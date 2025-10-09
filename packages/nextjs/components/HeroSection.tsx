"use client";

import { Button } from "~~/components/ui/button";
import { Brain, Zap } from "lucide-react";
import { useAccount } from "@starknet-react/core";
import Link from "next/link";

export function HeroSection() {
  const { address } = useAccount();

  return (
    <section className="relative py-16 md:py-24 px-4 overflow-hidden">
      {/* Retro scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="w-full h-full scanlines"></div>
      </div>

      <div className="pixel-container text-center relative z-10 mx-auto px-4">
        {/* Main Title */}
        <h1 className="font-bold mb-8 leading-none pixel-font" style={{ fontSize: 'clamp(4rem, 20vw, 20rem)' }}>
          <span className="neon-text-red">Brain</span>
          <span className="neon-text-yellow">D</span>
        </h1>

        {/* Subtitle */}
        <p className="font-semibold mb-10 neon-text-purple pixel-font" style={{ fontSize: 'clamp(1.5rem, 5vw, 5rem)' }}>
          &gt; Train your brain onchain &lt;
        </p>

        {/* Description - Simplified */}
        <p className="text-sm md:text-base text-pixel-light-gray mb-8 max-w-xl mx-auto pixel-font">
          Challenge your mind with retro pixel art brain games on Starknet
        </p>

        {/* CTAs - Minimal */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/games">
            <Button size="lg" className="arcade-button px-8 py-4">
              <Brain className="w-5 h-5 mr-2" />
              <span className="pixel-font text-sm">START PLAYING</span>
            </Button>
          </Link>
          {!address && (
            <p className="pixel-font text-xs text-pixel-gray">
              <Zap className="w-3 h-3 inline mr-1" />
              Connect wallet to earn rewards
            </p>
          )}
        </div>

        {/* Stats - Minimalistic Grid */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-pixel-black border-2 border-pixel-gray p-4 hover:border-primary transition-colors">
            <div className="text-2xl pixel-font neon-text-red mb-1">3</div>
            <div className="text-xs pixel-font text-pixel-gray">Games</div>
          </div>
          <div className="bg-pixel-black border-2 border-pixel-gray p-4 hover:border-yellow-400 transition-colors">
            <div className="text-2xl pixel-font neon-text-yellow mb-1">$STARK</div>
            <div className="text-xs pixel-font text-pixel-gray">Rewards</div>
          </div>
          <div className="bg-pixel-black border-2 border-pixel-gray p-4 hover:border-purple-500 transition-colors">
            <div className="text-2xl pixel-font neon-text-purple mb-1">Top</div>
            <div className="text-xs pixel-font text-pixel-gray">Ranks</div>
          </div>
        </div>
      </div>
    </section>
  );
}
