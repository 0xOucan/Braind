# Devnet Deployment & Testing Plan - V3 Contracts

## 🎯 Mission Objectives

1. ✅ Push V3 contracts to remote (DONE)
2. 🔄 Update PredictionMarketV3 with user-created markets
3. 🔄 Set up local devnet
4. 🔄 Deploy V3 contracts to devnet
5. 🔄 Test complete game flow
6. 🔄 Update frontend to use V3 contracts
7. 🔄 Deploy to Sepolia testnet

## 📋 System Requirements (from README.md)

### Game Economy
- **Game Fee**: 0.01 STRK per game (10000000000000000 wei)
- **Round System**: 10 games per round (default)
- **Prize Distribution**:
  - 🥇 1st Place: 30%
  - 🥈 2nd Place: 25%
  - 🥉 3rd Place: 20%
  - 🎲 Random Player: 10%
  - 🏠 House Fee: 10%
  - 🎁 Airdrop Fund: 5%

### Prediction Market Requirements (NEW)
- **Who Can Create**: Past round winners (top 3 finishers) ONLY
- **Creation Fee**: 1 STRK (1000000000000000000 wei)
- **Market Type**: Self-prediction for next round
- **Prediction**: "Will I make top 3 in the next round?"
- **Betting**: Any user can bet on the market
- **Resolution**: After round ends, based on actual leaderboard position

## 🔧 Updated PredictionMarketV3 Design

### Key Changes from Current Implementation

**Current V3**:
- Admin/game contracts create markets
- Markets for any player
- Session-based

**Updated V3 (User-Created Markets)**:
- Past round winners create their own markets
- Pay 1 STRK to create market
- Predict their own performance
- Anyone can bet on their prediction

### New Storage Requirements

```cairo
// Eligibility tracking
round_winners: Map<(u32, u32), ContractAddress>, // (round, position) => player
is_past_winner: Map<ContractAddress, bool>, // Quick lookup
player_market_count: Map<ContractAddress, u32>, // Markets created per player
player_active_market: Map<ContractAddress, u256>, // Current active market for player

// Market constraints
market_creation_fee: u256, // 1 STRK
min_bet_amount: u256, // Minimum bet
max_bet_per_user: u256, // Optional limit
```

### New Functions

```cairo
// Eligibility management (called by game contracts)
fn register_round_winner(round: u32, position: u32, player: ContractAddress)

// Market creation (public, with checks)
fn create_self_prediction_market(
    game_contract: ContractAddress,
    current_round: u32,
    prediction: bool // "I will make top 3"
) → u256

// Query functions
fn is_eligible_to_create(player: ContractAddress) → bool
fn get_round_winners(round: u32) → Array<ContractAddress>
fn get_player_active_market(player: ContractAddress) → Option<u256>
```

## 📁 Updated File Structure

```
packages/snfoundry/
├── contracts/src/v3/
│   ├── common_types.cairo ✅
│   ├── game_payment_handler.cairo ✅ (needs minor update)
│   ├── leaderboard_manager_v3.cairo ✅ (needs winner registration)
│   ├── base_game_v3.cairo ✅
│   ├── color_match_game_v3.cairo ✅
│   ├── speed_match_game_v3.cairo ✅
│   ├── memory_blitz_game_v3.cairo ✅
│   ├── airdrop_funds_v3.cairo ✅
│   └── prediction_market_v3.cairo 🔄 (needs major update)
├── scripts-ts/
│   ├── deploy-v3-devnet.ts 📝 (to create)
│   └── test-devnet-flow.ts 📝 (to create)
└── tests/ 📝 (to create basic tests)
```

## 🚀 Deployment Steps

### Step 1: Update Contracts

**1.1 Update PredictionMarketV3**
- Add user-created markets feature
- Add eligibility tracking
- Add 1 STRK creation fee
- Update market resolution logic

**1.2 Update LeaderboardManager**
- Add function to notify prediction market of winners
- Export round winners list

**1.3 Update GamePaymentHandler** (minor)
- Ensure 10%/5% split (house/airdrop)
- No prediction market fee during gameplay

### Step 2: Set Up Devnet Environment

Following: https://scaffoldstark.com/docs/quick-start/environment

```bash
# Terminal 1: Start devnet
cd packages/snfoundry
yarn chain

# This starts starknet-devnet on http://127.0.0.1:5050
# With pre-funded accounts for testing
```

### Step 3: Deploy Contracts to Devnet

Following: https://scaffoldstark.com/docs/deploying/deploy-smart-contracts

**Deployment Order:**
1. AirdropFundsV3
2. PredictionMarketV3
3. GamePaymentHandler
4. LeaderboardManager × 3 (one per game)
5. ColorMatchGameV3
6. SpeedMatchGameV3
7. MemoryBlitzGameV3

**Configuration After Deploy:**
```typescript
// Authorize contracts
await paymentHandler.authorize_game(colorMatchAddress);
await paymentHandler.authorize_game(speedMatchAddress);
await paymentHandler.authorize_game(memoryBlitzAddress);

// Set game fees (0.01 STRK)
await paymentHandler.set_game_fee(STRK_TOKEN, "10000000000000000");

// Connect leaderboard to prediction market
await leaderboardColorMatch.set_prediction_market(predictionMarketAddress);
await leaderboardSpeedMatch.set_prediction_market(predictionMarketAddress);
await leaderboardMemoryBlitz.set_prediction_market(predictionMarketAddress);
```

### Step 4: Test Flow

**Complete User Journey:**

