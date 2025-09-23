"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { Button } from "~~/components/ui/button";
import { Badge } from "~~/components/ui/badge";
import { Brain, Zap, Target, Puzzle, Clock, Eye, Coins, Play } from "lucide-react";
import { useAccount } from "@starknet-react/core";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark";
import Link from "next/link";

const games = [
  {
    id: 1,
    slug: "memory-blitz",
    name: "MemoryBlitz",
    description: "Test your memory with increasingly complex pixel patterns",
    icon: Brain,
    difficulty: "Medium",
    reward: "50 $STARK",
    color: "bg-red-500",
  },
  {
    id: 2,
    slug: "logic-lab",
    name: "LogicLab",
    description: "Solve intricate puzzles using pure logical reasoning",
    icon: Puzzle,
    difficulty: "Hard",
    reward: "75 $STARK",
    color: "bg-blue-500",
  },
  {
    id: 3,
    slug: "speed-sync",
    name: "SpeedSync",
    description: "React lightning-fast to visual and audio cues",
    icon: Zap,
    difficulty: "Easy",
    reward: "25 $STARK",
    color: "bg-yellow-500",
  },
  {
    id: 4,
    slug: "pattern-pro",
    name: "PatternPro",
    description: "Identify and complete complex geometric sequences",
    icon: Target,
    difficulty: "Medium",
    reward: "60 $STARK",
    color: "bg-green-500",
  },
  {
    id: 5,
    slug: "time-warp",
    name: "TimeWarp",
    description: "Master time-based challenges and temporal puzzles",
    icon: Clock,
    difficulty: "Hard",
    reward: "80 $STARK",
    color: "bg-purple-500",
  },
  {
    id: 6,
    slug: "vision-quest",
    name: "VisionQuest",
    description: "Enhance visual perception with optical illusions",
    icon: Eye,
    difficulty: "Medium",
    reward: "55 $STARK",
    color: "bg-pink-500",
  },
];

export function GamesCatalog() {
  const { address } = useAccount();

  // Example of reading game statistics from smart contract
  const { data: totalPlayers } = useScaffoldReadContract({
    contractName: "YourContract", // This will be created in Phase 5
    functionName: "premium",
    watch: true,
  });

  const { data: playerStats } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
    args: address ? [address] : undefined,
    watch: true,
  });

  return (
    <section id="games" className="py-20 px-4 bg-container/30">
      <div className="pixel-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary pixel-font">Game Catalog</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto retro-font">
            Choose your challenge and start training your brain with our collection of pixel art games
          </p>
          {totalPlayers && (
            <p className="text-sm text-accent mt-2 pixel-font">
              {totalPlayers.toString()} players worldwide!
            </p>
          )}
        </div>

        <div className="pixel-grid">
          {games.map((game) => {
            const IconComponent = game.icon;
            const isPlayable = Boolean(address); // Only playable if wallet connected

            return (
              <Card
                key={game.id}
                className={`game-card transition-all duration-300 ${
                  !isPlayable ? "opacity-75" : ""
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-12 h-12 ${game.color} rounded-lg flex items-center justify-center retro-shadow`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <Badge
                      variant={
                        game.difficulty === "Easy"
                          ? "success"
                          : game.difficulty === "Medium"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {game.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl pixel-font">{game.name}</CardTitle>
                  <CardDescription className="text-base retro-font">{game.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-accent font-semibold retro-font">
                      <Coins className="w-4 h-4 mr-1" />
                      {game.reward}
                    </div>
                    <div className="text-sm text-muted-foreground retro-font">
                      High Score: {playerStats ? "TODO" : "--"}
                    </div>
                  </div>

                  {isPlayable ? (
                    <Link href={`/games/${game.slug}`}>
                      <Button className="w-full btn-pixel">
                        <Play className="w-4 h-4 mr-2" />
                        Play {game.name}
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full">
                      <span className="pixel-font text-xs">Connect Wallet to Play</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {address && (
          <div className="mt-12 text-center">
            <div className="game-card inline-block p-6 border-green-500">
              <h3 className="pixel-font text-green-400 mb-2">Wallet Connected!</h3>
              <p className="retro-font text-sm text-muted-foreground">
                Your progress and rewards will be saved on-chain
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}