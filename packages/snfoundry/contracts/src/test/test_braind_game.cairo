#[cfg(test)]
mod tests {
    use starknet::{ContractAddress, contract_address_const};
    use snforge_std::{declare, ContractClassTrait, DeclareResultTrait};

    use super::super::braind_game_manager::{
        BrainDGameManager, IBrainDGameManagerDispatcher, IBrainDGameManagerDispatcherTrait
    };

    fn setup() -> (IBrainDGameManagerDispatcher, ContractAddress) {
        let owner = contract_address_const::<0x123>();
        let contract = declare("BrainDGameManager").unwrap().contract_class();
        let (contract_address, _) = contract.deploy(@array![owner.into()]).unwrap();

        let dispatcher = IBrainDGameManagerDispatcher { contract_address };
        (dispatcher, owner)
    }

    #[test]
    fn test_initial_state() {
        let (game_contract, owner) = setup();

        // Test initial values
        let total_players = game_contract.get_total_players();
        assert!(total_players == 0, "Initial total players should be 0");

        let total_rewards = game_contract.get_total_rewards_distributed();
        assert!(total_rewards == 0, "Initial total rewards should be 0");
    }

    #[test]
    fn test_submit_game_score() {
        let (game_contract, owner) = setup();

        // Submit a game score
        let game_type = 'memory_blitz';
        let score = 1500;
        let difficulty = 2; // Medium
        let duration = 120; // 2 minutes

        let reward = game_contract.submit_game_score(game_type, score, difficulty, duration);

        // Check that reward was returned (medium game should give 60 STARK)
        assert!(reward > 0, "Reward should be greater than 0");

        // Check player stats
        let player_stats = game_contract.get_player_stats(owner);
        assert!(player_stats.games_played == 1, "Player should have 1 game played");
        assert!(player_stats.high_score == score, "High score should match submitted score");
        assert!(player_stats.total_rewards == reward, "Total rewards should match received reward");

        // Check global stats
        let total_players = game_contract.get_total_players();
        assert!(total_players == 1, "Total players should be 1");

        let total_rewards = game_contract.get_total_rewards_distributed();
        assert!(total_rewards == reward, "Total distributed rewards should match");
    }

    #[test]
    fn test_multiple_games_same_player() {
        let (game_contract, owner) = setup();

        // Submit first game
        let reward1 = game_contract.submit_game_score('memory_blitz', 1000, 1, 60);

        // Submit second game with higher score
        let reward2 = game_contract.submit_game_score('logic_lab', 1500, 2, 90);

        let player_stats = game_contract.get_player_stats(owner);
        assert!(player_stats.games_played == 2, "Player should have 2 games played");
        assert!(player_stats.high_score == 1500, "High score should be updated");
        assert!(player_stats.total_rewards == reward1 + reward2, "Total rewards should be sum of both");

        // Check that total players is still 1
        let total_players = game_contract.get_total_players();
        assert!(total_players == 1, "Total players should still be 1");
    }

    #[test]
    fn test_leaderboard_update() {
        let (game_contract, owner) = setup();

        // Submit a game to get on leaderboard
        game_contract.submit_game_score('memory_blitz', 2000, 3, 180);

        // Check leaderboard
        let leaderboard = game_contract.get_leaderboard(10);
        assert!(leaderboard.len() == 1, "Leaderboard should have 1 entry");

        let (first_player, first_score) = leaderboard.at(0);
        assert!(*first_player == owner, "First player should be owner");
        assert!(*first_score == 2000, "First score should be 2000");

        // Check player rank
        let player_rank = game_contract.get_player_rank(owner);
        assert!(player_rank == 1, "Player should be ranked #1");
    }

    #[test]
    fn test_game_history() {
        let (game_contract, owner) = setup();

        // Submit multiple games
        game_contract.submit_game_score('memory_blitz', 1000, 1, 60);
        game_contract.submit_game_score('logic_lab', 1500, 2, 90);
        game_contract.submit_game_score('speed_sync', 800, 1, 45);

        // Get game history
        let history = game_contract.get_player_game_history(owner, 5);
        assert!(history.len() == 3, "History should have 3 entries");

        // Check first game in history
        let first_game = history.at(0);
        assert!(first_game.game_type == 'memory_blitz', "First game type should match");
        assert!(first_game.score == 1000, "First game score should match");
        assert!(first_game.difficulty == 1, "First game difficulty should match");
    }

    #[test]
    #[should_panic(expected: ('Invalid difficulty',))]
    fn test_invalid_difficulty() {
        let (game_contract, _) = setup();

        // Try to submit with invalid difficulty
        game_contract.submit_game_score('memory_blitz', 1000, 0, 60);
    }

    #[test]
    #[should_panic(expected: ('Score must be positive',))]
    fn test_zero_score() {
        let (game_contract, _) = setup();

        // Try to submit with zero score
        game_contract.submit_game_score('memory_blitz', 0, 1, 60);
    }

    #[test]
    fn test_difficulty_rewards() {
        let (game_contract, owner) = setup();

        // Test easy difficulty (should give least reward)
        let easy_reward = game_contract.submit_game_score('speed_sync', 1000, 1, 60);

        // Reset by creating new contract for clean test
        let (game_contract2, owner2) = setup();

        // Test medium difficulty
        let medium_reward = game_contract2.submit_game_score('pattern_pro', 1000, 2, 60);

        // Reset by creating new contract for clean test
        let (game_contract3, owner3) = setup();

        // Test hard difficulty (should give most reward)
        let hard_reward = game_contract3.submit_game_score('time_warp', 1000, 3, 60);

        // Verify reward progression
        assert!(easy_reward < medium_reward, "Easy reward should be less than medium");
        assert!(medium_reward < hard_reward, "Medium reward should be less than hard");
    }
}