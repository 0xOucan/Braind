use starknet::ContractAddress;
use super::common_types::{GameSession, GameStatus};
use super::leaderboard_manager_v3::LeaderboardEntry;

#[starknet::interface]
pub trait IMemoryBlitzGameV3<TContractState> {
    // Core game functions
    fn start_game(ref self: TContractState, token: ContractAddress) -> u256;
    fn submit_score(
        ref self: TContractState,
        session_id: u256,
        score: u32,
        level_reached: u32,
        sequence_length: u32
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
    fn get_leaderboard_by_level(self: @TContractState, level: u32, limit: u32) -> Array<(ContractAddress, u32, u32)>; // (player, score, sequence_length)
    fn get_player_stats(self: @TContractState, player: ContractAddress) -> (u32, u32, u32, u32); // best_score, max_level, total_games, total_sequences
    fn get_current_round(self: @TContractState) -> u32;

    // Admin functions
    fn set_payment_handler(ref self: TContractState, handler: ContractAddress);
    fn set_leaderboard_manager(ref self: TContractState, manager: ContractAddress);
    fn pause_game(ref self: TContractState);
    fn unpause_game(ref self: TContractState);
    fn end_current_round(ref self: TContractState);
}

#[starknet::contract]
pub mod MemoryBlitzGameV3 {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map,
        StorageMapReadAccess, StorageMapWriteAccess
    };
    use super::super::common_types::{GameSession, GameStatus};
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
        session_level: Map<u256, u32>, // session_id => level_reached
        session_sequence: Map<u256, u32>, // session_id => sequence_length
        player_active_session: Map<ContractAddress, u256>,
        player_session_count: Map<ContractAddress, u32>,
        player_sessions: Map<(ContractAddress, u32), u256>,

        // Game configuration
        session_timeout: u64,
        paused: bool,

        // Player statistics
        player_best_score: Map<ContractAddress, u32>,
        player_max_level: Map<ContractAddress, u32>,
        player_total_games: Map<ContractAddress, u32>,
        player_total_sequences: Map<ContractAddress, u32>,

        // Level-specific leaderboards (top 20 per level)
        level_leaderboard_size: Map<u32, u32>,
        level_leaderboard_player: Map<(u32, u32), ContractAddress>, // (level, position) => player
        level_leaderboard_score: Map<(u32, u32), u32>, // (level, position) => score
        level_leaderboard_sequence: Map<(u32, u32), u32>, // (level, position) => sequence_length
        player_level_position: Map<(ContractAddress, u32), u32>, // (player, level) => position
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        GameStarted: GameStarted,
        ScoreSubmitted: ScoreSubmitted,
        SessionExpired: SessionExpired,
        GamePaused: GamePaused,
        GameUnpaused: GameUnpaused,
        MemoryBlitzCompleted: MemoryBlitzCompleted,
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
        pub level_reached: u32,
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
    pub struct MemoryBlitzCompleted {
        pub session_id: u256,
        pub player: ContractAddress,
        pub level_reached: u32,
        pub sequence_length: u32,
    }

    const GAME_TYPE: felt252 = 'MEMORY_BLITZ';
    const SESSION_TIMEOUT: u64 = 600; // 10 minutes (memory games can take longer)
    const MAX_LEVEL_LEADERBOARD: u32 = 20;

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
    impl MemoryBlitzGameV3Impl of super::IMemoryBlitzGameV3<ContractState> {
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
            level_reached: u32,
            sequence_length: u32
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

            // Validate level progression (score should increase with level)
            assert!(level_reached > 0, "Invalid level");
            assert!(sequence_length >= level_reached, "Sequence too short for level");

            // Update session
            session.score = score;
            session.end_time = current_time;
            session.status = GameStatus::Completed;

            self.sessions.write(session_id, session);
            self.session_level.write(session_id, level_reached);
            self.session_sequence.write(session_id, sequence_length);
            self.player_active_session.write(player, 0);

            // Update player statistics
            let current_best_score = self.player_best_score.read(player);
            if score > current_best_score {
                self.player_best_score.write(player, score);
            }

            let current_max_level = self.player_max_level.read(player);
            if level_reached > current_max_level {
                self.player_max_level.write(player, level_reached);
            }

