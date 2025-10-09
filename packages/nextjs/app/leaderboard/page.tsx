"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Badge } from "~~/components/ui/badge";
import { Trophy, Users, Coins, TrendingUp, Crown, Medal, Award, Zap } from "lucide-react";
import { useAccount } from "@starknet-react/core";
import { useLeaderboard } from "~~/hooks/scaffold-stark/useLeaderboard";
import { shortenAddress } from "~~/utils/mockData";

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

export default function LeaderboardPage() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<"current" | "historic">("current");
  const { currentRound, historic, isLoading, currentRoundNumber, playerRank } = useLeaderboard(100);

  const displayData = activeTab === "current" ? currentRound : historic;

  return (
    <div className="min-h-screen bg-main pt-24">
      <div className="pixel-container">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-primary pixel-font retro-glow">
            Leaderboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto retro-font">
            Compete with the brightest minds in the Starknet ecosystem.
            Climb the ranks and prove you&apos;re the ultimate brain champion!
          </p>
          <div className="mt-4">
            <Badge variant="outline" className="px-4 py-2">
              <span className="pixel-font text-sm">Current Round: {currentRoundNumber}</span>
            </Badge>
          </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="game-card border-blue-500">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-blue-400">
                {activeTab === "current" ? currentRound.length : historic.length}
              </div>
              <div className="retro-font text-xs text-muted-foreground">
                {activeTab === "current" ? "Round Players" : "All-Time Players"}
              </div>
            </CardContent>
          </Card>

          <Card className="game-card border-green-500">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-green-400">
                {displayData.reduce((acc, player) => acc + (player.games || 0), 0).toLocaleString()}
              </div>
              <div className="retro-font text-xs text-muted-foreground">Total Games</div>
            </CardContent>
          </Card>

          <Card className="game-card border-yellow-500">
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-yellow-400">
                {displayData.reduce((acc, player) => acc + player.score, 0).toLocaleString()}
              </div>
              <div className="retro-font text-xs text-muted-foreground">Total Score</div>
            </CardContent>
          </Card>

          <Card className="game-card border-purple-500">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-purple-400">
                {address && playerRank ? `#${playerRank}` : "--"}
              </div>
              <div className="retro-font text-xs text-muted-foreground">Your Rank</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Levels */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center pixel-font">Achievement Ranks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="game-card border-yellow-400">
              <CardHeader>
                <CardTitle className="pixel-font text-yellow-400 flex items-center gap-2">
                  <Crown className="w-6 h-6" />
                  Brain Emperor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="retro-font text-sm text-muted-foreground mb-2">
                  Top 1% of all players
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">15,000+ Score</Badge>
                  <Badge variant="success" className="text-xs">1000+ STARK</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="game-card border-gray-400">
              <CardHeader>
                <CardTitle className="pixel-font text-gray-400 flex items-center gap-2">
                  <Medal className="w-6 h-6" />
                  Brain Master
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="retro-font text-sm text-muted-foreground mb-2">
                  Top 10% of all players
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">10,000+ Score</Badge>
                  <Badge variant="success" className="text-xs">500+ STARK</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="game-card border-amber-600">
              <CardHeader>
                <CardTitle className="pixel-font text-amber-600 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Brain Scholar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="retro-font text-sm text-muted-foreground mb-2">
                  Top 25% of all players
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">5,000+ Score</Badge>
                  <Badge variant="success" className="text-xs">250+ STARK</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-card border-2 border-black rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab("current")}
              className={`px-6 py-3 pixel-font text-sm transition-all ${
                activeTab === "current"
                  ? "bg-primary text-black"
                  : "bg-transparent text-foreground hover:bg-primary/20"
              }`}
            >
              Current Round
            </button>
            <button
              onClick={() => setActiveTab("historic")}
              className={`px-6 py-3 pixel-font text-sm transition-all ${
                activeTab === "historic"
                  ? "bg-primary text-black"
                  : "bg-transparent text-foreground hover:bg-primary/20"
              }`}
            >
              All-Time
            </button>
          </div>
        </div>

        {/* Personal Achievement */}
        {address && playerRank && activeTab === "current" && (
          <div className="mb-12 text-center">
            <Card className="game-card border-accent inline-block p-6">
              <h3 className="pixel-font text-accent mb-2">Your Current Round Rank</h3>
              <div className="flex items-center justify-center gap-4">
                <Trophy className="w-8 h-8 text-accent" />
                <span className="pixel-font text-2xl">#{playerRank}</span>
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <p className="retro-font text-sm text-muted-foreground mt-2">
                Keep playing to climb higher!
              </p>
            </Card>
          </div>
        )}

        {/* Leaderboard Table */}
        <Card className="game-card max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="pixel-font text-2xl text-center flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              {activeTab === "current" ? "Current Round Top Players" : "All-Time Legends"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="pixel-font text-gray-500">Loading leaderboard...</p>
              </div>
            ) : displayData.length > 0 ? (
              <div className="space-y-3">
                {displayData.map((player) => (
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
                        {player.username && (
                          <span className="pixel-font text-sm text-primary">{player.username}</span>
                        )}
                        <span className="text-xs text-muted-foreground font-mono">
                          {shortenAddress(player.address, 6)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs retro-font text-muted-foreground">
                        <span>Games: {player.games || 0}</span>
                        <span>Score: {player.score.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div className="text-right">
                      <Badge variant="outline" className="pixel-font">
                        {player.score.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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

        {/* Competition Info */}
        <div className="mt-20">
          <Card className="game-card border-purple-500 p-8">
            <CardHeader>
              <CardTitle className="pixel-font text-purple-400 text-center text-2xl">
                Weekly Competition
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="retro-font text-muted-foreground mb-6">
                Compete for the highest score this week and win bonus rewards!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                  <div className="pixel-font text-yellow-400">1st Place</div>
                  <div className="retro-font text-sm">500 STARK Bonus</div>
                </div>
                <div className="text-center">
                  <Medal className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <div className="pixel-font text-gray-400">2nd Place</div>
                  <div className="retro-font text-sm">250 STARK Bonus</div>
                </div>
                <div className="text-center">
                  <Award className="w-12 h-12 text-amber-600 mx-auto mb-2" />
                  <div className="pixel-font text-amber-600">3rd Place</div>
                  <div className="retro-font text-sm">100 STARK Bonus</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}