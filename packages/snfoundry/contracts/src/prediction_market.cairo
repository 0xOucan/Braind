use starknet::ContractAddress;

// Structs defined outside for visibility in the interface
#[derive(Copy, Drop, Serde)]
pub struct MarketInfo {
    pub market_id: u256,
    pub game_contract: ContractAddress,
    pub round: u32,
    pub target_player: ContractAddress,
    pub resolved: bool,
    pub player_won: bool,
    pub total_bets: u256,
    pub win_pool: u256,
    pub lose_pool: u256,
}

#[derive(Copy, Drop, Serde)]
pub struct BetInfo {
    pub bet_id: u256,
    pub market_id: u256,
    pub bettor: ContractAddress,
    pub prediction: bool,
    pub amount: u256,
    pub claimed: bool,
    pub is_winner: bool,
    pub payout: u256,
}

#[starknet::interface]
pub trait IPredictionMarket<TContractState> {
    // Betting functions
    fn create_market(
        ref self: TContractState,
        game_contract: ContractAddress,
        round: u32,
        player: ContractAddress
    ) -> u256;
    fn place_bet(
        ref self: TContractState,
        market_id: u256,
        prediction: bool, // true = win, false = lose
        token: ContractAddress,
        amount: u256
    ) -> u256;
    fn resolve_market(ref self: TContractState, market_id: u256, player_won: bool) -> bool;
    fn claim_winnings(ref self: TContractState, bet_id: u256) -> u256;

    // Query functions
    fn get_market_info(self: @TContractState, market_id: u256) -> MarketInfo;
    fn get_bet_info(self: @TContractState, bet_id: u256) -> BetInfo;
    fn get_player_bets(self: @TContractState, player: ContractAddress) -> Array<u256>;

    // Admin functions
    fn claim_house_fees(ref self: TContractState, token: ContractAddress) -> u256;
    fn set_airdrop_contract(ref self: TContractState, airdrop: ContractAddress);
    fn delegate_admin(ref self: TContractState, new_admin: ContractAddress);
    fn pause_market(ref self: TContractState);
    fn unpause_market(ref self: TContractState);
}

