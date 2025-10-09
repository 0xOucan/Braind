/**
 * Mock data for BrainD platform
 * Used for testing and development before blockchain integration
 */

export interface MockLeaderboardEntry {
  player: string;
  score: number;
  games: number;
  rank: number;
  username?: string;
}

export interface MockPredictionMarket {
  id: string;
  targetPlayer: string;
  targetPlayerName?: string;
  round: number;
  totalBets: string;
  resolved: boolean;
  playerWon?: boolean;
  winPool: string;
  losePool: string;
  createdAt: number;
}

export interface MockPlayerStats {
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  currentRoundRank: number;
  allTimeRank: number;
  earnings: string;
  roundsParticipated: number;
}

export interface MockBetInfo {
  betId: string;
  marketId: string;
  prediction: boolean; // true = win, false = lose
  amount: string;
  claimed: boolean;
  isWinner?: boolean;
  payout?: string;
  timestamp: number;
}

// Mock leaderboard data - Current Round
export const mockCurrentRoundLeaderboard: MockLeaderboardEntry[] = [
  {
    player: "0x1234567890abcdef1234567890abcdef12345678",
    username: "BrainMaster",
    score: 15420,
    games: 42,
    rank: 1,
  },
  {
    player: "0x2345678901bcdef12345678901bcdef123456789",
    username: "PixelProdigy",
    score: 14850,
    games: 38,
    rank: 2,
  },
  {
    player: "0x3456789012cdef123456789012cdef12345678a",
    username: "LogicLord",
    score: 13920,
    games: 35,
    rank: 3,
  },
  {
    player: "0x456789013def123456789013def123456789b",
    username: "MemoryMage",
    score: 13200,
    games: 31,
    rank: 4,
  },
  {
    player: "0x56789014ef123456789014ef123456789c",
    username: "SpeedDemon",
    score: 12750,
    games: 29,
    rank: 5,
  },
  {
    player: "0x6789015f123456789015f123456789d",
    username: "ColorKing",
    score: 11980,
    games: 27,
    rank: 6,
  },
  {
    player: "0x789016123456789016123456789e",
    username: "PatternPro",
    score: 11450,
    games: 25,
    rank: 7,
  },
  {
    player: "0x89017123456789017123456789f",
    username: "QuickThinker",
    score: 10890,
    games: 23,
    rank: 8,
  },
  {
    player: "0x9018123456789018123456780",
    username: "BrainAce",
    score: 10320,
    games: 21,
    rank: 9,
  },
  {
    player: "0xa019123456789019123456781",
    username: "MindMaster",
    score: 9875,
    games: 19,
    rank: 10,
  },
];

// Mock leaderboard data - All-Time Historic
export const mockHistoricLeaderboard: MockLeaderboardEntry[] = [
  {
    player: "0x1234567890abcdef1234567890abcdef12345678",
    username: "BrainMaster",
    score: 48500,
    games: 150,
    rank: 1,
  },
  {
    player: "0x3456789012cdef123456789012cdef12345678a",
    username: "LogicLord",
    score: 45200,
    games: 142,
    rank: 2,
  },
  {
    player: "0x2345678901bcdef12345678901bcdef123456789",
    username: "PixelProdigy",
    score: 43800,
    games: 138,
    rank: 3,
  },
  {
    player: "0xb01a123456789b01a123456782",
    username: "LegendaryBrain",
    score: 41500,
    games: 130,
    rank: 4,
  },
  {
    player: "0x456789013def123456789013def123456789b",
    username: "MemoryMage",
    score: 39800,
    games: 125,
    rank: 5,
  },
  {
    player: "0x56789014ef123456789014ef123456789c",
    username: "SpeedDemon",
    score: 38200,
    games: 120,
    rank: 6,
  },
  {
    player: "0xc01b123456789c01b123456783",
    username: "EliteThinker",
    score: 36900,
    games: 115,
    rank: 7,
  },
  {
    player: "0x6789015f123456789015f123456789d",
    username: "ColorKing",
    score: 35400,
    games: 110,
    rank: 8,
  },
  {
    player: "0x789016123456789016123456789e",
    username: "PatternPro",
    score: 34100,
    games: 105,
    rank: 9,
  },
  {
    player: "0xd01c123456789d01c123456784",
    username: "ChampionMind",
    score: 32800,
    games: 100,
    rank: 10,
  },
];

