#[starknet::contract]
mod BrainDGameManager {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess, StoragePathEntry, Map};

    #[storage]
    struct Storage {
        // Game configuration
        owner: ContractAddress,
        game_enabled: bool,

        // Player data
        player_stats: Map<ContractAddress, PlayerStats>,
        player_game_history: Map<(ContractAddress, u32), GameSession>,
        player_game_count: Map<ContractAddress, u32>,

        // Global stats
        total_players: u32,
        total_games_played: u64,
        total_rewards_distributed: u256,

        // Leaderboard (simplified - top 100 players)
        leaderboard: Map<u32, ContractAddress>,
        leaderboard_scores: Map<u32, u64>,
        leaderboard_size: u32,

        // Game rewards per difficulty
        easy_game_reward: u256,
        medium_game_reward: u256,
        hard_game_reward: u256,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct PlayerStats {
        games_played: u32,
        total_score: u64,
        high_score: u32,
        total_rewards: u256,
        rank: u32,
        last_played: u64,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct GameSession {
        game_type: felt252,
        score: u32,
        difficulty: u8, // 1 = Easy, 2 = Medium, 3 = Hard
        reward: u256,
        timestamp: u64,
        duration: u32, // Game duration in seconds
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct GlobalStats {
        total_players: u32,
        total_games: u64,
        total_rewards: u256,
        average_score: u32,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        GameCompleted: GameCompleted,
        NewPlayer: NewPlayer,
        LeaderboardUpdated: LeaderboardUpdated,
    }

    #[derive(Drop, starknet::Event)]
    struct GameCompleted {
        player: ContractAddress,
        game_type: felt252,
        score: u32,
        reward: u256,
        new_rank: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct NewPlayer {
        player: ContractAddress,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct LeaderboardUpdated {
        player: ContractAddress,
        new_rank: u32,
        score: u64,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.game_enabled.write(true);
        self.total_players.write(0);
        self.total_games_played.write(0);
        self.total_rewards_distributed.write(0);
        self.leaderboard_size.write(0);

        // Set default rewards (in wei, 18 decimals)
        self.easy_game_reward.write(25_000000000000000000); // 25 STARK
        self.medium_game_reward.write(60_000000000000000000); // 60 STARK
        self.hard_game_reward.write(80_000000000000000000); // 80 STARK
    }

    #[abi(embed_v0)]
    impl BrainDGameManager of super::IBrainDGameManager<ContractState> {
        fn submit_game_score(
            ref self: ContractState,
            game_type: felt252,
            score: u32,
            difficulty: u8,
            duration: u32
        ) -> u256 {
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();

            assert!(self.game_enabled.read(), "Game is disabled");
            assert!(difficulty >= 1 && difficulty <= 3, "Invalid difficulty");
            assert!(score > 0, "Score must be positive");

            // Check if this is a new player
            let mut player_stats = self.player_stats.read(caller);
            let is_new_player = player_stats.games_played == 0;

            if is_new_player {
                self.total_players.write(self.total_players.read() + 1);
                self.emit(NewPlayer { player: caller, timestamp });
            }

            // Calculate reward based on difficulty
            let reward = match difficulty {
                1 => self.easy_game_reward.read(),
                2 => self.medium_game_reward.read(),
                3 => self.hard_game_reward.read(),
                _ => 0,
            };

            // Update player stats
            player_stats.games_played += 1;
            player_stats.total_score += score.into();
            player_stats.total_rewards += reward;
            player_stats.last_played = timestamp;

            if score > player_stats.high_score {
                player_stats.high_score = score;
            }

            self.player_stats.write(caller, player_stats);

            // Store game session
            let game_count = self.player_game_count.read(caller);
            let game_session = GameSession {
                game_type,
                score,
                difficulty,
                reward,
                timestamp,
                duration,
            };
            self.player_game_history.write((caller, game_count), game_session);
            self.player_game_count.write(caller, game_count + 1);

            // Update global stats
            self.total_games_played.write(self.total_games_played.read() + 1);
            self.total_rewards_distributed.write(self.total_rewards_distributed.read() + reward);

            // Update leaderboard
            self._update_leaderboard(caller, player_stats.total_score);

            // Emit event
            self.emit(GameCompleted {
                player: caller,
                game_type,
                score,
                reward,
                new_rank: player_stats.rank
            });

            reward
        }

        fn get_player_stats(self: @ContractState, player: ContractAddress) -> PlayerStats {
            self.player_stats.read(player)
        }

        fn get_player_game_history(
            self: @ContractState,
            player: ContractAddress,
            limit: u32
        ) -> Array<GameSession> {
            let mut history = ArrayTrait::new();
            let total_games = self.player_game_count.read(player);

            let start_index = if total_games > limit { total_games - limit } else { 0 };
            let mut i = start_index;

            while i < total_games {
                let session = self.player_game_history.read((player, i));
                history.append(session);
                i += 1;
            };

            history
        }

        fn get_leaderboard(self: @ContractState, limit: u32) -> Array<(ContractAddress, u64)> {
            let mut leaderboard = ArrayTrait::new();
            let board_size = self.leaderboard_size.read();
            let actual_limit = if limit > board_size { board_size } else { limit };

            let mut i = 0;
            while i < actual_limit {
                let player = self.leaderboard.read(i);
                let score = self.leaderboard_scores.read(i);
                leaderboard.append((player, score));
                i += 1;
            };

            leaderboard
        }

        fn get_global_stats(self: @ContractState) -> GlobalStats {
            let total_games = self.total_games_played.read();
            let total_players = self.total_players.read();

            // Calculate average score
            let mut total_score_sum: u64 = 0;
            let mut i = 0;
            while i < self.leaderboard_size.read() {
                total_score_sum += self.leaderboard_scores.read(i);
                i += 1;
            };

            let average_score = if total_players > 0 {
                (total_score_sum / total_players.into()).try_into().unwrap()
            } else {
                0
            };

            GlobalStats {
                total_players,
                total_games,
                total_rewards: self.total_rewards_distributed.read(),
                average_score,
            }
        }

        fn get_player_rank(self: @ContractState, player: ContractAddress) -> u32 {
            let stats = self.player_stats.read(player);
            stats.rank
        }

        fn get_total_players(self: @ContractState) -> u32 {
            self.total_players.read()
        }

        fn get_total_rewards_distributed(self: @ContractState) -> u256 {
            self.total_rewards_distributed.read()
        }

        // Admin functions
        fn set_game_enabled(ref self: ContractState, enabled: bool) {
            self._only_owner();
            self.game_enabled.write(enabled);
        }

        fn set_rewards(
            ref self: ContractState,
            easy_reward: u256,
            medium_reward: u256,
            hard_reward: u256
        ) {
            self._only_owner();
            self.easy_game_reward.write(easy_reward);
            self.medium_game_reward.write(medium_reward);
            self.hard_game_reward.write(hard_reward);
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _only_owner(self: @ContractState) {
            let caller = get_caller_address();
            assert!(caller == self.owner.read(), "Only owner can call this function");
        }

        fn _update_leaderboard(ref self: ContractState, player: ContractAddress, total_score: u64) {
            let board_size = self.leaderboard_size.read();
            let max_board_size = 100; // Top 100 players

            // Simple insertion sort for leaderboard
            // In production, consider using a more efficient data structure
            let mut position = board_size;
            let mut i = 0;

            // Find insertion position
            while i < board_size {
                if total_score > self.leaderboard_scores.read(i) {
                    position = i;
                    break;
                }
                i += 1;
            };

            // Shift entries down
            if position < max_board_size {
                let mut j = if board_size < max_board_size { board_size } else { max_board_size - 1 };
                while j > position {
                    let prev_player = self.leaderboard.read(j - 1);
                    let prev_score = self.leaderboard_scores.read(j - 1);
                    self.leaderboard.write(j, prev_player);
                    self.leaderboard_scores.write(j, prev_score);
                    j -= 1;
                };

                // Insert new entry
                self.leaderboard.write(position, player);
                self.leaderboard_scores.write(position, total_score);

                // Update board size
                if board_size < max_board_size {
                    self.leaderboard_size.write(board_size + 1);
                }

                // Update player rank
                let mut player_stats = self.player_stats.read(player);
                player_stats.rank = position + 1; // Rank is 1-indexed
                self.player_stats.write(player, player_stats);

                self.emit(LeaderboardUpdated {
                    player,
                    new_rank: player_stats.rank,
                    score: total_score
                });
            }
        }
    }
}

#[starknet::interface]
trait IBrainDGameManager<TContractState> {
    fn submit_game_score(
        ref self: TContractState,
        game_type: felt252,
        score: u32,
        difficulty: u8,
        duration: u32
    ) -> u256;

    fn get_player_stats(self: @TContractState, player: ContractAddress) -> BrainDGameManager::PlayerStats;
    fn get_player_game_history(self: @TContractState, player: ContractAddress, limit: u32) -> Array<BrainDGameManager::GameSession>;
    fn get_leaderboard(self: @TContractState, limit: u32) -> Array<(ContractAddress, u64)>;
    fn get_global_stats(self: @TContractState) -> BrainDGameManager::GlobalStats;
    fn get_player_rank(self: @TContractState, player: ContractAddress) -> u32;
    fn get_total_players(self: @TContractState) -> u32;
    fn get_total_rewards_distributed(self: @TContractState) -> u256;

    fn set_game_enabled(ref self: TContractState, enabled: bool);
    fn set_rewards(ref self: TContractState, easy_reward: u256, medium_reward: u256, hard_reward: u256);
}