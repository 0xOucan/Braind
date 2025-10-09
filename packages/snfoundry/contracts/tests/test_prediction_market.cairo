use contracts::prediction_market::{IPredictionMarketDispatcher, IPredictionMarketDispatcherTrait};
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address};
use starknet::ContractAddress;

const OWNER: felt252 = 'owner';
const GAMBLER1: felt252 = 'gambler1';
const GAMBLER2: felt252 = 'gambler2';
const GAMBLER3: felt252 = 'gambler3';
const TARGET_PLAYER: felt252 = 'target_player';
const GAME_CONTRACT: felt252 = 'game_contract';
const TOKEN: felt252 = 'token';
const AIRDROP: felt252 = 'airdrop';

fn deploy_prediction_market() -> IPredictionMarketDispatcher {
    let contract = declare("PredictionMarket").unwrap().contract_class();

    let owner: ContractAddress = OWNER.try_into().unwrap();
    let airdrop: ContractAddress = AIRDROP.try_into().unwrap();

    let mut calldata = array![];
    calldata.append(owner.into());
    calldata.append(airdrop.into());

    let (contract_address, _) = contract.deploy(@calldata).unwrap();
    IPredictionMarketDispatcher { contract_address }
}

#[test]
fn test_deploy_prediction_market() {
    let dispatcher = deploy_prediction_market();
    // Just verify it deploys successfully
}

#[test]
fn test_create_market() {
    let dispatcher = deploy_prediction_market();
    let game_contract: ContractAddress = GAME_CONTRACT.try_into().unwrap();
    let target_player: ContractAddress = TARGET_PLAYER.try_into().unwrap();
    let round: u32 = 1;

    let market_id = dispatcher.create_market(game_contract, round, target_player);

    assert(market_id == 1, 'Wrong market ID');
}

#[test]
fn test_multiple_markets() {
    let dispatcher = deploy_prediction_market();
    let game_contract: ContractAddress = GAME_CONTRACT.try_into().unwrap();
    let player1: ContractAddress = TARGET_PLAYER.try_into().unwrap();
    let player2: ContractAddress = GAMBLER1.try_into().unwrap();

    let market1 = dispatcher.create_market(game_contract, 1, player1);
    let market2 = dispatcher.create_market(game_contract, 1, player2);
    let market3 = dispatcher.create_market(game_contract, 2, player1);

    assert(market1 == 1, 'Wrong market1 ID');
    assert(market2 == 2, 'Wrong market2 ID');
    assert(market3 == 3, 'Wrong market3 ID');
}

#[test]
fn test_place_bet() {
    let dispatcher = deploy_prediction_market();
    let game_contract: ContractAddress = GAME_CONTRACT.try_into().unwrap();
    let target_player: ContractAddress = TARGET_PLAYER.try_into().unwrap();
    let gambler: ContractAddress = GAMBLER1.try_into().unwrap();
    let token: ContractAddress = TOKEN.try_into().unwrap();

    let market_id = dispatcher.create_market(game_contract, 1, target_player);

    start_cheat_caller_address(dispatcher.contract_address, gambler);
    let bet_id = dispatcher.place_bet(market_id, true, token, 1000); // Bet on win
    stop_cheat_caller_address(dispatcher.contract_address);

    assert(bet_id == 1, 'Wrong bet ID');
}

#[test]
fn test_multiple_bets_same_market() {
    let dispatcher = deploy_prediction_market();
    let game_contract: ContractAddress = GAME_CONTRACT.try_into().unwrap();
    let target_player: ContractAddress = TARGET_PLAYER.try_into().unwrap();
    let gambler1: ContractAddress = GAMBLER1.try_into().unwrap();
    let gambler2: ContractAddress = GAMBLER2.try_into().unwrap();
    let token: ContractAddress = TOKEN.try_into().unwrap();

    let market_id = dispatcher.create_market(game_contract, 1, target_player);

    start_cheat_caller_address(dispatcher.contract_address, gambler1);
    let bet1 = dispatcher.place_bet(market_id, true, token, 1000); // Win
    stop_cheat_caller_address(dispatcher.contract_address);

    start_cheat_caller_address(dispatcher.contract_address, gambler2);
    let bet2 = dispatcher.place_bet(market_id, false, token, 500); // Lose
    stop_cheat_caller_address(dispatcher.contract_address);

    assert(bet1 == 1, 'Wrong bet1 ID');
    assert(bet2 == 2, 'Wrong bet2 ID');
}