// Mock prediction markets
export const mockPredictionMarkets: MockPredictionMarket[] = [
  {
    id: "1",
    targetPlayer: "0x1234567890abcdef1234567890abcdef12345678",
    targetPlayerName: "BrainMaster",
    round: 5,
    totalBets: "1500000000000000000", // 1.5 ETH
    resolved: false,
    winPool: "900000000000000000", // 0.9 ETH
    losePool: "600000000000000000", // 0.6 ETH
    createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
  },
  {
    id: "2",
    targetPlayer: "0x2345678901bcdef12345678901bcdef123456789",
    targetPlayerName: "PixelProdigy",
    round: 5,
    totalBets: "2100000000000000000", // 2.1 ETH
    resolved: false,
    winPool: "1200000000000000000", // 1.2 ETH
    losePool: "900000000000000000", // 0.9 ETH
    createdAt: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
  },
  {
    id: "3",
    targetPlayer: "0x3456789012cdef123456789012cdef12345678a",
    targetPlayerName: "LogicLord",
    round: 5,
    totalBets: "800000000000000000", // 0.8 ETH
    resolved: false,
    winPool: "500000000000000000", // 0.5 ETH
    losePool: "300000000000000000", // 0.3 ETH
    createdAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
  },
  {
    id: "4",
    targetPlayer: "0x456789013def123456789013def123456789b",
    targetPlayerName: "MemoryMage",
    round: 4,
    totalBets: "1200000000000000000", // 1.2 ETH
    resolved: true,
    playerWon: true,
    winPool: "700000000000000000", // 0.7 ETH
    losePool: "500000000000000000", // 0.5 ETH
    createdAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
  },
  {
    id: "5",
    targetPlayer: "0x56789014ef123456789014ef123456789c",
    targetPlayerName: "SpeedDemon",
    round: 4,
    totalBets: "950000000000000000", // 0.95 ETH
    resolved: true,
    playerWon: false,
    winPool: "400000000000000000", // 0.4 ETH
    losePool: "550000000000000000", // 0.55 ETH
    createdAt: Date.now() - 25 * 60 * 60 * 1000, // ~1 day ago
  },
];

// Mock player statistics
export const mockPlayerStats: MockPlayerStats = {
  gamesPlayed: 42,
  totalScore: 8500,
  bestScore: 850,
  currentRoundRank: 5,
  allTimeRank: 12,
  earnings: "500000000000000000", // 0.5 ETH
  roundsParticipated: 8,
};

// Mock bet history for a player
export const mockPlayerBets: MockBetInfo[] = [
  {
    betId: "101",
    marketId: "1",
    prediction: true, // bet on win
    amount: "100000000000000000", // 0.1 ETH
    claimed: false,
    timestamp: Date.now() - 1 * 60 * 60 * 1000,
  },
  {
    betId: "102",
    marketId: "2",
    prediction: false, // bet on lose
    amount: "50000000000000000", // 0.05 ETH
    claimed: false,
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    betId: "103",
    marketId: "4",
    prediction: true, // bet on win
    amount: "200000000000000000", // 0.2 ETH
    claimed: true,
    isWinner: true,
    payout: "340000000000000000", // 0.34 ETH (1.7x return)
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
  },
  {
    betId: "104",
    marketId: "5",
    prediction: true, // bet on win
    amount: "150000000000000000", // 0.15 ETH
    claimed: true,
    isWinner: false,
    payout: "0",
    timestamp: Date.now() - 25 * 60 * 60 * 1000,
  },
];

// Helper function to format ETH amounts
export const formatEthAmount = (weiAmount: string): string => {
  const eth = Number(weiAmount) / 1e18;
  return eth.toFixed(4);
};

// Helper function to shorten addresses
export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

// Helper function to get time ago
export const getTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
