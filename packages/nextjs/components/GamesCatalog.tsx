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
    slug: "colormatch",
    name: "ColorMatch",
    description: "Match colors and words in this fast-paced retro brain trainer",
    icon: Eye,
    difficulty: "Medium",
    reward: "50 $STARK",
    color: "bg-purple-500",
    available: true,
  },
  {
    id: 2,
    slug: "speed-match",
    name: "SpeedMatch",
    description: "Lightning-fast shape matching to test your reflexes",
    icon: Zap,
    difficulty: "Easy",
    reward: "25 $STARK",
    color: "bg-yellow-500",
    available: true,
  },
  {
    id: 3,
    slug: "memory-blitz",
    name: "MemoryBlitz",
    description: "Test your memory with increasingly complex pixel patterns",
    icon: Brain,
    difficulty: "Hard",
    reward: "75 $STARK",
    color: "bg-red-500",
    available: true,
  },
  {
    id: 4,
    slug: "logic-lab",
    name: "LogicLab",
    description: "Solve intricate puzzles using pure logical reasoning",
    icon: Puzzle,
    difficulty: "Hard",
    reward: "75 $STARK",
    color: "bg-blue-500",
    available: false,
  },
  {
    id: 5,
    slug: "pattern-pro",
    name: "PatternPro",
    description: "Identify and complete complex geometric sequences",
    icon: Target,
    difficulty: "Medium",
    reward: "60 $STARK",
    color: "bg-green-500",
    available: false,
  },
  {
    id: 6,
    slug: "time-warp",
    name: "TimeWarp",
    description: "Master time-based challenges and temporal puzzles",
    icon: Clock,
    difficulty: "Hard",
    reward: "80 $STARK",
    color: "bg-pink-500",
    available: false,
  },
];

export function GamesCatalog() {
  const { address } = useAccount();

  // Temporarily commented - YourContract not in deployed contracts
  // const { data: totalPlayers } = useScaffoldReadContract({
  //   contractName: "YourContract",
  //   functionName: "premium",
  //   watch: true,
  // });
  const totalPlayers: number | null = null;

  // const { data: playerStats } = useScaffoldReadContract({
  //   contractName: "YourContract",
  //   functionName: "greeting",
  //   args: address ? [address] : undefined,
  //   watch: true,
  // });
  const playerStats: any = null;

  return (
    <section id="games" className="py-20 px-4 bg-container/50 pixel-grid-bg relative">
      <div className="pixel-container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 neon-text-red pixel-font">━━ GAME CATALOG ━━</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto retro-font">
            &gt; Choose your challenge and train your brain &lt;
          </p>
          {/* Temporarily hidden - YourContract stats not available */}
          {/* {totalPlayers && (
            <p className="text-sm text-accent mt-2 pixel-font">
              {totalPlayers.toString()} players worldwide!
            </p>
          )} */}
        </div>

        <div className="pixel-grid">
          {games.map((game) => {
            const IconComponent = game.icon;
            const isPlayable = Boolean(address) && game.available; // Only playable if wallet connected AND game is available

            return (
              <Card
                key={game.id}
                className={`game-card transition-all duration-300 hover:shadow-neon-red ${
                  !isPlayable ? "opacity-75" : ""
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-12 h-12 ${game.color} flex items-center justify-center retro-shadow border-2 border-black ${
                        !game.available ? "grayscale" : ""
                      }`}
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
                  <CardTitle className="text-xl pixel-font">
                    {game.name}
                    {!game.available && (
                      <span className="text-xs ml-2 neon-text-yellow">🔒 COMING SOON</span>
                    )}
                  </CardTitle>
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

                  {!game.available ? (
                    <Button disabled className="w-full btn-pixel opacity-50">
                      <span className="pixel-font text-xs">🔒 COMING SOON</span>
                    </Button>
                  ) : isPlayable ? (
                    <Link href={`/games/${game.slug}`}>
                      <Button className="w-full arcade-button text-xs">
                        <Play className="w-4 h-4 mr-2" />
                        PLAY NOW
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full btn-pixel opacity-50">
                      <span className="pixel-font text-xs">CONNECT WALLET</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {address && (
          <div className="mt-12 text-center">
            <div className="retro-game-container inline-block p-6 border-green-500">
              <h3 className="pixel-font neon-text-yellow text-sm mb-2">✓ WALLET CONNECTED</h3>
              <p className="retro-font text-xs text-muted-foreground">
                Progress & rewards saved on-chain
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}