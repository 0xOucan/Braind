use starknet::ContractAddress;

// Structs defined outside for visibility in the interface
#[derive(Copy, Drop, Serde)]
pub struct LeaderboardEntry {
    pub player: ContractAddress,
    pub score: u32,
    pub position: u32,
}

#[starknet::interface]
pub trait IColorMatchGameV2<TContractState> {
    // Game functions
    fn start_game(ref self: TContractState, payment_token: ContractAddress) -> u256;
    fn submit_score(ref self: TContractState, game_id: u256, score: u32, color_matches: u32) -> bool;

    // Leaderboard functions
    fn get_current_round_leaderboard(self: @TContractState, limit: u32) -> Array<LeaderboardEntry>;
    fn get_historic_leaderboard(self: @TContractState, limit: u32) -> Array<LeaderboardEntry>;
    fn get_player_round_position(self: @TContractState, player: ContractAddress) -> u32;

    // Round management
    fn get_current_round(self: @TContractState) -> u32;
    fn get_games_in_current_round(self: @TContractState) -> u32;
    fn end_round_and_distribute(ref self: TContractState) -> bool;

    // Admin functions
    fn set_games_per_round(ref self: TContractState, games: u32);
    fn set_game_fee(ref self: TContractState, token: ContractAddress, fee: u256);
    fn claim_house_fees(ref self: TContractState, token: ContractAddress) -> u256;
    fn set_airdrop_contract(ref self: TContractState, airdrop: ContractAddress);
    fn delegate_admin(ref self: TContractState, new_admin: ContractAddress);
    fn pause_game(ref self: TContractState);
    fn unpause_game(ref self: TContractState);
}

