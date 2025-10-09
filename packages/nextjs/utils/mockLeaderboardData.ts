/**
 * Mock Leaderboard Data for Pre-Production Testing
 *
 * This file provides mock data for leaderboards while we don't have real data yet.
 * Once we have real data from the deployed contracts, we can remove these mocks.
 */

export interface LeaderboardEntry {
  player: string;
  score: number;
  position: number;
  // Optional fields for different game types
  time_taken?: number; // For SpeedMatchGameV2
  level_reached?: number; // For MemoryBlitzGameV2
}

// Mock player addresses (Starknet mainnet format)
const MOCK_PLAYERS = [
  "0x1234567890123456789012345678901234567890123456789012345678901234",
  "0x2345678901234567890123456789012345678901234567890123456789012345",
  "0x3456789012345678901234567890123456789012345678901234567890123456",
  "0x4567890123456789012345678901234567890123456789012345678901234567",
  "0x5678901234567890123456789012345678901234567890123456789012345678",
  "0x6789012345678901234567890123456789012345678901234567890123456789",
  "0x7890123456789012345678901234567890123456789012345678901234567890",
  "0x8901234567890123456789012345678901234567890123456789012345678901",
  "0x9012345678901234567890123456789012345678901234567890123456789012",
  "0xa123456789012345678901234567890123456789012345678901234567890123",
];

/**
 * Generate mock leaderboard for ColorMatchGameV2
 */
export function getMockColorMatchLeaderboard(limit: number = 10): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  const count = Math.min(limit, MOCK_PLAYERS.length);

  for (let i = 0; i < count; i++) {
    entries.push({
      player: MOCK_PLAYERS[i],
      score: 5000 - (i * 450), // Decreasing scores
      position: i + 1,
    });
  }

  return entries;
}

/**
 * Generate mock leaderboard for SpeedMatchGameV2
 * Includes time_taken field
 */
export function getMockSpeedMatchLeaderboard(limit: number = 10): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  const count = Math.min(limit, MOCK_PLAYERS.length);

  for (let i = 0; i < count; i++) {
    entries.push({
      player: MOCK_PLAYERS[i],
      score: 4800 - (i * 400),
      time_taken: 30000 + (i * 5000), // Time in milliseconds, lower is better
      position: i + 1,
    });
  }

  return entries;
}

/**
 * Generate mock leaderboard for MemoryBlitzGameV2
 * Includes level_reached field
 */
export function getMockMemoryBlitzLeaderboard(limit: number = 10): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  const count = Math.min(limit, MOCK_PLAYERS.length);

  for (let i = 0; i < count; i++) {
    entries.push({
      player: MOCK_PLAYERS[i],
      score: 6000 - (i * 500),
      level_reached: 15 - i, // Higher levels are better
      position: i + 1,
    });
  }

  return entries;
}

/**
 * Generate mock historic (all-time) leaderboard
 * Can be used for any game type
 */
export function getMockHistoricLeaderboard(gameType: 'color' | 'speed' | 'memory', limit: number = 100): LeaderboardEntry[] {
  switch (gameType) {
    case 'color':
      return getMockColorMatchLeaderboard(limit);
    case 'speed':
      return getMockSpeedMatchLeaderboard(limit);
    case 'memory':
      return getMockMemoryBlitzLeaderboard(limit);
    default:
      return [];
  }
}

/**
 * Get mock current round number
 */
export function getMockCurrentRound(): number {
  return 1; // First round
}

/**
 * Get mock games in current round
 */
export function getMockGamesInCurrentRound(): number {
  return 42; // 42 games played so far
}

/**
 * Check if we should use mock data
 * This can be controlled via environment variable
 */
export function shouldUseMockData(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
}
