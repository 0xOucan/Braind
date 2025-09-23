import { Button } from "@/components/ui/button"
import { Gamepad2, Wallet, Trophy } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="pixel-art w-8 h-8 bg-primary retro-shadow-accent flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary retro-glow">BrainD</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="#games" className="text-foreground hover:text-primary transition-colors">
            Games
          </a>
          <a href="#leaderboard" className="text-foreground hover:text-primary transition-colors">
            Leaderboard
          </a>
          <a href="#wallet" className="text-foreground hover:text-primary transition-colors">
            Wallet
          </a>
        </nav>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="retro-shadow bg-transparent">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
          <Button size="sm" className="retro-shadow">
            <Trophy className="w-4 h-4 mr-2" />
            Play Now
          </Button>
        </div>
      </div>
    </header>
  )
}
