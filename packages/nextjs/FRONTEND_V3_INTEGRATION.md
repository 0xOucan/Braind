# Frontend V3 Contract Integration Guide

## Current Status

### ✅ Completed
1. **Sepolia Network Configuration**
   - Added Sepolia RPC URL to `supportedChains.ts`
   - Updated `scaffold.config.ts` to target Sepolia testnet
   - V3 contract ABIs and addresses loaded in `deployedContracts.ts`

2. **Deployed Contracts Available**
   - All 7 V3 contracts deployed and verified on Sepolia
   - ABIs automatically extracted from compiled contracts
   - Contract addresses configured for both devnet and sepolia

### 🔄 Current Frontend State
- Game components (ColorMatch, SpeedMatch, MemoryBlitz) are **UI-only**
- No contract integration yet ("STARKNET REWARDS COMING SOON" message)
- Leaderboards use mock data
- Games are fully functional as standalone JavaScript games

## V3 Contracts on Sepolia

| Contract | Address |
|----------|---------|
| **ColorMatchGameV3** | `0x0ec31b78ba4f4ccb1f66aa2c79e485bdfd33d02b8546824c69c1bf5fd631531` |
| **SpeedMatchGameV3** | `0x003d36988097b2afb178518d9a25c4d1d8af9502b903bff87cb160f607ab9678` |
| **MemoryBlitzGameV3** | `0x01fd2685441d644697e0ef58836276f1e4ae0ef5e671bbf265f0d46eb04f072a` |
| **GamePaymentHandler** | `0x23de23a7f6271e87df4e82c7cff674d0837b2eee12893e4e2ca3fff105b5e6b` |
| **LeaderboardManager** | Multiple (one per game) |
| **AirdropFundsV3** | `0x79bf4e98b25d585238066de2bb6984bf885cd379d8fef18f81af559a264c589` |
| **PredictionMarketV3** | `0x2f7d11253b52f0b7b733b5b904bdc3702c833982e5c6e63d7792e6053c483f0` |

## Integration Steps (Next Phase)

### 1. Game Flow with V3 Contracts

#### A. Start Game
```typescript
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark";

const { writeAsync: startGame } = useScaffoldWriteContract({
  contractName: "ColorMatchGameV3",
  functionName: "start_game",
  args: [paymentToken], // Token address (STRK or ETH)
});

// Before calling start_game, approve payment
const { writeAsync: approvePayment } = useScaffoldWriteContract({
  contractName: "ERC20", // STRK or ETH token
  functionName: "approve",
  args: [
    gamePaymentHandlerAddress,
    gameFeeAmount
  ],
});

// Call sequence:
await approvePayment();
const sessionId = await startGame();
```

#### B. Submit Score
```typescript
const { writeAsync: submitScore } = useScaffoldWriteContract({
  contractName: "ColorMatchGameV3",
  functionName: "submit_score",
  args: [
    sessionId,
    score,
    colorMatches
  ],
});

await submitScore();
```

#### C. Read Leaderboard
```typescript
const { data: leaderboard } = useScaffoldReadContract({
  contractName: "LeaderboardManager",
  functionName: "get_leaderboard",
  args: [gameType], // 0 for main leaderboard
  watch: true,
});
```

### 2. Update Game Components

#### ColorMatch Example (`games/colormatch/hooks/useColorMatchGame.ts`)

Add contract hooks:
```typescript
import { useAccount } from "@starknet-react/core";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-stark";

export function useColorMatchGame() {
  const { address } = useAccount();
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Start game with contract
  const { writeAsync: startGameContract } = useScaffoldWriteContract({
    contractName: "ColorMatchGameV3",
    functionName: "start_game",
  });

  // Submit score to contract
  const { writeAsync: submitScoreContract } = useScaffoldWriteContract({
    contractName: "ColorMatchGameV3",
    functionName: "submit_score",
  });

  // Read leaderboard from contract
  const { data: contractLeaderboard } = useScaffoldReadContract({
    contractName: "LeaderboardManager",
    functionName: "get_leaderboard",
    args: [0], // Main leaderboard
    watch: true,
  });

  const startGame = async (difficulty: string) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      // Start game on contract
      const result = await startGameContract({
        args: [STRK_TOKEN_ADDRESS]
      });

      setSessionId(result.session_id);

      // Start local game logic
      // ... existing game logic
    } catch (error) {
      console.error("Failed to start game:", error);
      toast.error("Failed to start game on blockchain");
    }
  };

  const submitAnswer = async (isMatch: boolean) => {
    // ... existing game logic

    // If game ended, submit score to contract
    if (gameOver && sessionId) {
      try {
        await submitScoreContract({
          args: [sessionId, finalScore, totalColorMatches]
        });
        toast.success("Score submitted to blockchain!");
      } catch (error) {
        console.error("Failed to submit score:", error);
        toast.error("Failed to submit score to blockchain");
      }
    }
  };

  return {
    // ... existing returns
    contractLeaderboard,
  };
}
```

