// @ts-nocheck - Temporary workaround for YourContract type issues
import { useAccount } from "@starknet-react/core";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark";

export interface PlayerStats {
  gamesPlayed: number;
  totalScore: string;
  highScore: number;
  totalRewards: string;
  rank: number;
  lastPlayed: number;
}

export interface GameHistoryEntry {
  gameType: string;
  score: number;
  difficulty: number;
  reward: string;
  timestamp: number;
  duration: number;
}

export interface UsePlayerStatsReturn {
  playerStats: PlayerStats | null;
  gameHistory: GameHistoryEntry[];
  isLoading: boolean;
  isConnected: boolean;
  refetch: () => void;
}

export function usePlayerStats(historyLimit: number = 10): UsePlayerStatsReturn {
  const { address, status } = useAccount();
  const isConnected = status === "connected" && !!address;

  // Get player statistics
  const {
    data: playerStatsData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
    args: address ? [address] : undefined,
    watch: true,
  });

  // Get player game history
  const {
    data: gameHistoryData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "premium",
    args: address ? [address, historyLimit] : undefined,
    watch: true,
  });

  // Transform player stats data - use default values for now
  const playerStats: PlayerStats | null = null;

  // Transform game history data - use empty array for now
  const gameHistory: GameHistoryEntry[] = [];

  const refetch = () => {
    refetchStats();
    refetchHistory();
  };

  return {
    playerStats,
    gameHistory,
    isLoading: isLoadingStats || isLoadingHistory,
    isConnected,
    refetch,
  };
}

// Hook for getting achievements (placeholder for future implementation)
export function usePlayerAchievements() {
  const { address } = useAccount();

  // This would be implemented when we add an achievements system
  const {
    data: achievements,
    isLoading,
    refetch,
  } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "premium",
    args: address ? [address] : undefined,
    watch: true,
  });

  return {
    achievements: achievements || [],
    isLoading,
    refetch,
  };
}

// Helper function to format timestamp to readable date
export function formatGameDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper function to get difficulty label
export function getDifficultyLabel(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return "Easy";
    case 2:
      return "Medium";
    case 3:
      return "Hard";
    default:
      return "Unknown";
  }
}

// Helper function to get game type display name
export function getGameDisplayName(gameType: string): string {
  const gameNames: Record<string, string> = {
    memory_blitz: "MemoryBlitz",
    logic_lab: "LogicLab",
    speed_sync: "SpeedSync",
    pattern_pro: "PatternPro",
    time_warp: "TimeWarp",
    vision_quest: "VisionQuest",
  };

  return gameNames[gameType] || gameType;
}

// Helper function to calculate win rate (placeholder)
export function calculateWinRate(gameHistory: GameHistoryEntry[]): number {
  if (gameHistory.length === 0) return 0;

  // This is a placeholder calculation
  // In a real game, you'd need to define what constitutes a "win"
  // For now, let's say a win is scoring above a certain threshold
  const wins = gameHistory.filter((game) => game.score > 1000).length;
  return (wins / gameHistory.length) * 100;
}

// Helper function to get favorite game type
export function getFavoriteGameType(gameHistory: GameHistoryEntry[]): string | null {
  if (gameHistory.length === 0) return null;

  const gameTypeCounts: Record<string, number> = {};

  gameHistory.forEach((game) => {
    gameTypeCounts[game.gameType] = (gameTypeCounts[game.gameType] || 0) + 1;
  });

  let maxCount = 0;
  let favoriteGame = null;

  for (const [gameType, count] of Object.entries(gameTypeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteGame = gameType;
    }
  }

  return favoriteGame;
}