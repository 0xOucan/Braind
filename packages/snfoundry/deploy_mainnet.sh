#!/bin/bash
# BrainD Contracts Deployment Script for Starknet Mainnet
# Generated: 2025-10-09

set -e  # Exit on error

# Token addresses on Starknet Mainnet
STRK_TOKEN="0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
USDC_TOKEN="0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8"
ETH_TOKEN="0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"

# Owner address (your mainnet-deployer account)
OWNER="0x04190830986542df66313B9A6e8Faa0A3471DDc7C7447C3390Fca7055d9eCf8a"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  BrainD Smart Contracts - Mainnet Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Ensure we're using the correct Scarb version
export PATH="$HOME/.asdf/shims:$PATH"

cd /home/oucan/TheBrainD/packages/snfoundry/contracts

# Create file to store deployed addresses
DEPLOYMENT_FILE="deployed_contracts_mainnet.txt"
echo "# BrainD Mainnet Deployed Contracts - $(date)" > $DEPLOYMENT_FILE
echo "# Network: Starknet Mainnet" >> $DEPLOYMENT_FILE
echo "" >> $DEPLOYMENT_FILE

# ============================================================================
# 1. AirdropFunds (Already declared)
# ============================================================================
echo -e "${GREEN}[1/10] Deploying AirdropFunds...${NC}"
AIRDROP_CLASS_HASH="0x021e07b36ba7d70633dcae23e6b3a8904226909feabf35e0441eb896f37c9386"

AIRDROP_DEPLOY=$(sncast deploy \
  --class-hash $AIRDROP_CLASS_HASH \
  --constructor-calldata $OWNER \
  --network mainnet 2>&1)

AIRDROP_ADDRESS=$(echo "$AIRDROP_DEPLOY" | grep -oP 'contract_address: \K0x[0-9a-fA-F]+' || echo "FAILED")

if [ "$AIRDROP_ADDRESS" != "FAILED" ]; then
    echo -e "${GREEN}✅ AirdropFunds deployed: $AIRDROP_ADDRESS${NC}"
    echo "AIRDROP_FUNDS=$AIRDROP_ADDRESS" >> $DEPLOYMENT_FILE
else
    echo -e "${YELLOW}⚠️  AirdropFunds deployment failed or pending${NC}"
    echo "AIRDROP_FUNDS=PENDING" >> $DEPLOYMENT_FILE
fi
echo ""

# ============================================================================
# 2. BrainDGameManager
# ============================================================================
echo -e "${GREEN}[2/10] Declaring and Deploying BrainDGameManager...${NC}"

MANAGER_DECLARE=$(sncast declare --contract-name BrainDGameManager --network mainnet 2>&1)
MANAGER_CLASS_HASH=$(echo "$MANAGER_DECLARE" | grep -oP 'Class Hash:\s+\K0x[0-9a-fA-F]+')

echo "Class Hash: $MANAGER_CLASS_HASH"

MANAGER_DEPLOY=$(sncast deploy \
  --class-hash $MANAGER_CLASS_HASH \
  --constructor-calldata $OWNER \
  --network mainnet 2>&1)

MANAGER_ADDRESS=$(echo "$MANAGER_DEPLOY" | grep -oP 'contract_address: \K0x[0-9a-fA-F]+' || echo "FAILED")

if [ "$MANAGER_ADDRESS" != "FAILED" ]; then
    echo -e "${GREEN}✅ BrainDGameManager deployed: $MANAGER_ADDRESS${NC}"
    echo "BRAIND_GAME_MANAGER=$MANAGER_ADDRESS" >> $DEPLOYMENT_FILE
else
    echo -e "${YELLOW}⚠️  BrainDGameManager deployment failed or pending${NC}"
    echo "BRAIND_GAME_MANAGER=PENDING" >> $DEPLOYMENT_FILE
    MANAGER_ADDRESS="0x0"  # Default for next contracts
fi
echo ""

# ============================================================================
# 3. ColorMatchGame (V1)
# ============================================================================
echo -e "${GREEN}[3/10] Declaring and Deploying ColorMatchGame (V1)...${NC}"

COLOR_V1_DECLARE=$(sncast declare --contract-name ColorMatchGame --network mainnet 2>&1)
COLOR_V1_CLASS_HASH=$(echo "$COLOR_V1_DECLARE" | grep -oP 'Class Hash:\s+\K0x[0-9a-fA-F]+')