            let total_games = self.player_total_games.read(player);
            self.player_total_games.write(player, total_games + 1);

            let total_sequences = self.player_total_sequences.read(player);
            self.player_total_sequences.write(player, total_sequences + sequence_length);

            // Add to main leaderboard (use level as additional metric)
            let manager = ILeaderboardManagerDispatcher {
                contract_address: self.leaderboard_manager.read()
            };
            manager.add_score(player, score, level_reached, session_id);

            // Add to level-specific leaderboard
            self._insert_level_leaderboard(level_reached, player, score, sequence_length);

            self.emit(ScoreSubmitted { session_id, player, score, level_reached, end_time: current_time });
            self.emit(MemoryBlitzCompleted { session_id, player, level_reached, sequence_length });

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

        fn get_leaderboard_by_level(
            self: @ContractState,
            level: u32,
            limit: u32
        ) -> Array<(ContractAddress, u32, u32)> {
            let size = self.level_leaderboard_size.read(level);
            let actual_limit = if limit > size { size } else { limit };

            let mut leaderboard = ArrayTrait::new();
            let mut i: u32 = 0;

            while i < actual_limit {
                let player = self.level_leaderboard_player.read((level, i));
                let score = self.level_leaderboard_score.read((level, i));
                let sequence = self.level_leaderboard_sequence.read((level, i));
                leaderboard.append((player, score, sequence));
                i += 1;
            };

            leaderboard
        }

        fn get_player_stats(self: @ContractState, player: ContractAddress) -> (u32, u32, u32, u32) {
            let best_score = self.player_best_score.read(player);
            let max_level = self.player_max_level.read(player);
            let total_games = self.player_total_games.read(player);
            let total_sequences = self.player_total_sequences.read(player);
            (best_score, max_level, total_games, total_sequences)
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

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _insert_level_leaderboard(
            ref self: ContractState,
            level: u32,
            player: ContractAddress,
            score: u32,
            sequence_length: u32
        ) {
            let max_size = MAX_LEVEL_LEADERBOARD;
            let mut size = self.level_leaderboard_size.read(level);

            // Find insertion position (sort by score DESC, then sequence_length DESC)
            let mut position: u32 = 0;
            let mut found = false;

            while position < size && !found {
                let existing_score = self.level_leaderboard_score.read((level, position));
                let existing_sequence = self.level_leaderboard_sequence.read((level, position));

                if score > existing_score || (score == existing_score && sequence_length > existing_sequence) {
                    found = true;
                } else {
                    position += 1;
                }
            };

            // Check if player already on this level leaderboard
            let existing_position = self.player_level_position.read((player, level));
            if existing_position < size {
                let existing_player = self.level_leaderboard_player.read((level, existing_position));
                if existing_player == player {
                    let existing_score = self.level_leaderboard_score.read((level, existing_position));
                    let existing_sequence = self.level_leaderboard_sequence.read((level, existing_position));

                    if existing_score > score || (existing_score == score && existing_sequence >= sequence_length) {
                        return; // Don't insert worse score
                    }
                }
            }

            // Insert entry and shift others down
            if position < max_size {
                let mut i = if size < max_size { size } else { max_size - 1 };

                while i > position {
                    let prev_player = self.level_leaderboard_player.read((level, i - 1));
                    let prev_score = self.level_leaderboard_score.read((level, i - 1));
                    let prev_sequence = self.level_leaderboard_sequence.read((level, i - 1));

                    self.level_leaderboard_player.write((level, i), prev_player);
                    self.level_leaderboard_score.write((level, i), prev_score);
                    self.level_leaderboard_sequence.write((level, i), prev_sequence);

                    if prev_player != player {
                        self.player_level_position.write((prev_player, level), i);
                    }

                    i -= 1;
                };

                // Insert new entry
                self.level_leaderboard_player.write((level, position), player);
                self.level_leaderboard_score.write((level, position), score);
                self.level_leaderboard_sequence.write((level, position), sequence_length);
                self.player_level_position.write((player, level), position);

                // Update size
                if size < max_size {
                    self.level_leaderboard_size.write(level, size + 1);
                }
            }
        }
    }
}