#[starknet::contract]
mod ColorMatchGameV2 {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp, get_contract_address};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map,
        StorageMapReadAccess, StorageMapWriteAccess
    };
    use super::LeaderboardEntry;

    #[storage]
    struct Storage {
        // Ownership & Admin
        owner: ContractAddress,
        admin: ContractAddress,
        game_paused: bool,

        // Round configuration
        current_round: u32,
        games_per_round: u32,
        games_in_current_round: u32,

        // Payment & Fees
        token_fees: Map<ContractAddress, u256>,
        supported_tokens: Map<ContractAddress, bool>,
        round_collected_fees: Map<(u32, ContractAddress), u256>, // (round, token) => amount
        house_claimable_fees: Map<ContractAddress, u256>,

        // External contracts
        airdrop_contract: ContractAddress,

        // Game sessions
        game_sessions: Map<u256, GameSession>,
        next_game_id: u256,

        // Current Round Leaderboard (top 100)
        round_leaderboard: Map<(u32, u32), ContractAddress>, // (round, position) => player
        round_leaderboard_scores: Map<(u32, u32), u32>, // (round, position) => score
        round_leaderboard_size: Map<u32, u32>,

        // Historic Leaderboard (all-time top 100)
        historic_leaderboard: Map<u32, ContractAddress>, // position => player
        historic_leaderboard_scores: Map<u32, u32>, // position => score
        historic_leaderboard_size: u32,

        // Player stats
        player_round_stats: Map<(ContractAddress, u32), PlayerRoundStats>,
        player_all_time_stats: Map<ContractAddress, PlayerStats>,

        // Round participants
        round_players: Map<(u32, u256), ContractAddress>, // (round, index) => player
        round_player_count: Map<u32, u256>,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    pub struct GameSession {
        pub game_id: u256,
        pub player: ContractAddress,
        pub round: u32,
        pub score: u32,
        pub color_matches: u32,
        pub payment_token: ContractAddress,
        pub payment_amount: u256,
        pub timestamp: u64,
        pub completed: bool,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    pub struct PlayerRoundStats {
        pub games_played: u32,
        pub total_score: u64,
        pub best_score: u32,
        pub round_position: u32,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    pub struct PlayerStats {
        pub total_games: u32,
        pub all_time_high_score: u32,
        pub total_winnings: u256,
        pub rounds_participated: u32,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        GameStarted: GameStarted,
        GameCompleted: GameCompleted,
        RoundEnded: RoundEnded,
        PrizeDistributed: PrizeDistributed,
        AdminDelegated: AdminDelegated,
    }

    #[derive(Drop, starknet::Event)]
    struct GameStarted {
        game_id: u256,
        player: ContractAddress,
        round: u32,
        payment_token: ContractAddress,
        payment_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct GameCompleted {
        game_id: u256,
        player: ContractAddress,
        round: u32,
        score: u32,
        round_position: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct RoundEnded {
        round: u32,
        total_games: u32,
        total_fees_collected: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct PrizeDistributed {
        round: u32,
        player: ContractAddress,
        prize_type: felt252, // '1st', '2nd', '3rd', 'random'
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct AdminDelegated {
        previous_admin: ContractAddress,
        new_admin: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        stark_token: ContractAddress,
        usdc_token: ContractAddress,
        eth_token: ContractAddress,
        airdrop_contract: ContractAddress
    ) {
        self.owner.write(owner);
        self.admin.write(owner);
        self.game_paused.write(false);
        self.next_game_id.write(1);
        self.current_round.write(1);
        self.games_per_round.write(100); // Default: 100 games per round
        self.games_in_current_round.write(0);
        self.airdrop_contract.write(airdrop_contract);
        self.historic_leaderboard_size.write(0);

        // Set default game fees
        self.token_fees.write(stark_token, 10000000000000000);
        self.supported_tokens.write(stark_token, true);
        self.token_fees.write(usdc_token, 10000);
        self.supported_tokens.write(usdc_token, true);
        self.token_fees.write(eth_token, 100000000);
        self.supported_tokens.write(eth_token, true);
    }

    #[abi(embed_v0)]
    impl ColorMatchGameV2 of super::IColorMatchGameV2<ContractState> {
        fn start_game(ref self: ContractState, payment_token: ContractAddress) -> u256 {
            assert!(!self.game_paused.read(), "Game paused");
            assert!(self.supported_tokens.read(payment_token), "Token not supported");

            let caller = get_caller_address();
            let game_fee = self.token_fees.read(payment_token);
            let current_round = self.current_round.read();

            // Note: Payment transfer would happen here via ERC20
            // For now, we'll track it in storage

            // Create game session
            let game_id = self.next_game_id.read();
            let timestamp = get_block_timestamp();

            let game_session = GameSession {
                game_id,
                player: caller,
                round: current_round,
                score: 0,
                color_matches: 0,
                payment_token,
                payment_amount: game_fee,
                timestamp,
                completed: false,
            };

            self.game_sessions.write(game_id, game_session);
            self.next_game_id.write(game_id + 1);

            // Track round fees
            let current_fees = self.round_collected_fees.read((current_round, payment_token));
            self.round_collected_fees.write((current_round, payment_token), current_fees + game_fee);

            // Increment games in round
            let games_count = self.games_in_current_round.read();
            self.games_in_current_round.write(games_count + 1);

            // Track round participant
            let player_count = self.round_player_count.read(current_round);
            self.round_players.write((current_round, player_count), caller);
            self.round_player_count.write(current_round, player_count + 1);

            self.emit(GameStarted {
                game_id,
                player: caller,
                round: current_round,
                payment_token,
                payment_amount: game_fee,
            });

            game_id
        }

        fn submit_score(
            ref self: ContractState,
            game_id: u256,
            score: u32,
            color_matches: u32
        ) -> bool {
            let caller = get_caller_address();
            let mut game_session = self.game_sessions.read(game_id);

            assert!(game_session.player == caller, "Not your game");
            assert!(!game_session.completed, "Already completed");
            assert!(score > 0, "Invalid score");

            // Update game session
            game_session.score = score;
            game_session.color_matches = color_matches;
            game_session.completed = true;
            self.game_sessions.write(game_id, game_session);

            // Update player round stats
            let round = game_session.round;
            let mut round_stats = self.player_round_stats.read((caller, round));
            round_stats.games_played += 1;
            round_stats.total_score += score.into();
            if score > round_stats.best_score {
                round_stats.best_score = score;
            }
            self.player_round_stats.write((caller, round), round_stats);

            // Update leaderboards
            self._update_round_leaderboard(caller, score, round);
            self._update_historic_leaderboard(caller, score);

            // Get updated position
            let position = self.player_round_stats.read((caller, round)).round_position;

            self.emit(GameCompleted {
                game_id,
                player: caller,
                round,
                score,
                round_position: position,
            });

            true
        }

        fn get_current_round_leaderboard(
            self: @ContractState,
            limit: u32
        ) -> Array<LeaderboardEntry> {
            let mut leaderboard = ArrayTrait::new();
            let round = self.current_round.read();
            let board_size = self.round_leaderboard_size.read(round);
            let actual_limit = if limit > board_size { board_size } else { limit };

            let mut i = 0;
            while i < actual_limit {
                let player = self.round_leaderboard.read((round, i));
                let score = self.round_leaderboard_scores.read((round, i));
                leaderboard.append(LeaderboardEntry {
                    player,
                    score,
                    position: i + 1,
                });
                i += 1;
            };

            leaderboard
        }

        fn get_historic_leaderboard(self: @ContractState, limit: u32) -> Array<LeaderboardEntry> {
            let mut leaderboard = ArrayTrait::new();
            let board_size = self.historic_leaderboard_size.read();
            let actual_limit = if limit > board_size { board_size } else { limit };

            let mut i = 0;
            while i < actual_limit {
                let player = self.historic_leaderboard.read(i);
                let score = self.historic_leaderboard_scores.read(i);
                leaderboard.append(LeaderboardEntry {
                    player,
                    score,
                    position: i + 1,
                });
                i += 1;
            };

            leaderboard
        }

        fn get_player_round_position(self: @ContractState, player: ContractAddress) -> u32 {
            let round = self.current_round.read();
            let stats = self.player_round_stats.read((player, round));
            stats.round_position
        }

        fn get_current_round(self: @ContractState) -> u32 {
            self.current_round.read()
        }

        fn get_games_in_current_round(self: @ContractState) -> u32 {
            self.games_in_current_round.read()
        }

        fn end_round_and_distribute(ref self: ContractState) -> bool {
            self._only_admin();

            let round = self.current_round.read();
            let games_played = self.games_in_current_round.read();

            // Get top 3 players
            let first = self.round_leaderboard.read((round, 0));
            let second = self.round_leaderboard.read((round, 1));
            let third = self.round_leaderboard.read((round, 2));

            // Calculate distributions (simplified - would need token-specific logic)
            // This is a placeholder for the distribution logic

            self.emit(RoundEnded {
                round,
                total_games: games_played,
                total_fees_collected: 0, // Would calculate from all tokens
            });

            // Start new round
            self.current_round.write(round + 1);
            self.games_in_current_round.write(0);

            true
        }

        fn set_games_per_round(ref self: ContractState, games: u32) {
            self._only_admin();
            self.games_per_round.write(games);
        }

        fn set_game_fee(ref self: ContractState, token: ContractAddress, fee: u256) {
            self._only_admin();
            self.token_fees.write(token, fee);
            self.supported_tokens.write(token, true);
        }

        fn claim_house_fees(ref self: ContractState, token: ContractAddress) -> u256 {
            self._only_owner();
            let claimable = self.house_claimable_fees.read(token);
            self.house_claimable_fees.write(token, 0);
            claimable
        }

        fn set_airdrop_contract(ref self: ContractState, airdrop: ContractAddress) {
            self._only_admin();
            self.airdrop_contract.write(airdrop);
        }

        fn delegate_admin(ref self: ContractState, new_admin: ContractAddress) {
            self._only_owner();
            let previous_admin = self.admin.read();
            self.admin.write(new_admin);

            self.emit(AdminDelegated {
                previous_admin,
                new_admin,
            });
        }

        fn pause_game(ref self: ContractState) {
            self._only_admin();
            self.game_paused.write(true);
        }

        fn unpause_game(ref self: ContractState) {
            self._only_admin();
            self.game_paused.write(false);
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _only_owner(self: @ContractState) {
            let caller = get_caller_address();
            assert!(caller == self.owner.read(), "Only owner");
        }

        fn _only_admin(self: @ContractState) {
            let caller = get_caller_address();
            let is_owner = caller == self.owner.read();
            let is_admin = caller == self.admin.read();
            assert!(is_owner || is_admin, "Only admin");
        }

        fn _update_round_leaderboard(ref self: ContractState, player: ContractAddress, score: u32, round: u32) {
            let board_size = self.round_leaderboard_size.read(round);
            let max_size = 100;

            let mut position = board_size;
            let mut i = 0;

            // Find insertion position
            while i < board_size {
                if score > self.round_leaderboard_scores.read((round, i)) {
                    position = i;
                    break;
                }
                i += 1;
            };

            // Shift entries and update their positions
            if position < max_size {
                let mut j = if board_size < max_size { board_size } else { max_size - 1 };
                while j > position {
                    let prev_player = self.round_leaderboard.read((round, j - 1));
                    let prev_score = self.round_leaderboard_scores.read((round, j - 1));
                    self.round_leaderboard.write((round, j), prev_player);
                    self.round_leaderboard_scores.write((round, j), prev_score);

                    // Update shifted player's position
                    let mut shifted_stats = self.player_round_stats.read((prev_player, round));
                    shifted_stats.round_position = j + 1;
                    self.player_round_stats.write((prev_player, round), shifted_stats);

                    j -= 1;
                };

                // Insert new entry
                self.round_leaderboard.write((round, position), player);
                self.round_leaderboard_scores.write((round, position), score);

                if board_size < max_size {
                    self.round_leaderboard_size.write(round, board_size + 1);
                }

                // Update player position
                let mut player_stats = self.player_round_stats.read((player, round));
                player_stats.round_position = position + 1;
                self.player_round_stats.write((player, round), player_stats)
            }
        }

        fn _update_historic_leaderboard(ref self: ContractState, player: ContractAddress, score: u32) {
            let board_size = self.historic_leaderboard_size.read();
            let max_size = 100;

            let mut position = board_size;
            let mut i = 0;

            while i < board_size {
                if score > self.historic_leaderboard_scores.read(i) {
                    position = i;
                    break;
                }
                i += 1;
            };

            if position < max_size {
                let mut j = if board_size < max_size { board_size } else { max_size - 1 };
                while j > position {
                    let prev_player = self.historic_leaderboard.read(j - 1);
                    let prev_score = self.historic_leaderboard_scores.read(j - 1);
                    self.historic_leaderboard.write(j, prev_player);
                    self.historic_leaderboard_scores.write(j, prev_score);
                    j -= 1;
                };

                self.historic_leaderboard.write(position, player);
                self.historic_leaderboard_scores.write(position, score);

                if board_size < max_size {
                    self.historic_leaderboard_size.write(board_size + 1);
                }
            }
        }
    }
}