```typescript
// 1. Player approves tokens (ONE TIME)
await paymentHandler.approve_for_games(STRK_TOKEN, "1000000000000000000"); // 1 STRK

// 2. Play 10 games in a round
for (let i = 0; i < 10; i++) {
  const sessionId = await colorMatch.start_game(STRK_TOKEN);
  // Play game...
  await colorMatch.submit_score(sessionId, score, colorMatches);
}

// 3. Admin ends round
await leaderboardColorMatch.end_current_round();
// This notifies prediction market of winners

// 4. Winner creates prediction market for next round
const marketId = await predictionMarket.create_self_prediction_market(
  colorMatchAddress,
  2, // next round
  true // "I will make top 3"
);

// 5. Others bet on the market
await predictionMarket.place_bet(marketId, true, STRK_TOKEN, "10000000000000000");

// 6. Winner plays in round 2
const sessionId2 = await colorMatch.start_game(STRK_TOKEN);
await colorMatch.submit_score(sessionId2, score, colorMatches);

// 7. Admin ends round 2
await leaderboardColorMatch.end_current_round();

// 8. Market auto-resolves based on leaderboard position
// If winner made top 3: prediction = true wins
// If winner didn't make top 3: prediction = false wins

// 9. Winners claim payouts
await predictionMarket.claim_winnings(betId);
```

### Step 5: Frontend Integration

**Update deployedContracts.ts:**
```typescript
export default {
  31337: { // Devnet
    GamePaymentHandler: { address: "0x...", abi: [...] },
    LeaderboardManagerColorMatch: { address: "0x...", abi: [...] },
    LeaderboardManagerSpeedMatch: { address: "0x...", abi: [...] },
    LeaderboardManagerMemoryBlitz: { address: "0x...", abi: [...] },
    ColorMatchGameV3: { address: "0x...", abi: [...] },
    SpeedMatchGameV3: { address: "0x...", abi: [...] },
    MemoryBlitzGameV3: { address: "0x...", abi: [...] },
    AirdropFundsV3: { address: "0x...", abi: [...] },
    PredictionMarketV3: { address: "0x...", abi: [...] },
  }
}
```

**Create New Hooks:**
```typescript
// hooks/usePredictionMarketV3.ts
export const usePredictionMarketV3 = () => {
  const canCreateMarket = useScaffoldReadContract({
    contractName: "PredictionMarketV3",
    functionName: "is_eligible_to_create",
    args: [address],
  });

  const createMarket = useScaffoldWriteContract({
    contractName: "PredictionMarketV3",
    functionName: "create_self_prediction_market",
  });

  // ... more functions
};
```

**Create Prediction Market UI:**
```typescript
// app/prediction-market/create/page.tsx
// - Show eligibility (past winner check)
// - Creation form (choose game, prediction)
// - Pay 1 STRK to create
// - Display created market

// app/prediction-market/[marketId]/page.tsx
// - Show market details
// - Betting interface
// - Pool stats (win/lose pools)
// - Resolution status
```

## 🧪 Testing Checklist

### Contract Tests
- [ ] GamePaymentHandler charges 0.01 STRK per game
- [ ] Fee splits correctly: 10% house, 5% airdrop, 85% stays in games
- [ ] Round ends after 10 games (or configured amount)
- [ ] Leaderboard identifies top 3 winners
- [ ] Only past winners can create prediction markets
- [ ] Market creation costs 1 STRK
- [ ] Anyone can bet on markets
- [ ] Markets resolve correctly based on leaderboard position
- [ ] Winning bets get paid out proportionally

### Integration Tests
- [ ] Full game flow (approve → play → score → leaderboard)
- [ ] Round completion and winner tracking
- [ ] Prediction market creation by winner
- [ ] Betting on prediction market
- [ ] Second round gameplay
- [ ] Market resolution after second round
- [ ] Payout claims

### Frontend Tests
- [ ] Connect wallet
- [ ] Approve tokens once
- [ ] Play multiple games without re-approving
- [ ] View leaderboard updates
- [ ] See eligibility to create market
- [ ] Create prediction market
- [ ] Bet on markets
- [ ] View market status
- [ ] Claim winnings

## 📊 Expected Gas Costs (Devnet)

| Operation | Estimated Gas | Cost (0.01 STRK/gas) |
|-----------|--------------|----------------------|
| Approve tokens | ~50k | ~0.0005 STRK |
| Start game | ~100k | ~0.001 STRK |
| Submit score | ~150k | ~0.0015 STRK |
| Create market | ~200k | ~0.002 STRK |
| Place bet | ~100k | ~0.001 STRK |
| Claim winnings | ~80k | ~0.0008 STRK |

**Total for complete flow**: ~0.007 STRK in gas + 1.01 STRK in fees

## 🎯 Success Criteria

- ✅ All V3 contracts deploy successfully to devnet
- ✅ Can play 10 games and complete a round
- ✅ Round winners are correctly identified
- ✅ Winners can create prediction markets
- ✅ Non-winners cannot create markets
- ✅ Betting works correctly
- ✅ Markets resolve based on actual leaderboard
- ✅ Payouts distributed correctly
- ✅ Frontend displays all data correctly
- ✅ User experience is smooth and intuitive

## 📝 Documentation to Update

After successful devnet deployment:
1. Update V3_COMPLETE_SUMMARY.md with prediction market details
2. Update FRONTEND_INTEGRATION_GUIDE.md with prediction market hooks
3. Create PREDICTION_MARKET_USER_GUIDE.md
4. Update README.md with V3 information

## 🚀 Next Steps After Devnet Success

1. Deploy to Sepolia testnet
2. Community testing on testnet
3. Security audit (if budget allows)
4. Deploy to mainnet
5. Launch! 🎉

---

**Branch**: `newcontracts`
**Status**: Ready to implement prediction market updates
**Estimated Time**:
- Contract updates: 2 hours
- Devnet deployment: 1 hour
- Testing: 2 hours
- Frontend integration: 3 hours
- **Total**: ~8 hours
