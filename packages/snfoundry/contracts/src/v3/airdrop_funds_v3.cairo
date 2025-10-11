use starknet::ContractAddress;

#[starknet::interface]
pub trait IAirdropFundsV3<TContractState> {
    // V3 Integration - Called by GamePaymentHandler
    fn receive_fee_share(ref self: TContractState, token: ContractAddress, amount: u256);

    // Admin functions
    fn deposit_funds(ref self: TContractState, token: ContractAddress, amount: u256);
    fn get_balance(self: @TContractState, token: ContractAddress) -> u256;
    fn execute_airdrop(
        ref self: TContractState,
        token: ContractAddress,
        recipients: Array<ContractAddress>,
        amount_per_recipient: u256
    ) -> bool;
    fn schedule_airdrop_for_round(
        ref self: TContractState,
        round: u32,
        token: ContractAddress,
        recipients: Array<ContractAddress>,
        amount_per_recipient: u256
    );
    fn execute_scheduled_airdrop(ref self: TContractState, round: u32, token: ContractAddress) -> bool;
    fn withdraw_to_admin(ref self: TContractState, token: ContractAddress, amount: u256);

    // Query functions
    fn get_total_received(self: @TContractState, token: ContractAddress) -> u256;
    fn get_total_distributed(self: @TContractState, token: ContractAddress) -> u256;
    fn get_pending_airdrop_amount(self: @TContractState, round: u32, token: ContractAddress) -> u256;
    fn is_authorized_depositor(self: @TContractState, address: ContractAddress) -> bool;

    // Ownership
    fn transfer_ownership(ref self: TContractState, new_owner: ContractAddress);
    fn add_authorized_depositor(ref self: TContractState, depositor: ContractAddress);
    fn remove_authorized_depositor(ref self: TContractState, depositor: ContractAddress);
    fn get_owner(self: @TContractState) -> ContractAddress;
}

