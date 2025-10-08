import { Brain, Github } from "lucide-react";
import Link from "next/link";

/**
 * Minimalistic site footer - retro aesthetic
 */
export const Footer = () => {
  return (
    <footer className="relative mt-auto border-t-4 border-pixel-gray bg-pixel-black">
      <div className="pixel-container py-8">
        {/* Main Content - Single Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary animate-pulse" />
            <span className="pixel-font text-lg neon-text-red">BrainD</span>
            <span className="hidden md:inline text-xs text-pixel-light-gray px-2">|</span>
            <span className="hidden md:inline pixel-font text-xs text-pixel-light-gray">
              Train • Earn • Win
            </span>
          </div>

          {/* Available Games - Compact */}
          <div className="flex items-center gap-4 pixel-font text-xs">
            <Link
              href="/games/colormatch"
              className="text-pixel-light-gray hover:text-yellow-400 transition-colors"
            >
              ColorMatch
            </Link>
            <Link
              href="/games/speed-match"
              className="text-pixel-light-gray hover:text-yellow-400 transition-colors"
            >
              SpeedMatch
            </Link>
            <Link
              href="/games/memory-blitz"
              className="text-pixel-light-gray hover:text-yellow-400 transition-colors"
            >
              MemoryBlitz
            </Link>
          </div>

          {/* Links & Social */}
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/0xOucan/Braind"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pixel-light-gray hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href="/debug"
              className="pixel-font text-xs text-pixel-light-gray hover:text-accent transition-colors"
            >
              Debug
            </Link>
          </div>
        </div>

        {/* Bottom Bar - Minimal */}
        <div className="mt-6 pt-4 border-t border-pixel-dark-gray">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-pixel-light-gray">
            <div className="pixel-font">
              © 2024 BrainD • Powered by{" "}
              <Link
                href="https://starknet.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80 transition-colors"
              >
                Starknet
              </Link>
            </div>
            <div className="pixel-font text-pixel-gray">
              ▓ Built with 🧠 & ⚡ ▓
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