echo "Class Hash: $COLOR_V1_CLASS_HASH"

COLOR_V1_DEPLOY=$(sncast deploy \
  --class-hash $COLOR_V1_CLASS_HASH \
  --constructor-calldata $OWNER $MANAGER_ADDRESS $STRK_TOKEN \
  --network mainnet 2>&1)

COLOR_V1_ADDRESS=$(echo "$COLOR_V1_DEPLOY" | grep -oP 'contract_address: \K0x[0-9a-fA-F]+' || echo "FAILED")

if [ "$COLOR_V1_ADDRESS" != "FAILED" ]; then
    echo -e "${GREEN}✅ ColorMatchGame (V1) deployed: $COLOR_V1_ADDRESS${NC}"
    echo "COLOR_MATCH_GAME_V1=$COLOR_V1_ADDRESS" >> $DEPLOYMENT_FILE
else
    echo -e "${YELLOW}⚠️  ColorMatchGame (V1) deployment failed or pending${NC}"
    echo "COLOR_MATCH_GAME_V1=PENDING" >> $DEPLOYMENT_FILE
fi
echo ""

# ============================================================================
# 4. ColorMatchGameV2
# ============================================================================
echo -e "${GREEN}[4/10] Declaring and Deploying ColorMatchGameV2...${NC}"

COLOR_V2_DECLARE=$(sncast declare --contract-name ColorMatchGameV2 --network mainnet 2>&1)
COLOR_V2_CLASS_HASH=$(echo "$COLOR_V2_DECLARE" | grep -oP 'Class Hash:\s+\K0x[0-9a-fA-F]+')

echo "Class Hash: $COLOR_V2_CLASS_HASH"

COLOR_V2_DEPLOY=$(sncast deploy \
  --class-hash $COLOR_V2_CLASS_HASH \
  --constructor-calldata $OWNER $STRK_TOKEN $USDC_TOKEN $ETH_TOKEN $AIRDROP_ADDRESS \
  --network mainnet 2>&1)

COLOR_V2_ADDRESS=$(echo "$COLOR_V2_DEPLOY" | grep -oP 'contract_address: \K0x[0-9a-fA-F]+' || echo "FAILED")

if [ "$COLOR_V2_ADDRESS" != "FAILED" ]; then
    echo -e "${GREEN}✅ ColorMatchGameV2 deployed: $COLOR_V2_ADDRESS${NC}"
    echo "COLOR_MATCH_GAME_V2=$COLOR_V2_ADDRESS" >> $DEPLOYMENT_FILE
else
    echo -e "${YELLOW}⚠️  ColorMatchGameV2 deployment failed or pending${NC}"
    echo "COLOR_MATCH_GAME_V2=PENDING" >> $DEPLOYMENT_FILE
fi
echo ""

# ============================================================================
# 5. MemoryBlitzGame (V1)
# ============================================================================
echo -e "${GREEN}[5/10] Declaring and Deploying MemoryBlitzGame (V1)...${NC}"

MEMORY_V1_DECLARE=$(sncast declare --contract-name MemoryBlitzGame --network mainnet 2>&1)
MEMORY_V1_CLASS_HASH=$(echo "$MEMORY_V1_DECLARE" | grep -oP 'Class Hash:\s+\K0x[0-9a-fA-F]+')

echo "Class Hash: $MEMORY_V1_CLASS_HASH"

MEMORY_V1_DEPLOY=$(sncast deploy \
  --class-hash $MEMORY_V1_CLASS_HASH \
  --constructor-calldata $OWNER $STRK_TOKEN $USDC_TOKEN $ETH_TOKEN \
  --network mainnet 2>&1)

MEMORY_V1_ADDRESS=$(echo "$MEMORY_V1_DEPLOY" | grep -oP 'contract_address: \K0x[0-9a-fA-F]+' || echo "FAILED")

if [ "$MEMORY_V1_ADDRESS" != "FAILED" ]; then
    echo -e "${GREEN}✅ MemoryBlitzGame (V1) deployed: $MEMORY_V1_ADDRESS${NC}"
    echo "MEMORY_BLITZ_GAME_V1=$MEMORY_V1_ADDRESS" >> $DEPLOYMENT_FILE
