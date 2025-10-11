use starknet::ContractAddress;
use super::common_types::FeeConfig;

#[starknet::interface]
pub trait IGamePaymentHandler<TContractState> {
    // Player functions
    fn approve_for_games(ref self: TContractState, token: ContractAddress, amount: u256);
    fn get_allowance(self: @TContractState, player: ContractAddress, token: ContractAddress) -> u256;

    // Game contract functions
    fn charge_game_fee(
        ref self: TContractState,
        player: ContractAddress,
        token: ContractAddress
    ) -> bool;

    // Admin functions
    fn set_game_fee(ref self: TContractState, token: ContractAddress, fee: u256);
    fn set_fee_config(ref self: TContractState, config: FeeConfig);
    fn set_airdrop_contract(ref self: TContractState, airdrop: ContractAddress);
    fn set_prediction_market(ref self: TContractState, market: ContractAddress);
    fn add_authorized_game(ref self: TContractState, game: ContractAddress);
    fn remove_authorized_game(ref self: TContractState, game: ContractAddress);
    fn claim_house_fees(ref self: TContractState, token: ContractAddress) -> u256;

    // View functions
    fn get_game_fee(self: @TContractState, token: ContractAddress) -> u256;
    fn get_fee_config(self: @TContractState) -> FeeConfig;
    fn is_game_authorized(self: @TContractState, game: ContractAddress) -> bool;
}

