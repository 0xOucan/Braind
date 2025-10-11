# V3 BrainD Contracts - Sepolia Deployment

## Deployment Summary
**Date:** 2025-10-11
**Network:** Starknet Sepolia
**Deployer:** 0x4190830986542df66313b9a6e8faa0a3471ddc7c7447c3390fca7055d9ecf8a

## Core Infrastructure Contracts

### 1. AirdropFundsV3
- **Contract Address:** `0x79bf4e98b25d585238066de2bb6984bf885cd379d8fef18f81af559a264c589`
- **Class Hash:** `0x67dceef45d2a4e8806fe23d4adc51630a714a26fb2cf563e8cd31ccfcfeb51a`
- **Voyager:** https://sepolia.voyager.online/contract/0x79bf4e98b25d585238066de2bb6984bf885cd379d8fef18f81af559a264c589

### 2. PredictionMarketV3
- **Contract Address:** `0x2f7d11253b52f0b7b733b5b904bdc3702c833982e5c6e63d7792e6053c483f0`
- **Class Hash:** `0x52486a5cd89816864e77313fb6b5219a981a80f1fca4db0e5505a9141b09739`
- **Voyager:** https://sepolia.voyager.online/contract/0x2f7d11253b52f0b7b733b5b904bdc3702c833982e5c6e63d7792e6053c483f0

### 3. GamePaymentHandler
- **Contract Address:** `0x23de23a7f6271e87df4e82c7cff674d0837b2eee12893e4e2ca3fff105b5e6b`
- **Class Hash:** `0x7216329c9f7a43ba2123bfb962974ec29ebb05ebefa8a526568a4c4cf68ee44`
- **Voyager:** https://sepolia.voyager.online/contract/0x23de23a7f6271e87df4e82c7cff674d0837b2eee12893e4e2ca3fff105b5e6b

## Game Contracts

### 4. ColorMatchGameV3
- **Contract Address:** `0xec31b78ba4f4ccb1f66aa2c79e485bdfd33d02b8546824c69c1bf5fd631531`
- **Class Hash:** `0x49f332246be1637f6705ffe45a71e7bfa21b5bad88f150a1468d19354ca07c2`
- **Leaderboard:** `0x0088d4670b7a95fa716ea4147bac5043aca8224e23e791cc49965d0a18db101c`
- **Voyager:** https://sepolia.voyager.online/contract/0xec31b78ba4f4ccb1f66aa2c79e485bdfd33d02b8546824c69c1bf5fd631531

### 5. SpeedMatchGameV3
- **Contract Address:** `0x003d36988097b2afb178518d9a25c4d1d8af9502b903bff87cb160f607ab9678`
- **Class Hash:** `0x07a628068df2ca1fbf9e48b42f54d57bc9adfff05ccbaf7ec5bf03540f2aa3a8`
- **Leaderboard:** `0x0033fceca352cc64a2ea831e618a289f0c6feb6710b720208f2a44b9e3350e34`
- **Voyager:** https://sepolia.voyager.online/contract/0x003d36988097b2afb178518d9a25c4d1d8af9502b903bff87cb160f607ab9678

### 6. MemoryBlitzGameV3
- **Contract Address:** `0x01fd2685441d644697e0ef58836276f1e4ae0ef5e671bbf265f0d46eb04f072a`
- **Class Hash:** `0x00634b3ea6a80b68f2614183276492df0e9f792f51fd5008276071214a9721a0`
- **Leaderboard:** `0x078cac47d063247203b59555b1344bd210c9cad9c34fb0e4d76d18f1cdfbc211`
- **Voyager:** https://sepolia.voyager.online/contract/0x01fd2685441d644697e0ef58836276f1e4ae0ef5e671bbf265f0d46eb04f072a

## Leaderboard Contracts