#[starknet::contract]
pub mod AirdropFundsV3 {
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map,
        StorageMapReadAccess, StorageMapWriteAccess
    };

    #[storage]
    struct Storage {
        owner: ContractAddress,
        authorized_depositors: Map<ContractAddress, bool>, // GamePaymentHandler authorized

        // Token balances
        token_balances: Map<ContractAddress, u256>,

        // Statistics
        total_received: Map<ContractAddress, u256>,
        total_distributed: Map<ContractAddress, u256>,
        total_airdrops: u256,
        total_recipients: u256,

        // Scheduled airdrops
        scheduled_airdrop_recipient_count: Map<(u32, ContractAddress), u256>, // (round, token) => count
        scheduled_airdrop_recipients: Map<(u32, ContractAddress, u256), ContractAddress>, // (round, token, index) => recipient
        scheduled_airdrop_amount: Map<(u32, ContractAddress), u256>, // (round, token) => amount per recipient
        scheduled_airdrop_executed: Map<(u32, ContractAddress), bool>, // (round, token) => executed
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        FundsDeposited: FundsDeposited,
        FeeShareReceived: FeeShareReceived,
        AirdropExecuted: AirdropExecuted,
        AirdropScheduled: AirdropScheduled,
        ScheduledAirdropExecuted: ScheduledAirdropExecuted,
        OwnershipTransferred: OwnershipTransferred,
        DepositorAuthorized: DepositorAuthorized,
        DepositorRevoked: DepositorRevoked,
    }

    #[derive(Drop, starknet::Event)]
    struct FundsDeposited {
        token: ContractAddress,
        amount: u256,
        depositor: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct FeeShareReceived {
        token: ContractAddress,
        amount: u256,
        from: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct AirdropExecuted {
        token: ContractAddress,
        total_amount: u256,
        recipient_count: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct AirdropScheduled {
        round: u32,
        token: ContractAddress,
        recipient_count: u256,
        amount_per_recipient: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct ScheduledAirdropExecuted {
        round: u32,
        token: ContractAddress,
        total_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct OwnershipTransferred {
        previous_owner: ContractAddress,
        new_owner: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct DepositorAuthorized {
        depositor: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct DepositorRevoked {
        depositor: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.total_airdrops.write(0);
        self.total_recipients.write(0);
    }

    #[abi(embed_v0)]
    impl AirdropFundsV3Impl of super::IAirdropFundsV3<ContractState> {
        fn receive_fee_share(ref self: ContractState, token: ContractAddress, amount: u256) {
            let caller = get_caller_address();
            assert!(self.authorized_depositors.read(caller), "Not authorized");

            let current_balance = self.token_balances.read(token);
            self.token_balances.write(token, current_balance + amount);

            let total_received = self.total_received.read(token);
            self.total_received.write(token, total_received + amount);

            self.emit(FeeShareReceived {
                token,
                amount,
                from: caller,
            });
        }

        fn deposit_funds(ref self: ContractState, token: ContractAddress, amount: u256) {
            let current_balance = self.token_balances.read(token);
            self.token_balances.write(token, current_balance + amount);

            self.emit(FundsDeposited {
                token,
                amount,
                depositor: get_caller_address(),
            });
        }

        fn get_balance(self: @ContractState, token: ContractAddress) -> u256 {
            self.token_balances.read(token)
        }

        fn execute_airdrop(
            ref self: ContractState,
            token: ContractAddress,
            recipients: Array<ContractAddress>,
            amount_per_recipient: u256
        ) -> bool {
            self._only_owner();

            let recipient_count: u256 = recipients.len().into();
            let total_amount = amount_per_recipient * recipient_count;
            let current_balance = self.token_balances.read(token);

            assert!(current_balance >= total_amount, "Insufficient balance");

            // Deduct from balance
            self.token_balances.write(token, current_balance - total_amount);

            // Update stats
            let total_distributed = self.total_distributed.read(token);
            self.total_distributed.write(token, total_distributed + total_amount);

            self.total_airdrops.write(self.total_airdrops.read() + total_amount);
            self.total_recipients.write(self.total_recipients.read() + recipient_count);

            self.emit(AirdropExecuted {
                token,
                total_amount,
                recipient_count,
            });

            true
        }

        fn schedule_airdrop_for_round(
            ref self: ContractState,
            round: u32,
            token: ContractAddress,
            recipients: Array<ContractAddress>,
            amount_per_recipient: u256
        ) {
            self._only_owner();

            let recipient_count: u256 = recipients.len().into();

            // Store recipients
            let mut i: u256 = 0;
            while i < recipient_count {
                let recipient = *recipients.at(i.try_into().unwrap());
                self.scheduled_airdrop_recipients.write((round, token, i), recipient);
                i += 1;
            };

            self.scheduled_airdrop_recipient_count.write((round, token), recipient_count);
            self.scheduled_airdrop_amount.write((round, token), amount_per_recipient);

            self.emit(AirdropScheduled {
                round,
                token,
                recipient_count: recipient_count,
                amount_per_recipient,
            });
        }

        fn execute_scheduled_airdrop(ref self: ContractState, round: u32, token: ContractAddress) -> bool {
            self._only_owner();

            assert!(!self.scheduled_airdrop_executed.read((round, token)), "Already executed");

            let recipient_count = self.scheduled_airdrop_recipient_count.read((round, token));
            let amount_per_recipient = self.scheduled_airdrop_amount.read((round, token));
            let total_amount = amount_per_recipient * recipient_count;

            let current_balance = self.token_balances.read(token);
            assert!(current_balance >= total_amount, "Insufficient balance");

            // Deduct from balance
            self.token_balances.write(token, current_balance - total_amount);

            // Update stats
            let total_distributed = self.total_distributed.read(token);
            self.total_distributed.write(token, total_distributed + total_amount);

            self.total_airdrops.write(self.total_airdrops.read() + total_amount);
            self.total_recipients.write(self.total_recipients.read() + recipient_count);

            // Mark as executed
            self.scheduled_airdrop_executed.write((round, token), true);

            self.emit(ScheduledAirdropExecuted {
                round,
                token,
                total_amount,
            });

            true
        }

        fn withdraw_to_admin(ref self: ContractState, token: ContractAddress, amount: u256) {
            self._only_owner();
            let current_balance = self.token_balances.read(token);
            assert!(current_balance >= amount, "Insufficient balance");
            self.token_balances.write(token, current_balance - amount);
        }

        fn get_total_received(self: @ContractState, token: ContractAddress) -> u256 {
            self.total_received.read(token)
        }

        fn get_total_distributed(self: @ContractState, token: ContractAddress) -> u256 {
            self.total_distributed.read(token)
        }

        fn get_pending_airdrop_amount(self: @ContractState, round: u32, token: ContractAddress) -> u256 {
            if self.scheduled_airdrop_executed.read((round, token)) {
                return 0;
            }

            let recipient_count = self.scheduled_airdrop_recipient_count.read((round, token));
            let amount_per_recipient = self.scheduled_airdrop_amount.read((round, token));
            amount_per_recipient * recipient_count
        }

        fn is_authorized_depositor(self: @ContractState, address: ContractAddress) -> bool {
            self.authorized_depositors.read(address)
        }

        fn transfer_ownership(ref self: ContractState, new_owner: ContractAddress) {
            self._only_owner();
            let previous_owner = self.owner.read();
            self.owner.write(new_owner);

            self.emit(OwnershipTransferred {
                previous_owner,
                new_owner,
            });
        }

        fn add_authorized_depositor(ref self: ContractState, depositor: ContractAddress) {
            self._only_owner();
            self.authorized_depositors.write(depositor, true);
            self.emit(DepositorAuthorized { depositor });
        }

        fn remove_authorized_depositor(ref self: ContractState, depositor: ContractAddress) {
            self._only_owner();
            self.authorized_depositors.write(depositor, false);
            self.emit(DepositorRevoked { depositor });
        }

        fn get_owner(self: @ContractState) -> ContractAddress {
            self.owner.read()
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _only_owner(self: @ContractState) {
            let caller = get_caller_address();
            assert!(caller == self.owner.read(), "Only owner");
        }
    }
}
