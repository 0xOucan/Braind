"use client";

import { GamesCatalog } from "~~/components/GamesCatalog";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Badge } from "~~/components/ui/badge";
import { Brain, Trophy, Zap, Target } from "lucide-react";
import { useAccount } from "@starknet-react/core";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark";

export default function GamesPage() {
  const { address } = useAccount();

  const { data: playerStats } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
    args: address ? [address] : undefined,
    watch: true,
  });

  return (
    <div className="min-h-screen bg-main pt-24">
      <div className="pixel-container">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-primary pixel-font retro-glow">
            Brain Games
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto retro-font">
            Challenge your mind with our collection of pixel art brain training games.
            Each game targets different cognitive abilities and rewards you with $STARK tokens.
          </p>
        </div>

        {/* Player Stats */}
        {address && playerStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <Card className="game-card border-blue-500">
              <CardContent className="p-4 text-center">
                <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="pixel-font text-lg text-blue-400">{"0"}</div>
                <div className="retro-font text-xs text-muted-foreground">Games Played</div>
              </CardContent>
            </Card>

            <Card className="game-card border-green-500">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="pixel-font text-lg text-green-400">{"0"}</div>
                <div className="retro-font text-xs text-muted-foreground">High Score</div>
              </CardContent>
            </Card>

            <Card className="game-card border-yellow-500">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="pixel-font text-lg text-yellow-400">{"0"}</div>
                <div className="retro-font text-xs text-muted-foreground">STARK Earned</div>
              </CardContent>
            </Card>

            <Card className="game-card border-purple-500">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="pixel-font text-lg text-purple-400">{"--"}</div>
                <div className="retro-font text-xs text-muted-foreground">Global Rank</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Games Catalog */}
        <GamesCatalog />

        {/* Game Categories */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8 text-center pixel-font">Game Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="game-card border-red-500">
              <CardHeader>
                <CardTitle className="pixel-font text-red-400 flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  Memory Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="retro-font text-sm text-muted-foreground mb-4">
                  Enhance your working memory and recall abilities with pattern recognition challenges.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">MemoryBlitz</Badge>
                  <Badge variant="outline" className="text-xs">PatternPro</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="game-card border-blue-500">
              <CardHeader>
                <CardTitle className="pixel-font text-blue-400 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Logic Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="retro-font text-sm text-muted-foreground mb-4">
                  Sharpen your problem-solving skills with complex logical reasoning puzzles.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">LogicLab</Badge>
                  <Badge variant="outline" className="text-xs">TimeWarp</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="game-card border-yellow-500">
              <CardHeader>
                <CardTitle className="pixel-font text-yellow-400 flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  Speed Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="retro-font text-sm text-muted-foreground mb-4">
                  Improve your reaction time and processing speed with fast-paced challenges.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">SpeedSync</Badge>
                  <Badge variant="outline" className="text-xs">VisionQuest</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}