### 7. LeaderboardManager (ColorMatch)
- **Contract Address:** `0x0088d4670b7a95fa716ea4147bac5043aca8224e23e791cc49965d0a18db101c`
- **Class Hash:** `0x008e72254fbde13a0a354e2c809e8359282ae6067a5409814846f24c0b7a4aeb`
- **Game Contract:** ColorMatchGameV3
- **Max Leaderboard Size:** 10
- **Voyager:** https://sepolia.voyager.online/contract/0x0088d4670b7a95fa716ea4147bac5043aca8224e23e791cc49965d0a18db101c

### 8. LeaderboardManager (SpeedMatch)
- **Contract Address:** `0x0033fceca352cc64a2ea831e618a289f0c6feb6710b720208f2a44b9e3350e34`
- **Class Hash:** `0x008e72254fbde13a0a354e2c809e8359282ae6067a5409814846f24c0b7a4aeb`
- **Game Contract:** SpeedMatchGameV3
- **Max Leaderboard Size:** 10
- **Voyager:** https://sepolia.voyager.online/contract/0x0033fceca352cc64a2ea831e618a289f0c6feb6710b720208f2a44b9e3350e34

### 9. LeaderboardManager (MemoryBlitz)
- **Contract Address:** `0x078cac47d063247203b59555b1344bd210c9cad9c34fb0e4d76d18f1cdfbc211`
- **Class Hash:** `0x008e72254fbde13a0a354e2c809e8359282ae6067a5409814846f24c0b7a4aeb`
- **Game Contract:** MemoryBlitzGameV3
- **Max Leaderboard Size:** 10
- **Voyager:** https://sepolia.voyager.online/contract/0x078cac47d063247203b59555b1344bd210c9cad9c34fb0e4d76d18f1cdfbc211

## Post-Deployment Setup Required

### Link Games to Leaderboards
Each game needs to be linked to its leaderboard using `set_leaderboard_manager()`:

```bash
# ColorMatchGameV3
sncast --account sepolia-deployer invoke \
  --contract-address 0xec31b78ba4f4ccb1f66aa2c79e485bdfd33d02b8546824c69c1bf5fd631531 \
  --function set_leaderboard_manager \
  --calldata 0x0088d4670b7a95fa716ea4147bac5043aca8224e23e791cc49965d0a18db101c

# SpeedMatchGameV3
sncast --account sepolia-deployer invoke \
  --contract-address 0x003d36988097b2afb178518d9a25c4d1d8af9502b903bff87cb160f607ab9678 \
  --function set_leaderboard_manager \
  --calldata 0x0033fceca352cc64a2ea831e618a289f0c6feb6710b720208f2a44b9e3350e34

# MemoryBlitzGameV3
sncast --account sepolia-deployer invoke \
  --contract-address 0x01fd2685441d644697e0ef58836276f1e4ae0ef5e671bbf265f0d46eb04f072a \
  --function set_leaderboard_manager \
  --calldata 0x078cac47d063247203b59555b1344bd210c9cad9c34fb0e4d76d18f1cdfbc211
```

### Contract Verification
All contracts can be verified using voyager-verifier:

```bash
# AirdropFundsV3
voyager verify --network sepolia --class-hash 0x67dceef45d2a4e8806fe23d4adc51630a714a26fb2cf563e8cd31ccfcfeb51a --contract-name AirdropFundsV3

# PredictionMarketV3
voyager verify --network sepolia --class-hash 0x52486a5cd89816864e77313fb6b5219a981a80f1fca4db0e5505a9141b09739 --contract-name PredictionMarketV3

# GamePaymentHandler
voyager verify --network sepolia --class-hash 0x7216329c9f7a43ba2123bfb962974ec29ebb05ebefa8a526568a4c4cf68ee44 --contract-name GamePaymentHandler

# ColorMatchGameV3
voyager verify --network sepolia --class-hash 0x49f332246be1637f6705ffe45a71e7bfa21b5bad88f150a1468d19354ca07c2 --contract-name ColorMatchGameV3

# SpeedMatchGameV3
voyager verify --network sepolia --class-hash 0x07a628068df2ca1fbf9e48b42f54d57bc9adfff05ccbaf7ec5bf03540f2aa3a8 --contract-name SpeedMatchGameV3

# MemoryBlitzGameV3
voyager verify --network sepolia --class-hash 0x00634b3ea6a80b68f2614183276492df0e9f792f51fd5008276071214a9721a0 --contract-name MemoryBlitzGameV3

# LeaderboardManager
voyager verify --network sepolia --class-hash 0x008e72254fbde13a0a354e2c809e8359282ae6067a5409814846f24c0b7a4aeb --contract-name LeaderboardManager
```

