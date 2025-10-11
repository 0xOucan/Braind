use starknet::ContractAddress;
use super::common_types::{GameSession, GameMetadata, GameStatus};
use super::leaderboard_manager_v3::LeaderboardEntry;

#[starknet::interface]
pub trait IColorMatchGameV3<TContractState> {
    // Core game functions
    fn start_game(ref self: TContractState, token: ContractAddress) -> u256;
    fn submit_score(
        ref self: TContractState,
        session_id: u256,
        score: u32,
        color_matches: u32
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
    fn get_leaderboard(self: @TContractState, limit: u32) -> Array<LeaderboardEntry>;
    fn get_player_stats(self: @TContractState, player: ContractAddress) -> (u32, u32, u32); // best_score, total_games, total_matches
    fn get_current_round(self: @TContractState) -> u32;

    // Admin functions
    fn set_payment_handler(ref self: TContractState, handler: ContractAddress);
    fn set_leaderboard_manager(ref self: TContractState, manager: ContractAddress);
    fn pause_game(ref self: TContractState);
    fn unpause_game(ref self: TContractState);
    fn end_current_round(ref self: TContractState);
}

#[starknet::contract]
pub mod ColorMatchGameV3 {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map,
        StorageMapReadAccess, StorageMapWriteAccess
    };
    use super::super::common_types::{GameSession, GameMetadata, GameStatus};
    use super::super::game_payment_handler::{
        IGamePaymentHandlerDispatcher, IGamePaymentHandlerDispatcherTrait
    };
    use super::super::leaderboard_manager_v3::{
        ILeaderboardManagerDispatcher, ILeaderboardManagerDispatcherTrait, LeaderboardEntry
    };

    #[storage]
    struct Storage {
        owner: ContractAddress,
        payment_handler: ContractAddress,
        leaderboard_manager: ContractAddress,

        // Session management
        next_session_id: u256,
        sessions: Map<u256, GameSession>,
        player_active_session: Map<ContractAddress, u256>,
        player_session_count: Map<ContractAddress, u32>,
        player_sessions: Map<(ContractAddress, u32), u256>,

        // Game configuration
        session_timeout: u64,
        paused: bool,

        // Player statistics
        player_best_score: Map<ContractAddress, u32>,
        player_total_games: Map<ContractAddress, u32>,
        player_total_matches: Map<ContractAddress, u32>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        GameStarted: GameStarted,
        ScoreSubmitted: ScoreSubmitted,
        SessionExpired: SessionExpired,
        GamePaused: GamePaused,
        GameUnpaused: GameUnpaused,
        ColorMatched: ColorMatched,
    }

    #[derive(Drop, starknet::Event)]
    pub struct GameStarted {
        pub session_id: u256,
        pub player: ContractAddress,
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

    #[derive(Drop, starknet::Event)]
    pub struct ColorMatched {
        pub session_id: u256,
        pub player: ContractAddress,
        pub color_matches: u32,
    }

    const GAME_TYPE: felt252 = 'COLOR_MATCH';
    const SESSION_TIMEOUT: u64 = 300; // 5 minutes

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        payment_handler: ContractAddress,
        leaderboard_manager: ContractAddress,
    ) {
        self.owner.write(owner);
        self.payment_handler.write(payment_handler);
        self.leaderboard_manager.write(leaderboard_manager);
        self.session_timeout.write(SESSION_TIMEOUT);
        self.next_session_id.write(1);
        self.paused.write(false);
    }

    #[abi(embed_v0)]
    impl ColorMatchGameV3Impl of super::IColorMatchGameV3<ContractState> {
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
                game_type: GAME_TYPE,
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

            self.emit(GameStarted { session_id, player, start_time });

            session_id
        }

        fn submit_score(
            ref self: ContractState,
            session_id: u256,
            score: u32,
            color_matches: u32
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

            // Update player statistics
            let current_best = self.player_best_score.read(player);
            if score > current_best {
                self.player_best_score.write(player, score);
            }

            let total_games = self.player_total_games.read(player);
            self.player_total_games.write(player, total_games + 1);

            let total_matches = self.player_total_matches.read(player);
            self.player_total_matches.write(player, total_matches + color_matches);

            // Add to leaderboard
            let manager = ILeaderboardManagerDispatcher {
                contract_address: self.leaderboard_manager.read()
            };
            manager.add_score(player, score, 0, session_id);

            self.emit(ScoreSubmitted { session_id, player, score, end_time: current_time });
            self.emit(ColorMatched { session_id, player, color_matches });

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

        fn get_leaderboard(self: @ContractState, limit: u32) -> Array<LeaderboardEntry> {
            let manager = ILeaderboardManagerDispatcher {
                contract_address: self.leaderboard_manager.read()
            };
            manager.get_top_scores(limit)
        }

        fn get_player_stats(self: @ContractState, player: ContractAddress) -> (u32, u32, u32) {
            let best_score = self.player_best_score.read(player);
            let total_games = self.player_total_games.read(player);
            let total_matches = self.player_total_matches.read(player);
            (best_score, total_games, total_matches)
        }

        fn get_current_round(self: @ContractState) -> u32 {
            let manager = ILeaderboardManagerDispatcher {
                contract_address: self.leaderboard_manager.read()
            };
            manager.get_current_round()
        }

        fn set_payment_handler(ref self: ContractState, handler: ContractAddress) {
            assert!(get_caller_address() == self.owner.read(), "Only owner");
            self.payment_handler.write(handler);
        }

        fn set_leaderboard_manager(ref self: ContractState, manager: ContractAddress) {
            assert!(get_caller_address() == self.owner.read(), "Only owner");
            self.leaderboard_manager.write(manager);
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

        fn end_current_round(ref self: ContractState) {
            assert!(get_caller_address() == self.owner.read(), "Only owner");
            let manager = ILeaderboardManagerDispatcher {
                contract_address: self.leaderboard_manager.read()
            };
            manager.end_current_round();
        }
    }
}
