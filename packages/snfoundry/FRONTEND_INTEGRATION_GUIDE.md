# Frontend Integration Guide - V3 Game Contracts

## Overview

This guide explains how to integrate the V3 game contracts with your Next.js frontend using Scaffold-Stark patterns.

## Quick Start

### 1. Key Differences from V2

| Aspect | V2 | V3 |
|--------|----|----|
| **Approval** | Approve before each game | Approve once for all games |
| **Session ID** | Parse from events | Returned directly |
| **Contract Calls** | Game-specific | Standardized across all games |
| **Parameters** | Inconsistent | Consistent interface |

### 2. Contract Addresses

After deployment, update your `deployedContracts.ts`:

```typescript
export default {
  11155111: { // Sepolia testnet
    GamePaymentHandler: {
      address: "0x...",
      abi: [...],
    },
    LeaderboardManagerColorMatch: {
      address: "0x...",
      abi: [...],
    },
    ColorMatchGameV3: {
      address: "0x...",
      abi: [...],
    },
    SpeedMatchGameV3: {
      address: "0x...",
      abi: [...],
    },
    MemoryBlitzGameV3: {
      address: "0x...",
      abi: [...],
    },
    AirdropFundsV3: {
      address: "0x...",
      abi: [...],
    },
    PredictionMarketV3: {
      address: "0x...",
      abi: [...],
    },
  },
} as const;
```

## Implementation Patterns

### Pattern 1: One-Time Approval

Create a reusable approval hook:

```typescript
// hooks/useGameApproval.ts
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-stark";
import { useState } from "react";

export const useGameApproval = () => {
  const [isApproving, setIsApproving] = useState(false);

  const { sendAsync: approve } = useScaffoldWriteContract({
    contractName: "GamePaymentHandler",
    functionName: "approve_for_games",
  });

  const { data: allowance } = useScaffoldReadContract({
    contractName: "GamePaymentHandler",
    functionName: "get_allowance",
    args: [playerAddress, tokenAddress], // Pass actual values
  });

  const approveForGames = async (
    tokenAddress: string,
    amount: string // In wei, e.g., "100000000000000000000" for 100 STRK
  ) => {
    setIsApproving(true);
    try {
      await approve([tokenAddress, amount]);
      return true;
    } catch (error) {
      console.error("Approval failed:", error);
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  return {
    approveForGames,
    isApproving,
    allowance: allowance || 0n,
  };
};
```

### Pattern 2: Generic Game Hook

Create a reusable game hook that works for all games:

```typescript
// hooks/useGameV3.ts
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-stark";
import { useState } from "react";

export const useGameV3 = (gameContractName: string) => {
  const [currentSessionId, setCurrentSessionId] = useState<bigint | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sendAsync: startGame } = useScaffoldWriteContract({
    contractName: gameContractName,
    functionName: "start_game",
  });

  const { sendAsync: submitScore } = useScaffoldWriteContract({
    contractName: gameContractName,
    functionName: "submit_score",
  });

  const { data: leaderboard } = useScaffoldReadContract({
    contractName: gameContractName,
    functionName: "get_leaderboard",
    args: [10], // Top 10
  });

  const { data: playerStats } = useScaffoldReadContract({
    contractName: gameContractName,
    functionName: "get_player_stats",
    args: [playerAddress], // Pass actual player address
  });

  const start = async (tokenAddress: string, ...extraArgs: any[]) => {
    setIsStarting(true);
    try {
      // For most games: just token
      // For SpeedMatch: token + difficulty
      const result = await startGame([tokenAddress, ...extraArgs]);

      // Session ID is returned directly - no event parsing!
      const sessionId = BigInt(result);
      setCurrentSessionId(sessionId);

      return sessionId;
    } catch (error) {
      console.error("Start game failed:", error);
      return null;
    } finally {
      setIsStarting(false);
    }
  };

  const submit = async (
    sessionId: bigint,
    score: number,
    ...gameSpecificData: any[]
  ) => {
    setIsSubmitting(true);
    try {
      // ColorMatch: [sessionId, score, colorMatches]
      // SpeedMatch: [sessionId, score, correctMatches, timeTaken]
      // MemoryBlitz: [sessionId, score, levelReached, sequenceLength]
      const result = await submitScore([sessionId, score, ...gameSpecificData]);

      setCurrentSessionId(null); // Clear session after submission
      return result;
    } catch (error) {
      console.error("Submit score failed:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    start,
    submit,
    currentSessionId,
    isStarting,
    isSubmitting,
    leaderboard,
    playerStats,
  };
};
```

