import { DebugContracts } from "./_components/DebugContracts";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-stark/getMetadata";

export const metadata = getMetadata({
  title: "BrainD - Smart Contract Debugger",
  description:
    "Debug your deployed BrainD smart contracts with a retro-styled interface",
});

// Force dynamic rendering to avoid static generation errors
export const dynamic = 'force-dynamic';

const Debug: NextPage = () => {
  return (
    <div className="min-h-screen bg-main pt-24">
      <div className="pixel-container">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-primary pixel-font retro-glow">
            Contract Debugger
          </h1>
          <p className="text-lg text-muted-foreground retro-font">
            Debug and interact with BrainD smart contracts like a retro hacker
          </p>
        </div>
        <div className="game-card border-green-400 p-6">
          <DebugContracts />
        </div>
      </div>
    </div>
  );
};

export default Debug;
