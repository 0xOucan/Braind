import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Coins, Shield, Zap, ExternalLink } from "lucide-react"

export function StarknetIntegration() {
  return (
    <section id="wallet" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Powered by Starknet</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience seamless blockchain gaming with low fees and instant transactions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Wallet Connection Card */}
          <Card className="retro-shadow border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-6 h-6 text-primary" />
                Connect Your Wallet
              </CardTitle>
              <CardDescription>Link your Starknet wallet to start earning $STARK rewards</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Wallet Status</span>
                  <Badge variant="destructive">Disconnected</Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">$STARK Balance</span>
                  <span className="font-mono">--</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Games Played</span>
                  <span className="font-mono">0</span>
                </div>
              </div>

              <Button className="w-full retro-shadow">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Starknet Wallet
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Supports ArgentX, Braavos, and other Starknet wallets
              </p>
            </CardContent>
          </Card>

          {/* $STARK Token Info */}
          <Card className="retro-shadow border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-accent" />
                $STARK Rewards
              </CardTitle>
              <CardDescription>Earn tokens by playing games and achieving high scores</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-accent">25-80</div>
                  <div className="text-xs text-muted-foreground">$STARK per game</div>
                </div>
                <div className="bg-muted p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">2.5M</div>
                  <div className="text-xs text-muted-foreground">Total distributed</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Easy Games</span>
                  <span className="text-accent font-semibold">25 $STARK</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medium Games</span>
                  <span className="text-accent font-semibold">50-60 $STARK</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hard Games</span>
                  <span className="text-accent font-semibold">75-80 $STARK</span>
                </div>
              </div>

              <Button variant="outline" className="w-full retro-shadow bg-transparent">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Starknet Explorer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 retro-shadow">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">Instant transactions with Starknet's L2 scaling</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4 retro-shadow">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold mb-2">Secure & Trustless</h3>
            <p className="text-sm text-muted-foreground">Your rewards are secured by blockchain technology</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 retro-shadow">
              <Coins className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Low Fees</h3>
            <p className="text-sm text-muted-foreground">Minimal transaction costs, maximum rewards</p>
          </div>
        </div>
      </div>
    </section>
  )
}