### Pattern 3: Game-Specific Hooks

#### ColorMatch Hook

```typescript
// hooks/useColorMatchGame.ts
import { useGameV3 } from "./useGameV3";

export const useColorMatchGame = () => {
  const game = useGameV3("ColorMatchGameV3");

  const startColorMatch = async (tokenAddress: string) => {
    return await game.start(tokenAddress);
  };

  const submitColorMatch = async (
    sessionId: bigint,
    score: number,
    colorMatches: number
  ) => {
    return await game.submit(sessionId, score, colorMatches);
  };

  return {
    ...game,
    startColorMatch,
    submitColorMatch,
  };
};
```

#### SpeedMatch Hook

```typescript
// hooks/useSpeedMatchGame.ts
import { useGameV3 } from "./useGameV3";

export const useSpeedMatchGame = () => {
  const game = useGameV3("SpeedMatchGameV3");

  const startSpeedMatch = async (
    tokenAddress: string,
    difficulty: 1 | 2 | 3 // Easy, Medium, Hard
  ) => {
    return await game.start(tokenAddress, difficulty);
  };

  const submitSpeedMatch = async (
    sessionId: bigint,
    score: number,
    correctMatches: number,
    timeTaken: number // in seconds or milliseconds
  ) => {
    return await game.submit(sessionId, score, correctMatches, timeTaken);
  };

  return {
    ...game,
    startSpeedMatch,
    submitSpeedMatch,
  };
};
```

#### MemoryBlitz Hook

```typescript
// hooks/useMemoryBlitzGame.ts
import { useGameV3 } from "./useGameV3";

export const useMemoryBlitzGame = () => {
  const game = useGameV3("MemoryBlitzGameV3");

  const startMemoryBlitz = async (tokenAddress: string) => {
    return await game.start(tokenAddress);
  };

  const submitMemoryBlitz = async (
    sessionId: bigint,
    score: number,
    levelReached: number,
    sequenceLength: number
  ) => {
    return await game.submit(sessionId, score, levelReached, sequenceLength);
  };

  return {
    ...game,
    startMemoryBlitz,
    submitMemoryBlitz,
  };
};
```

## Complete Game Flow Example

### ColorMatch Game Component

