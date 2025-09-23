import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Trophy, Coins } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
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

      <div className="container mx-auto text-center relative z-10">
        <Badge variant="secondary" className="mb-6 retro-shadow text-lg px-4 py-2">
          <Zap className="w-4 h-4 mr-2" />
          Powered by Starknet
        </Badge>

        <h1 className="text-6xl md:text-8xl font-bold mb-6 text-balance">
          <span className="text-primary retro-glow">Brain</span>
          <span className="text-foreground">D</span>
        </h1>

        <p className="text-2xl md:text-3xl font-semibold mb-4 text-accent">Train your brain onchain!</p>

        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
          Challenge your mind with 6 unique pixel art brain games. Earn $STARK rewards, climb the leaderboards, and
          prove you're the ultimate brain champion in the Starknet ecosystem.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button size="lg" className="retro-shadow text-lg px-8 py-4">
            <Brain className="w-5 h-5 mr-2" />
            Start Training
          </Button>
          <Button variant="outline" size="lg" className="retro-shadow text-lg px-8 py-4 bg-transparent">
            <Trophy className="w-5 h-5 mr-2" />
            View Leaderboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-card p-6 rounded-lg retro-shadow border-2 border-primary/20">
            <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">6 Unique Games</h3>
            <p className="text-muted-foreground">Memory, logic, speed, and pattern recognition challenges</p>
          </div>

          <div className="bg-card p-6 rounded-lg retro-shadow border-2 border-accent/20">
            <Coins className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Earn $STARK</h3>
            <p className="text-muted-foreground">Get rewarded for your brain training achievements</p>
          </div>

          <div className="bg-card p-6 rounded-lg retro-shadow border-2 border-primary/20">
            <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Global Rankings</h3>
            <p className="text-muted-foreground">Compete with players worldwide on the leaderboard</p>
          </div>
        </div>
      </div>
    </section>
  )
}
