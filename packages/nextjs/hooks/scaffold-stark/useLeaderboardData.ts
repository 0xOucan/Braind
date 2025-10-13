// @ts-nocheck - Temporary workaround for V2 contract type issues
/**
 * Custom hook for fetching leaderboard data with mock data support
 *
 * This hook demonstrates how to conditionally use mock data or real contract data
 * based on the NEXT_PUBLIC_USE_MOCK_DATA environment variable.
 *
 * Usage:
 * ```tsx
 * const { currentRoundLeaderboard, historicLeaderboard, currentRound, gamesInRound, isLoading } =
 *   useLeaderboardData('ColorMatchGameV2', 10);
 * ```
 */

import { useScaffoldReadContract } from "./useScaffoldReadContract";
import {
  getMockColorMatchLeaderboard,
  getMockSpeedMatchLeaderboard,
  getMockMemoryBlitzLeaderboard,
  getMockHistoricLeaderboard,
  getMockCurrentRound,
  getMockGamesInCurrentRound,
  shouldUseMockData,
  type LeaderboardEntry,
} from "~/utils/mockLeaderboardData";

type GameType = "ColorMatchGameV2" | "SpeedMatchGameV2" | "MemoryBlitzGameV2";

interface LeaderboardData {
  currentRoundLeaderboard: LeaderboardEntry[];
  historicLeaderboard: LeaderboardEntry[];
  currentRound: number;
  gamesInRound: number;
  isLoading: boolean;
}

/**
 * Hook to fetch leaderboard data from contracts or mock data
 */
export function useLeaderboardData(
  contractName: GameType,
  limit: number = 10
): LeaderboardData {
  const useMock = shouldUseMockData();

  // Fetch current round leaderboard from contract
  const { data: currentRoundData, isLoading: isLoadingCurrent } = useScaffoldReadContract({
    contractName,
    functionName: "get_current_round_leaderboard",
    args: [limit],
    enabled: !useMock, // Only fetch if not using mock data
  });

  // Fetch historic leaderboard from contract
  const { data: historicData, isLoading: isLoadingHistoric } = useScaffoldReadContract({
    contractName,
    functionName: "get_historic_leaderboard",
    args: [limit],
    enabled: !useMock,
  });

  // Fetch current round number
  const { data: roundData, isLoading: isLoadingRound } = useScaffoldReadContract({
    contractName,
    functionName: "get_current_round",
    enabled: !useMock,
  });

  // Fetch games in current round
  const { data: gamesData, isLoading: isLoadingGames } = useScaffoldReadContract({
    contractName,
    functionName: "get_games_in_current_round",
    enabled: !useMock,
  });

  // Return mock data if enabled
  if (useMock) {
    const gameType = contractName.includes("Color")
      ? "color"
      : contractName.includes("Speed")
        ? "speed"
        : "memory";

    const mockCurrentRound =
      gameType === "color"
        ? getMockColorMatchLeaderboard(limit)
        : gameType === "speed"
          ? getMockSpeedMatchLeaderboard(limit)
          : getMockMemoryBlitzLeaderboard(limit);

    return {
      currentRoundLeaderboard: mockCurrentRound,
      historicLeaderboard: getMockHistoricLeaderboard(gameType, limit),
      currentRound: getMockCurrentRound(),
      gamesInRound: getMockGamesInCurrentRound(),
      isLoading: false,
    };
  }

  // Return real contract data
  return {
    currentRoundLeaderboard: (currentRoundData as LeaderboardEntry[]) || [],
    historicLeaderboard: (historicData as LeaderboardEntry[]) || [],
    currentRound: Number(roundData) || 0,
    gamesInRound: Number(gamesData) || 0,
    isLoading:
      isLoadingCurrent || isLoadingHistoric || isLoadingRound || isLoadingGames,
  };
}

/**
 * Hook to fetch player's position in current round
 */
export function usePlayerRoundPosition(
  contractName: GameType,
  playerAddress?: string
): { position: number; isLoading: boolean } {
  const useMock = shouldUseMockData();

  const { data: positionData, isLoading } = useScaffoldReadContract({
    contractName,
    functionName: "get_player_round_position",
    args: playerAddress ? [playerAddress] : undefined,
    enabled: !useMock && !!playerAddress,
  });

  if (useMock) {
    // Return mock position (player is in position 3)
    return { position: 3, isLoading: false };
  }

  return {
    position: Number(positionData) || 0,
    isLoading,
  };
}
