use starknet::ContractAddress;
use super::common_types::{GameSession, GameMetadata, GameStatus};

#[starknet::interface]
pub trait IGameV3<TContractState> {
    // Core game functions
    fn start_game(ref self: TContractState, token: ContractAddress) -> u256;
    fn submit_score(
        ref self: TContractState,
        session_id: u256,
        score: u32,
        metadata: GameMetadata
    ) -> bool;

    // View functions
    fn get_session(self: @TContractState, session_id: u256) -> GameSession;
    fn get_player_sessions(
        self: @TContractState,
        player: ContractAddress,
        offset: u32,
        limit: u32
    ) -> Array<u256>;
    fn get_active_session(self: @TContractState, player: ContractAddress) -> Option<u256>;

    // Admin functions
    fn set_payment_handler(ref self: TContractState, handler: ContractAddress);
    fn set_game_fee(ref self: TContractState, token: ContractAddress, fee: u256);
    fn pause_game(ref self: TContractState);
    fn unpause_game(ref self: TContractState);
}

#[starknet::contract]
pub mod BaseGameV3 {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map,
        StorageMapReadAccess, StorageMapWriteAccess, Vec, VecTrait, MutableVecTrait
    };
    use super::super::common_types::{GameSession, GameMetadata, GameStatus, FeeConfig};
    use super::super::game_payment_handler::{
        IGamePaymentHandlerDispatcher, IGamePaymentHandlerDispatcherTrait
    };

    #[storage]
    struct Storage {
        owner: ContractAddress,
        payment_handler: ContractAddress,
        game_type: felt252,

        // Session management
        next_session_id: u256,
        sessions: Map<u256, GameSession>,
        player_active_session: Map<ContractAddress, u256>,
        player_session_count: Map<ContractAddress, u32>,
        player_sessions: Map<(ContractAddress, u32), u256>,

        // Game configuration
        session_timeout: u64,
        paused: bool,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        GameStarted: GameStarted,
        ScoreSubmitted: ScoreSubmitted,
        SessionExpired: SessionExpired,
        GamePaused: GamePaused,
        GameUnpaused: GameUnpaused,
    }

    #[derive(Drop, starknet::Event)]
    pub struct GameStarted {
        pub session_id: u256,
        pub player: ContractAddress,
        pub game_type: felt252,
        pub start_time: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ScoreSubmitted {
        pub session_id: u256,
        pub player: ContractAddress,
        pub score: u32,
        pub end_time: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct SessionExpired {
        pub session_id: u256,
        pub player: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct GamePaused {
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct GameUnpaused {
        pub timestamp: u64,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        payment_handler: ContractAddress,
        game_type: felt252,
        session_timeout: u64,
    ) {
        self.owner.write(owner);
        self.payment_handler.write(payment_handler);
        self.game_type.write(game_type);
        self.session_timeout.write(session_timeout);
        self.next_session_id.write(1);
        self.paused.write(false);
    }

    #[abi(embed_v0)]
    impl GameV3Impl of super::IGameV3<ContractState> {
        fn start_game(ref self: ContractState, token: ContractAddress) -> u256 {
            assert!(!self.paused.read(), "Game is paused");

            let player = get_caller_address();

            // Check if player has an active session
            let active_session_id = self.player_active_session.read(player);
            if active_session_id != 0 {
                let active_session = self.sessions.read(active_session_id);
                assert!(active_session.status != GameStatus::Active, "Active session exists");
            }

            // Charge game fee through payment handler
            let payment_handler = IGamePaymentHandlerDispatcher {
                contract_address: self.payment_handler.read()
            };
            let charged = payment_handler.charge_game_fee(player, token);
            assert!(charged, "Fee charge failed");

            // Create new session
            let session_id = self.next_session_id.read();
            let start_time = get_block_timestamp();

            let session = GameSession {
                session_id,
                player,
                game_type: self.game_type.read(),
                start_time,
                end_time: 0,
                score: 0,
                status: GameStatus::Active,
            };

            self.sessions.write(session_id, session);
            self.player_active_session.write(player, session_id);

            // Add to player's session list
            let session_count = self.player_session_count.read(player);
            self.player_sessions.write((player, session_count), session_id);
            self.player_session_count.write(player, session_count + 1);

            // Increment session counter
            self.next_session_id.write(session_id + 1);

            self.emit(GameStarted {
                session_id,
                player,
                game_type: self.game_type.read(),
                start_time,
            });

            session_id
        }

        fn submit_score(
            ref self: ContractState,
            session_id: u256,
            score: u32,
            metadata: GameMetadata
        ) -> bool {
            let player = get_caller_address();
            let mut session = self.sessions.read(session_id);

            // Validate session
            assert!(session.player == player, "Not session owner");
            assert!(session.status == GameStatus::Active, "Session not active");

            // Check timeout
            let current_time = get_block_timestamp();
            let timeout = self.session_timeout.read();
            if timeout > 0 && (current_time - session.start_time) > timeout {
                session.status = GameStatus::Expired;
                self.sessions.write(session_id, session);
                self.player_active_session.write(player, 0);

                self.emit(SessionExpired { session_id, player });
                return false;
            }

            // Update session
            session.score = score;
            session.end_time = current_time;
            session.status = GameStatus::Completed;

            self.sessions.write(session_id, session);
            self.player_active_session.write(player, 0);

            self.emit(ScoreSubmitted {
                session_id,
                player,
                score,
                end_time: current_time,
            });

            // Hook for game-specific logic (implemented by inheriting contracts)
            self._on_score_submitted(session_id, score, metadata);

            true
        }

        fn get_session(self: @ContractState, session_id: u256) -> GameSession {
            self.sessions.read(session_id)
        }

        fn get_player_sessions(
            self: @ContractState,
            player: ContractAddress,
            offset: u32,
            limit: u32
        ) -> Array<u256> {
            let total = self.player_session_count.read(player);
            let mut sessions = ArrayTrait::new();

            let mut i = offset;
            let end = if offset + limit > total { total } else { offset + limit };

            while i < end {
                let session_id = self.player_sessions.read((player, i));
                sessions.append(session_id);
                i += 1;
            };

            sessions
        }

        fn get_active_session(self: @ContractState, player: ContractAddress) -> Option<u256> {
            let session_id = self.player_active_session.read(player);
            if session_id == 0 {
                Option::None
            } else {
                Option::Some(session_id)
            }
        }

        fn set_payment_handler(ref self: ContractState, handler: ContractAddress) {
            assert!(get_caller_address() == self.owner.read(), "Only owner");
            self.payment_handler.write(handler);
        }

        fn set_game_fee(ref self: ContractState, token: ContractAddress, fee: u256) {
            assert!(get_caller_address() == self.owner.read(), "Only owner");

            let payment_handler = IGamePaymentHandlerDispatcher {
                contract_address: self.payment_handler.read()
            };
            payment_handler.set_game_fee(token, fee);
        }

        fn pause_game(ref self: ContractState) {
            assert!(get_caller_address() == self.owner.read(), "Only owner");
            self.paused.write(true);
            self.emit(GamePaused { timestamp: get_block_timestamp() });
        }

        fn unpause_game(ref self: ContractState) {
            assert!(get_caller_address() == self.owner.read(), "Only owner");
            self.paused.write(false);
            self.emit(GameUnpaused { timestamp: get_block_timestamp() });
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        // Hook for game-specific logic after score submission
        // Must be implemented by inheriting contracts
        fn _on_score_submitted(
            ref self: ContractState,
            session_id: u256,
            score: u32,
            metadata: GameMetadata
        ) {
            // Default implementation does nothing
            // Override in specific game contracts
        }

        // Helper to get session safely
        fn _get_session_safe(self: @ContractState, session_id: u256) -> GameSession {
            let session = self.sessions.read(session_id);
            assert!(session.session_id != 0, "Session does not exist");
            session
        }

        // Helper to validate session ownership
        fn _validate_session_owner(self: @ContractState, session_id: u256, player: ContractAddress) {
            let session = self._get_session_safe(session_id);
            assert!(session.player == player, "Not session owner");
        }

        // Helper to check if session is expired
        fn _is_session_expired(self: @ContractState, session: GameSession) -> bool {
            let timeout = self.session_timeout.read();
            if timeout == 0 {
                return false;
            }

            let current_time = get_block_timestamp();
            (current_time - session.start_time) > timeout
        }
    }
}
