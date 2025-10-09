# Pre-Production Testing Setup

This branch (`preproductiontest`) is configured for testing the BrainD frontend with deployed mainnet contracts while using mock data for leaderboards and prediction markets.

## Overview

This setup allows you to:
- ✅ Connect games to **real deployed contracts on Starknet Mainnet**
- ✅ Test game interactions (start_game, submit_score) with real blockchain transactions
- ✅ Display **mock leaderboard data** until we have real players
- ✅ Display **mock prediction market data** for UI testing
- ✅ Easily switch between mock and real data via environment variable

## Configuration

### 1. Network Configuration

The app is configured to connect to **Starknet Mainnet**:

📄 [`packages/nextjs/scaffold.config.ts`](packages/nextjs/scaffold.config.ts)
```typescript
targetNetworks: [chains.mainnet]
```

### 2. Deployed Contracts

All V2 game contracts are deployed and configured:

📄 [`packages/nextjs/contracts/deployedContracts.ts`](packages/nextjs/contracts/deployedContracts.ts)

**Mainnet Contract Addresses:**
- **ColorMatchGameV2**: `0x054bb49e1ff312972ba1bc1a3022f946f860495b005db31d47806ab2892f4fec`
- **SpeedMatchGameV2**: `0x07e8a78427ae80aa553806867a62555d983ef9b0b757738a0744f409961af1fb`
- **MemoryBlitzGameV2**: `0x0639b75944b41f01d41c86ffe81214b7c992ec4dc5456ef8182ea39ef3e67aef`
- **PredictionMarket**: `0x0005ee116e87e40e457fb9435fb79895374fb9dd059d572f955445566ee6b91e`
- **AirdropFunds**: `0x046256fb3e69776a119b174f60e9123f3592e1f01e908dc5f1ee8e035395da44`

All contracts are **verified on Voyager** ✅

### 3. Mock Data Configuration

📄 [`packages/nextjs/.env.local`](packages/nextjs/.env.local)
```bash
# Set to 'true' to use mock data (default for this branch)
NEXT_PUBLIC_USE_MOCK_DATA=true

# Set to 'false' when you want to use real contract data
# NEXT_PUBLIC_USE_MOCK_DATA=false
```

## Mock Data Utilities

### Leaderboard Mock Data

📄 [`packages/nextjs/utils/mockLeaderboardData.ts`](packages/nextjs/utils/mockLeaderboardData.ts)

Provides mock data for:
- Current round leaderboards (top 10 players)
- Historic all-time leaderboards (top 100 players)
- Player positions
- Round information

**Functions:**
- `getMockColorMatchLeaderboard(limit)` - ColorMatchGameV2 leaderboard
- `getMockSpeedMatchLeaderboard(limit)` - SpeedMatchGameV2 leaderboard (with time)
- `getMockMemoryBlitzLeaderboard(limit)` - MemoryBlitzGameV2 leaderboard (with level)
- `getMockHistoricLeaderboard(gameType, limit)` - All-time leaderboard
- `getMockCurrentRound()` - Current round number
- `getMockGamesInCurrentRound()` - Games played in round

### Prediction Market Mock Data

📄 [`packages/nextjs/utils/mockPredictionMarketData.ts`](packages/nextjs/utils/mockPredictionMarketData.ts)

Provides mock data for:
- Active prediction markets
- Resolved markets
- Player bets
- Market odds calculation

**Functions:**
- `getMockPredictionMarkets(limit)` - List of markets
- `getMockMarketInfo(marketId)` - Specific market info
- `getMockPlayerBets(playerAddress, count)` - Player's bets
- `getMockActiveMarkets()` - Unresolved markets
- `getMockResolvedMarkets()` - Resolved markets
- `calculateOdds(market)` - Calculate betting odds

## Custom Hooks

### Leaderboard Data Hook

📄 [`packages/nextjs/hooks/scaffold-stark/useLeaderboardData.ts`](packages/nextjs/hooks/scaffold-stark/useLeaderboardData.ts)

**Usage:**
```tsx
import { useLeaderboardData } from "~/hooks/scaffold-stark/useLeaderboardData";

function LeaderboardComponent() {
  const {
    currentRoundLeaderboard,
    historicLeaderboard,
    currentRound,
    gamesInRound,
    isLoading
  } = useLeaderboardData('ColorMatchGameV2', 10);

  return (
    <div>
      <h2>Round {currentRound} - {gamesInRound} games played</h2>
      {currentRoundLeaderboard.map((entry, i) => (
        <div key={i}>
          #{entry.position} - {entry.player} - {entry.score} points
        </div>
      ))}
    </div>
  );
}
```

