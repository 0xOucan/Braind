"use client";

import { Button } from "~~/components/ui/button";
import { Badge } from "~~/components/ui/badge";
import { Brain, Zap, Trophy, Coins } from "lucide-react";
import { useAccount } from "@starknet-react/core";
import Link from "next/link";

export function HeroSection() {
  const { address } = useAccount();

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-main">
      {/* Pixel art background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23dc2626' fillOpacity='1'%3E%3Crect width='10' height='10'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="pixel-container text-center relative z-10">
        <Badge variant="secondary" className="mb-6 retro-shadow text-lg px-4 py-2">
          <Zap className="w-4 h-4 mr-2" />
          Powered by Starknet
        </Badge>

        <h1 className="text-6xl md:text-8xl font-bold mb-6 text-balance">
          <span className="text-primary retro-glow">Brain</span>
          <span className="text-foreground">D</span>
        </h1>

        <p className="text-2xl md:text-3xl font-semibold mb-4 text-accent retro-font">
          Train your brain onchain!
        </p>

        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty retro-font">
          Challenge your mind with 6 unique pixel art brain games. Earn $STARK rewards, climb the leaderboards, and
          prove you&apos;re the ultimate brain champion in the Starknet ecosystem.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/games">
            <Button size="lg" className="btn-pixel text-lg px-8 py-4">
              <Brain className="w-5 h-5 mr-2" />
              Start Training
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              <Trophy className="w-5 h-5 mr-2" />
              View Leaderboard
            </Button>
          </Link>
        </div>

        <div className="pixel-grid max-w-4xl mx-auto">
          <div className="game-card p-6 rounded-lg border-2 border-primary/20">
            <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 pixel-font">6 Unique Games</h3>
            <p className="text-muted-foreground retro-font">Memory, logic, speed, and pattern recognition challenges</p>
          </div>

          <div className="game-card p-6 rounded-lg border-2 border-accent/20">
            <Coins className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 pixel-font">Earn $STARK</h3>
            <p className="text-muted-foreground retro-font">Get rewarded for your brain training achievements</p>
          </div>

          <div className="game-card p-6 rounded-lg border-2 border-primary/20">
            <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 pixel-font">Global Rankings</h3>
            <p className="text-muted-foreground retro-font">Compete with players worldwide on the leaderboard</p>
          </div>
        </div>

        {!address && (
          <div className="mt-12 p-6 game-card border-yellow-400 animate-pixel-pulse">
            <p className="pixel-font text-yellow-400 mb-4">Connect your wallet to start earning rewards!</p>
            <p className="retro-font text-sm text-muted-foreground">
              Use ArgentX, Braavos, or any Starknet wallet to play and earn $STARK tokens
            </p>
          </div>
        )}
      </div>
    </section>
  );
}