# V3 BrainD Ecosystem - Complete Execution Plan

## Goal
Create a complete, working V3 ecosystem with all game contracts, leaderboards, airdrop, and prediction market properly integrated and ready for frontend integration following Scaffold-Stark patterns.

## Current Status Analysis

### ✅ Completed
- Common types (GameSession, GameStatus, GameMetadata, FeeConfig)
- GamePaymentHandler (centralized payment system)
- LeaderboardManager (dual leaderboard system)
- ColorMatchGameV3 (first game implementation)
- Base architecture and design

### 🔄 In Progress
- SpeedMatchGameV3 (needs implementation)
- MemoryBlitzGameV3 (needs implementation)

### ⏳ Pending
- AirdropFunds V3 integration
- PredictionMarket V3 integration
- Comprehensive test suite
- Deployment scripts
- Frontend integration documentation

## Detailed Execution Plan

### Phase 1: Complete Game Contract Suite (SpeedMatch & MemoryBlitz)

#### Task 1.1: Implement SpeedMatchGameV3
**Based on V2 features:**
- Difficulty levels (easy/medium/hard)
- Time-based scoring (lower time = better)
- Correct matches tracking
- Speed-optimized leaderboard (sort by score, then time)

**Implementation:**
```cairo
// Interface
fn start_game(token, difficulty: u8) → u256
fn submit_score(session_id, score, correct_matches, time_taken) → bool
fn get_leaderboard_by_difficulty(difficulty, limit) → Array<LeaderboardEntry>
```

**Key differences from ColorMatch:**
- Difficulty parameter in start_game
- Time tracking in scoring
- Leaderboard sorted by (score DESC, time ASC)

#### Task 1.2: Implement MemoryBlitzGameV3
**Based on V2 features:**
- Progressive levels
- Sequence length tracking
- Level-based progression
- Complex scoring

**Implementation:**
```cairo
// Interface
fn start_game(token) → u256
fn submit_score(session_id, score, level_reached, sequence_length) → bool
fn get_leaderboard_by_level(level, limit) → Array<LeaderboardEntry>
```

**Key differences from ColorMatch:**
- Level progression tracking
- Sequence length validation
- Multiple leaderboard views (by level)

### Phase 2: Integrate Supporting Contracts

#### Task 2.1: Update AirdropFunds for V3
**Current features to preserve:**
- Token deposit tracking
- Batch airdrop execution
- Balance management
- Owner controls

**V3 Enhancements:**
- Integration with GamePaymentHandler (receives 5% of fees)
- Automatic distribution triggers
- Round-based airdrop schedules
- Support for multiple token types

**New interface:**
```cairo
fn receive_fee_share(token, amount) // Called by GamePaymentHandler
fn schedule_airdrop_for_round(round, token, recipients)
fn get_pending_airdrop_amount(round, token) → u256
```

#### Task 2.2: Update PredictionMarket for V3
**Current features to preserve:**
- Market creation per player/round
- Betting on player outcomes
- Win/lose pool management
- Payout calculations

**V3 Enhancements:**
- Integration with GamePaymentHandler (receives 85% of fees)
- Automatic market creation on round start
- Leaderboard-based predictions
- Cross-game betting support

**New interface:**
```cairo
fn receive_fee_share(token, amount) // Called by GamePaymentHandler
fn create_market_from_game(game_contract, session_id, player) → u256
fn auto_resolve_from_leaderboard(game_contract, round) → bool
```

### Phase 3: Testing Infrastructure

#### Task 3.1: Unit Tests
**For each contract:**
- Test all public functions
- Test authorization (owner/admin checks)
- Test edge cases (overflow, underflow, zero values)
- Test pause/unpause functionality

**Test files to create:**
```
tests/
├── test_game_payment_handler.cairo
├── test_leaderboard_manager.cairo
├── test_color_match_v3.cairo
├── test_speed_match_v3.cairo
├── test_memory_blitz_v3.cairo
├── test_airdrop_funds_v3.cairo
└── test_prediction_market_v3.cairo
```

#### Task 3.2: Integration Tests
**Full ecosystem flows:**
1. Player approves tokens → GamePaymentHandler
2. Player starts game → Fee charged and split (10% house, 5% airdrop, 85% prediction)
3. Player submits score → Leaderboard updated
4. Admin ends round → Leaderboard finalized
5. Airdrop executed to top players
6. Prediction market resolved

**Test file:**
```
tests/test_ecosystem_integration.cairo
```

### Phase 4: Deployment Strategy

#### Task 4.1: Create Deployment Scripts
**Order of deployment:**
1. AirdropFunds (needs: owner)
2. PredictionMarket (needs: owner, airdrop_address)
3. GamePaymentHandler (needs: owner, airdrop_address, prediction_address)
4. LeaderboardManager (needs: owner, game_address - deploy per game)
5. ColorMatchGameV3 (needs: owner, payment_handler, leaderboard)
6. SpeedMatchGameV3 (needs: owner, payment_handler, leaderboard)
7. MemoryBlitzGameV3 (needs: owner, payment_handler, leaderboard)

**Configuration after deployment:**
- Authorize game contracts in GamePaymentHandler
- Set game fees for each token
- Configure games_per_round
- Test with small transactions

#### Task 4.2: Deployment Script (TypeScript)
```typescript
// scripts-ts/deploy-v3.ts
async function deployV3Ecosystem(network: 'sepolia' | 'mainnet') {
  // 1. Deploy AirdropFunds
  // 2. Deploy PredictionMarket
  // 3. Deploy GamePaymentHandler
  // 4. Deploy 3x LeaderboardManagers
  // 5. Deploy 3x Game contracts
  // 6. Configure authorizations
  // 7. Verify all contracts
}
```

