# V3 Game Contracts - Design Document

## Implementation Status: ✅ COMPLETED (Initial Phase)

### Implemented Contracts
- ✅ **common_types.cairo** - Shared types and structs
- ✅ **game_payment_handler.cairo** - Centralized payment processing
- ✅ **base_game_v3.cairo** - Abstract base contract (kept for reference, not used in component pattern)
- ✅ **leaderboard_manager_v3.cairo** - Unified leaderboard management
- ✅ **color_match_game_v3.cairo** - First game implementation
- ✅ **Compilation successful** - All contracts compile with only minor warnings

### Next Steps
- [ ] Implement SpeedMatchGameV3 and MemoryBlitzGameV3
- [ ] Write comprehensive test suite using snforge
- [ ] Deploy to testnet and verify
- [ ] Update frontend integration
- [ ] Deploy to mainnet

# V3 Game Contracts - Design Document

## Issues Found in V2 (from debugging session)

### Critical Issues

1. **ABI Mismatch Between Source and Deployed**
   - **Issue**: Deployed mainnet contracts had different function signatures than source code
   - **Example**: MemoryBlitzGameV2 deployed with 4 params (game_id, score, level_reached, sequence_length) but local ABI showed only 3
   - **Impact**: Frontend couldn't submit scores due to parameter count mismatch
   - **Root Cause**: Contracts were modified after deployment, causing ABI drift

2. **Parameter Serialization Issues**
   - **Issue**: u256 parameters not properly serialized in frontend calls
   - **Details**: BigInt values need cairo.uint256() conversion to {low, high} format
   - **Impact**: "Failed to deserialize param #4" errors in wallet

3. **Event Data Extraction Complexity**
   - **Issue**: game_id must be extracted from GameStarted event after multicall
   - **Details**: start_game doesn't return game_id directly, must parse events
   - **Impact**: Extra complexity, potential for missing/null game_id

4. **Nonce Conflicts**
   - **Issue**: Separate approve() and start_game() transactions caused nonce errors
   - **Solution**: Had to use multicall to combine both in single transaction
   - **Impact**: Increased complexity, harder to debug

### Design Issues

5. **Inconsistent Function Signatures Across Games**
   - ColorMatchGameV2: submit_score(game_id, score, color_matches)
   - SpeedMatchGameV2: submit_score(game_id, score, correct_matches, time_taken)
   - MemoryBlitzGameV2: submit_score(game_id, score, level_reached, sequence_length)
   - **Impact**: Different frontend implementations for each game

6. **No Direct Return Values**
   - start_game() returns u256 but value not accessible without event parsing
   - Requires complex event extraction logic

7. **Token Approval Required Per Game**
   - Each game requires separate STRK approval
   - Users must approve before each game start
   - UX friction

## V3 Design Goals

### 1. **Standardized Interface**
All games will implement identical interface:

```cairo
#[starknet::interface]
trait IGameV3<TContractState> {
    // Unified game lifecycle
    fn start_game(ref self: TContractState, payment_token: ContractAddress) -> GameSession;
    fn submit_score(ref self: TContractState, session_id: u256, score: u32, metadata: GameMetadata) -> bool;

    // Direct queries (no events needed)
    fn get_session(self: @TContractState, session_id: u256) -> GameSession;
    fn get_player_sessions(self: @TContractState, player: ContractAddress) -> Array<u256>;
}

#[derive(Drop, Serde)]
struct GameSession {
    session_id: u256,
    player: ContractAddress,
    game_type: felt252,
    start_time: u64,
    end_time: u64,
    score: u32,
    status: GameStatus, // Active, Completed, Expired
}

#[derive(Drop, Serde)]
struct GameMetadata {
    level: u32,
    difficulty: u32,
    extra_data: Array<u32>, // Flexible for game-specific metrics
}
```

### 2. **Return Values Instead of Events**
- start_game() returns GameSession struct directly
- No need for event parsing to get session_id
- Frontend gets immediate confirmation with all data