#[test]
#[should_panic(expected: ('Market resolved',))]
fn test_bet_on_resolved_market() {
    let dispatcher = deploy_prediction_market();
    let owner: ContractAddress = OWNER.try_into().unwrap();
    let game_contract: ContractAddress = GAME_CONTRACT.try_into().unwrap();
    let target_player: ContractAddress = TARGET_PLAYER.try_into().unwrap();
    let gambler: ContractAddress = GAMBLER1.try_into().unwrap();
    let token: ContractAddress = TOKEN.try_into().unwrap();

    let market_id = dispatcher.create_market(game_contract, 1, target_player);

    // Resolve market
    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.resolve_market(market_id, true);
    stop_cheat_caller_address(dispatcher.contract_address);

    // Try to bet after resolution
    start_cheat_caller_address(dispatcher.contract_address, gambler);
    dispatcher.place_bet(market_id, true, token, 1000);
    stop_cheat_caller_address(dispatcher.contract_address);
}

#[test]
fn test_resolve_market() {
    let dispatcher = deploy_prediction_market();
    let owner: ContractAddress = OWNER.try_into().unwrap();
    let game_contract: ContractAddress = GAME_CONTRACT.try_into().unwrap();
    let target_player: ContractAddress = TARGET_PLAYER.try_into().unwrap();

    let market_id = dispatcher.create_market(game_contract, 1, target_player);

    start_cheat_caller_address(dispatcher.contract_address, owner);
    let result = dispatcher.resolve_market(market_id, true);
    stop_cheat_caller_address(dispatcher.contract_address);

    assert(result == true, 'Resolve failed');
}

#[test]
#[should_panic(expected: ('Only admin',))]
fn test_resolve_market_non_admin() {
    let dispatcher = deploy_prediction_market();
    let gambler: ContractAddress = GAMBLER1.try_into().unwrap();
    let game_contract: ContractAddress = GAME_CONTRACT.try_into().unwrap();
    let target_player: ContractAddress = TARGET_PLAYER.try_into().unwrap();

    let market_id = dispatcher.create_market(game_contract, 1, target_player);

    start_cheat_caller_address(dispatcher.contract_address, gambler);
    dispatcher.resolve_market(market_id, true);
    stop_cheat_caller_address(dispatcher.contract_address);
}

#[test]
#[should_panic(expected: ('Already resolved',))]
fn test_resolve_market_twice() {
    let dispatcher = deploy_prediction_market();
    let owner: ContractAddress = OWNER.try_into().unwrap();
    let game_contract: ContractAddress = GAME_CONTRACT.try_into().unwrap();
    let target_player: ContractAddress = TARGET_PLAYER.try_into().unwrap();

    let market_id = dispatcher.create_market(game_contract, 1, target_player);

    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.resolve_market(market_id, true);
    // Try to resolve again
    dispatcher.resolve_market(market_id, false);
    stop_cheat_caller_address(dispatcher.contract_address);
}

#[test]
fn test_get_market_info() {
    let dispatcher = deploy_prediction_market();
    let game_contract: ContractAddress = GAME_CONTRACT.try_into().unwrap();
    let target_player: ContractAddress = TARGET_PLAYER.try_into().unwrap();

    let market_id = dispatcher.create_market(game_contract, 1, target_player);
    let market_info = dispatcher.get_market_info(market_id);

    assert(market_info.market_id == market_id, 'Wrong market ID in info');
    assert(market_info.target_player == target_player, 'Wrong target player');
    assert(market_info.round == 1, 'Wrong round');
    assert(market_info.resolved == false, 'Should not be resolved');
}

