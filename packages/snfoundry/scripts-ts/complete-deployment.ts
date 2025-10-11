import { deployContract } from "./deploy-contract";
import { green, yellow } from "./helpers/colorize-log";
import { deployer } from "./deploy-contract";

const AIRDROP = "0x79bf4e98b25d585238066de2bb6984bf885cd379d8fef18f81af559a264c589";
const PREDICTION = "0x2f7d11253b52f0b7b733b5b904bdc3702c833982e5c6e63d7792e6053c483f0";
const PAYMENT = "0x23de23a7f6271e87df4e82c7cff674d0837b2eee12893e4e2ca3fff105b5e6b";

async function finishDeployment() {
  console.log(green("\n🎮 Step 1: Deploy Game Contracts"));

  // Deploy ColorMatchGameV3
  console.log(yellow("Deploying ColorMatchGameV3..."));
  const colorMatch = await deployContract({
    contract: "ColorMatchGameV3",
    contractName: "ColorMatchGameV3",
    constructorArgs: {
      owner: deployer.address,
      payment_handler: PAYMENT,
      leaderboard_manager: "0x0", // Will be set later
    },
  });
  console.log(green(`✅ ColorMatchGameV3: ${colorMatch.address}`));

  // Deploy SpeedMatchGameV3
  console.log(yellow("Deploying SpeedMatchGameV3..."));
  const speedMatch = await deployContract({
    contract: "SpeedMatchGameV3",
    contractName: "SpeedMatchGameV3",
    constructorArgs: {
      owner: deployer.address,
      payment_handler: PAYMENT,
      leaderboard_manager: "0x0", // Will be set later
    },
  });
  console.log(green(`✅ SpeedMatchGameV3: ${speedMatch.address}`));

  // Deploy MemoryBlitzGameV3
  console.log(yellow("Deploying MemoryBlitzGameV3..."));
  const memoryBlitz = await deployContract({
    contract: "MemoryBlitzGameV3",
    contractName: "MemoryBlitzGameV3",
    constructorArgs: {
      owner: deployer.address,
      payment_handler: PAYMENT,
      leaderboard_manager: "0x0", // Will be set later
    },
  });
  console.log(green(`✅ MemoryBlitzGameV3: ${memoryBlitz.address}`));

  console.log(green("\n📊 Step 2: Deploy Leaderboard Managers"));

  // Deploy LeaderboardManager for ColorMatch
  console.log(yellow("Deploying ColorMatch LeaderboardManager..."));
  const leaderboardColorMatch = await deployContract({
    contract: "LeaderboardManagerV3",
    contractName: "LeaderboardManagerColorMatch",
    constructorArgs: {
      owner: deployer.address,
      game_contract: colorMatch.address,
      max_size: 100,
    },
  });
  console.log(green(`✅ ColorMatch Leaderboard: ${leaderboardColorMatch.address}`));

  // Deploy LeaderboardManager for SpeedMatch
  console.log(yellow("Deploying SpeedMatch LeaderboardManager..."));
  const leaderboardSpeedMatch = await deployContract({
    contract: "LeaderboardManagerV3",
    contractName: "LeaderboardManagerSpeedMatch",
    constructorArgs: {
      owner: deployer.address,
      game_contract: speedMatch.address,
      max_size: 100,
    },
  });
  console.log(green(`✅ SpeedMatch Leaderboard: ${leaderboardSpeedMatch.address}`));

  // Deploy LeaderboardManager for MemoryBlitz
  console.log(yellow("Deploying MemoryBlitz LeaderboardManager..."));
  const leaderboardMemoryBlitz = await deployContract({
    contract: "LeaderboardManagerV3",
    contractName: "LeaderboardManagerMemoryBlitz",
    constructorArgs: {
      owner: deployer.address,
      game_contract: memoryBlitz.address,
      max_size: 100,
    },
  });
  console.log(green(`✅ MemoryBlitz Leaderboard: ${leaderboardMemoryBlitz.address}`));

  console.log(green("\n✅ All V3 Contracts Deployed!"));
  console.log("\nDeployment Summary:");
  console.log("AirdropFundsV3:", AIRDROP);
  console.log("PredictionMarketV3:", PREDICTION);
  console.log("GamePaymentHandler:", PAYMENT);
  console.log("ColorMatchGameV3:", colorMatch.address);
  console.log("SpeedMatchGameV3:", speedMatch.address);
  console.log("MemoryBlitzGameV3:", memoryBlitz.address);
  console.log("ColorMatch Leaderboard:", leaderboardColorMatch.address);
  console.log("SpeedMatch Leaderboard:", leaderboardSpeedMatch.address);
  console.log("MemoryBlitz Leaderboard:", leaderboardMemoryBlitz.address);
}

finishDeployment().catch(console.error);