### 3. Update Leaderboard Component

Replace mock data with contract data:

```typescript
// components/Leaderboard.tsx
const { data: globalLeaderboard } = useScaffoldReadContract({
  contractName: "LeaderboardManager",
  functionName: "get_global_leaderboard",
  args: [10], // Top 10
  watch: true,
});

// Transform contract data to display format
const displayData = globalLeaderboard?.map((entry, index) => ({
  rank: index + 1,
  address: entry.player,
  totalScore: entry.score,
  // ... other fields
})) || mockLeaderboardData;
```

### 4. Payment Token Configuration

**Supported Tokens on Sepolia:**
- **STRK**: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`
- **ETH**: `0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7`

Add token selector to game UI:
```typescript
const [selectedToken, setSelectedToken] = useState<"STRK" | "ETH">("STRK");

const tokenAddresses = {
  STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
};
```

### 5. Environment Variables

Ensure `.env.local` has Sepolia RPC URL:
```env
NEXT_PUBLIC_SEPOLIA_PROVIDER_URL=https://starknet-sepolia.public.blastapi.io/rpc/v0_9
```

### 6. Testing Integration

1. **Connect Wallet to Sepolia**
   - Use Argent or Braavos wallet
   - Switch to Sepolia testnet
   - Get test tokens from faucet

2. **Test Game Flow**
   - Approve payment token
   - Start game
   - Play game
   - Submit score
   - Verify score appears in leaderboard

3. **Verify on Voyager**
   - Check transactions: https://sepolia.voyager.online
   - Verify contract calls
   - Check leaderboard state

## Key Differences V2 → V3

| Feature | V2 | V3 |
|---------|----|----|
| **Payment** | Direct to game contract | Via GamePaymentHandler |
| **Leaderboard** | Embedded in game | Separate LeaderboardManager |
| **Setup** | Deploy with leaderboard | Deploy games first, link later |
| **Fees** | Per-game tracking | Centralized fee management |

## V3 Contract Functions

### ColorMatchGameV3
- `start_game(payment_token: ContractAddress) -> u256` - Start game session
- `submit_score(session_id: u256, score: u32, color_matches: u32)` - Submit game results
- `get_session_data(session_id: u256) -> GameSession` - Get session info
- `set_leaderboard_manager(manager: ContractAddress)` - Link leaderboard (owner only)

### LeaderboardManager
- `add_score(player: ContractAddress, score: u32, additional_metric: u32, session_id: u256)` - Add score (game only)
- `get_leaderboard(leaderboard_type: u8) -> Array<LeaderboardEntry>` - Get leaderboard
- `get_player_position(player: ContractAddress, leaderboard_type: u8) -> u32` - Get player rank

### GamePaymentHandler
- `charge_game_fee(player: ContractAddress, token: ContractAddress, amount: u256)` - Process payment
- `get_game_fee(game: ContractAddress) -> u256` - Get game fee amount

## Next Steps

1. **Phase 1: Read-Only Integration** (Recommended First)
   - Display real leaderboards from LeaderboardManager
   - Show player stats from contracts
   - No wallet required

2. **Phase 2: Write Integration**
   - Implement start_game flow
   - Add token approval
   - Submit scores to blockchain

3. **Phase 3: Advanced Features**
   - Prediction markets integration
   - Airdrop rewards
   - Multi-game tournaments

## Troubleshooting

### Common Issues
1. **"Account not deployed"** - Deploy Sepolia account via wallet first
2. **"Insufficient allowance"** - Approve tokens before starting game
3. **"Session not found"** - Session may have expired or not been created
4. **Leaderboard not updating** - Check if game is linked to LeaderboardManager

### Debug Tools
- **Voyager**: https://sepolia.voyager.online
- **Starkscan**: https://sepolia.starkscan.co
- **Contract Addresses**: See V3_SEPOLIA_DEPLOYMENT.md

## Resources

- **Contract Deployment Details**: `/packages/snfoundry/V3_SEPOLIA_DEPLOYMENT.md`
- **Contract ABIs**: `/packages/nextjs/contracts/deployedContracts.ts`
- **Scaffold-Stark Hooks**: `/packages/nextjs/hooks/scaffold-stark/`
- **Voyager Verification**: All contracts verified on Voyager

---

**Status**: Frontend configured for Sepolia, ready for contract integration.
**Last Updated**: 2025-10-11
**Deployed Contracts**: 9/9 on Sepolia testnet ✅
