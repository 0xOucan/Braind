use contracts::airdrop_funds::{IAirdropFundsDispatcher, IAirdropFundsDispatcherTrait};
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address};
use starknet::ContractAddress;

const OWNER: felt252 = 'owner';
const USER1: felt252 = 'user1';
const USER2: felt252 = 'user2';
const USER3: felt252 = 'user3';
const TOKEN_ADDRESS: felt252 = 'token';

fn deploy_airdrop_contract() -> IAirdropFundsDispatcher {
    let contract = declare("AirdropFunds").unwrap().contract_class();
    let owner: ContractAddress = OWNER.try_into().unwrap();

    let mut calldata = array![];
    calldata.append(owner.into());

    let (contract_address, _) = contract.deploy(@calldata).unwrap();
    IAirdropFundsDispatcher { contract_address }
}

#[test]
fn test_deploy_airdrop_funds() {
    let dispatcher = deploy_airdrop_contract();
    let owner: ContractAddress = OWNER.try_into().unwrap();

    assert(dispatcher.get_owner() == owner, 'Wrong owner');
}

#[test]
fn test_deposit_funds() {
    let dispatcher = deploy_airdrop_contract();
    let token: ContractAddress = TOKEN_ADDRESS.try_into().unwrap();
    let amount: u256 = 1000;

    dispatcher.deposit_funds(token, amount);

    let balance = dispatcher.get_balance(token);
    assert(balance == amount, 'Wrong balance');
}

#[test]
fn test_multiple_deposits() {
    let dispatcher = deploy_airdrop_contract();
    let token: ContractAddress = TOKEN_ADDRESS.try_into().unwrap();

    dispatcher.deposit_funds(token, 500);
    dispatcher.deposit_funds(token, 300);
    dispatcher.deposit_funds(token, 200);

    let balance = dispatcher.get_balance(token);
    assert(balance == 1000, 'Wrong total balance');
}

#[test]
fn test_execute_airdrop() {
    let dispatcher = deploy_airdrop_contract();
    let owner: ContractAddress = OWNER.try_into().unwrap();
    let token: ContractAddress = TOKEN_ADDRESS.try_into().unwrap();

    // Deposit funds
    dispatcher.deposit_funds(token, 1000);

    // Prepare recipients
    let mut recipients = array![];
    recipients.append(USER1.try_into().unwrap());
    recipients.append(USER2.try_into().unwrap());
    recipients.append(USER3.try_into().unwrap());

    // Execute airdrop as owner
    start_cheat_caller_address(dispatcher.contract_address, owner);
    let result = dispatcher.execute_airdrop(token, recipients, 100);
    stop_cheat_caller_address(dispatcher.contract_address);

    assert(result == true, 'Airdrop failed');

    // Check remaining balance (1000 - 300 = 700)
    let balance = dispatcher.get_balance(token);
    assert(balance == 700, 'Wrong balance after airdrop');
}

#[test]
#[should_panic(expected: ('Insufficient balance',))]
fn test_airdrop_insufficient_balance() {
    let dispatcher = deploy_airdrop_contract();
    let owner: ContractAddress = OWNER.try_into().unwrap();
    let token: ContractAddress = TOKEN_ADDRESS.try_into().unwrap();

    // Deposit only 100
    dispatcher.deposit_funds(token, 100);

    // Try to airdrop 500 to 3 users (total 1500)
    let mut recipients = array![];
    recipients.append(USER1.try_into().unwrap());
    recipients.append(USER2.try_into().unwrap());
    recipients.append(USER3.try_into().unwrap());

    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.execute_airdrop(token, recipients, 500);
    stop_cheat_caller_address(dispatcher.contract_address);
}

#[test]
#[should_panic(expected: ('Only owner',))]
fn test_airdrop_only_owner() {
    let dispatcher = deploy_airdrop_contract();
    let user: ContractAddress = USER1.try_into().unwrap();
    let token: ContractAddress = TOKEN_ADDRESS.try_into().unwrap();

    dispatcher.deposit_funds(token, 1000);

    let mut recipients = array![];
    recipients.append(USER2.try_into().unwrap());

    // Try to execute as non-owner
    start_cheat_caller_address(dispatcher.contract_address, user);
    dispatcher.execute_airdrop(token, recipients, 100);
    stop_cheat_caller_address(dispatcher.contract_address);
}

#[test]
fn test_withdraw_to_admin() {
    let dispatcher = deploy_airdrop_contract();
    let owner: ContractAddress = OWNER.try_into().unwrap();
    let token: ContractAddress = TOKEN_ADDRESS.try_into().unwrap();

    dispatcher.deposit_funds(token, 1000);

    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.withdraw_to_admin(token, 400);
    stop_cheat_caller_address(dispatcher.contract_address);

    let balance = dispatcher.get_balance(token);
    assert(balance == 600, 'Wrong balance after withdraw');
}

#[test]
fn test_transfer_ownership() {
    let dispatcher = deploy_airdrop_contract();
    let owner: ContractAddress = OWNER.try_into().unwrap();
    let new_owner: ContractAddress = USER1.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.transfer_ownership(new_owner);
    stop_cheat_caller_address(dispatcher.contract_address);

    assert(dispatcher.get_owner() == new_owner, 'Ownership not transferred');
}

#[test]
#[should_panic(expected: ('Only owner',))]
fn test_transfer_ownership_non_owner() {
    let dispatcher = deploy_airdrop_contract();
    let user: ContractAddress = USER1.try_into().unwrap();
    let new_owner: ContractAddress = USER2.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, user);
    dispatcher.transfer_ownership(new_owner);
    stop_cheat_caller_address(dispatcher.contract_address);
}
