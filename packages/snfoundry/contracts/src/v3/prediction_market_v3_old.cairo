use starknet::ContractAddress;

// Structs defined outside for visibility in the interface
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct MarketInfo {
    pub market_id: u256,
    pub game_contract: ContractAddress,
    pub round: u32,
    pub session_id: u256,
    pub target_player: ContractAddress,
    pub resolved: bool,
    pub player_won: bool,
    pub total_bets: u256,
    pub win_pool: u256,
    pub lose_pool: u256,
    pub created_at: u64,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
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
pub trait IPredictionMarketV3<TContractState> {
    // V3 Integration - Called by GamePaymentHandler
    fn receive_fee_share(ref self: TContractState, token: ContractAddress, amount: u256);

    // Betting functions
    fn create_market(
        ref self: TContractState,
        game_contract: ContractAddress,
        round: u32,
        session_id: u256,
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
    fn get_player_bets(self: @TContractState, player: ContractAddress, offset: u32, limit: u32) -> Array<u256>;
    fn get_market_stats(self: @TContractState, market_id: u256) -> (u256, u256, u256); // total_bets, win_pool, lose_pool
    fn get_player_market_bet(self: @TContractState, market_id: u256, player: ContractAddress) -> Option<u256>; // Returns bet_id if exists

    // Statistics
    fn get_total_volume(self: @TContractState, token: ContractAddress) -> u256;
    fn get_total_payouts(self: @TContractState, token: ContractAddress) -> u256;
    fn get_house_earnings(self: @TContractState, token: ContractAddress) -> u256;

    // Admin functions
    fn claim_house_fees(ref self: TContractState, token: ContractAddress) -> u256;
    fn set_house_fee_percentage(ref self: TContractState, percentage: u16); // in basis points (100 = 1%)
    fn add_authorized_creator(ref self: TContractState, creator: ContractAddress);
    fn remove_authorized_creator(ref self: TContractState, creator: ContractAddress);
    fn delegate_admin(ref self: TContractState, new_admin: ContractAddress);
    fn pause_market(ref self: TContractState);
    fn unpause_market(ref self: TContractState);
}

#[starknet::contract]
pub mod PredictionMarketV3 {
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

        // Authorization
        authorized_creators: Map<ContractAddress, bool>, // Game contracts authorized
        authorized_depositors: Map<ContractAddress, bool>, // GamePaymentHandler authorized

        // Markets
        next_market_id: u256,
        markets: Map<u256, MarketInfo>,

        // Bets
        next_bet_id: u256,
        bets: Map<u256, BetInfo>,
        player_bet_count: Map<ContractAddress, u32>,
        player_bets: Map<(ContractAddress, u32), u256>, // (player, index) => bet_id

        // Market lookup
        market_player_bet: Map<(u256, ContractAddress), u256>, // (market_id, player) => bet_id
        market_has_player_bet: Map<(u256, ContractAddress), bool>,

        // Fee tracking
        house_fee_percentage: u16, // in basis points (100 = 1%)
        house_claimable: Map<ContractAddress, u256>,
        available_pool: Map<ContractAddress, u256>,

        // Statistics
        total_volume: Map<ContractAddress, u256>,
        total_payouts: Map<ContractAddress, u256>,
        house_total_earned: Map<ContractAddress, u256>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        FeeShareReceived: FeeShareReceived,
        MarketCreated: MarketCreated,
        BetPlaced: BetPlaced,
        MarketResolved: MarketResolved,
        WinningsClaimed: WinningsClaimed,
        HouseFeesClaimed: HouseFeesClaimed,
    }

    #[derive(Drop, starknet::Event)]
    struct FeeShareReceived {
        token: ContractAddress,
        amount: u256,
        from: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct MarketCreated {
        market_id: u256,
        game_contract: ContractAddress,
        round: u32,
        session_id: u256,
        player: ContractAddress,
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
        payout: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct HouseFeesClaimed {
        token: ContractAddress,
        amount: u256,
    }

    const DEFAULT_HOUSE_FEE_BPS: u16 = 500; // 5%
    const MAX_HOUSE_FEE_BPS: u16 = 2000; // 20% max

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        admin: ContractAddress,
    ) {
        self.owner.write(owner);
        self.admin.write(admin);
        self.next_market_id.write(1);
        self.next_bet_id.write(1);
        self.house_fee_percentage.write(DEFAULT_HOUSE_FEE_BPS);
        self.paused.write(false);
    }

    #[abi(embed_v0)]
    impl PredictionMarketV3Impl of super::IPredictionMarketV3<ContractState> {
        fn receive_fee_share(ref self: ContractState, token: ContractAddress, amount: u256) {
            let caller = get_caller_address();
            assert!(self.authorized_depositors.read(caller), "Not authorized");

            let current_pool = self.available_pool.read(token);
            self.available_pool.write(token, current_pool + amount);

            self.emit(FeeShareReceived {
                token,
                amount,
                from: caller,
            });
        }

        fn create_market(
            ref self: ContractState,
            game_contract: ContractAddress,
            round: u32,
            session_id: u256,
            player: ContractAddress
        ) -> u256 {
            assert!(!self.paused.read(), "Market is paused");

            let caller = get_caller_address();
            assert!(
                self.authorized_creators.read(caller) || caller == self.owner.read() || caller == self.admin.read(),
                "Not authorized"
            );

            let market_id = self.next_market_id.read();

            let market = MarketInfo {
                market_id,
                game_contract,
                round,
                session_id,
                target_player: player,
                resolved: false,
                player_won: false,
                total_bets: 0,
                win_pool: 0,
                lose_pool: 0,
                created_at: get_block_timestamp(),
            };

            self.markets.write(market_id, market);
            self.next_market_id.write(market_id + 1);

            self.emit(MarketCreated {
                market_id,
                game_contract,
                round,
                session_id,
                player,
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
            assert!(!self.paused.read(), "Market is paused");
            assert!(amount > 0, "Amount must be positive");

            let bettor = get_caller_address();
            let mut market = self.markets.read(market_id);

            assert!(!market.resolved, "Market already resolved");
            assert!(!self.market_has_player_bet.read((market_id, bettor)), "Already bet on this market");

            // Calculate house fee
            let fee_bps: u256 = self.house_fee_percentage.read().into();
            let house_fee = (amount * fee_bps) / 10000;
            let bet_amount = amount - house_fee;

            // Update market pools
            if prediction {
                market.win_pool += bet_amount;
            } else {
                market.lose_pool += bet_amount;
            }
            market.total_bets += bet_amount;

            self.markets.write(market_id, market);

            // Create bet
            let bet_id = self.next_bet_id.read();

            let bet = BetInfo {
                bet_id,
                market_id,
                bettor,
                prediction,
                amount: bet_amount,
                claimed: false,
                is_winner: false,
                payout: 0,
            };

            self.bets.write(bet_id, bet);
            self.next_bet_id.write(bet_id + 1);

            // Track player bets
            let player_bet_count = self.player_bet_count.read(bettor);
            self.player_bets.write((bettor, player_bet_count), bet_id);
            self.player_bet_count.write(bettor, player_bet_count + 1);

            // Mark player as having bet on this market
            self.market_player_bet.write((market_id, bettor), bet_id);
            self.market_has_player_bet.write((market_id, bettor), true);

            // Update house fees
            let house_claimable = self.house_claimable.read(token);
            self.house_claimable.write(token, house_claimable + house_fee);

            let house_earned = self.house_total_earned.read(token);
            self.house_total_earned.write(token, house_earned + house_fee);

            // Update statistics
            let total_volume = self.total_volume.read(token);
            self.total_volume.write(token, total_volume + amount);

            self.emit(BetPlaced {
                bet_id,
                market_id,
                bettor,
                prediction,
                amount: bet_amount,
            });

            bet_id
        }

        fn resolve_market(ref self: ContractState, market_id: u256, player_won: bool) -> bool {
            self._only_admin();

            let mut market = self.markets.read(market_id);
            assert!(!market.resolved, "Already resolved");

            market.resolved = true;
            market.player_won = player_won;

            self.markets.write(market_id, market);

            self.emit(MarketResolved {
                market_id,
                player_won,
                total_payout: market.total_bets,
            });

            true
        }

        fn claim_winnings(ref self: ContractState, bet_id: u256) -> u256 {
            let bettor = get_caller_address();
            let mut bet = self.bets.read(bet_id);

            assert!(bet.bettor == bettor, "Not bet owner");
            assert!(!bet.claimed, "Already claimed");

            let market = self.markets.read(bet.market_id);
            assert!(market.resolved, "Market not resolved");

            // Calculate payout
            let mut payout: u256 = 0;

            if bet.prediction == market.player_won {
                // Winner
                bet.is_winner = true;

                // Calculate proportional payout
                let winning_pool = if market.player_won { market.win_pool } else { market.lose_pool };
                let losing_pool = if market.player_won { market.lose_pool } else { market.win_pool };

                if winning_pool > 0 {
                    // Return original bet + proportional share of losing pool
                    let share = (bet.amount * losing_pool) / winning_pool;
                    payout = bet.amount + share;
                }
            }

            bet.claimed = true;
            bet.payout = payout;
            self.bets.write(bet_id, bet);

            self.emit(WinningsClaimed {
                bet_id,
                bettor,
                payout,
            });

            payout
        }

        fn get_market_info(self: @ContractState, market_id: u256) -> MarketInfo {
            self.markets.read(market_id)
        }

        fn get_bet_info(self: @ContractState, bet_id: u256) -> BetInfo {
            self.bets.read(bet_id)
        }

        fn get_player_bets(
            self: @ContractState,
            player: ContractAddress,
            offset: u32,
            limit: u32
        ) -> Array<u256> {
            let total = self.player_bet_count.read(player);
            let mut bet_ids = ArrayTrait::new();

            let mut i = offset;
            let end = if offset + limit > total { total } else { offset + limit };

            while i < end {
                let bet_id = self.player_bets.read((player, i));
                bet_ids.append(bet_id);
                i += 1;
            };

            bet_ids
        }

        fn get_market_stats(self: @ContractState, market_id: u256) -> (u256, u256, u256) {
            let market = self.markets.read(market_id);
            (market.total_bets, market.win_pool, market.lose_pool)
        }

        fn get_player_market_bet(
            self: @ContractState,
            market_id: u256,
            player: ContractAddress
        ) -> Option<u256> {
            if self.market_has_player_bet.read((market_id, player)) {
                Option::Some(self.market_player_bet.read((market_id, player)))
            } else {
                Option::None
            }
        }

        fn get_total_volume(self: @ContractState, token: ContractAddress) -> u256 {
            self.total_volume.read(token)
        }

        fn get_total_payouts(self: @ContractState, token: ContractAddress) -> u256 {
            self.total_payouts.read(token)
        }

        fn get_house_earnings(self: @ContractState, token: ContractAddress) -> u256 {
            self.house_total_earned.read(token)
        }

        fn claim_house_fees(ref self: ContractState, token: ContractAddress) -> u256 {
            self._only_owner();

            let amount = self.house_claimable.read(token);
            assert!(amount > 0, "No fees to claim");

            self.house_claimable.write(token, 0);

            self.emit(HouseFeesClaimed { token, amount });

            amount
        }

        fn set_house_fee_percentage(ref self: ContractState, percentage: u16) {
            self._only_owner();
            assert!(percentage <= MAX_HOUSE_FEE_BPS, "Fee too high");
            self.house_fee_percentage.write(percentage);
        }

        fn add_authorized_creator(ref self: ContractState, creator: ContractAddress) {
            self._only_owner();
            self.authorized_creators.write(creator, true);
        }

        fn remove_authorized_creator(ref self: ContractState, creator: ContractAddress) {
            self._only_owner();
            self.authorized_creators.write(creator, false);
        }

        fn delegate_admin(ref self: ContractState, new_admin: ContractAddress) {
            self._only_owner();
            self.admin.write(new_admin);
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
            let is_admin = caller == self.owner.read() || caller == self.admin.read();
            assert!(is_admin, "Only admin");
        }
    }
}