else
    echo -e "${YELLOW}⚠️  MemoryBlitzGame (V1) deployment failed or pending${NC}"
    echo "MEMORY_BLITZ_GAME_V1=PENDING" >> $DEPLOYMENT_FILE
fi
echo ""

# ============================================================================
# 6. MemoryBlitzGameV2
# ============================================================================
echo -e "${GREEN}[6/10] Declaring and Deploying MemoryBlitzGameV2...${NC}"

MEMORY_V2_DECLARE=$(sncast declare --contract-name MemoryBlitzGameV2 --network mainnet 2>&1)
MEMORY_V2_CLASS_HASH=$(echo "$MEMORY_V2_DECLARE" | grep -oP 'Class Hash:\s+\K0x[0-9a-fA-F]+')

echo "Class Hash: $MEMORY_V2_CLASS_HASH"

MEMORY_V2_DEPLOY=$(sncast deploy \
  --class-hash $MEMORY_V2_CLASS_HASH \
  --constructor-calldata $OWNER $STRK_TOKEN $USDC_TOKEN $ETH_TOKEN $AIRDROP_ADDRESS \
  --network mainnet 2>&1)

MEMORY_V2_ADDRESS=$(echo "$MEMORY_V2_DEPLOY" | grep -oP 'contract_address: \K0x[0-9a-fA-F]+' || echo "FAILED")

if [ "$MEMORY_V2_ADDRESS" != "FAILED" ]; then
    echo -e "${GREEN}✅ MemoryBlitzGameV2 deployed: $MEMORY_V2_ADDRESS${NC}"
    echo "MEMORY_BLITZ_GAME_V2=$MEMORY_V2_ADDRESS" >> $DEPLOYMENT_FILE
else
    echo -e "${YELLOW}⚠️  MemoryBlitzGameV2 deployment failed or pending${NC}"
    echo "MEMORY_BLITZ_GAME_V2=PENDING" >> $DEPLOYMENT_FILE
fi
echo ""

# ============================================================================
# 7. PredictionMarket
# ============================================================================
echo -e "${GREEN}[7/10] Declaring and Deploying PredictionMarket...${NC}"

PREDICTION_DECLARE=$(sncast declare --contract-name PredictionMarket --network mainnet 2>&1)
PREDICTION_CLASS_HASH=$(echo "$PREDICTION_DECLARE" | grep -oP 'Class Hash:\s+\K0x[0-9a-fA-F]+')

echo "Class Hash: $PREDICTION_CLASS_HASH"

PREDICTION_DEPLOY=$(sncast deploy \
  --class-hash $PREDICTION_CLASS_HASH \
  --constructor-calldata $OWNER $AIRDROP_ADDRESS \
  --network mainnet 2>&1)

PREDICTION_ADDRESS=$(echo "$PREDICTION_DEPLOY" | grep -oP 'contract_address: \K0x[0-9a-fA-F]+' || echo "FAILED")

if [ "$PREDICTION_ADDRESS" != "FAILED" ]; then
    echo -e "${GREEN}✅ PredictionMarket deployed: $PREDICTION_ADDRESS${NC}"
    echo "PREDICTION_MARKET=$PREDICTION_ADDRESS" >> $DEPLOYMENT_FILE
else
    echo -e "${YELLOW}⚠️  PredictionMarket deployment failed or pending${NC}"
    echo "PREDICTION_MARKET=PENDING" >> $DEPLOYMENT_FILE
fi
echo ""

# ============================================================================
# 8. SpeedMatchGame (V1)
# ============================================================================
echo -e "${GREEN}[8/10] Declaring and Deploying SpeedMatchGame (V1)...${NC}"

SPEED_V1_DECLARE=$(sncast declare --contract-name SpeedMatchGame --network mainnet 2>&1)
SPEED_V1_CLASS_HASH=$(echo "$SPEED_V1_DECLARE" | grep -oP 'Class Hash:\s+\K0x[0-9a-fA-F]+')

echo "Class Hash: $SPEED_V1_CLASS_HASH"

SPEED_V1_DEPLOY=$(sncast deploy \
  --class-hash $SPEED_V1_CLASS_HASH \
  --constructor-calldata $OWNER $STRK_TOKEN $USDC_TOKEN $ETH_TOKEN \
  --network mainnet 2>&1)

