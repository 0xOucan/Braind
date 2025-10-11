pub mod your_contract;
pub mod braind_game_manager;

// V1 Game Contracts (Simple payment)
pub mod color_match_game;
pub mod speed_match_game;
pub mod memory_blitz_game;

// V2 Game Contracts (Round-based with prize distribution)
pub mod color_match_game_v2;
pub mod speed_match_game_v2;
pub mod memory_blitz_game_v2;

// Supporting Contracts
pub mod airdrop_funds;
pub mod prediction_market;

// V3 Game Contracts (Centralized payment + improved architecture)
pub mod v3 {
    pub mod common_types;
    pub mod game_payment_handler;
    pub mod base_game_v3;
    pub mod leaderboard_manager_v3;
    pub mod color_match_game_v3;
    pub mod speed_match_game_v3;
    pub mod memory_blitz_game_v3;
    pub mod airdrop_funds_v3;
    pub mod prediction_market_v3;
}
