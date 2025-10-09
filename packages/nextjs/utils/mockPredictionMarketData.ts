/**
 * Mock Prediction Market Data for Pre-Production Testing
 *
 * This file provides mock data for prediction markets while we don't have real data yet.
 * Once we have real data from the deployed contracts, we can remove these mocks.
 */

export interface MarketInfo {
  market_id: bigint;
  game_contract: string;
  round: number;
  target_player: string;
  resolved: boolean;
  player_won: boolean;
  total_bets: bigint;
  win_pool: bigint;
  lose_pool: bigint;
}

export interface BetInfo {
  bet_id: bigint;
  market_id: bigint;
  bettor: string;
  prediction: boolean; // true = win, false = lose
  amount: bigint;
  claimed: boolean;
  is_winner: boolean;
  payout: bigint;
}

// Mock game contract addresses (from README)
const GAME_CONTRACTS = {
  ColorMatchGameV2: "0x054bb49e1ff312972ba1bc1a3022f946f860495b005db31d47806ab2892f4fec",
  SpeedMatchGameV2: "0x07e8a78427ae80aa553806867a62555d983ef9b0b757738a0744f409961af1fb",
  MemoryBlitzGameV2: "0x0639b75944b41f01d41c86ffe81214b7c992ec4dc5456ef8182ea39ef3e67aef",
};

// Mock player addresses
const MOCK_PLAYERS = [
  "0x1234567890123456789012345678901234567890123456789012345678901234",
  "0x2345678901234567890123456789012345678901234567890123456789012345",
  "0x3456789012345678901234567890123456789012345678901234567890123456",
  "0x4567890123456789012345678901234567890123456789012345678901234567",
  "0x5678901234567890123456789012345678901234567890123456789012345678",
];

/**
 * Generate mock prediction markets
 */
export function getMockPredictionMarkets(limit: number = 5): MarketInfo[] {
  const markets: MarketInfo[] = [];
  const gameContractValues = Object.values(GAME_CONTRACTS);

  for (let i = 0; i < Math.min(limit, 5); i++) {
    const isResolved = i < 2; // First 2 markets are resolved
    const playerWon = i === 0; // Only first market won

    markets.push({
      market_id: BigInt(i + 1),
      game_contract: gameContractValues[i % gameContractValues.length],
      round: 1,
      target_player: MOCK_PLAYERS[i],
      resolved: isResolved,
      player_won: isResolved ? playerWon : false,
      total_bets: BigInt(1000000000000000000) * BigInt(i + 1), // Increasing pools
      win_pool: BigInt(600000000000000000) * BigInt(i + 1),
      lose_pool: BigInt(400000000000000000) * BigInt(i + 1),
    });
  }

  return markets;
}

/**
 * Generate mock market info for a specific market ID
 */
export function getMockMarketInfo(marketId: bigint): MarketInfo {
  const id = Number(marketId);
  const gameContractValues = Object.values(GAME_CONTRACTS);
  const isResolved = id <= 2;
  const playerWon = id === 1;

  return {
    market_id: marketId,
    game_contract: gameContractValues[id % gameContractValues.length],
    round: 1,
    target_player: MOCK_PLAYERS[id % MOCK_PLAYERS.length],
    resolved: isResolved,
    player_won: isResolved ? playerWon : false,
    total_bets: BigInt(1000000000000000000) * BigInt(id + 1),
    win_pool: BigInt(600000000000000000) * BigInt(id + 1),
    lose_pool: BigInt(400000000000000000) * BigInt(id + 1),
  };
}

/**
 * Generate mock bets for a player
 */
export function getMockPlayerBets(playerAddress: string, count: number = 3): BetInfo[] {
  const bets: BetInfo[] = [];

  for (let i = 0; i < count; i++) {
    const marketId = BigInt(i + 1);
    const isResolved = i < 2;
    const prediction = i % 2 === 0; // Alternate between win/lose predictions
    const isWinner = isResolved && prediction && i === 0; // Only first bet won

    bets.push({
      bet_id: BigInt(i + 1),
      market_id: marketId,
      bettor: playerAddress,
      prediction: prediction,
      amount: BigInt(100000000000000000) * BigInt(i + 1), // 0.1 ETH, 0.2 ETH, 0.3 ETH
      claimed: isWinner,
      is_winner: isWinner,
      payout: isWinner ? BigInt(250000000000000000) : BigInt(0), // 0.25 ETH payout for winner
    });
  }

  return bets;
}

/**
 * Generate mock bet info for a specific bet ID
 */
export function getMockBetInfo(betId: bigint): BetInfo {
  const id = Number(betId);
  const marketId = BigInt(Math.floor(id / 3) + 1);
  const isResolved = id <= 6;
  const prediction = id % 2 === 0;
  const isWinner = isResolved && prediction && id <= 2;

  return {
    bet_id: betId,
    market_id: marketId,
    bettor: MOCK_PLAYERS[id % MOCK_PLAYERS.length],
    prediction: prediction,
    amount: BigInt(100000000000000000) * BigInt(id + 1),
    claimed: isWinner,
    is_winner: isWinner,
    payout: isWinner ? BigInt(250000000000000000) : BigInt(0),
  };
}

/**
 * Calculate odds for a market
 */
export function calculateOdds(market: MarketInfo): { winOdds: number; loseOdds: number } {
  const winPoolNum = Number(market.win_pool);
  const losePoolNum = Number(market.lose_pool);
  const totalPool = winPoolNum + losePoolNum;

  if (totalPool === 0) {
    return { winOdds: 1.0, loseOdds: 1.0 };
  }

  return {
    winOdds: totalPool / (winPoolNum || 1),
    loseOdds: totalPool / (losePoolNum || 1),
  };
}

/**
 * Get mock active markets (unresolved)
 */
export function getMockActiveMarkets(): MarketInfo[] {
  return getMockPredictionMarkets(5).filter(m => !m.resolved);
}

/**
 * Get mock resolved markets
 */
export function getMockResolvedMarkets(): MarketInfo[] {
  return getMockPredictionMarkets(5).filter(m => m.resolved);
}

/**
 * Check if we should use mock data
 */
export function shouldUseMockPredictionData(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
}
