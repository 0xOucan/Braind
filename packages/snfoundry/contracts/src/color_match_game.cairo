use starknet::ContractAddress;

// Structs defined outside for visibility in the interface
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct GameSession {
    pub game_id: u256,
    pub player: ContractAddress,
    pub score: u32,
    pub color_matches: u32,
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
    pub total_color_matches: u64,
    pub total_paid: u256,
    pub last_played: u64,
}

#[starknet::interface]
pub trait IColorMatchGame<TContractState> {
    // Game functions
    fn start_game(ref self: TContractState, payment_token: ContractAddress) -> u256;
    fn submit_score(ref self: TContractState, game_id: u256, score: u32, color_matches: u32) -> bool;
    fn get_game_session(self: @TContractState, game_id: u256) -> GameSession;
    fn get_player_stats(self: @TContractState, player: ContractAddress) -> PlayerStats;
    fn get_player_high_score(self: @TContractState, player: ContractAddress) -> u32;

    // Admin functions
    fn set_game_fee(ref self: TContractState, token: ContractAddress, fee: u256);
    fn get_game_fee(self: @TContractState, token: ContractAddress) -> u256;
    fn withdraw_funds(ref self: TContractState, token: ContractAddress, amount: u256);
    fn pause_game(ref self: TContractState);
    fn unpause_game(ref self: TContractState);
}

#[starknet::contract]
mod ColorMatchGame {
    use starknet::{
        ContractAddress, get_caller_address, get_block_timestamp, get_contract_address
    };
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map,
        StorageMapReadAccess, StorageMapWriteAccess
    };
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use super::{GameSession, PlayerStats};

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
        game_fee_stark: u256,  // 0.01 STARK
        game_fee_usdc: u256,   // 0.01 USDC (6 decimals)
        game_fee_eth: u256,    // 0.0000000001 ETH

        // Supported payment tokens (add STARK, USDC, ETH addresses)
        token_fees: Map<ContractAddress, u256>,
        supported_tokens: Map<ContractAddress, bool>,

        // Game sessions
        game_sessions: Map<u256, GameSession>,
        next_game_id: u256,

        // Player data
        player_stats: Map<ContractAddress, PlayerStats>,
        player_game_ids: Map<(ContractAddress, u256), u256>,
        player_game_count: Map<ContractAddress, u256>,

        // Game manager contract
        game_manager: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        GameStarted: GameStarted,
        GameCompleted: GameCompleted,
        PaymentReceived: PaymentReceived,
    }

    #[derive(Drop, starknet::Event)]
    struct GameStarted {
        game_id: u256,
        player: ContractAddress,
        payment_token: ContractAddress,
        payment_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct GameCompleted {
        game_id: u256,
        player: ContractAddress,
        score: u32,
        color_matches: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct PaymentReceived {
        from: ContractAddress,
        token: ContractAddress,
        amount: u256,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        game_manager: ContractAddress,
        stark_token: ContractAddress,
        usdc_token: ContractAddress,
        eth_token: ContractAddress
    ) {
        self.ownable.initializer(owner);
        self.game_manager.write(game_manager);
        self.game_paused.write(false);
        self.next_game_id.write(1);

        // Set default game fees
        // 0.01 STARK (18 decimals)
        self.game_fee_stark.write(10000000000000000);
        self.token_fees.write(stark_token, 10000000000000000);
        self.supported_tokens.write(stark_token, true);

        // 0.01 USDC (6 decimals)
        self.game_fee_usdc.write(10000);
        self.token_fees.write(usdc_token, 10000);
        self.supported_tokens.write(usdc_token, true);

        // 0.0000000001 ETH (18 decimals)
        self.game_fee_eth.write(100000000);
        self.token_fees.write(eth_token, 100000000);
        self.supported_tokens.write(eth_token, true);
    }

    #[abi(embed_v0)]
    impl ColorMatchGame of super::IColorMatchGame<ContractState> {
        fn start_game(ref self: ContractState, payment_token: ContractAddress) -> u256 {
            assert!(!self.game_paused.read(), "Game is paused");
            assert!(self.supported_tokens.read(payment_token), "Token not supported");

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
                color_matches: 0,
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
            color_matches: u32
        ) -> bool {
            let caller = get_caller_address();
            let mut game_session = self.game_sessions.read(game_id);

            assert!(game_session.player == caller, "Not your game");
            assert!(!game_session.completed, "Game already completed");
            assert!(score > 0, "Invalid score");

            // Update game session
            game_session.score = score;
            game_session.color_matches = color_matches;
            game_session.completed = true;
            self.game_sessions.write(game_id, game_session);

            // Update player stats
            let mut player_stats = self.player_stats.read(caller);
            player_stats.games_played += 1;
            player_stats.total_score += score.into();
            player_stats.total_color_matches += color_matches.into();
            player_stats.total_paid += game_session.payment_amount;
            player_stats.last_played = get_block_timestamp();

            if score > player_stats.high_score {
                player_stats.high_score = score;
            }

            self.player_stats.write(caller, player_stats);

            self.emit(GameCompleted {
                game_id,
                player: caller,
                score,
                color_matches,
            });

            true
        }

        fn get_game_session(self: @ContractState, game_id: u256) -> GameSession {
            self.game_sessions.read(game_id)
        }

        fn get_player_stats(self: @ContractState, player: ContractAddress) -> PlayerStats {
            self.player_stats.read(player)
        }

        fn get_player_high_score(self: @ContractState, player: ContractAddress) -> u32 {
            let stats = self.player_stats.read(player);
            stats.high_score
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
