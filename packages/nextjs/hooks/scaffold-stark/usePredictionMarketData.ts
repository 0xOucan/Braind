// @ts-nocheck - Temporary workaround for PredictionMarket type issues
/**
 * Custom hook for fetching prediction market data with mock data support
 *
 * This hook demonstrates how to conditionally use mock data or real contract data
 * based on the NEXT_PUBLIC_USE_MOCK_DATA environment variable.
 *
 * Usage:
 * ```tsx
 * const { marketInfo, isLoading } = useMarketInfo(marketId);
 * const { playerBets, isLoading } = usePlayerBets(playerAddress);
 * ```
 */

import { useScaffoldReadContract } from "./useScaffoldReadContract";
import {
  getMockMarketInfo,
  getMockPlayerBets,
  getMockActiveMarkets,
  getMockResolvedMarkets,
  shouldUseMockPredictionData,
  type MarketInfo,
  type BetInfo,
} from "~/utils/mockPredictionMarketData";

/**
 * Hook to fetch market information
 */
export function useMarketInfo(marketId?: bigint): {
  marketInfo: MarketInfo | undefined;
  isLoading: boolean;
} {
  const useMock = shouldUseMockPredictionData();

  const { data: marketData, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "get_market_info",
    args: marketId !== undefined ? [marketId] : undefined,
    enabled: !useMock && marketId !== undefined,
  });

  if (useMock && marketId !== undefined) {
    return {
      marketInfo: getMockMarketInfo(marketId),
      isLoading: false,
    };
  }

  return {
    marketInfo: marketData as MarketInfo | undefined,
    isLoading,
  };
}

/**
 * Hook to fetch bet information
 */
export function useBetInfo(betId?: bigint): {
  betInfo: BetInfo | undefined;
  isLoading: boolean;
} {
  const useMock = shouldUseMockPredictionData();

  const { data: betData, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "get_bet_info",
    args: betId !== undefined ? [betId] : undefined,
    enabled: !useMock && betId !== undefined,
  });

  if (useMock && betId !== undefined) {
    // For mock, we'll need to implement getMockBetInfo
    return {
      betInfo: undefined, // Implement getMockBetInfo if needed
      isLoading: false,
    };
  }

  return {
    betInfo: betData as BetInfo | undefined,
    isLoading,
  };
}

/**
 * Hook to fetch all bets for a player
 */
export function usePlayerBets(playerAddress?: string): {
  betIds: bigint[];
  bets: BetInfo[];
  isLoading: boolean;
} {
  const useMock = shouldUseMockPredictionData();

  const { data: betIdsData, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "get_player_bets",
    args: playerAddress ? [playerAddress] : undefined,
    enabled: !useMock && !!playerAddress,
  });

  if (useMock && playerAddress) {
    const mockBets = getMockPlayerBets(playerAddress, 3);
    return {
      betIds: mockBets.map(bet => bet.bet_id),
      bets: mockBets,
      isLoading: false,
    };
  }

  return {
    betIds: (betIdsData as bigint[]) || [],
    bets: [], // Would need to fetch individual bets
    isLoading,
  };
}

/**
 * Hook to fetch active (unresolved) markets
 */
export function useActiveMarkets(): {
  markets: MarketInfo[];
  isLoading: boolean;
} {
  const useMock = shouldUseMockPredictionData();

  // Note: This would require a contract function to get all markets
  // For now, we'll just return mock data or empty array

  if (useMock) {
    return {
      markets: getMockActiveMarkets(),
      isLoading: false,
    };
  }

  return {
    markets: [],
    isLoading: false,
  };
}

/**
 * Hook to fetch resolved markets
 */
export function useResolvedMarkets(): {
  markets: MarketInfo[];
  isLoading: boolean;
} {
  const useMock = shouldUseMockPredictionData();

  if (useMock) {
    return {
      markets: getMockResolvedMarkets(),
      isLoading: false,
    };
  }

  return {
    markets: [],
    isLoading: false,
  };
}
