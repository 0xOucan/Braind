import { Cog8ToothIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { Brain, Github, Twitter, MessageCircle, ExternalLink } from "lucide-react";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";
import { devnet, sepolia, mainnet } from "@starknet-react/chains";
import { Faucet } from "~~/components/scaffold-stark/Faucet";
import { FaucetSepolia } from "~~/components/scaffold-stark/FaucetSepolia";
import { BlockExplorerSepolia } from "./scaffold-stark/BlockExplorerSepolia";
import { BlockExplorer } from "./scaffold-stark/BlockExplorer";
import Link from "next/link";
import { BlockExplorerDevnet } from "./scaffold-stark/BlockExplorerDevnet";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(
    (state) => state.nativeCurrencyPrice,
  );
  const { targetNetwork } = useTargetNetwork();

  // NOTE: workaround - check by name also since in starknet react devnet and sepolia has the same chainId
  const isLocalNetwork =
    targetNetwork.id === devnet.id && targetNetwork.network === devnet.network;
  const isSepoliaNetwork =
    targetNetwork.id === sepolia.id &&
    targetNetwork.network === sepolia.network;
  const isMainnetNetwork =
    targetNetwork.id === mainnet.id &&
    targetNetwork.network === mainnet.network;

  return (
    <>
      {/* Development Tools - Only show in dev mode */}
      <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
        <div className="flex flex-col md:flex-row gap-2 pointer-events-auto">
          {isSepoliaNetwork && (
            <>
              <FaucetSepolia />
              <BlockExplorerSepolia />
            </>
          )}
          {isLocalNetwork && (
            <>
              <Faucet />
              <BlockExplorerDevnet />
            </>
          )}
          {isMainnetNetwork && (
            <>
              <BlockExplorer />
            </>
          )}
          <Link
            href={"/debug"}
            passHref
            className="btn btn-sm font-normal gap-1 cursor-pointer border border-accent bg-transparent hover:bg-accent hover:text-black"
          >
            <Cog8ToothIcon className="h-4 w-4" />
            <span className="pixel-font text-xs">Debug</span>
          </Link>
          {nativeCurrencyPrice > 0 && (
            <div>
              <div className="btn btn-sm font-normal gap-1 cursor-auto border border-accent bg-transparent">
                <CurrencyDollarIcon className="h-4 w-4" />
                <span className="pixel-font text-xs">${nativeCurrencyPrice}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Footer */}
      <footer className="footer-pixel mt-20 mb-16 lg:mb-0">
        <div className="pixel-container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-8 h-8 text-primary" />
                <span className="pixel-font text-xl retro-glow">BrainD</span>
              </div>
              <p className="retro-font text-sm text-muted-foreground">
                The ultimate retro pixel art brain training platform on Starknet.
                Train your mind and earn $STARK rewards!
              </p>
              <div className="flex items-center gap-2">
                <span className="badge-pixel text-xs">Powered by</span>
                <Link
                  href="https://starknet.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent/80 transition-colors"
                >
                  <span className="pixel-font text-xs">Starknet</span>
                </Link>
              </div>
            </div>

            {/* Games Section */}
            <div className="space-y-4">
              <h3 className="pixel-font text-primary">Games</h3>
              <ul className="space-y-2 retro-font text-sm">
                <li>
                  <Link href="/games" className="text-muted-foreground hover:text-accent transition-colors">
                    MemoryBlitz
                  </Link>
                </li>
                <li>
                  <Link href="/games" className="text-muted-foreground hover:text-accent transition-colors">
                    LogicLab
                  </Link>
                </li>
                <li>
                  <Link href="/games" className="text-muted-foreground hover:text-accent transition-colors">
                    SpeedSync
                  </Link>
                </li>
                <li>
                  <Link href="/games" className="text-muted-foreground hover:text-accent transition-colors">
                    PatternPro
                  </Link>
                </li>
                <li>
                  <Link href="/games" className="text-muted-foreground hover:text-accent transition-colors">
                    TimeWarp
                  </Link>
                </li>
                <li>
                  <Link href="/games" className="text-muted-foreground hover:text-accent transition-colors">
                    VisionQuest
                  </Link>
                </li>
              </ul>
            </div>

            {/* Platform Section */}
            <div className="space-y-4">
              <h3 className="pixel-font text-primary">Platform</h3>
              <ul className="space-y-2 retro-font text-sm">
                <li>
                  <Link href="/leaderboard" className="text-muted-foreground hover:text-accent transition-colors">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-muted-foreground hover:text-accent transition-colors">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link href="/debug" className="text-muted-foreground hover:text-accent transition-colors">
                    Smart Contracts
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://starkscan.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
                  >
                    Explorer
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community Section */}
            <div className="space-y-4">
              <h3 className="pixel-font text-primary">Community</h3>
              <div className="flex gap-4">
                <Link
                  href="https://github.com/scaffold-stark/scaffold-stark-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  <Github className="w-5 h-5" />
                </Link>
                <Link
                  href="https://twitter.com/StarkScaffold"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link
                  href="https://t.me/+wO3PtlRAreo4MDI9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>
              </div>
              <div className="retro-font text-xs text-muted-foreground">
                <p>Join our community and stay updated with the latest brain training challenges!</p>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-600 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="retro-font text-sm text-muted-foreground">
                © 2024 BrainD Platform. Built with 🧠 and ⚡ on Starknet.
              </div>
              <div className="flex items-center gap-4 retro-font text-xs">
                <Link href="https://github.com/scaffold-stark/scaffold-stark-2" target="_blank" className="text-muted-foreground hover:text-accent transition-colors">
                  Fork on GitHub
                </Link>
                <Link href="https://t.me/+wO3PtlRAreo4MDI9" target="_blank" className="text-muted-foreground hover:text-accent transition-colors">
                  Get Support
                </Link>
              </div>
            </div>
          </div>

          {/* Pixel Art Decoration */}
          <div className="mt-8 text-center">
            <div className="inline-block p-4 game-card border-accent">
              <span className="pixel-font text-xs text-accent animate-pixel-pulse">
                ▓▓▓ TRAIN YOUR BRAIN • EARN $STARK • CLIMB THE RANKS ▓▓▓
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
