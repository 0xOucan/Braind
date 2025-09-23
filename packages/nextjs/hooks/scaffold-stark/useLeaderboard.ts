import { useScaffoldReadContract } from "~~/hooks/scaffold-stark";
import { useAccount } from "@starknet-react/core";

export interface LeaderboardEntry {
  address: string;
  score: string;
  rank: number;
}

export interface UseLeaderboardReturn {
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  globalStats: any;
  playerRank: number | null;
  refetch: () => void;
}

export function useLeaderboard(limit: number = 100): UseLeaderboardReturn {
  const { address } = useAccount();

  // Get leaderboard data
  const {
    data: leaderboardData,
    isLoading: isLoadingLeaderboard,
    refetch: refetchLeaderboard,
  } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "premium",
    args: [limit],
    watch: true,
  });

  // Get global statistics
  const {
    data: globalStats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "premium",
    watch: true,
  });

  // Get player's rank
  const {
    data: playerRank,
    refetch: refetchPlayerRank,
  } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "premium",
    args: address ? [address] : undefined,
    watch: true,
  });

  // Transform leaderboard data - use mock data for now
  const leaderboard: LeaderboardEntry[] = [];

  const refetch = () => {
    refetchLeaderboard();
    refetchStats();
    if (address) {
      refetchPlayerRank();
    }
  };

  return {
    leaderboard,
    isLoading: isLoadingLeaderboard || isLoadingStats,
    globalStats,
    playerRank: playerRank ? Number(playerRank) : null,
    refetch,
  };
}

// Hook for weekly/daily leaderboards (filtered by time)
export function useTimeFilteredLeaderboard(timeFilter: "daily" | "weekly" | "all" = "all") {
  const days = timeFilter === "daily" ? 1 : timeFilter === "weekly" ? 7 : 0;

  const {
    data: leaderboardData,
    isLoading,
    refetch,
  } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "premium",
    args: [100], // Always get top 100, filtering is done on-chain
    watch: true,
  });

  // In a real implementation, you might want a separate contract function
  // for time-filtered leaderboards. For now, we return mock data.
  const leaderboard: LeaderboardEntry[] = [];

  return {
    leaderboard,
    isLoading,
    refetch,
    timeFilter,
  };
}