SPEED_V1_ADDRESS=$(echo "$SPEED_V1_DEPLOY" | grep -oP 'contract_address: \K0x[0-9a-fA-F]+' || echo "FAILED")

if [ "$SPEED_V1_ADDRESS" != "FAILED" ]; then
    echo -e "${GREEN}✅ SpeedMatchGame (V1) deployed: $SPEED_V1_ADDRESS${NC}"
    echo "SPEED_MATCH_GAME_V1=$SPEED_V1_ADDRESS" >> $DEPLOYMENT_FILE
else
    echo -e "${YELLOW}⚠️  SpeedMatchGame (V1) deployment failed or pending${NC}"
    echo "SPEED_MATCH_GAME_V1=PENDING" >> $DEPLOYMENT_FILE
fi
echo ""

# ============================================================================
# 9. SpeedMatchGameV2
# ============================================================================
echo -e "${GREEN}[9/10] Declaring and Deploying SpeedMatchGameV2...${NC}"

SPEED_V2_DECLARE=$(sncast declare --contract-name SpeedMatchGameV2 --network mainnet 2>&1)
SPEED_V2_CLASS_HASH=$(echo "$SPEED_V2_DECLARE" | grep -oP 'Class Hash:\s+\K0x[0-9a-fA-F]+')

echo "Class Hash: $SPEED_V2_CLASS_HASH"

SPEED_V2_DEPLOY=$(sncast deploy \
  --class-hash $SPEED_V2_CLASS_HASH \
  --constructor-calldata $OWNER $STRK_TOKEN $USDC_TOKEN $ETH_TOKEN $AIRDROP_ADDRESS \
  --network mainnet 2>&1)

SPEED_V2_ADDRESS=$(echo "$SPEED_V2_DEPLOY" | grep -oP 'contract_address: \K0x[0-9a-fA-F]+' || echo "FAILED")

if [ "$SPEED_V2_ADDRESS" != "FAILED" ]; then
    echo -e "${GREEN}✅ SpeedMatchGameV2 deployed: $SPEED_V2_ADDRESS${NC}"
    echo "SPEED_MATCH_GAME_V2=$SPEED_V2_ADDRESS" >> $DEPLOYMENT_FILE
else
    echo -e "${YELLOW}⚠️  SpeedMatchGameV2 deployment failed or pending${NC}"
    echo "SPEED_MATCH_GAME_V2=PENDING" >> $DEPLOYMENT_FILE
fi
echo ""

# ============================================================================
# 10. YourContract
# ============================================================================
echo -e "${GREEN}[10/10] Declaring and Deploying YourContract...${NC}"

YOUR_DECLARE=$(sncast declare --contract-name YourContract --network mainnet 2>&1)
YOUR_CLASS_HASH=$(echo "$YOUR_DECLARE" | grep -oP 'Class Hash:\s+\K0x[0-9a-fA-F]+')

echo "Class Hash: $YOUR_CLASS_HASH"

YOUR_DEPLOY=$(sncast deploy \
  --class-hash $YOUR_CLASS_HASH \
  --constructor-calldata $OWNER \
  --network mainnet 2>&1)

YOUR_ADDRESS=$(echo "$YOUR_DEPLOY" | grep -oP 'contract_address: \K0x[0-9a-fA-F]+' || echo "FAILED")

if [ "$YOUR_ADDRESS" != "FAILED" ]; then
    echo -e "${GREEN}✅ YourContract deployed: $YOUR_ADDRESS${NC}"
    echo "YOUR_CONTRACT=$YOUR_ADDRESS" >> $DEPLOYMENT_FILE
else
    echo -e "${YELLOW}⚠️  YourContract deployment failed or pending${NC}"
    echo "YOUR_CONTRACT=PENDING" >> $DEPLOYMENT_FILE
fi
echo ""

# ============================================================================
# Summary
# ============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Deployment Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Deployed contracts saved to: $DEPLOYMENT_FILE${NC}"
echo ""
cat $DEPLOYMENT_FILE
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update packages/nextjs/contracts/deployedContracts.ts with these addresses"
echo "2. Verify contracts on Starkscan"
echo "3. Test contract interactions on mainnet"
echo ""
