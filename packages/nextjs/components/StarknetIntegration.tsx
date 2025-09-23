"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { Button } from "~~/components/ui/button";
import { Badge } from "~~/components/ui/badge";
import { Wallet, Coins, Shield, Zap, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark";
import { Address, Balance } from "~~/components/scaffold-stark";
import { CustomConnectButton } from "~~/components/scaffold-stark/CustomConnectButton";
import { useState } from "react";
import { formatStark } from "~~/lib/utils";

export function StarknetIntegration() {
  const { address, status } = useAccount();
  const { chain } = useNetwork();
  const [copied, setCopied] = useState(false);

  // Read player stats from contract
  const { data: playerStats } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
    args: address ? [address] : undefined,
    watch: true,
  });

  // Read total rewards distributed
  const { data: totalRewardsDistributed } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "premium",
    watch: true,
  });

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="wallet" className="py-20 px-4 bg-container/30">
      <div className="pixel-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary pixel-font">Powered by Starknet</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto retro-font">
            Experience seamless blockchain gaming with low fees and instant transactions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Wallet Connection Card */}
          <Card className="game-card border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 pixel-font">
                <Wallet className="w-6 h-6 text-primary" />
                Wallet Status
              </CardTitle>
              <CardDescription className="retro-font">
                Connect your Starknet wallet to start earning $STARK rewards
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-card p-4 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground retro-font">Connection Status</span>
                  <Badge
                    variant={status === "connected" ? "success" : "destructive"}
                    className="pixel-font text-xs"
                  >
                    {status === "connected" ? "Connected" : "Disconnected"}
                  </Badge>
                </div>

                {address && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground retro-font">Address</span>
                      <div className="flex items-center gap-2">
                        <Address address={address} format="short" />
                        <button
                          onClick={copyAddress}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground retro-font">Network</span>
                      <span className="pixel-font text-xs text-accent">{chain?.name || "Unknown"}</span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground retro-font">STRK Balance</span>
                      <Balance address={address} />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground retro-font">Games Played</span>
                      <span className="pixel-font text-xs">{"0"}</span>
                    </div>
                  </>
                )}

                {!address && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground retro-font mb-2">No wallet connected</p>
                    <p className="text-xs text-muted-foreground">Connect to view your stats</p>
                  </div>
                )}
              </div>

              <CustomConnectButton />

              <p className="text-xs text-muted-foreground text-center retro-font">
                Supports ArgentX, Braavos, and other Starknet wallets
              </p>
            </CardContent>
          </Card>

          {/* $STARK Token Info */}
          <Card className="game-card border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 pixel-font">
                <Coins className="w-6 h-6 text-accent" />
                $STARK Rewards
              </CardTitle>
              <CardDescription className="retro-font">
                Earn tokens by playing games and achieving high scores
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-3 rounded-lg text-center border border-gray-600">
                  <div className="text-2xl font-bold text-accent pixel-font">25-80</div>
                  <div className="text-xs text-muted-foreground retro-font">$STARK per game</div>
                </div>
                <div className="bg-card p-3 rounded-lg text-center border border-gray-600">
                  <div className="text-2xl font-bold text-primary pixel-font">
                    {totalRewardsDistributed ? formatStark(totalRewardsDistributed.toString()) : "2.5M"}
                  </div>
                  <div className="text-xs text-muted-foreground retro-font">Total distributed</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm retro-font">
                  <span>Easy Games</span>
                  <span className="text-accent font-semibold">25 $STARK</span>
                </div>
                <div className="flex justify-between text-sm retro-font">
                  <span>Medium Games</span>
                  <span className="text-accent font-semibold">50-60 $STARK</span>
                </div>
                <div className="flex justify-between text-sm retro-font">
                  <span>Hard Games</span>
                  <span className="text-accent font-semibold">75-80 $STARK</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Starknet Explorer
              </Button>

              {address && playerStats && (
                <div className="bg-green-900/20 border border-green-500 p-3 rounded-lg">
                  <p className="pixel-font text-green-400 text-xs mb-1">Your Rewards</p>
                  <p className="retro-font text-sm">
                    Total Earned: <span className="text-accent font-semibold">{"0"} $STARK</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 retro-shadow border-2 border-primary/20">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold mb-2 pixel-font">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground retro-font">Instant transactions with Starknet&apos;s L2 scaling</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4 retro-shadow border-2 border-accent/20">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold mb-2 pixel-font">Secure & Trustless</h3>
            <p className="text-sm text-muted-foreground retro-font">Your rewards are secured by blockchain technology</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 retro-shadow border-2 border-primary/20">
              <Coins className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold mb-2 pixel-font">Low Fees</h3>
            <p className="text-sm text-muted-foreground retro-font">Minimal transaction costs, maximum rewards</p>
          </div>
        </div>
      </div>
    </section>
  );
}