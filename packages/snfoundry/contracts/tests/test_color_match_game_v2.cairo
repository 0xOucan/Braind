use contracts::color_match_game_v2::{IColorMatchGameV2Dispatcher, IColorMatchGameV2DispatcherTrait};
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address};
use starknet::ContractAddress;

const OWNER: felt252 = 'owner';
const PLAYER1: felt252 = 'player1';
const PLAYER2: felt252 = 'player2';
const PLAYER3: felt252 = 'player3';
const STARK_TOKEN: felt252 = 'stark_token';
const USDC_TOKEN: felt252 = 'usdc_token';
const ETH_TOKEN: felt252 = 'eth_token';
const AIRDROP: felt252 = 'airdrop';

fn deploy_game_contract() -> IColorMatchGameV2Dispatcher {
    let contract = declare("ColorMatchGameV2").unwrap().contract_class();

    let owner: ContractAddress = OWNER.try_into().unwrap();
    let stark_token: ContractAddress = STARK_TOKEN.try_into().unwrap();
    let usdc_token: ContractAddress = USDC_TOKEN.try_into().unwrap();
    let eth_token: ContractAddress = ETH_TOKEN.try_into().unwrap();
    let airdrop: ContractAddress = AIRDROP.try_into().unwrap();

    let mut calldata = array![];
    calldata.append(owner.into());
    calldata.append(stark_token.into());
    calldata.append(usdc_token.into());
    calldata.append(eth_token.into());
    calldata.append(airdrop.into());

    let (contract_address, _) = contract.deploy(@calldata).unwrap();
    IColorMatchGameV2Dispatcher { contract_address }
}

#[test]
fn test_deploy_game() {
    let dispatcher = deploy_game_contract();

    let round = dispatcher.get_current_round();
    assert(round == 1, 'Wrong initial round');

    let games = dispatcher.get_games_in_current_round();
    assert(games == 0, 'Wrong initial game count');
}

#[test]
fn test_start_game() {
    let dispatcher = deploy_game_contract();
    let player: ContractAddress = PLAYER1.try_into().unwrap();
    let token: ContractAddress = STARK_TOKEN.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, player);
    let game_id = dispatcher.start_game(token);
    stop_cheat_caller_address(dispatcher.contract_address);

    assert(game_id == 1, 'Wrong game ID');

    let games = dispatcher.get_games_in_current_round();
    assert(games == 1, 'Game count not updated');
}

#[test]
fn test_submit_score() {
    let dispatcher = deploy_game_contract();
    let player: ContractAddress = PLAYER1.try_into().unwrap();
    let token: ContractAddress = STARK_TOKEN.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, player);
    let game_id = dispatcher.start_game(token);
    let result = dispatcher.submit_score(game_id, 100, 50);
    stop_cheat_caller_address(dispatcher.contract_address);

    assert(result == true, 'Submit score failed');
}

#[test]
#[should_panic(expected: ('Not your game',))]
fn test_submit_score_wrong_player() {
    let dispatcher = deploy_game_contract();
    let player1: ContractAddress = PLAYER1.try_into().unwrap();
    let player2: ContractAddress = PLAYER2.try_into().unwrap();
    let token: ContractAddress = STARK_TOKEN.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, player1);
    let game_id = dispatcher.start_game(token);
    stop_cheat_caller_address(dispatcher.contract_address);

    // Try to submit score as different player
    start_cheat_caller_address(dispatcher.contract_address, player2);
    dispatcher.submit_score(game_id, 100, 50);
    stop_cheat_caller_address(dispatcher.contract_address);
}

#[test]
#[should_panic(expected: ('Already completed',))]
fn test_submit_score_twice() {
    let dispatcher = deploy_game_contract();
    let player: ContractAddress = PLAYER1.try_into().unwrap();
    let token: ContractAddress = STARK_TOKEN.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, player);
    let game_id = dispatcher.start_game(token);
    dispatcher.submit_score(game_id, 100, 50);
    // Try to submit again
    dispatcher.submit_score(game_id, 200, 100);
    stop_cheat_caller_address(dispatcher.contract_address);
}

#[test]
fn test_leaderboard_updates() {
    let dispatcher = deploy_game_contract();
    let player1: ContractAddress = PLAYER1.try_into().unwrap();
    let player2: ContractAddress = PLAYER2.try_into().unwrap();
    let player3: ContractAddress = PLAYER3.try_into().unwrap();
    let token: ContractAddress = STARK_TOKEN.try_into().unwrap();

    // Player 1 scores 100
    start_cheat_caller_address(dispatcher.contract_address, player1);
    let game1 = dispatcher.start_game(token);
    dispatcher.submit_score(game1, 100, 50);
    stop_cheat_caller_address(dispatcher.contract_address);

    // Player 2 scores 200 (should be first)
    start_cheat_caller_address(dispatcher.contract_address, player2);
    let game2 = dispatcher.start_game(token);
    dispatcher.submit_score(game2, 200, 100);
    stop_cheat_caller_address(dispatcher.contract_address);

    // Player 3 scores 150 (should be second)
    start_cheat_caller_address(dispatcher.contract_address, player3);
    let game3 = dispatcher.start_game(token);
    dispatcher.submit_score(game3, 150, 75);
    stop_cheat_caller_address(dispatcher.contract_address);

    // Check positions
    let pos1 = dispatcher.get_player_round_position(player2);
    let pos2 = dispatcher.get_player_round_position(player3);
    let pos3 = dispatcher.get_player_round_position(player1);

    assert(pos1 == 1, 'Player2 should be 1st');
    assert(pos2 == 2, 'Player3 should be 2nd');
    assert(pos3 == 3, 'Player1 should be 3rd');
}

