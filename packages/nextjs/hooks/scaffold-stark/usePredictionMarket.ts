import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-stark";
import { useAccount } from "@starknet-react/core";
import {
  mockPredictionMarkets,
  mockPlayerBets,
  type MockPredictionMarket,
  type MockBetInfo,
} from "~~/utils/mockData";

export interface MarketInfo {
  marketId: string;
  gameContract: string;
  round: number;
  targetPlayer: string;
  targetPlayerName?: string;
  resolved: boolean;
  playerWon: boolean;
  totalBets: string;
  winPool: string;
  losePool: string;
  createdAt?: number;
}

export interface BetInfo {
  betId: string;
  marketId: string;
  bettor: string;
  prediction: boolean;
  amount: string;
  claimed: boolean;
  isWinner: boolean;
  payout: string;
  timestamp?: number;
}

export interface UsePredictionMarketReturn {
  markets: MarketInfo[];
  playerBets: BetInfo[];
  isLoading: boolean;
  placeBet: (marketId: string, prediction: boolean, amount: string) => Promise<void>;
  claimWinnings: (betId: string) => Promise<void>;
  createMarket: (gameContract: string, round: number, player: string) => Promise<void>;
  refetch: () => void;
}

export function usePredictionMarket(): UsePredictionMarketReturn {
  const { address } = useAccount();

  // Get market info - would typically fetch all active markets
  // For now, we'll use mock data since contracts aren't deployed
  const {
    data: marketData,
    isLoading: isLoadingMarkets,
    refetch: refetchMarkets,
  } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "get_market_info",
    args: ["1"], // Example: fetch market #1
    watch: true,
  });

  // Get player's bets
  const {
    data: playerBetsData,
    isLoading: isLoadingBets,
    refetch: refetchBets,
  } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "get_player_bets",
    args: address ? [address] : undefined,
    watch: true,
  });

  // Write functions
  const { writeAsync: writePlaceBet } = useScaffoldWriteContract({
    contractName: "PredictionMarket",
    functionName: "place_bet",
  });

  const { writeAsync: writeClaimWinnings } = useScaffoldWriteContract({
    contractName: "PredictionMarket",
    functionName: "claim_winnings",
  });

  const { writeAsync: writeCreateMarket } = useScaffoldWriteContract({
    contractName: "PredictionMarket",
    functionName: "create_market",
  });

  // Transform mock data to interface format
  const markets: MarketInfo[] = mockPredictionMarkets.map((market) => ({
    marketId: market.id,
    gameContract: "0x1234567890123456789012345678901234567890123456789012345678901234",
    round: market.round,
    targetPlayer: market.targetPlayer,
    targetPlayerName: market.targetPlayerName,
    resolved: market.resolved,
    playerWon: market.playerWon || false,
    totalBets: market.totalBets,
    winPool: market.winPool,
    losePool: market.losePool,
    createdAt: market.createdAt,
  }));

  const playerBets: BetInfo[] = mockPlayerBets.map((bet) => ({
    betId: bet.betId,
    marketId: bet.marketId,
    bettor: address || "0x0",
    prediction: bet.prediction,
    amount: bet.amount,
    claimed: bet.claimed,
    isWinner: bet.isWinner || false,
    payout: bet.payout || "0",
    timestamp: bet.timestamp,
  }));

  // Placeholder functions for contract interactions
  const placeBet = async (marketId: string, prediction: boolean, amount: string) => {
    try {
      // In production, this would call the actual contract
      // await writePlaceBet({
      //   args: [marketId, prediction, tokenAddress, amount],
      // });
      console.log("Placing bet:", { marketId, prediction, amount });
      // For now, just log the action
      alert(`Mock: Placing bet of ${amount} wei on ${prediction ? "WIN" : "LOSE"} for market ${marketId}`);
    } catch (error) {
      console.error("Error placing bet:", error);
      throw error;
    }
  };

  const claimWinnings = async (betId: string) => {
    try {
      // In production, this would call the actual contract
      // await writeClaimWinnings({
      //   args: [betId],
      // });
      console.log("Claiming winnings for bet:", betId);
      alert(`Mock: Claiming winnings for bet ${betId}`);
    } catch (error) {
      console.error("Error claiming winnings:", error);
      throw error;
    }
  };

  const createMarket = async (gameContract: string, round: number, player: string) => {
    try {
      // In production, this would call the actual contract
      // await writeCreateMarket({
      //   args: [gameContract, round, player],
      // });
      console.log("Creating market:", { gameContract, round, player });
      alert(`Mock: Creating market for player ${player} in round ${round}`);
    } catch (error) {
      console.error("Error creating market:", error);
      throw error;
    }
  };

  const refetch = () => {
    refetchMarkets();
    if (address) {
      refetchBets();
    }
  };

  return {
    markets,
    playerBets,
    isLoading: isLoadingMarkets || isLoadingBets,
    placeBet,
    claimWinnings,
    createMarket,
    refetch,
  };
}

// Hook to get a specific market's details
export function useMarketDetails(marketId: string) {
  const {
    data: marketInfo,
    isLoading,
    refetch,
  } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "get_market_info",
    args: [marketId],
    watch: true,
  });

  // Use mock data for now
  const mockMarket = mockPredictionMarkets.find((m) => m.id === marketId);

  const market: MarketInfo | null = mockMarket
    ? {
        marketId: mockMarket.id,
        gameContract: "0x1234567890123456789012345678901234567890123456789012345678901234",
        round: mockMarket.round,
        targetPlayer: mockMarket.targetPlayer,
        targetPlayerName: mockMarket.targetPlayerName,
        resolved: mockMarket.resolved,
        playerWon: mockMarket.playerWon || false,
        totalBets: mockMarket.totalBets,
        winPool: mockMarket.winPool,
        losePool: mockMarket.losePool,
        createdAt: mockMarket.createdAt,
      }
    : null;

  return {
    market,
    isLoading,
    refetch,
  };
}