```typescript
"use client";

import { useState, useEffect } from "react";
import { useAccount } from "@starknet-react/core";
import { useGameApproval } from "~~/hooks/useGameApproval";
import { useColorMatchGame } from "~~/hooks/useColorMatchGame";

const STRK_TOKEN = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"; // Mainnet STRK

export const ColorMatchGame = () => {
  const { address } = useAccount();
  const { approveForGames, isApproving, allowance } = useGameApproval();
  const {
    startColorMatch,
    submitColorMatch,
    currentSessionId,
    isStarting,
    isSubmitting,
    leaderboard,
    playerStats,
  } = useColorMatchGame();

  const [gameState, setGameState] = useState({
    isPlaying: false,
    score: 0,
    colorMatches: 0,
  });

  // Check if user needs to approve
  const needsApproval = allowance < BigInt("10000000000000000"); // Less than 0.01 STRK

  const handleApprove = async () => {
    // Approve 100 STRK for future games
    await approveForGames(STRK_TOKEN, "100000000000000000000");
  };

  const handleStartGame = async () => {
    if (needsApproval) {
      alert("Please approve tokens first");
      return;
    }

    const sessionId = await startColorMatch(STRK_TOKEN);
    if (sessionId) {
      setGameState({ isPlaying: true, score: 0, colorMatches: 0 });
    }
  };

  const handleGameEnd = async () => {
    if (!currentSessionId) return;

    const success = await submitColorMatch(
      currentSessionId,
      gameState.score,
      gameState.colorMatches
    );

    if (success) {
      setGameState({ isPlaying: false, score: 0, colorMatches: 0 });
      alert("Score submitted successfully!");
    }
  };

  return (
    <div className="game-container">
      <h1>Color Match Game</h1>

      {/* Approval Section */}
      {needsApproval && (
        <div className="approval-section">
          <p>You need to approve tokens to play</p>
          <button onClick={handleApprove} disabled={isApproving}>
            {isApproving ? "Approving..." : "Approve 100 STRK"}
          </button>
        </div>
      )}

      {/* Game Controls */}
      {!gameState.isPlaying ? (
        <button onClick={handleStartGame} disabled={isStarting || needsApproval}>
          {isStarting ? "Starting..." : "Start Game"}
        </button>
      ) : (
        <div>
          {/* Your game UI here */}
          <p>Score: {gameState.score}</p>
          <p>Matches: {gameState.colorMatches}</p>

          <button onClick={handleGameEnd} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "End Game & Submit Score"}
          </button>
        </div>
      )}

      {/* Player Stats */}
      {playerStats && (
        <div className="stats">
          <h3>Your Stats</h3>
          <p>Best Score: {playerStats[0]?.toString()}</p>
          <p>Total Games: {playerStats[1]?.toString()}</p>
          <p>Total Matches: {playerStats[2]?.toString()}</p>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard && (
        <div className="leaderboard">
          <h3>Top Players</h3>
          <ol>
            {leaderboard.map((entry: any, index: number) => (
              <li key={index}>
                {entry.player.slice(0, 6)}...{entry.player.slice(-4)} - Score: {entry.score.toString()}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
```

## Error Handling

### Common Errors and Solutions

1. **"Fee charge failed"**
   - User hasn't approved enough tokens
   - Solution: Call `approveForGames` with sufficient amount

2. **"Active session exists"**
   - User didn't finish previous game
   - Solution: Either finish the previous game or add timeout handling

3. **"Session not active"**
   - Session expired or already completed
   - Solution: Start a new game

4. **"Not session owner"**
   - Wrong wallet trying to submit score
   - Solution: Ensure user is connected with correct wallet

### Error Handling Example

```typescript
const handleStartGame = async () => {
  try {
    const sessionId = await startColorMatch(STRK_TOKEN);
    if (!sessionId) {
      throw new Error("Failed to start game");
    }
    setGameState({ isPlaying: true, score: 0, colorMatches: 0 });
  } catch (error: any) {
    if (error.message.includes("Fee charge failed")) {
      alert("Please approve more tokens");
    } else if (error.message.includes("Active session exists")) {
      alert("Please finish your current game first");
    } else {
      alert(`Error starting game: ${error.message}`);
    }
  }
};
```

## Testing Checklist

- [ ] User can approve tokens once
- [ ] User can start game without re-approving
- [ ] Session ID is received immediately (no event parsing)
- [ ] User can play multiple games without re-approving
- [ ] Score submission works correctly
- [ ] Leaderboard updates after score submission
- [ ] Player stats update correctly
- [ ] Error messages are clear and helpful
- [ ] Game prevents starting new session while one is active
- [ ] Timeout handling works correctly

## Performance Tips

1. **Batch Approve**: Approve large amounts (e.g., 100 STRK) to avoid frequent approvals
2. **Cache Leaderboard**: Use React Query or SWR to cache leaderboard data
3. **Optimistic Updates**: Update UI optimistically before blockchain confirmation
4. **Loading States**: Always show loading states for better UX

## Additional Resources

- [Scaffold-Stark Documentation](https://scaffoldstark.com)
- [Starknet React Documentation](https://starknet-react.com)
- [V3 Design Document](./V3_DESIGN.md)
- [V3 Complete Summary](./V3_COMPLETE_SUMMARY.md)

## Support

For issues or questions:
- Check the V3_DESIGN.md for architectural decisions
- Review V3_COMPLETE_SUMMARY.md for complete contract details
- Test on Sepolia testnet first before mainnet deployment
