use starknet::ContractAddress;

#[starknet::interface]
pub trait IAirdropFunds<TContractState> {
    // Admin functions
    fn deposit_funds(ref self: TContractState, token: ContractAddress, amount: u256);
    fn get_balance(self: @TContractState, token: ContractAddress) -> u256;
    fn execute_airdrop(
        ref self: TContractState,
        token: ContractAddress,
        recipients: Array<ContractAddress>,
        amount_per_recipient: u256
    ) -> bool;
    fn withdraw_to_admin(ref self: TContractState, token: ContractAddress, amount: u256);

    // Ownership
    fn transfer_ownership(ref self: TContractState, new_owner: ContractAddress);
    fn get_owner(self: @TContractState) -> ContractAddress;
}

#[starknet::contract]
mod AirdropFunds {
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map,
        StorageMapReadAccess, StorageMapWriteAccess
    };

    #[storage]
    struct Storage {
        owner: ContractAddress,
        token_balances: Map<ContractAddress, u256>,
        total_airdrops: u256,
        total_recipients: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        FundsDeposited: FundsDeposited,
        AirdropExecuted: AirdropExecuted,
        OwnershipTransferred: OwnershipTransferred,
    }

    #[derive(Drop, starknet::Event)]
    struct FundsDeposited {
        token: ContractAddress,
        amount: u256,
        depositor: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct AirdropExecuted {
        token: ContractAddress,
        total_amount: u256,
        recipient_count: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct OwnershipTransferred {
        previous_owner: ContractAddress,
        new_owner: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.total_airdrops.write(0);
        self.total_recipients.write(0);
    }

    #[abi(embed_v0)]
    impl AirdropFunds of super::IAirdropFunds<ContractState> {
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
            self.total_airdrops.write(self.total_airdrops.read() + total_amount);
            self.total_recipients.write(self.total_recipients.read() + recipient_count);

            self.emit(AirdropExecuted {
                token,
                total_amount,
                recipient_count,
            });

            true
        }

        fn withdraw_to_admin(ref self: ContractState, token: ContractAddress, amount: u256) {
            self._only_owner();
            let current_balance = self.token_balances.read(token);
            assert!(current_balance >= amount, "Insufficient balance");
            self.token_balances.write(token, current_balance - amount);
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
