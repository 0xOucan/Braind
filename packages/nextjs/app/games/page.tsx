"use client";

import { GamesCatalog } from "~~/components/GamesCatalog";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Badge } from "~~/components/ui/badge";
import { Brain, Trophy, Zap, Target } from "lucide-react";
import { useAccount } from "@starknet-react/core";
// import { useScaffoldReadContract } from "~~/hooks/scaffold-stark"; // Temporarily unused

export default function GamesPage() {
  const { address } = useAccount();

  // Temporarily commented - YourContract not in deployed contracts
  // const { data: playerStats } = useScaffoldReadContract({
  //   contractName: "YourContract",
  //   functionName: "greeting",
  //   args: address ? [address] : undefined,
  //   watch: true,
  // });
  const playerStats = null; // Placeholder until real stats contract is integrated

  return (
    <div className="min-h-screen bg-main pt-24 pixel-grid-bg relative">
      <div className="pixel-container relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 pixel-font neon-text-red animate-pixel-float">
            ▼ BRAIN GAMES ▼
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto retro-font">
            Challenge your mind with pixel art brain training games.
            <br />
            <span className="neon-text-yellow">Earn $STARK • Climb Leaderboards • Prove Your Skills</span>
          </p>
        </div>

        {/* Player Stats */}
        {address && playerStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <Card className="retro-game-container border-blue-500">
              <CardContent className="p-4 text-center">
                <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2 animate-pixel-bounce" />
                <div className="pixel-font text-lg neon-text-yellow">{"0"}</div>
                <div className="retro-font text-xs text-muted-foreground">GAMES PLAYED</div>
              </CardContent>
            </Card>

            <Card className="retro-game-container border-green-500">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2 animate-pixel-bounce" />
                <div className="pixel-font text-lg neon-text-yellow">{"0"}</div>
                <div className="retro-font text-xs text-muted-foreground">HIGH SCORE</div>
              </CardContent>
            </Card>

            <Card className="retro-game-container border-yellow-500">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2 animate-pixel-bounce" />
                <div className="pixel-font text-lg neon-text-yellow">{"0"}</div>
                <div className="retro-font text-xs text-muted-foreground">STARK EARNED</div>
              </CardContent>
            </Card>

            <Card className="retro-game-container border-purple-500">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-pixel-bounce" />
                <div className="pixel-font text-lg neon-text-yellow">{"--"}</div>
                <div className="retro-font text-xs text-muted-foreground">GLOBAL RANK</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Games Catalog */}
        <GamesCatalog />

        {/* Game Categories */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8 text-center pixel-font neon-text-purple">━━ GAME CATEGORIES ━━</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="retro-game-container border-red-500 hover:shadow-neon-red transition-all">
              <CardHeader>
                <CardTitle className="pixel-font text-sm neon-text-red flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  MEMORY
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="retro-font text-xs text-muted-foreground mb-4">
                  Enhance memory & recall with pattern recognition
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs pixel-font">MemoryBlitz</Badge>
                  <Badge variant="outline" className="text-xs pixel-font">PatternPro</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="retro-game-container border-blue-500 hover:shadow-neon-purple transition-all">
              <CardHeader>
                <CardTitle className="pixel-font text-sm text-blue-400 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  LOGIC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="retro-font text-xs text-muted-foreground mb-4">
                  Sharpen problem-solving with logical puzzles
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs pixel-font">LogicLab</Badge>
                  <Badge variant="outline" className="text-xs pixel-font">TimeWarp</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="retro-game-container border-yellow-500 hover:shadow-neon-yellow transition-all">
              <CardHeader>
                <CardTitle className="pixel-font text-sm neon-text-yellow flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  SPEED
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="retro-font text-xs text-muted-foreground mb-4">
                  Improve reaction time with fast-paced challenges
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs pixel-font">SpeedSync</Badge>
                  <Badge variant="outline" className="text-xs pixel-font">VisionQuest</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}