### Prediction Market Data Hook

📄 [`packages/nextjs/hooks/scaffold-stark/usePredictionMarketData.ts`](packages/nextjs/hooks/scaffold-stark/usePredictionMarketData.ts)

**Usage:**
```tsx
import {
  useMarketInfo,
  usePlayerBets,
  useActiveMarkets
} from "~/hooks/scaffold-stark/usePredictionMarketData";

function PredictionMarketComponent() {
  const { markets } = useActiveMarkets();
  const { marketInfo } = useMarketInfo(BigInt(1));
  const { bets } = usePlayerBets(playerAddress);

  return (
    <div>
      {markets.map(market => (
        <MarketCard key={market.market_id} market={market} />
      ))}
    </div>
  );
}
```

## Game Interactions (Real Contracts)

Games will interact with **real deployed contracts**:

### Starting a Game

```tsx
import { useScaffoldWriteContract } from "~/hooks/scaffold-stark/useScaffoldWriteContract";

const { writeAsync: startGame } = useScaffoldWriteContract({
  contractName: "ColorMatchGameV2",
  functionName: "start_game",
  args: [paymentTokenAddress], // STRK, USDC, or ETH
});

// This will create a REAL transaction on Starknet Mainnet!
await startGame();
```

### Submitting a Score

```tsx
const { writeAsync: submitScore } = useScaffoldWriteContract({
  contractName: "ColorMatchGameV2",
  functionName: "submit_score",
  args: [gameId, score, colorMatches],
});

// This will submit the score to the real contract
await submitScore();
```

## Testing Workflow

### 1. Start Development Server

```bash
cd /home/oucan/TheBrainD
yarn start
```

### 2. Connect Wallet

- Use **ArgentX** or **Braavos** wallet
- Ensure you're connected to **Starknet Mainnet**
- Have some **STRK**, **USDC**, or **ETH** for gas fees

### 3. Test Game Flow

1. ✅ Navigate to a game (e.g., `/games/colormatch`)
2. ✅ Click "Start Game" (real transaction)
3. ✅ Play the game
4. ✅ Submit score (real transaction)
5. ✅ View leaderboard (mock data for now)

### 4. Test Prediction Markets

1. ✅ Navigate to `/prediction-market`
2. ✅ View active markets (mock data)
3. ✅ Place bets (will use real contract when ready)
4. ✅ View your bets (mock data)

### 5. Switch to Real Data (When Ready)

Edit `.env.local`:
```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Restart the dev server, and the app will fetch real data from contracts!

## Token Addresses (Mainnet)

For testing game payments:

- **STRK**: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`
- **USDC**: `0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8`
- **ETH**: `0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7`

## Important Notes

⚠️ **This branch connects to REAL mainnet contracts**
- Game transactions will cost real gas fees
- Scores submitted will be recorded on-chain
- Use testnet tokens for testing if needed

📊 **Mock Data is Only for Display**
- Leaderboards show mock data (when `USE_MOCK_DATA=true`)
- Prediction markets show mock data (when `USE_MOCK_DATA=true`)
- Game logic and scoring uses real contracts

🔄 **Switching Between Mock and Real**
- Change `NEXT_PUBLIC_USE_MOCK_DATA` in `.env.local`
- Restart dev server
- No code changes needed!

## Next Steps

1. ✅ Test all game flows with real contracts
2. ✅ Verify transactions on [Starkscan](https://starkscan.co)
3. ✅ Monitor contract interactions
4. ✅ Collect real player data
5. ✅ Switch to real data when ready (`USE_MOCK_DATA=false`)

## Troubleshooting

### Games not connecting to contracts?
- Check `scaffold.config.ts` targets mainnet
- Verify wallet is on Starknet Mainnet
- Check contract addresses in `deployedContracts.ts`

### Mock data not showing?
- Verify `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local`
- Restart dev server after changing env vars
- Check browser console for errors

### Transactions failing?
- Ensure you have enough tokens for gas
- Check wallet connection
- Verify you're on mainnet network

## Resources

- 📖 [Scaffold-Stark Hooks](https://scaffoldstark.com/docs/hooks/)
- 🔗 [Starknet Mainnet Explorer](https://starkscan.co)
- ✅ [Contract Verification](https://voyager.online/)
- 📚 [BrainD Main README](./README.md)

---

**Happy Testing! 🧠🎮**
