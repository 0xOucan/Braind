use starknet::ContractAddress;
use super::common_types::{GameSession, GameStatus};
use super::leaderboard_manager_v3::LeaderboardEntry;

#[starknet::interface]
pub trait ISpeedMatchGameV3<TContractState> {
    // Core game functions
    fn start_game(ref self: TContractState, token: ContractAddress, difficulty: u8) -> u256;
    fn submit_score(
        ref self: TContractState,
        session_id: u256,
        score: u32,
        correct_matches: u32,
        time_taken: u32
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
    fn get_leaderboard_by_difficulty(self: @TContractState, difficulty: u8, limit: u32) -> Array<(ContractAddress, u32, u32)>; // (player, score, time)
    fn get_player_stats(self: @TContractState, player: ContractAddress) -> (u32, u32, u32, u32); // best_score, best_time, total_games, total_matches
    fn get_current_round(self: @TContractState) -> u32;

    // Admin functions
    fn set_payment_handler(ref self: TContractState, handler: ContractAddress);
    fn set_leaderboard_manager(ref self: TContractState, manager: ContractAddress);
    fn pause_game(ref self: TContractState);
    fn unpause_game(ref self: TContractState);
    fn end_current_round(ref self: TContractState);
}

#[starknet::contract]
pub mod SpeedMatchGameV3 {
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
        session_difficulty: Map<u256, u8>, // session_id => difficulty
        session_time: Map<u256, u32>, // session_id => time_taken
        player_active_session: Map<ContractAddress, u256>,
        player_session_count: Map<ContractAddress, u32>,
        player_sessions: Map<(ContractAddress, u32), u256>,

        // Game configuration
        session_timeout: u64,
        paused: bool,

        // Player statistics
        player_best_score: Map<ContractAddress, u32>,
        player_best_time: Map<ContractAddress, u32>,
        player_total_games: Map<ContractAddress, u32>,
        player_total_matches: Map<ContractAddress, u32>,

        // Difficulty-specific leaderboards (top 20 per difficulty)
        difficulty_leaderboard_size: Map<u8, u32>,
        difficulty_leaderboard_player: Map<(u8, u32), ContractAddress>, // (difficulty, position) => player
        difficulty_leaderboard_score: Map<(u8, u32), u32>, // (difficulty, position) => score
        difficulty_leaderboard_time: Map<(u8, u32), u32>, // (difficulty, position) => time
        player_difficulty_position: Map<(ContractAddress, u8), u32>, // (player, difficulty) => position
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        GameStarted: GameStarted,
        ScoreSubmitted: ScoreSubmitted,
        SessionExpired: SessionExpired,
        GamePaused: GamePaused,
        GameUnpaused: GameUnpaused,
        SpeedMatched: SpeedMatched,
    }