### Phase 5: Frontend Integration Documentation

#### Task 5.1: Create Integration Guide
**Document for frontend developers:**
- Contract addresses for each network
- ABI generation process
- Hook patterns for each game
- Event listening patterns
- Error handling

#### Task 5.2: Update deployedContracts.ts
**Auto-generate or manually update:**
```typescript
{
  31337: { // localhost
    GamePaymentHandler: { address, abi },
    LeaderboardManager: { address, abi },
    ColorMatchGameV3: { address, abi },
    SpeedMatchGameV3: { address, abi },
    MemoryBlitzGameV3: { address, abi },
    AirdropFunds: { address, abi },
    PredictionMarket: { address, abi }
  }
}
```

#### Task 5.3: Create Hook Examples
**useGameV3.ts pattern:**
```typescript
// Approval once for all games
const { sendAsync: approve } = useScaffoldWriteContract({
  contractName: "GamePaymentHandler",
  functionName: "approve_for_games"
});

// Start game (any game)
const { sendAsync: startGame } = useScaffoldWriteContract({
  contractName: "ColorMatchGameV3",
  functionName: "start_game"
});

// Session ID returned directly (no event parsing!)
const sessionId = await startGame([tokenAddress]);
```

## Technical Specifications

### Contract Interaction Flow

```
Player
  │
  ├─→ Approve tokens → GamePaymentHandler.approve_for_games()
  │
  ├─→ Start game → ColorMatchGameV3.start_game(token)
  │                    └─→ Calls: GamePaymentHandler.charge_game_fee()
  │                         └─→ Splits: 10% house, 5% airdrop, 85% prediction
  │                    └─→ Returns: session_id (u256)
  │
  ├─→ Submit score → ColorMatchGameV3.submit_score(session_id, score, data)
  │                    └─→ Calls: LeaderboardManager.add_score()
  │                    └─→ Returns: true/false
  │
  └─→ View leaderboard → ColorMatchGameV3.get_leaderboard(limit)
                           └─→ Calls: LeaderboardManager.get_top_scores()
                           └─→ Returns: Array<LeaderboardEntry>

Admin
  │
  ├─→ End round → LeaderboardManager.end_current_round()
  │
  ├─→ Distribute airdrop → AirdropFunds.execute_airdrop()
  │
  ├─→ Resolve markets → PredictionMarket.resolve_market()
  │
  └─→ Claim house fees → GamePaymentHandler.claim_house_fees()
```

### Fee Distribution Breakdown

**Per game fee (example: 0.01 STRK):**
- House: 0.001 STRK (10%)
- Airdrop: 0.0005 STRK (5%)
- Prediction Market: 0.0085 STRK (85%)

**Stored in:**
- House fees → GamePaymentHandler.house_fees[token]
- Airdrop fees → Sent to AirdropFunds.deposit_funds()
- Prediction fees → Sent to PredictionMarket (for betting pool)

## Success Criteria

### Compilation
- ✅ All contracts compile without errors
- ⚠️ Only warnings for unused imports (acceptable)

### Testing
- [ ] 100% of public functions covered
- [ ] All integration flows tested
- [ ] Edge cases handled (zero values, overflows, etc.)
- [ ] Gas usage benchmarked

### Deployment
- [ ] Testnet deployment successful
- [ ] All contracts verified on Voyager
- [ ] Test transactions successful
- [ ] No security issues found

### Frontend Integration
- [ ] ABI files generated and accessible
- [ ] Hook patterns documented
- [ ] Example implementations provided
- [ ] Error handling documented

## Risk Mitigation

### Identified Risks
1. **ABI Drift** - Deploy from clean state, verify source matches deployed
2. **Fee Math Errors** - Extensive testing of percentage splits
3. **Reentrancy** - Use checks-effects-interactions pattern
4. **Integer Overflow** - Cairo 2.0 has built-in overflow protection
5. **Authorization Bypass** - Test all admin functions with non-owner

### Mitigation Strategies
- Comprehensive test coverage
- Multiple code reviews
- Gradual rollout (testnet → small mainnet → full mainnet)
- Pause functionality in all contracts
- Admin delegation for emergency response

## Timeline Estimate

**Phase 1** (Games): 2-3 hours
- SpeedMatchGameV3: 1 hour
- MemoryBlitzGameV3: 1 hour
- Testing/fixes: 1 hour

**Phase 2** (Supporting): 2 hours
- AirdropFunds V3: 1 hour
- PredictionMarket V3: 1 hour

**Phase 3** (Testing): 3-4 hours
- Unit tests: 2 hours
- Integration tests: 2 hours

**Phase 4** (Deployment): 1-2 hours
- Scripts: 1 hour
- Testnet deployment: 1 hour

**Phase 5** (Documentation): 1 hour
- Integration guide: 30 min
- Hook examples: 30 min

**Total: 9-12 hours** of focused development

## Next Immediate Actions

1. ✅ Create this execution plan
2. ⏭️ Implement SpeedMatchGameV3
3. ⏭️ Implement MemoryBlitzGameV3
4. ⏭️ Compile and fix errors
5. ⏭️ Update AirdropFunds for V3
6. ⏭️ Update PredictionMarket for V3
7. ⏭️ Create test suite structure
8. ⏭️ Write and run tests
9. ⏭️ Create deployment scripts
10. ⏭️ Deploy to testnet
11. ⏭️ Document frontend integration
12. ⏭️ Update deployedContracts.ts

Let's execute! 🚀