#[starknet::contract]
mod GamePaymentHandler {
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map,
        StorageMapReadAccess, StorageMapWriteAccess
    };
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use super::super::common_types::FeeConfig;

    #[storage]
    struct Storage {
        owner: ContractAddress,

        // Fee configuration
        token_fees: Map<ContractAddress, u256>,
        fee_config: FeeConfig,

        // External contracts
        airdrop_contract: ContractAddress,
        prediction_market: ContractAddress,

        // Authorized games
        authorized_games: Map<ContractAddress, bool>,

        // Player allowances per token
        player_allowances: Map<(ContractAddress, ContractAddress), u256>,

        // House fees accumulated
        house_fees: Map<ContractAddress, u256>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        GameFeeCharged: GameFeeCharged,
        AllowanceSet: AllowanceSet,
        FeeConfigUpdated: FeeConfigUpdated,
        HouseFeesClaimed: HouseFeesClaimed,
    }

    #[derive(Drop, starknet::Event)]
    struct GameFeeCharged {
        player: ContractAddress,
        game: ContractAddress,
        token: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct AllowanceSet {
        player: ContractAddress,
        token: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct FeeConfigUpdated {
        house_bps: u16,
        airdrop_bps: u16,
        prediction_bps: u16,
    }

    #[derive(Drop, starknet::Event)]
    struct HouseFeesClaimed {
        token: ContractAddress,
        amount: u256,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        airdrop: ContractAddress,
        prediction_market: ContractAddress,
    ) {
        self.owner.write(owner);
        self.airdrop_contract.write(airdrop);
        self.prediction_market.write(prediction_market);

        // Default fee split: 10% house, 5% airdrop, 85% prediction
        self.fee_config.write(FeeConfig {
            house_fee_bps: 1000,      // 10%
            airdrop_fee_bps: 500,     // 5%
            prediction_fee_bps: 8500, // 85%
        });
    }

    #[abi(embed_v0)]
    impl GamePaymentHandlerImpl of super::IGamePaymentHandler<ContractState> {
        fn approve_for_games(ref self: ContractState, token: ContractAddress, amount: u256) {
            let caller = get_caller_address();

            // Transfer tokens from player to this contract
            let token_dispatcher = IERC20Dispatcher { contract_address: token };
            let success = token_dispatcher.transfer_from(caller, get_contract_address(), amount);
            assert(success, 'Transfer failed');

            // Update allowance
            let current = self.player_allowances.read((caller, token));
            self.player_allowances.write((caller, token), current + amount);

            self.emit(AllowanceSet { player: caller, token, amount: current + amount });
        }

        fn get_allowance(self: @ContractState, player: ContractAddress, token: ContractAddress) -> u256 {
            self.player_allowances.read((player, token))
        }

        fn charge_game_fee(
            ref self: ContractState,
            player: ContractAddress,
            token: ContractAddress
        ) -> bool {
            let caller = get_caller_address();

            // Only authorized games can charge fees
            assert(self.authorized_games.read(caller), 'Unauthorized game');

            let fee = self.token_fees.read(token);
            let allowance = self.player_allowances.read((player, token));

            assert(allowance >= fee, 'Insufficient allowance');

            // Deduct from allowance
            self.player_allowances.write((player, token), allowance - fee);

            // Split fees
            let config = self.fee_config.read();
            let house_amount = (fee * config.house_fee_bps.into()) / 10000;
            let airdrop_amount = (fee * config.airdrop_fee_bps.into()) / 10000;
            let prediction_amount = (fee * config.prediction_fee_bps.into()) / 10000;

            // Accumulate house fees
            let current_house = self.house_fees.read(token);
            self.house_fees.write(token, current_house + house_amount);

            // Transfer to airdrop
            if airdrop_amount > 0 {
                let token_dispatcher = IERC20Dispatcher { contract_address: token };
                token_dispatcher.transfer(self.airdrop_contract.read(), airdrop_amount);
            }

            // Transfer to prediction market
            if prediction_amount > 0 {
                let token_dispatcher = IERC20Dispatcher { contract_address: token };
                token_dispatcher.transfer(self.prediction_market.read(), prediction_amount);
            }

            self.emit(GameFeeCharged { player, game: caller, token, amount: fee });
            true
        }

        fn set_game_fee(ref self: ContractState, token: ContractAddress, fee: u256) {
            assert(get_caller_address() == self.owner.read(), 'Only owner');
            self.token_fees.write(token, fee);
        }

        fn set_fee_config(ref self: ContractState, config: FeeConfig) {
            assert(get_caller_address() == self.owner.read(), 'Only owner');

            // Validate total is 100%
            let total = config.house_fee_bps + config.airdrop_fee_bps + config.prediction_fee_bps;
            assert(total == 10000, 'Total must be 10000 bps');

            self.fee_config.write(config);

            self.emit(FeeConfigUpdated {
                house_bps: config.house_fee_bps,
                airdrop_bps: config.airdrop_fee_bps,
                prediction_bps: config.prediction_fee_bps,
            });
        }

        fn set_airdrop_contract(ref self: ContractState, airdrop: ContractAddress) {
            assert(get_caller_address() == self.owner.read(), 'Only owner');
            self.airdrop_contract.write(airdrop);
        }

        fn set_prediction_market(ref self: ContractState, market: ContractAddress) {
            assert(get_caller_address() == self.owner.read(), 'Only owner');
            self.prediction_market.write(market);
        }

        fn add_authorized_game(ref self: ContractState, game: ContractAddress) {
            assert(get_caller_address() == self.owner.read(), 'Only owner');
            self.authorized_games.write(game, true);
        }

        fn remove_authorized_game(ref self: ContractState, game: ContractAddress) {
            assert(get_caller_address() == self.owner.read(), 'Only owner');
            self.authorized_games.write(game, false);
        }

        fn claim_house_fees(ref self: ContractState, token: ContractAddress) -> u256 {
            assert(get_caller_address() == self.owner.read(), 'Only owner');

            let amount = self.house_fees.read(token);
            assert(amount > 0, 'No fees to claim');

            self.house_fees.write(token, 0);

            let token_dispatcher = IERC20Dispatcher { contract_address: token };
            token_dispatcher.transfer(self.owner.read(), amount);

            self.emit(HouseFeesClaimed { token, amount });
            amount
        }

        fn get_game_fee(self: @ContractState, token: ContractAddress) -> u256 {
            self.token_fees.read(token)
        }

        fn get_fee_config(self: @ContractState) -> FeeConfig {
            self.fee_config.read()
        }

        fn is_game_authorized(self: @ContractState, game: ContractAddress) -> bool {
            self.authorized_games.read(game)
        }
    }
}