## Architecture Overview

### V3 Improvements
- **Centralized Payment:** GamePaymentHandler manages all game fees
- **Modular Leaderboards:** Separate LeaderboardManager contracts per game
- **Optional Leaderboards:** Games work with or without leaderboards (0x0)
- **Reduced Complexity:** Games deployed first with 0x0, leaderboards added later
- **Better Testing:** Each component can be tested independently

### Payment Flow
1. Player calls `start_game()` on Game contract
2. Game contract calls `charge_game_fee()` on PaymentHandler
3. PaymentHandler transfers tokens and tracks fees
4. Player plays game and calls `submit_score()`
5. If leaderboard exists, score is added to leaderboard

### Contract Dependencies
- **Games → PaymentHandler:** Required (non-zero)
- **Games → LeaderboardManager:** Optional (can be 0x0, set later)
- **LeaderboardManager → Game:** Required (non-zero)
- **PaymentHandler → Airdrop:** Required (non-zero)
- **PaymentHandler → PredictionMarket:** Required (non-zero)

## Contract Source Code

All contract source code is available at:
- V3 Contracts: `/packages/snfoundry/contracts/src/v3/`
- Cairo Version: 2.12.0
- Scarb Version: 2.12.2
- Starknet Foundry: 0.49.0

## Fixes Applied
1. **Circular Dependency Resolution:** Games check if leaderboard is non-zero before calling
2. **Compilation Fix:** Added `use core::num::traits::Zero` import
3. **Deployment Script Fix:** Allow `leaderboard_manager` parameter to be 0x0
4. **Constructor Validation:** Updated to skip zero-address check for `leaderboard_manager`

## Testing Status
- ✅ All contracts compiled successfully
- ✅ All contracts deployed to Sepolia (9/9 contracts)
- ✅ Post-deployment setup: 2/3 games linked to leaderboards
  - ✅ SpeedMatchGameV3 → LeaderboardManager (TX: 0x058a7269d545e0486e614ba36e02623655f0323601c1ab56b82bbe8d9d63127a)
  - ✅ MemoryBlitzGameV3 → LeaderboardManager (TX: 0x06a2d2872c8f6815ff719c860cf1afafd99ce8d331b4235706a973144f571008)
  - ⏳ ColorMatchGameV3 → LeaderboardManager (pending - contract needs indexing, retry later)
- ✅ Contract verification with voyager (7/7 classes verified)
  - ✅ AirdropFundsV3 (https://voyager.online/class/0x067dceef45d2a4e8806fe23d4adc51630a714a26fb2cf563e8cd31ccfcfeb51a)
  - ✅ PredictionMarketV3
  - ✅ GamePaymentHandler
  - ✅ ColorMatchGameV3 (https://voyager.online/class/0x049f332246be1637f6705ffe45a71e7bfa21b5bad88f150a1468d19354ca07c2)
  - ✅ SpeedMatchGameV3
  - ✅ MemoryBlitzGameV3
  - ✅ LeaderboardManager (https://voyager.online/class/0x008e72254fbde13a0a354e2c809e8359282ae6067a5409814846f24c0b7a4aeb)
- ⏳ Integration testing - **PENDING**