    #[derive(Drop, starknet::Event)]
    pub struct GameStarted {
        pub session_id: u256,
        pub player: ContractAddress,
        pub difficulty: u8,
        pub start_time: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ScoreSubmitted {
        pub session_id: u256,
        pub player: ContractAddress,
        pub score: u32,
        pub time_taken: u32,
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
    pub struct SpeedMatched {
        pub session_id: u256,
        pub player: ContractAddress,
        pub correct_matches: u32,
        pub time_taken: u32,
        pub difficulty: u8,
    }

    const GAME_TYPE: felt252 = 'SPEED_MATCH';
    const SESSION_TIMEOUT: u64 = 300; // 5 minutes
    const MAX_DIFFICULTY_LEADERBOARD: u32 = 20;

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
    impl SpeedMatchGameV3Impl of super::ISpeedMatchGameV3<ContractState> {
        fn start_game(ref self: ContractState, token: ContractAddress, difficulty: u8) -> u256 {
            assert!(!self.paused.read(), "Game is paused");
            assert!(difficulty >= 1 && difficulty <= 3, "Invalid difficulty (1-3)");

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
            self.session_difficulty.write(session_id, difficulty);
            self.player_active_session.write(player, session_id);

            // Add to player's session list
            let session_count = self.player_session_count.read(player);
            self.player_sessions.write((player, session_count), session_id);
            self.player_session_count.write(player, session_count + 1);

            // Increment session counter
            self.next_session_id.write(session_id + 1);

            self.emit(GameStarted { session_id, player, difficulty, start_time });

            session_id
        }

        fn submit_score(
            ref self: ContractState,
            session_id: u256,
            score: u32,
            correct_matches: u32,
            time_taken: u32
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
            self.session_time.write(session_id, time_taken);
            self.player_active_session.write(player, 0);

            // Update player statistics
            let current_best_score = self.player_best_score.read(player);
            let current_best_time = self.player_best_time.read(player);

            if score > current_best_score || (score == current_best_score && time_taken < current_best_time) {
                self.player_best_score.write(player, score);
                self.player_best_time.write(player, time_taken);
            }

            let total_games = self.player_total_games.read(player);
            self.player_total_games.write(player, total_games + 1);

            let total_matches = self.player_total_matches.read(player);
            self.player_total_matches.write(player, total_matches + correct_matches);

            // Add to main leaderboard
            let manager = ILeaderboardManagerDispatcher {
                contract_address: self.leaderboard_manager.read()
            };
            manager.add_score(player, score, 0, session_id);

            // Add to difficulty-specific leaderboard
            let difficulty = self.session_difficulty.read(session_id);
            self._insert_difficulty_leaderboard(difficulty, player, score, time_taken);

            self.emit(ScoreSubmitted { session_id, player, score, time_taken, end_time: current_time });
            self.emit(SpeedMatched { session_id, player, correct_matches, time_taken, difficulty });

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

        fn get_leaderboard_by_difficulty(
            self: @ContractState,
            difficulty: u8,
            limit: u32
        ) -> Array<(ContractAddress, u32, u32)> {
            let size = self.difficulty_leaderboard_size.read(difficulty);
            let actual_limit = if limit > size { size } else { limit };

            let mut leaderboard = ArrayTrait::new();
            let mut i: u32 = 0;

            while i < actual_limit {
                let player = self.difficulty_leaderboard_player.read((difficulty, i));
                let score = self.difficulty_leaderboard_score.read((difficulty, i));
                let time = self.difficulty_leaderboard_time.read((difficulty, i));
                leaderboard.append((player, score, time));
                i += 1;
            };

            leaderboard
        }

        fn get_player_stats(self: @ContractState, player: ContractAddress) -> (u32, u32, u32, u32) {
            let best_score = self.player_best_score.read(player);
            let best_time = self.player_best_time.read(player);
            let total_games = self.player_total_games.read(player);
            let total_matches = self.player_total_matches.read(player);
            (best_score, best_time, total_games, total_matches)
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
        fn _insert_difficulty_leaderboard(
            ref self: ContractState,
            difficulty: u8,
            player: ContractAddress,
            score: u32,
            time: u32
        ) {
            let max_size = MAX_DIFFICULTY_LEADERBOARD;
            let mut size = self.difficulty_leaderboard_size.read(difficulty);

            // Find insertion position (sort by score DESC, then time ASC)
            let mut position: u32 = 0;
            let mut found = false;

            while position < size && !found {
                let existing_score = self.difficulty_leaderboard_score.read((difficulty, position));
                let existing_time = self.difficulty_leaderboard_time.read((difficulty, position));

                if score > existing_score || (score == existing_score && time < existing_time) {
                    found = true;
                } else {
                    position += 1;
                }
            };

            // Check if player already on this difficulty leaderboard
            let existing_position = self.player_difficulty_position.read((player, difficulty));
            if existing_position < size {
                let existing_player = self.difficulty_leaderboard_player.read((difficulty, existing_position));
                if existing_player == player {
                    let existing_score = self.difficulty_leaderboard_score.read((difficulty, existing_position));
                    let existing_time = self.difficulty_leaderboard_time.read((difficulty, existing_position));

                    if existing_score > score || (existing_score == score && existing_time <= time) {
                        return; // Don't insert worse score
                    }
                }
            }

            // Insert entry and shift others down
            if position < max_size {
                let mut i = if size < max_size { size } else { max_size - 1 };

                while i > position {
                    let prev_player = self.difficulty_leaderboard_player.read((difficulty, i - 1));
                    let prev_score = self.difficulty_leaderboard_score.read((difficulty, i - 1));
                    let prev_time = self.difficulty_leaderboard_time.read((difficulty, i - 1));

                    self.difficulty_leaderboard_player.write((difficulty, i), prev_player);
                    self.difficulty_leaderboard_score.write((difficulty, i), prev_score);
                    self.difficulty_leaderboard_time.write((difficulty, i), prev_time);

                    if prev_player != player {
                        self.player_difficulty_position.write((prev_player, difficulty), i);
                    }

                    i -= 1;
                };

                // Insert new entry
                self.difficulty_leaderboard_player.write((difficulty, position), player);
                self.difficulty_leaderboard_score.write((difficulty, position), score);
                self.difficulty_leaderboard_time.write((difficulty, position), time);
                self.player_difficulty_position.write((player, difficulty), position);

                // Update size
                if size < max_size {
                    self.difficulty_leaderboard_size.write(difficulty, size + 1);
                }
            }
        }
    }
}
