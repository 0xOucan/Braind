import { Button } from "@/components/ui/button"
import { Gamepad2, Github, Twitter, Diamond as Discord } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="pixel-art w-8 h-8 bg-primary retro-shadow-accent flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-primary">BrainD</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Train your brain onchain with pixel art games and earn $STARK rewards on Starknet.
            </p>
          </div>

          {/* Games */}
          <div className="space-y-4">
            <h4 className="font-semibold">Games</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  MemoryBlitz
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  LogicLab
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  SpeedSync
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  PatternPro
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  TimeWarp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  VisionQuest
                </a>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Leaderboard
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Wallet
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Rewards
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Statistics
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Help
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h4 className="font-semibold">Community</h4>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="retro-shadow bg-transparent">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="retro-shadow bg-transparent">
                <Discord className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="retro-shadow bg-transparent">
                <Github className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Join our community of brain trainers and stay updated with the latest features.
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© 2025 BrainD. Built on Starknet. Train your brain onchain!</p>
          <div className="flex space-x-4 text-sm text-muted-foreground mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