#[test]
fn test_get_round_leaderboard() {
    let dispatcher = deploy_game_contract();
    let player1: ContractAddress = PLAYER1.try_into().unwrap();
    let player2: ContractAddress = PLAYER2.try_into().unwrap();
    let token: ContractAddress = STARK_TOKEN.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, player1);
    let game1 = dispatcher.start_game(token);
    dispatcher.submit_score(game1, 100, 50);
    stop_cheat_caller_address(dispatcher.contract_address);

    start_cheat_caller_address(dispatcher.contract_address, player2);
    let game2 = dispatcher.start_game(token);
    dispatcher.submit_score(game2, 200, 100);
    stop_cheat_caller_address(dispatcher.contract_address);

    let leaderboard = dispatcher.get_current_round_leaderboard(10);
    assert(leaderboard.len() == 2, 'Wrong leaderboard size');
}

#[test]
fn test_historic_leaderboard() {
    let dispatcher = deploy_game_contract();
    let player: ContractAddress = PLAYER1.try_into().unwrap();
    let token: ContractAddress = STARK_TOKEN.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, player);
    let game = dispatcher.start_game(token);
    dispatcher.submit_score(game, 500, 250);
    stop_cheat_caller_address(dispatcher.contract_address);

    let historic = dispatcher.get_historic_leaderboard(10);
    assert(historic.len() == 1, 'Wrong historic size');
}

#[test]
fn test_set_games_per_round() {
    let dispatcher = deploy_game_contract();
    let owner: ContractAddress = OWNER.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.set_games_per_round(50);
    stop_cheat_caller_address(dispatcher.contract_address);

    // Can't directly check but should not panic
}

#[test]
#[should_panic(expected: ('Only admin',))]
fn test_set_games_per_round_non_admin() {
    let dispatcher = deploy_game_contract();
    let player: ContractAddress = PLAYER1.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, player);
    dispatcher.set_games_per_round(50);
    stop_cheat_caller_address(dispatcher.contract_address);
}

#[test]
fn test_delegate_admin() {
    let dispatcher = deploy_game_contract();
    let owner: ContractAddress = OWNER.try_into().unwrap();
    let new_admin: ContractAddress = PLAYER1.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.delegate_admin(new_admin);
    stop_cheat_caller_address(dispatcher.contract_address);

    // New admin should be able to set games per round
    start_cheat_caller_address(dispatcher.contract_address, new_admin);
    dispatcher.set_games_per_round(75);
    stop_cheat_caller_address(dispatcher.contract_address);
}

#[test]
fn test_pause_unpause() {
    let dispatcher = deploy_game_contract();
    let owner: ContractAddress = OWNER.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.pause_game();
    stop_cheat_caller_address(dispatcher.contract_address);

    // Should be paused now - unpause to verify
    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.unpause_game();
    stop_cheat_caller_address(dispatcher.contract_address);
}

#[test]
#[should_panic(expected: ('Game paused',))]
fn test_start_game_when_paused() {
    let dispatcher = deploy_game_contract();
    let owner: ContractAddress = OWNER.try_into().unwrap();
    let player: ContractAddress = PLAYER1.try_into().unwrap();
    let token: ContractAddress = STARK_TOKEN.try_into().unwrap();

    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.pause_game();
    stop_cheat_caller_address(dispatcher.contract_address);

    start_cheat_caller_address(dispatcher.contract_address, player);
    dispatcher.start_game(token);
    stop_cheat_caller_address(dispatcher.contract_address);
}

#[test]
fn test_set_game_fee() {
    let dispatcher = deploy_game_contract();
    let owner: ContractAddress = OWNER.try_into().unwrap();
    let token: ContractAddress = STARK_TOKEN.try_into().unwrap();
    let new_fee: u256 = 50000000000000000; // 0.05 STARK

    start_cheat_caller_address(dispatcher.contract_address, owner);
    dispatcher.set_game_fee(token, new_fee);
    stop_cheat_caller_address(dispatcher.contract_address);

    // Fee should be updated (can't directly verify but shouldn't panic)
}

#[test]
fn test_end_round() {
    let dispatcher = deploy_game_contract();
    let owner: ContractAddress = OWNER.try_into().unwrap();
    let player1: ContractAddress = PLAYER1.try_into().unwrap();
    let token: ContractAddress = STARK_TOKEN.try_into().unwrap();

    // Play some games
    start_cheat_caller_address(dispatcher.contract_address, player1);
    let game1 = dispatcher.start_game(token);
    dispatcher.submit_score(game1, 100, 50);
    stop_cheat_caller_address(dispatcher.contract_address);

    let round_before = dispatcher.get_current_round();

    // End round
    start_cheat_caller_address(dispatcher.contract_address, owner);
    let result = dispatcher.end_round_and_distribute();
    stop_cheat_caller_address(dispatcher.contract_address);

    assert(result == true, 'End round failed');

    let round_after = dispatcher.get_current_round();
    assert(round_after == round_before + 1, 'Round not incremented');

    let games_in_new_round = dispatcher.get_games_in_current_round();
    assert(games_in_new_round == 0, 'Games not reset');
}