#[test]
fn test_get_bet_info() {
    let dispatcher = deploy_prediction_market();
    let game_contract: ContractAddress = GAME_CONTRACT.try_into().unwrap();
    let target_player: ContractAddress = TARGET_PLAYER.try_into().unwrap();
    let gambler: ContractAddress = GAMBLER1.try_into().unwrap();
    let token: ContractAddress = TOKEN.try_into().unwrap();

    let market_id = dispatcher.create_market(game_contract, 1, target_player);

    start_cheat_caller_address(dispatcher.contract_address, gambler);
    let bet_id = dispatcher.place_bet(market_id, true, token, 1000);
    stop_cheat_caller_address(dispatcher.contract_address);

    let bet_info = dispatcher.get_bet_info(bet_id);

    assert(bet_info.bet_id == bet_id, 'Wrong bet ID');
    assert(bet_info.bettor == gambler, 'Wrong bettor');
    assert(bet_info.prediction == true, 'Wrong prediction');
    assert(bet_info.amount == 1000, 'Wrong amount');
}

#[test]
fn test_get_player_bets() {
    let dispatcher = deploy_prediction_market();
    let game_contract: ContractAddress = GAME_CONTRACT.try_into().unwrap();
    let target_player: ContractAddress = TARGET_PLAYER.try_into().unwrap();
    let gambler: ContractAddress = GAMBLER1.try_into().unwrap();
    let token: ContractAddress = TOKEN.try_into().unwrap();

    let market1 = dispatcher.create_market(game_contract, 1, target_player);
    let market2 = dispatcher.create_market(game_contract, 2, target_player);

    start_cheat_caller_address(dispatcher.contract_address, gambler);
    dispatcher.place_bet(market1, true, token, 1000);
    dispatcher.place_bet(market2, false, token, 500);
    stop_cheat_caller_address(dispatcher.contract_address);

    let player_bets = dispatcher.get_player_bets(gambler);
    assert(player_bets.len() == 2, 'Wrong number of bets');
}

#[test]
fn test_delegate_admin() {
    let dispatcher = deploy_prediction_market();
    let owner: ContractAddress = OWNER.try_into().unwrap();
    let new_admin: ContractAddress = GAMBLER1.try_into().unwrap();
    let game_contract: ContractAddress = GAME_CONTRACT.try_into().unwrap();
    let target_player: ContractAddress = TARGET_PLAYER.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.delegate_admin(new_admin);
    stop_cheat_caller_address(dispatcher.contract_address);

    // New admin should be able to resolve markets
    let market_id = dispatcher.create_market(game_contract, 1, target_player);

    start_cheat_caller_address(dispatcher.contract_address, new_admin);
    let result = dispatcher.resolve_market(market_id, true);
    stop_cheat_caller_address(dispatcher.contract_address);

    assert(result == true, 'New admin cannot resolve');
}

#[test]
fn test_pause_unpause_market() {
    let dispatcher = deploy_prediction_market();
    let owner: ContractAddress = OWNER.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.pause_market();
    dispatcher.unpause_market();
    stop_cheat_caller_address(dispatcher.contract_address);
}

#[test]
#[should_panic(expected: ('Market paused',))]
fn test_create_market_when_paused() {
    let dispatcher = deploy_prediction_market();
    let owner: ContractAddress = OWNER.try_into().unwrap();
    let game_contract: ContractAddress = GAME_CONTRACT.try_into().unwrap();
    let target_player: ContractAddress = TARGET_PLAYER.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.pause_market();
    stop_cheat_caller_address(dispatcher.contract_address);

    dispatcher.create_market(game_contract, 1, target_player);
}

#[test]
#[should_panic(expected: ('Market paused',))]
fn test_place_bet_when_paused() {
    let dispatcher = deploy_prediction_market();
    let owner: ContractAddress = OWNER.try_into().unwrap();
    let gambler: ContractAddress = GAMBLER1.try_into().unwrap();
    let game_contract: ContractAddress = GAME_CONTRACT.try_into().unwrap();
    let target_player: ContractAddress = TARGET_PLAYER.try_into().unwrap();
    let token: ContractAddress = TOKEN.try_into().unwrap();

    let market_id = dispatcher.create_market(game_contract, 1, target_player);

    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.pause_market();
    stop_cheat_caller_address(dispatcher.contract_address);

    start_cheat_caller_address(dispatcher.contract_address, gambler);
    dispatcher.place_bet(market_id, true, token, 1000);
    stop_cheat_caller_address(dispatcher.contract_address);
}