### 3. **Unified Payment Handler**
- Single payment contract handles all game payments
- One-time approval for all games
- Automatic fee distribution (house, airdrop, prediction market)

```cairo
#[starknet::interface]
trait IGamePaymentHandler<TContractState> {
    fn approve_for_games(ref self: TContractState, token: ContractAddress, amount: u256);
    fn charge_game_fee(ref self: TContractState, game: ContractAddress, player: ContractAddress) -> bool;
    fn get_allowance(self: @TContractState, player: ContractAddress, token: ContractAddress) -> u256;
}
```

### 4. **Simplified Score Submission**
All games use same metadata struct:
- game_id (now session_id) - u256
- score - u32
- metadata - GameMetadata struct with:
  - level - u32
  - difficulty - u32
  - extra_data - Array<u32> for game-specific stats

### 5. **Better Testing Strategy**
- Comprehensive unit tests for each function
- Integration tests for full game flow
- Test fixtures with pre-deployed contracts
- Mock contracts for isolated testing

### 6. **Version Control for ABIs**
- ABIs stored with version tags
- Automated ABI generation on compile
- ABI validation tests
- Clear deployment tracking

## V3 Contract Architecture

### Core Contracts

1. **GamePaymentHandler.cairo** (NEW)
   - Centralized payment processing
   - Multi-token support
   - Fee distribution logic
   - Allowance management

2. **BaseGameV3.cairo** (NEW)
   - Abstract base contract
   - Common game logic
   - Session management
   - Score validation

3. **ColorMatchGameV3.cairo**
   - Inherits BaseGameV3
   - Implements IGameV3
   - Game-specific logic only

4. **SpeedMatchGameV3.cairo**
   - Inherits BaseGameV3
   - Implements IGameV3
   - Game-specific logic only

5. **MemoryBlitzGameV3.cairo**
   - Inherits BaseGameV3
   - Implements IGameV3
   - Game-specific logic only

6. **LeaderboardManagerV3.cairo** (NEW)
   - Separated leaderboard logic
   - Shared across all games
   - Optimized for gas efficiency
   - Supports multiple leaderboard types

7. **AirdropFunds.cairo** (UPDATE)
   - Compatible with new payment handler
   - Receives 5% from all games

8. **PredictionMarket.cairo** (UPDATE)
   - Compatible with new session system
   - Uses session_id instead of game_id

## Implementation Plan

### Phase 1: Core Infrastructure
1. GamePaymentHandler contract
2. BaseGameV3 abstract contract
3. LeaderboardManagerV3 contract
4. Comprehensive test suite setup

### Phase 2: Game Implementations
1. Migrate ColorMatchGameV3
2. Migrate SpeedMatchGameV3
3. Migrate MemoryBlitzGameV3
4. Integration tests

### Phase 3: Supporting Contracts
1. Update AirdropFunds
2. Update PredictionMarket
3. Cross-contract integration tests

### Phase 4: Deployment & Testing
1. Deploy to testnet (Sepolia)
2. Frontend integration testing
3. Full E2E testing
4. Security audit preparation
5. Mainnet deployment

## Key Improvements Over V2

1. ✅ **No ABI Drift**: Strict versioning and validation
2. ✅ **Simpler Frontend**: Direct return values, no event parsing
3. ✅ **Better UX**: Single approval for all games
4. ✅ **Consistent Interface**: All games use same functions
5. ✅ **Easier Testing**: Modular design, clear separation of concerns
6. ✅ **Gas Optimization**: Shared leaderboard manager, optimized storage
7. ✅ **Better Debugging**: Clear error messages, comprehensive logging
8. ✅ **Scalability**: Easy to add new games with BaseGameV3

## Success Criteria

- [ ] All tests pass (100% coverage for core logic)
- [ ] Frontend integration works without event parsing
- [ ] Single STRK approval works for all games
- [ ] ABI matches deployed contracts (automated validation)
- [ ] Gas costs reduced by 20% vs V2
- [ ] Deployment completes without errors
- [ ] E2E testing successful on testnet
- [ ] No parameter serialization issues
- [ ] Clear documentation and upgrade guide
