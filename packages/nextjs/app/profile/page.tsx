"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Button } from "~~/components/ui/button";
import { Badge } from "~~/components/ui/badge";
import {
  User,
  Trophy,
  Brain,
  Zap,
  Target,
  Clock,
  Coins,
  Calendar,
  TrendingUp,
  Award,
  Eye,
  Puzzle
} from "lucide-react";
import { useAccount } from "@starknet-react/core";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark";
import { Address, Balance } from "~~/components/scaffold-stark";
import { CustomConnectButton } from "~~/components/scaffold-stark/CustomConnectButton";

const gameIcons = {
  memory: Brain,
  logic: Puzzle,
  speed: Zap,
  pattern: Target,
  time: Clock,
  vision: Eye,
};

export default function ProfilePage() {
  const { address, status } = useAccount();

  // Temporarily commented - YourContract not in deployed contracts
  // const { data: playerStats } = useScaffoldReadContract({
  //   contractName: "YourContract",
  //   functionName: "greeting",
  //   args: address ? [address] : undefined,
  //   watch: true,
  // });
  const playerStats = null;

  // const { data: gameHistory } = useScaffoldReadContract({
  //   contractName: "YourContract",
  //   functionName: "premium",
  //   args: address ? [address] : undefined,
  //   watch: true,
  // });
  const gameHistory: any[] = [];

  // const { data: achievements } = useScaffoldReadContract({
  //   contractName: "YourContract",
  //   functionName: "premium",
  //   args: address ? [address] : undefined,
  //   watch: true,
  // });
  const achievements: any[] = [];

  if (status !== "connected" || !address) {
    return (
      <div className="min-h-screen bg-main pt-24">
        <div className="pixel-container">
          <div className="text-center">
            <Card className="game-card border-yellow-400 max-w-md mx-auto p-8">
              <CardHeader>
                <CardTitle className="pixel-font text-yellow-400 flex items-center justify-center gap-2">
                  <User className="w-6 h-6" />
                  Connect Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="retro-font text-muted-foreground">
                  Connect your Starknet wallet to view your player profile and game statistics.
                </p>
                <CustomConnectButton />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main pt-24">
      <div className="pixel-container">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-primary pixel-font retro-glow">
            Player Profile
          </h1>
          <p className="text-xl text-muted-foreground retro-font">
            Your brain training journey on Starknet
          </p>
        </div>

        {/* Profile Overview */}
        <Card className="game-card border-primary mb-8">
          <CardHeader>
            <CardTitle className="pixel-font text-primary flex items-center gap-2">
              <User className="w-6 h-6" />
              Wallet Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="pixel-font text-sm text-muted-foreground mb-2">Address</h3>
                <Address address={address} format="long" />
              </div>
              <div>
                <h3 className="pixel-font text-sm text-muted-foreground mb-2">STRK Balance</h3>
                <Balance address={address} className="retro-font text-accent font-semibold" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="game-card border-blue-500">
            <CardContent className="p-4 text-center">
              <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-blue-400">
{"0"}
              </div>
              <div className="retro-font text-xs text-muted-foreground">Games Played</div>
            </CardContent>
          </Card>

          <Card className="game-card border-green-500">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-green-400">
{"0"}
              </div>
              <div className="retro-font text-xs text-muted-foreground">Best Score</div>
            </CardContent>
          </Card>

          <Card className="game-card border-yellow-500">
            <CardContent className="p-4 text-center">
              <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-yellow-400">
{"0"}
              </div>
              <div className="retro-font text-xs text-muted-foreground">STARK Earned</div>
            </CardContent>
          </Card>

          <Card className="game-card border-purple-500">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-purple-400">
{"--"}
              </div>
              <div className="retro-font text-xs text-muted-foreground">Global Rank</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Game Performance */}
          <Card className="game-card border-accent">
            <CardHeader>
              <CardTitle className="pixel-font text-accent flex items-center gap-2">
                <Brain className="w-6 h-6" />
                Game Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(gameIcons).map(([gameType, IconComponent]) => (
                  <div key={gameType} className="flex items-center justify-between p-3 bg-card/50 rounded border border-gray-600">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-accent" />
                      <span className="pixel-font text-sm capitalize">{gameType}</span>
                    </div>
                    <div className="text-right">
                      <div className="pixel-font text-xs text-green-400">
                        {/* Mock data - will be replaced with real stats */}
                        {Math.floor(Math.random() * 100)}% Accuracy
                      </div>
                      <div className="retro-font text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 20)} games
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="game-card border-yellow-400">
            <CardHeader>
              <CardTitle className="pixel-font text-yellow-400 flex items-center gap-2">
                <Award className="w-6 h-6" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements && achievements.length > 0 ? (
                  achievements.map((achievement: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-card/50 rounded border border-yellow-400/30">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <div>
                        <div className="pixel-font text-sm text-yellow-400">{achievement.name}</div>
                        <div className="retro-font text-xs text-muted-foreground">{achievement.description}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-card/50 rounded border border-yellow-400/30">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <div>
                        <div className="pixel-font text-sm text-yellow-400">First Steps</div>
                        <div className="retro-font text-xs text-muted-foreground">Play your first game</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded border border-gray-600 opacity-50">
                      <Brain className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="pixel-font text-sm text-gray-400">Brain Trainer</div>
                        <div className="retro-font text-xs text-muted-foreground">Play 10 games</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded border border-gray-600 opacity-50">
                      <Coins className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="pixel-font text-sm text-gray-400">Token Collector</div>
                        <div className="retro-font text-xs text-muted-foreground">Earn 100 STARK</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Games */}
        <Card className="game-card border-blue-500 mt-8">
          <CardHeader>
            <CardTitle className="pixel-font text-blue-400 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Recent Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gameHistory && gameHistory.length > 0 ? (
              <div className="space-y-3">
                {gameHistory.slice(0, 5).map((game: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-card/50 rounded border border-gray-600">
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="pixel-font text-sm">{game.gameName}</div>
                        <div className="retro-font text-xs text-muted-foreground">
                          {new Date(game.timestamp * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="pixel-font text-sm text-green-400">Score: {game.score}</div>
                      <div className="retro-font text-xs text-yellow-400">+{game.reward} STARK</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="pixel-font text-gray-500 mb-2">No games played yet</p>
                <p className="retro-font text-sm text-muted-foreground mb-4">
                  Start playing to see your game history here
                </p>
                <Button className="btn-pixel">
                  Play Your First Game
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}