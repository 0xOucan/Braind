"use client";

import { Leaderboard } from "~~/components/Leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Badge } from "~~/components/ui/badge";
import { Trophy, Users, Coins, TrendingUp, Crown, Medal, Award } from "lucide-react";
import { useAccount } from "@starknet-react/core";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark";

export default function LeaderboardPage() {
  const { address } = useAccount();

  const { data: globalStats } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "premium",
    watch: true,
  });

  const { data: playerRank } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "premium",
    args: address ? [address] : undefined,
    watch: true,
  });

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
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="game-card border-blue-500">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-blue-400">
{"1,247"}
              </div>
              <div className="retro-font text-xs text-muted-foreground">Total Players</div>
            </CardContent>
          </Card>

          <Card className="game-card border-green-500">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-green-400">
{"15,842"}
              </div>
              <div className="retro-font text-xs text-muted-foreground">Games Played</div>
            </CardContent>
          </Card>

          <Card className="game-card border-yellow-500">
            <CardContent className="p-4 text-center">
              <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-yellow-400">
{"2.5M"}
              </div>
              <div className="retro-font text-xs text-muted-foreground">STARK Distributed</div>
            </CardContent>
          </Card>

          <Card className="game-card border-purple-500">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-purple-400">
{"--"}
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

        {/* Personal Achievement */}
        {address && playerRank && (
          <div className="mb-12 text-center">
            <Card className="game-card border-accent inline-block p-6">
              <h3 className="pixel-font text-accent mb-2">Your Current Rank</h3>
              <div className="flex items-center justify-center gap-4">
                <Trophy className="w-8 h-8 text-accent" />
                <span className="pixel-font text-2xl">#{playerRank.toString()}</span>
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <p className="retro-font text-sm text-muted-foreground mt-2">
                Keep playing to climb higher!
              </p>
            </Card>
          </div>
        )}

        {/* Main Leaderboard Component */}
        <Leaderboard />

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