#[starknet::contract]
mod PredictionMarket {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map,
        StorageMapReadAccess, StorageMapWriteAccess
    };
    use super::{MarketInfo, BetInfo};

    #[storage]
    struct Storage {
        // Ownership & Admin
        owner: ContractAddress,
        admin: ContractAddress,
        paused: bool,

        // External contracts
        airdrop_contract: ContractAddress,

        // Markets
        next_market_id: u256,
        markets: Map<u256, Market>,

        // Bets
        next_bet_id: u256,
        bets: Map<u256, Bet>,
        player_bets: Map<(ContractAddress, u256), u256>, // (player, index) => bet_id
        player_bet_count: Map<ContractAddress, u256>,

        // Market stats
        market_total_bets: Map<u256, u256>,
        market_win_pool: Map<u256, u256>,
        market_lose_pool: Map<u256, u256>,

        // Fee tracking
        house_claimable: Map<ContractAddress, u256>,
        player_share_pending: Map<(ContractAddress, ContractAddress), u256>, // (player, token) => amount
        random_distribution_pool: Map<ContractAddress, u256>,
        airdrop_pending: Map<ContractAddress, u256>,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    pub struct Market {
        pub market_id: u256,
        pub game_contract: ContractAddress,
        pub round: u32,
        pub target_player: ContractAddress,
        pub resolved: bool,
        pub player_won: bool,
        pub created_at: u64,
        pub resolved_at: u64,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    pub struct Bet {
        pub bet_id: u256,
        pub market_id: u256,
        pub bettor: ContractAddress,
        pub prediction: bool, // true = win, false = lose
        pub token: ContractAddress,
        pub amount: u256,
        pub claimed: bool,
        pub timestamp: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        MarketCreated: MarketCreated,
        BetPlaced: BetPlaced,
        MarketResolved: MarketResolved,
        WinningsClaimed: WinningsClaimed,
        AdminDelegated: AdminDelegated,
    }

    #[derive(Drop, starknet::Event)]
    struct MarketCreated {
        market_id: u256,
        game_contract: ContractAddress,
        round: u32,
        target_player: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct BetPlaced {
        bet_id: u256,
        market_id: u256,
        bettor: ContractAddress,
        prediction: bool,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct MarketResolved {
        market_id: u256,
        player_won: bool,
        total_payout: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct WinningsClaimed {
        bet_id: u256,
        bettor: ContractAddress,
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
        airdrop_contract: ContractAddress
    ) {
        self.owner.write(owner);
        self.admin.write(owner);
        self.paused.write(false);
        self.next_market_id.write(1);
        self.next_bet_id.write(1);
        self.airdrop_contract.write(airdrop_contract);
    }

    #[abi(embed_v0)]
    impl PredictionMarket of super::IPredictionMarket<ContractState> {
        fn create_market(
            ref self: ContractState,
            game_contract: ContractAddress,
            round: u32,
            player: ContractAddress
        ) -> u256 {
            assert!(!self.paused.read(), "Market paused");

            let market_id = self.next_market_id.read();
            let timestamp = get_block_timestamp();

            let market = Market {
                market_id,
                game_contract,
                round,
                target_player: player,
                resolved: false,
                player_won: false,
                created_at: timestamp,
                resolved_at: 0,
            };

            self.markets.write(market_id, market);
            self.next_market_id.write(market_id + 1);

            self.emit(MarketCreated {
                market_id,
                game_contract,
                round,
                target_player: player,
            });

            market_id
        }

        fn place_bet(
            ref self: ContractState,
            market_id: u256,
            prediction: bool,
            token: ContractAddress,
            amount: u256
        ) -> u256 {
            assert!(!self.paused.read(), "Market paused");
            let market = self.markets.read(market_id);
            assert!(!market.resolved, "Market resolved");

            let caller = get_caller_address();
            let timestamp = get_block_timestamp();

            // Note: ERC20 transfer would happen here

            // Create bet
            let bet_id = self.next_bet_id.read();
            let bet = Bet {
                bet_id,
                market_id,
                bettor: caller,
                prediction,
                token,
                amount,
                claimed: false,
                timestamp,
            };

            self.bets.write(bet_id, bet);
            self.next_bet_id.write(bet_id + 1);

            // Track player bets
            let player_bet_count = self.player_bet_count.read(caller);
            self.player_bets.write((caller, player_bet_count), bet_id);
            self.player_bet_count.write(caller, player_bet_count + 1);

            // Update market pools
            let total_bets = self.market_total_bets.read(market_id);
            self.market_total_bets.write(market_id, total_bets + amount);

            if prediction {
                let win_pool = self.market_win_pool.read(market_id);
                self.market_win_pool.write(market_id, win_pool + amount);
            } else {
                let lose_pool = self.market_lose_pool.read(market_id);
                self.market_lose_pool.write(market_id, lose_pool + amount);
            }

            self.emit(BetPlaced {
                bet_id,
                market_id,
                bettor: caller,
                prediction,
                amount,
            });

            bet_id
        }

        fn resolve_market(ref self: ContractState, market_id: u256, player_won: bool) -> bool {
            self._only_admin();

            let mut market = self.markets.read(market_id);
            assert!(!market.resolved, "Already resolved");

            market.resolved = true;
            market.player_won = player_won;
            market.resolved_at = get_block_timestamp();
            self.markets.write(market_id, market);

            // Calculate distributions
            let total_pool = self.market_total_bets.read(market_id);

            // Distribution breakdown (from 100%):
            // 50% -> Winning bettors (gambler prize pool)
            // 25% -> Target player
            // 15% -> House
            // 5% -> Random distribution
            // 5% -> Airdrop

            // Note: Actual distribution logic would be implemented here

            self.emit(MarketResolved {
                market_id,
                player_won,
                total_payout: total_pool,
            });

            true
        }

        fn claim_winnings(ref self: ContractState, bet_id: u256) -> u256 {
            let caller = get_caller_address();
            let mut bet = self.bets.read(bet_id);

            assert!(bet.bettor == caller, "Not your bet");
            assert!(!bet.claimed, "Already claimed");

            let market = self.markets.read(bet.market_id);
            assert!(market.resolved, "Market not resolved");

            // Check if bet won
            let won = bet.prediction == market.player_won;
            assert!(won, "Bet lost");

            // Calculate payout (simplified)
            let payout = bet.amount; // Would calculate based on pool ratios

            bet.claimed = true;
            self.bets.write(bet_id, bet);

            self.emit(WinningsClaimed {
                bet_id,
                bettor: caller,
                amount: payout,
            });

            payout
        }

        fn get_market_info(self: @ContractState, market_id: u256) -> MarketInfo {
            let market = self.markets.read(market_id);
            MarketInfo {
                market_id,
                game_contract: market.game_contract,
                round: market.round,
                target_player: market.target_player,
                resolved: market.resolved,
                player_won: market.player_won,
                total_bets: self.market_total_bets.read(market_id),
                win_pool: self.market_win_pool.read(market_id),
                lose_pool: self.market_lose_pool.read(market_id),
            }
        }

        fn get_bet_info(self: @ContractState, bet_id: u256) -> BetInfo {
            let bet = self.bets.read(bet_id);
            let market = self.markets.read(bet.market_id);

            let is_winner = if market.resolved {
                bet.prediction == market.player_won
            } else {
                false
            };

            BetInfo {
                bet_id,
                market_id: bet.market_id,
                bettor: bet.bettor,
                prediction: bet.prediction,
                amount: bet.amount,
                claimed: bet.claimed,
                is_winner,
                payout: 0, // Would calculate
            }
        }

        fn get_player_bets(self: @ContractState, player: ContractAddress) -> Array<u256> {
            let mut bets = ArrayTrait::new();
            let count = self.player_bet_count.read(player);

            let mut i = 0;
            while i < count {
                let bet_id = self.player_bets.read((player, i));
                bets.append(bet_id);
                i += 1;
            };

            bets
        }

        fn claim_house_fees(ref self: ContractState, token: ContractAddress) -> u256 {
            self._only_owner();
            let claimable = self.house_claimable.read(token);
            self.house_claimable.write(token, 0);
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

        fn pause_market(ref self: ContractState) {
            self._only_admin();
            self.paused.write(true);
        }

        fn unpause_market(ref self: ContractState) {
            self._only_admin();
            self.paused.write(false);
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
    }
}
