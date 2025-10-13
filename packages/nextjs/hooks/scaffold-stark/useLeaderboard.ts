// @ts-nocheck - Temporary workaround for V2 contract type issues
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark";
import { useAccount } from "@starknet-react/core";
import {
  mockCurrentRoundLeaderboard,
  mockHistoricLeaderboard,
  type MockLeaderboardEntry,
} from "~~/utils/mockData";

export interface LeaderboardEntry {
  address: string;
  score: number;
  rank: number;
  username?: string;
  games?: number;
}

export interface UseLeaderboardReturn {
  currentRound: LeaderboardEntry[];
  historic: LeaderboardEntry[];
  isLoading: boolean;
  currentRoundNumber: number;
  playerRank: number | null;
  refetch: () => void;
}

export function useLeaderboard(limit: number = 100): UseLeaderboardReturn {
  const { address } = useAccount();

  // Get current round leaderboard
  const {
    data: currentRoundData,
    isLoading: isLoadingCurrentRound,
    refetch: refetchCurrentRound,
  } = useScaffoldReadContract({
    contractName: "ColorMatchGameV2",
    functionName: "get_current_round_leaderboard",
    args: [limit],
    watch: true,
  });

  // Get historic leaderboard
  const {
    data: historicData,
    isLoading: isLoadingHistoric,
    refetch: refetchHistoric,
  } = useScaffoldReadContract({
    contractName: "ColorMatchGameV2",
    functionName: "get_historic_leaderboard",
    args: [limit],
    watch: true,
  });

  // Get current round number
  const {
    data: roundNumber,
    refetch: refetchRound,
  } = useScaffoldReadContract({
    contractName: "ColorMatchGameV2",
    functionName: "get_current_round",
    watch: true,
  });

  // Get player's rank in current round
  const {
    data: playerRank,
    refetch: refetchPlayerRank,
  } = useScaffoldReadContract({
    contractName: "ColorMatchGameV2",
    functionName: "get_player_round_position",
    args: address ? [address] : undefined,
    watch: true,
  });

  // Transform leaderboard data - use mock data for now since contracts aren't deployed
  const currentRound: LeaderboardEntry[] = mockCurrentRoundLeaderboard.map((entry) => ({
    address: entry.player,
    score: entry.score,
    rank: entry.rank,
    username: entry.username,
    games: entry.games,
  }));

  const historic: LeaderboardEntry[] = mockHistoricLeaderboard.map((entry) => ({
    address: entry.player,
    score: entry.score,
    rank: entry.rank,
    username: entry.username,
    games: entry.games,
  }));

  const refetch = () => {
    refetchCurrentRound();
    refetchHistoric();
    refetchRound();
    if (address) {
      refetchPlayerRank();
    }
  };

  return {
    currentRound,
    historic,
    isLoading: isLoadingCurrentRound || isLoadingHistoric,
    currentRoundNumber: roundNumber ? Number(roundNumber) : 5,
    playerRank: playerRank ? Number(playerRank) : null,
    refetch,
  };
}