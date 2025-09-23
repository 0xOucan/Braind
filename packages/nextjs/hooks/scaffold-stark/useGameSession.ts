import { useState, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-stark";

export type GameDifficulty = 1 | 2 | 3; // Easy, Medium, Hard
export type GameType =
  | "memory_blitz"
  | "logic_lab"
  | "speed_sync"
  | "pattern_pro"
  | "time_warp"
  | "vision_quest";

export interface GameSession {
  gameType: GameType;
  difficulty: GameDifficulty;
  startTime: number;
  isActive: boolean;
  score: number;
}

export interface UseGameSessionReturn {
  currentSession: GameSession | null;
  isSubmitting: boolean;
  startGame: (gameType: GameType, difficulty: GameDifficulty) => void;
  submitScore: (score: number) => Promise<bigint | undefined>;
  endGame: () => void;
  playerStats: any;
  isLoadingStats: boolean;
}

export function useGameSession(): UseGameSessionReturn {
  const { address } = useAccount();
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);

  // Read player stats
  const {
    data: playerStats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
    args: address ? [address] : undefined,
    watch: true,
  });

  // Submit game score - placeholder implementation
  const submitGameScore = async () => {};
  const isSubmitting = false;

  const startGame = useCallback((gameType: GameType, difficulty: GameDifficulty) => {
    const session: GameSession = {
      gameType,
      difficulty,
      startTime: Date.now(),
      isActive: true,
      score: 0,
    };
    setCurrentSession(session);
  }, []);

  const submitScore = useCallback(async (score: number): Promise<bigint | undefined> => {
    if (!currentSession || !address) {
      throw new Error("No active game session or wallet not connected");
    }

    try {
      const duration = Math.floor((Date.now() - currentSession.startTime) / 1000);

      // Convert game type to felt252 (Cairo's felt252 is essentially a string)
      const gameTypeFelt = currentSession.gameType;

      await submitGameScore();

      // Update session with final score
      setCurrentSession({
        ...currentSession,
        score,
        isActive: false,
      });

      // Refetch player stats to get updated data
      await refetchStats();

      return BigInt(0); // Mock return value
    } catch (error) {
      console.error("Error submitting game score:", error);
      throw error;
    }
  }, [currentSession, address, submitGameScore, refetchStats]);

  const endGame = useCallback(() => {
    setCurrentSession(null);
  }, []);

  return {
    currentSession,
    isSubmitting,
    startGame,
    submitScore,
    endGame,
    playerStats,
    isLoadingStats,
  };
}

// Helper hook for reading game rewards
export function useGameRewards() {
  const { data: easyReward } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "premium",
  });

  const { data: mediumReward } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "premium",
  });

  const { data: hardReward } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "premium",
  });

  return {
    easyReward: easyReward ? easyReward.toString() : "25",
    mediumReward: mediumReward ? mediumReward.toString() : "60",
    hardReward: hardReward ? hardReward.toString() : "80",
  };
}

// Helper function to get reward amount by difficulty
export function getRewardByDifficulty(difficulty: GameDifficulty): string {
  switch (difficulty) {
    case 1:
      return "25";
    case 2:
      return "60";
    case 3:
      return "80";
    default:
      return "0";
  }
}

// Helper function to format game duration
export function formatGameDuration(durationMs: number): string {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}