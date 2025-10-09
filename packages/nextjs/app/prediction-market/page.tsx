"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Badge } from "~~/components/ui/badge";
import { TrendingUp, Trophy, Target, ChevronRight, Coins, Clock, Users } from "lucide-react";
import { useAccount } from "@starknet-react/core";
import { usePredictionMarket } from "~~/hooks/scaffold-stark/usePredictionMarket";
import { formatEthAmount, shortenAddress, getTimeAgo } from "~~/utils/mockData";

export default function PredictionMarketPage() {
  const { address } = useAccount();
  const { markets, playerBets, isLoading, placeBet, claimWinnings } = usePredictionMarket();
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<string>("0.1");
  const [selectedPrediction, setSelectedPrediction] = useState<boolean | null>(null);

  const activeMarkets = markets.filter((m) => !m.resolved);
  const resolvedMarkets = markets.filter((m) => m.resolved);
  const unclaimedBets = playerBets.filter((b) => !b.claimed && b.isWinner);

  const handlePlaceBet = async () => {
    if (!selectedMarket || selectedPrediction === null) {
      alert("Please select a market and prediction");
      return;
    }

    if (!address) {
      alert("Please connect your wallet");
      return;
    }

    try {
      // Convert ETH to wei (multiply by 10^18)
      const weiAmount = (parseFloat(betAmount) * 1e18).toString();
      await placeBet(selectedMarket, selectedPrediction, weiAmount);

      // Reset form
      setSelectedMarket(null);
      setSelectedPrediction(null);
      setBetAmount("0.1");
    } catch (error) {
      console.error("Error placing bet:", error);
    }
  };

  const handleClaimWinnings = async (betId: string) => {
    try {
      await claimWinnings(betId);
    } catch (error) {
      console.error("Error claiming winnings:", error);
    }
  };

  const calculateOdds = (market: any, prediction: boolean) => {
    const pool = prediction ? parseFloat(market.winPool) : parseFloat(market.losePool);
    const totalPool = parseFloat(market.totalBets);
    if (pool === 0) return "N/A";
    const odds = totalPool / pool;
    return `${odds.toFixed(2)}x`;
  };

  return (
    <div className="min-h-screen bg-main pt-24">
      <div className="pixel-container">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-primary pixel-font retro-glow">
            Prediction Market
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto retro-font">
            Bet on player performance in upcoming rounds. Win big if you predict correctly!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="game-card border-blue-500">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-blue-400">{activeMarkets.length}</div>
              <div className="retro-font text-xs text-muted-foreground">Active Markets</div>
            </CardContent>
          </Card>

          <Card className="game-card border-green-500">
            <CardContent className="p-4 text-center">
              <Coins className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-green-400">{playerBets.length}</div>
              <div className="retro-font text-xs text-muted-foreground">Your Bets</div>
            </CardContent>
          </Card>

          <Card className="game-card border-yellow-500">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="pixel-font text-lg text-yellow-400">{unclaimedBets.length}</div>
              <div className="retro-font text-xs text-muted-foreground">Unclaimed Wins</div>
            </CardContent>
          </Card>
        </div>

        {/* Unclaimed Winnings Alert */}
        {unclaimedBets.length > 0 && (
          <Card className="game-card border-green-500 bg-green-500/10 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="pixel-font text-green-400 text-lg mb-2">
                    You have {unclaimedBets.length} winning bet(s) to claim!
                  </h3>
                  <p className="retro-font text-sm text-muted-foreground">
                    Total winnings:{" "}
                    {formatEthAmount(
                      unclaimedBets.reduce((acc, bet) => acc + parseFloat(bet.payout), 0).toString()
                    )}{" "}
                    ETH
                  </p>
                </div>
                <button
                  onClick={() => unclaimedBets.forEach((bet) => handleClaimWinnings(bet.betId))}
                  className="btn-pixel btn-primary"
                >
                  Claim All
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Markets */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-6 pixel-font">Active Markets</h2>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="pixel-font text-gray-500">Loading markets...</p>
              </div>
            ) : activeMarkets.length > 0 ? (
              <div className="space-y-4">
                {activeMarkets.map((market) => (
                  <Card
                    key={market.marketId}
                    className={`game-card cursor-pointer transition-all ${
                      selectedMarket === market.marketId ? "border-primary" : "border-gray-600"
                    }`}
                    onClick={() => setSelectedMarket(market.marketId)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-primary" />
                          <div>
                            <CardTitle className="pixel-font text-lg">
                              {market.targetPlayerName || shortenAddress(market.targetPlayer, 6)}
                            </CardTitle>
                            <p className="retro-font text-xs text-muted-foreground">
                              Round {market.round} • {market.createdAt && getTimeAgo(market.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="pixel-font">
                          {formatEthAmount(market.totalBets)} ETH
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Win Pool */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMarket(market.marketId);
                            setSelectedPrediction(true);
                          }}
                          className={`p-4 rounded border-2 transition-all cursor-pointer ${
                            selectedMarket === market.marketId && selectedPrediction === true
                              ? "border-green-500 bg-green-500/20"
                              : "border-gray-600 hover:border-green-500/50"
                          }`}
                        >
                          <div className="text-center">
                            <div className="pixel-font text-green-400 text-sm mb-1">WIN</div>
                            <div className="retro-font text-xs text-muted-foreground mb-2">
                              {formatEthAmount(market.winPool)} ETH
                            </div>
                            <Badge variant="success" className="text-xs">
                              {calculateOdds(market, true)}
                            </Badge>
                          </div>
                        </div>

                        {/* Lose Pool */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMarket(market.marketId);
                            setSelectedPrediction(false);
                          }}
                          className={`p-4 rounded border-2 transition-all cursor-pointer ${
                            selectedMarket === market.marketId && selectedPrediction === false
                              ? "border-red-500 bg-red-500/20"
                              : "border-gray-600 hover:border-red-500/50"
                          }`}
                        >
                          <div className="text-center">
                            <div className="pixel-font text-red-400 text-sm mb-1">LOSE</div>
                            <div className="retro-font text-xs text-muted-foreground mb-2">
                              {formatEthAmount(market.losePool)} ETH
                            </div>
                            <Badge variant="destructive" className="text-xs">
                              {calculateOdds(market, false)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="game-card">
                <CardContent className="p-12 text-center">
                  <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="pixel-font text-gray-500 mb-2">No active markets</p>
                  <p className="retro-font text-sm text-muted-foreground">
                    New markets will appear when players start competing in the next round
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Betting Panel */}
          <div>
            <h2 className="text-3xl font-bold mb-6 pixel-font">Place Bet</h2>
            <Card className="game-card sticky top-24">
              <CardHeader>
                <CardTitle className="pixel-font text-lg">Bet Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedMarket ? (
                  <>
                    <div>
                      <label className="retro-font text-sm text-muted-foreground mb-2 block">
                        Selected Market
                      </label>
                      <div className="game-card p-3">
                        <p className="pixel-font text-sm">
                          {markets.find((m) => m.marketId === selectedMarket)?.targetPlayerName ||
                            "Market #" + selectedMarket}
                        </p>
                        <p className="retro-font text-xs text-muted-foreground">
                          Round {markets.find((m) => m.marketId === selectedMarket)?.round}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="retro-font text-sm text-muted-foreground mb-2 block">
                        Your Prediction
                      </label>
                      <div className="game-card p-3">
                        <p className="pixel-font text-sm">
                          {selectedPrediction === null ? (
                            <span className="text-gray-500">Select WIN or LOSE</span>
                          ) : selectedPrediction ? (
                            <span className="text-green-400">WIN</span>
                          ) : (
                            <span className="text-red-400">LOSE</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="retro-font text-sm text-muted-foreground mb-2 block">
                        Bet Amount (ETH)
                      </label>
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        step="0.01"
                        min="0.01"
                        className="w-full p-3 bg-card border-2 border-gray-600 rounded pixel-font text-sm"
                      />
                    </div>

                    <div className="game-card p-3 bg-primary/10">
                      <div className="flex justify-between retro-font text-xs mb-1">
                        <span className="text-muted-foreground">Potential Return:</span>
                        <span className="pixel-font text-primary">
                          {selectedMarket && selectedPrediction !== null
                            ? (
                                parseFloat(betAmount) *
                                parseFloat(
                                  calculateOdds(
                                    markets.find((m) => m.marketId === selectedMarket)!,
                                    selectedPrediction
                                  ).replace("x", "")
                                )
                              ).toFixed(4)
                            : "0.00"}{" "}
                          ETH
                        </span>
                      </div>
                      <div className="flex justify-between retro-font text-xs">
                        <span className="text-muted-foreground">Odds:</span>
                        <span className="pixel-font">
                          {selectedMarket && selectedPrediction !== null
                            ? calculateOdds(
                                markets.find((m) => m.marketId === selectedMarket)!,
                                selectedPrediction
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceBet}
                      disabled={!address || selectedPrediction === null}
                      className="btn-pixel btn-primary w-full"
                    >
                      {!address ? "Connect Wallet" : "Place Bet"}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="pixel-font text-sm text-gray-500">Select a market to place a bet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Your Bets */}
            {playerBets.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 pixel-font">Your Bets</h3>
                <div className="space-y-3">
                  {playerBets.slice(0, 5).map((bet) => (
                    <Card key={bet.betId} className="game-card">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={bet.prediction ? "success" : "destructive"} className="text-xs">
                            {bet.prediction ? "WIN" : "LOSE"}
                          </Badge>
                          <span className="retro-font text-xs text-muted-foreground">
                            {bet.timestamp && getTimeAgo(bet.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="pixel-font text-xs">{formatEthAmount(bet.amount)} ETH</span>
                          {bet.claimed ? (
                            <Badge variant="outline" className="text-xs">
                              Claimed
                            </Badge>
                          ) : bet.isWinner ? (
                            <button
                              onClick={() => handleClaimWinnings(bet.betId)}
                              className="btn-pixel btn-sm btn-success text-xs"
                            >
                              Claim
                            </button>
                          ) : (
                            <span className="retro-font text-xs text-muted-foreground">Pending</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <Card className="game-card border-purple-500 p-8">
            <CardHeader>
              <CardTitle className="pixel-font text-purple-400 text-center text-2xl">
                How Prediction Markets Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="pixel-font text-2xl text-purple-400">1</span>
                  </div>
                  <h4 className="pixel-font text-sm mb-2">Select a Market</h4>
                  <p className="retro-font text-xs text-muted-foreground">
                    Choose a player and round to bet on
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="pixel-font text-2xl text-purple-400">2</span>
                  </div>
                  <h4 className="pixel-font text-sm mb-2">Place Your Bet</h4>
                  <p className="retro-font text-xs text-muted-foreground">
                    Predict if they&apos;ll win or lose, set your amount
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="pixel-font text-2xl text-purple-400">3</span>
                  </div>
                  <h4 className="pixel-font text-sm mb-2">Claim Winnings</h4>
                  <p className="retro-font text-xs text-muted-foreground">
                    If you&apos;re right, claim your share of the pool
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
