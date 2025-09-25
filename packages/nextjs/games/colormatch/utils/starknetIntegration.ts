// Starknet Integration Utilities
// This file contains placeholder functions for future Starknet integration

import { GameSession, StarknetGameSession, StarknetPlayerStats } from '../types';
import { STARKNET_CONFIG } from './constants';

/**
 * Prepare contract call data for submitting game score
 * TODO: Integrate with useScaffoldWriteContract hook
 */
export function prepareSubmitScoreTransaction(
  gameType: string,
  score: number,
  difficulty: number,
  duration: number
) {
  return {
    contractName: STARKNET_CONFIG.CONTRACT_NAME,
    functionName: STARKNET_CONFIG.SUBMIT_SCORE_FUNCTION,
    args: [
      gameType,
      score,
      difficulty,
      duration
    ]
  };
}

/**
 * Prepare contract call data for getting player stats
 * TODO: Integrate with useScaffoldReadContract hook
 */
export function prepareGetPlayerStatsCall(playerAddress: string) {
  return {
    contractName: STARKNET_CONFIG.CONTRACT_NAME,
    functionName: STARKNET_CONFIG.GET_PLAYER_STATS_FUNCTION,
    args: [playerAddress]
  };
}

/**
 * Prepare contract call data for getting leaderboard
 * TODO: Integrate with useScaffoldReadContract hook
 */
export function prepareGetLeaderboardCall(limit: number = 10) {
  return {
    contractName: STARKNET_CONFIG.CONTRACT_NAME,
    functionName: STARKNET_CONFIG.GET_LEADERBOARD_FUNCTION,
    args: [limit]
  };
}

/**
 * Convert game session to Starknet format
 */
export function convertToStarknetSession(
  session: GameSession,
  playerAddress: string
): StarknetGameSession {
  return {
    sessionId: session.sessionId || `${Date.now()}_${playerAddress.slice(-6)}`,
    player: playerAddress,
    gameType: session.gameType,
    difficulty: session.difficulty,
    startTimestamp: Math.floor(session.startTime / 1000), // Convert to seconds
    endTimestamp: session.endTime ? Math.floor(session.endTime / 1000) : undefined,
    score: session.finalScore,
    reward: undefined // Will be calculated by contract
  };
}

/**
 * Format player stats for display
 */
export function formatStarknetPlayerStats(stats: StarknetPlayerStats) {
  return {
    gamesPlayed: stats.gamesPlayed,
    totalScore: stats.totalScore,
    highScore: stats.highScore,
    totalRewards: `${parseInt(stats.totalRewards) / 1e18} STARK`, // Convert wei to STARK
    rank: stats.rank,
    lastPlayed: new Date(stats.lastPlayed * 1000).toLocaleDateString()
  };
}

/**
 * Calculate expected reward based on difficulty
 */
export function calculateExpectedReward(difficulty: 'easy' | 'medium' | 'hard'): string {
  const rewardMap = {
    'easy': '25000000000000000000',   // 25 STARK
    'medium': '60000000000000000000', // 60 STARK
    'hard': '80000000000000000000'    // 80 STARK
  };
  return rewardMap[difficulty];
}

/**
 * Validate game score before submission
 */
export function validateGameScore(score: number, difficulty: number): boolean {
  // Basic validation rules
  if (score < 0) return false;
  if (difficulty < 1 || difficulty > 3) return false;

  // Reasonable score limits based on difficulty
  const maxScores = {
    1: 50,  // Easy: max 50 points
    2: 75,  // Medium: max 75 points
    3: 100  // Hard: max 100 points
  };

  return score <= maxScores[difficulty as keyof typeof maxScores];
}

/**
 * Generate unique game session ID
 */
export function generateGameSessionId(): string {
  return `colormatch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Mock functions for testing (remove when implementing real integration)
 */
export const mockStarknetFunctions = {
  async submitScore(score: number, difficulty: number): Promise<{ success: boolean; txHash?: string }> {
    console.log('Mock: Submitting score to Starknet:', { score, difficulty });
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, txHash: '0x' + Math.random().toString(16).substr(2, 64) };
  },

  async getPlayerStats(address: string): Promise<StarknetPlayerStats> {
    console.log('Mock: Getting player stats for:', address);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      gamesPlayed: 5,
      totalScore: 245,
      highScore: 67,
      totalRewards: '125000000000000000000', // 125 STARK in wei
      rank: 42,
      lastPlayed: Math.floor(Date.now() / 1000)
    };
  },

  async getLeaderboard(limit: number): Promise<Array<{ address: string; score: number }>> {
    console.log('Mock: Getting leaderboard, limit:', limit);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      score: 100 - i * 10
    }));
  }
};