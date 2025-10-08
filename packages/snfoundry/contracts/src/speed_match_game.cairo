use starknet::ContractAddress;

#[starknet::interface]
pub trait ISpeedMatchGame<TContractState> {
    // Game functions
    fn start_game(ref self: TContractState, payment_token: ContractAddress, difficulty: u8) -> u256;
    fn submit_score(
        ref self: TContractState,
        game_id: u256,
        score: u32,
        correct_matches: u32,
        time_taken: u32
    ) -> bool;
    fn get_game_session(self: @TContractState, game_id: u256) -> GameSession;
    fn get_player_stats(self: @TContractState, player: ContractAddress) -> PlayerStats;
    fn get_player_best_time(self: @TContractState, player: ContractAddress) -> u32;

    // Admin functions
    fn set_game_fee(ref self: TContractState, token: ContractAddress, fee: u256);
    fn get_game_fee(self: @TContractState, token: ContractAddress) -> u256;
    fn withdraw_funds(ref self: TContractState, token: ContractAddress, amount: u256);
    fn pause_game(ref self: TContractState);
    fn unpause_game(ref self: TContractState);
}

#[starknet::contract]
mod SpeedMatchGame {
    use starknet::{
        ContractAddress, get_caller_address, get_block_timestamp, get_contract_address
    };
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, StoragePathEntry, Map
    };
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,

        // Game configuration
        game_paused: bool,

        // Supported payment tokens
        token_fees: Map<ContractAddress, u256>,
        supported_tokens: Map<ContractAddress, bool>,

        // Game sessions
        game_sessions: Map<u256, GameSession>,
        next_game_id: u256,

        // Player data
        player_stats: Map<ContractAddress, PlayerStats>,
        player_game_ids: Map<(ContractAddress, u256), u256>,
        player_game_count: Map<ContractAddress, u256>,

        // Difficulty-based best times
        player_best_times: Map<(ContractAddress, u8), u32>,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    pub struct GameSession {
        pub game_id: u256,
        pub player: ContractAddress,
        pub score: u32,
        pub correct_matches: u32,
        pub time_taken: u32,
        pub difficulty: u8, // 1=Easy, 2=Medium, 3=Hard
        pub payment_token: ContractAddress,
        pub payment_amount: u256,
        pub timestamp: u64,
        pub completed: bool,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    pub struct PlayerStats {
        pub games_played: u32,
        pub total_score: u64,
        pub high_score: u32,
        pub total_correct_matches: u64,
        pub best_time: u32, // in milliseconds
        pub total_paid: u256,
        pub last_played: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        GameStarted: GameStarted,
        GameCompleted: GameCompleted,
        PaymentReceived: PaymentReceived,
        NewBestTime: NewBestTime,
    }

    #[derive(Drop, starknet::Event)]
    struct GameStarted {
        game_id: u256,
        player: ContractAddress,
        difficulty: u8,
        payment_token: ContractAddress,
        payment_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct GameCompleted {
        game_id: u256,
        player: ContractAddress,
        score: u32,
        time_taken: u32,
        correct_matches: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct PaymentReceived {
        from: ContractAddress,
        token: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct NewBestTime {
        player: ContractAddress,
        difficulty: u8,
        time: u32,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        stark_token: ContractAddress,
        usdc_token: ContractAddress,
        eth_token: ContractAddress
    ) {
        self.ownable.initializer(owner);
        self.game_paused.write(false);
        self.next_game_id.write(1);

        // Set default game fees (same as ColorMatch)
        // 0.01 STARK (18 decimals)
        self.token_fees.write(stark_token, 10000000000000000);
        self.supported_tokens.write(stark_token, true);

        // 0.01 USDC (6 decimals)
        self.token_fees.write(usdc_token, 10000);
        self.supported_tokens.write(usdc_token, true);

        // 0.0000000001 ETH (18 decimals)
        self.token_fees.write(eth_token, 100000000);
        self.supported_tokens.write(eth_token, true);
    }

    #[abi(embed_v0)]
    impl SpeedMatchGame of super::ISpeedMatchGame<ContractState> {
        fn start_game(
            ref self: ContractState,
            payment_token: ContractAddress,
            difficulty: u8
        ) -> u256 {
            assert!(!self.game_paused.read(), "Game is paused");
            assert!(self.supported_tokens.read(payment_token), "Token not supported");
            assert!(difficulty >= 1 && difficulty <= 3, "Invalid difficulty");

            let caller = get_caller_address();
            let game_fee = self.token_fees.read(payment_token);

            // Transfer payment from player to contract
            let token = IERC20Dispatcher { contract_address: payment_token };
            let contract_address = get_contract_address();

            assert!(
                token.transfer_from(caller, contract_address, game_fee),
                "Payment failed"
            );

            // Create game session
            let game_id = self.next_game_id.read();
            let timestamp = get_block_timestamp();

            let game_session = GameSession {
                game_id,
                player: caller,
                score: 0,
                correct_matches: 0,
                time_taken: 0,
                difficulty,
                payment_token,
                payment_amount: game_fee,
                timestamp,
                completed: false,
            };

            self.game_sessions.write(game_id, game_session);
            self.next_game_id.write(game_id + 1);

            // Update player game tracking
            let player_game_count = self.player_game_count.read(caller);
            self.player_game_ids.write((caller, player_game_count), game_id);
            self.player_game_count.write(caller, player_game_count + 1);

            self.emit(GameStarted {
                game_id,
                player: caller,
                difficulty,
                payment_token,
                payment_amount: game_fee,
            });

            self.emit(PaymentReceived {
                from: caller,
                token: payment_token,
                amount: game_fee,
            });

            game_id
        }

        fn submit_score(
            ref self: ContractState,
            game_id: u256,
            score: u32,
            correct_matches: u32,
            time_taken: u32
        ) -> bool {
            let caller = get_caller_address();
            let mut game_session = self.game_sessions.read(game_id);

            assert!(game_session.player == caller, "Not your game");
            assert!(!game_session.completed, "Game already completed");
            assert!(score > 0, "Invalid score");
            assert!(time_taken > 0, "Invalid time");

            // Update game session
            game_session.score = score;
            game_session.correct_matches = correct_matches;
            game_session.time_taken = time_taken;
            game_session.completed = true;
            self.game_sessions.write(game_id, game_session);

            // Update player stats
            let mut player_stats = self.player_stats.read(caller);
            player_stats.games_played += 1;
            player_stats.total_score += score.into();
            player_stats.total_correct_matches += correct_matches.into();
            player_stats.total_paid += game_session.payment_amount;
            player_stats.last_played = get_block_timestamp();

            if score > player_stats.high_score {
                player_stats.high_score = score;
            }

            // Update best time (lower is better)
            let current_best = self.player_best_times.read((caller, game_session.difficulty));
            if current_best == 0 || time_taken < current_best {
                self.player_best_times.write((caller, game_session.difficulty), time_taken);
                player_stats.best_time = time_taken;

                self.emit(NewBestTime {
                    player: caller,
                    difficulty: game_session.difficulty,
                    time: time_taken,
                });
            }

            self.player_stats.write(caller, player_stats);

            self.emit(GameCompleted {
                game_id,
                player: caller,
                score,
                time_taken,
                correct_matches,
            });

            true
        }

        fn get_game_session(self: @ContractState, game_id: u256) -> GameSession {
            self.game_sessions.read(game_id)
        }

        fn get_player_stats(self: @ContractState, player: ContractAddress) -> PlayerStats {
            self.player_stats.read(player)
        }

        fn get_player_best_time(self: @ContractState, player: ContractAddress) -> u32 {
            let stats = self.player_stats.read(player);
            stats.best_time
        }

        fn set_game_fee(ref self: ContractState, token: ContractAddress, fee: u256) {
            self.ownable.assert_only_owner();
            self.token_fees.write(token, fee);
            self.supported_tokens.write(token, true);
        }

        fn get_game_fee(self: @ContractState, token: ContractAddress) -> u256 {
            self.token_fees.read(token)
        }

        fn withdraw_funds(ref self: ContractState, token: ContractAddress, amount: u256) {
            self.ownable.assert_only_owner();
            let token_dispatcher = IERC20Dispatcher { contract_address: token };
            let owner = self.ownable.owner();
            assert!(token_dispatcher.transfer(owner, amount), "Withdrawal failed");
        }

        fn pause_game(ref self: ContractState) {
            self.ownable.assert_only_owner();
            self.game_paused.write(true);
        }

        fn unpause_game(ref self: ContractState) {
            self.ownable.assert_only_owner();
            self.game_paused.write(false);
        }
    }
}
