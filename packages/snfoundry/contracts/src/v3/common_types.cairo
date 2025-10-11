// Common types shared across all V3 contracts
use starknet::ContractAddress;

// Game session status
#[derive(Copy, Drop, Serde, starknet::Store, PartialEq)]
pub enum GameStatus {
    Active,
    Completed,
    Expired,
}

// Core game session structure - standardized across all games
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct GameSession {
    pub session_id: u256,
    pub player: ContractAddress,
    pub game_type: felt252,
    pub start_time: u64,
    pub end_time: u64,
    pub score: u32,
    pub status: GameStatus,
}

// Flexible metadata for game-specific stats
#[derive(Drop, Serde)]
pub struct GameMetadata {
    pub level: u32,
    pub difficulty: u32,
    pub extra_data: Array<u32>, // For game-specific metrics
}

// Leaderboard entry - standardized
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct LeaderboardEntry {
    pub player: ContractAddress,
    pub score: u32,
    pub level: u32,
    pub position: u32,
    pub timestamp: u64,
}

// Payment configuration
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct FeeConfig {
    pub house_fee_bps: u16,      // Basis points (100 = 1%)
    pub airdrop_fee_bps: u16,    // 500 = 5%
    pub prediction_fee_bps: u16, // Remaining goes here
}
