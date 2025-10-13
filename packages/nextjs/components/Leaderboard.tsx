"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Badge } from "~~/components/ui/badge";
import { Trophy, Crown, Medal, Award, Coins } from "lucide-react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark";

// Mock data for demonstration - will be replaced with real contract data
const mockLeaderboardData = [
  {
    rank: 1,
    address: "0x1234567890abcdef1234567890abcdef12345678",
    username: "BrainMaster",
    totalScore: 15420,
    gamesPlayed: 42,
    totalRewards: "1250 STARK",
  },
  {
    rank: 2,
    address: "0x2345678901bcdef12345678901bcdef123456789",
    username: "PixelProdigy",
    totalScore: 14850,
    gamesPlayed: 38,
    totalRewards: "1100 STARK",
  },
  {
    rank: 3,
    address: "0x3456789012cdef123456789012cdef12345678a",
    username: "LogicLord",
    totalScore: 13920,
    gamesPlayed: 35,
    totalRewards: "950 STARK",
  },
  {
    rank: 4,
    address: "0x456789013def123456789013def123456789b",
    username: "MemoryMage",
    totalScore: 13200,
    gamesPlayed: 31,
    totalRewards: "800 STARK",
  },
  {
    rank: 5,
    address: "0x56789014ef123456789014ef123456789c",
    username: "SpeedDemon",
    totalScore: 12750,
    gamesPlayed: 29,
    totalRewards: "725 STARK",
  },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />;
    default:
      return <Trophy className="w-5 h-5 text-gray-500" />;
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return "border-yellow-400 bg-yellow-400/10";
    case 2:
      return "border-gray-400 bg-gray-400/10";
    case 3:
      return "border-amber-600 bg-amber-600/10";
    default:
      return "border-gray-600";
  }
};

export function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState<"daily" | "weekly" | "all">("all");

  // Temporarily commented - YourContract not in deployed contracts
  // const { data: globalStats } = useScaffoldReadContract({
  //   contractName: "YourContract",
  //   functionName: "premium",
  //   watch: true,
  // });
  const globalStats = null;

  // const { data: leaderboardData } = useScaffoldReadContract({
  //   contractName: "YourContract",
  //   functionName: "premium",
  //   args: [timeFilter === "daily" ? 1 : timeFilter === "weekly" ? 7 : 0],
  //   watch: true,
  // });
  const leaderboardData = null;

  // Use mock data for now (contract functions don't exist yet)
  const displayData = mockLeaderboardData;

  return (
    <section id="leaderboard" className="py-20 px-4 bg-main">
      <div className="pixel-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary pixel-font">Global Leaderboard</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto retro-font">
            See how you stack up against the brightest minds in the Starknet ecosystem
          </p>

          {globalStats && (
            <div className="flex justify-center gap-4 mt-6">
              <div className="game-card p-3 border-blue-500">
                <span className="pixel-font text-blue-400 text-sm">Total Games: {"15,842"}</span>
              </div>
              <div className="game-card p-3 border-green-500">
                <span className="pixel-font text-green-400 text-sm">Total Rewards: {"2.5M"} STARK</span>
              </div>
            </div>
          )}
        </div>

        {/* Time Filter */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-card border-2 border-black rounded-lg overflow-hidden">
            {(["daily", "weekly", "all"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 pixel-font text-xs transition-all ${
                  timeFilter === filter
                    ? "bg-yellow-400 text-black"
                    : "bg-transparent text-foreground hover:bg-yellow-400/20"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <Card className="game-card max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="pixel-font text-2xl text-center flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Top Brain Champions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayData.map((player, index) => (
                <div
                  key={player.address}
                  className={`game-card p-4 flex items-center gap-4 ${getRankStyle(player.rank)}`}
                >
                  {/* Rank */}
                  <div className="flex items-center gap-2 min-w-12">
                    {getRankIcon(player.rank)}
                    <span className="pixel-font text-lg">{player.rank}</span>
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="pixel-font text-sm text-primary">{player.username}</span>
                      <span className="text-xs text-muted-foreground">{player.address}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs retro-font text-muted-foreground">
                      <span>Games: {player.gamesPlayed}</span>
                      <span>Score: {player.totalScore.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-accent retro-font font-semibold">
                      <Coins className="w-4 h-4" />
                      {player.totalRewards}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {displayData.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="pixel-font text-gray-500">No leaderboard data available</p>
                <p className="retro-font text-sm text-muted-foreground mt-2">
                  Be the first to play and claim your spot!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Stats */}
        <div className="mt-12 text-center">
          <p className="retro-font text-muted-foreground mb-4">
            Your ranking will appear here once you start playing games
          </p>
          <Badge variant="outline" className="px-4 py-2">
            <span className="pixel-font text-xs">Connect wallet to track your progress</span>
          </Badge>
        </div>
      </div>
    </section>
  );
}