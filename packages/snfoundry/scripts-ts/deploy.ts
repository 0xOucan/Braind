import {
  deployContract,
  executeDeployCalls,
  exportDeployments,
  deployer,
} from "./deploy-contract";
import { green, yellow, red } from "./helpers/colorize-log";

/**
 * Deploy V3 BrainD Ecosystem Contracts
 *
 * Deployment Order:
 * 1. AirdropFundsV3
 * 2. PredictionMarketV3
 * 3. GamePaymentHandler (needs airdrop + prediction addresses)
 * 4. LeaderboardManagers × 3 (one per game)
 * 5. Game Contracts × 3 (need payment handler + leaderboard)
 * 6. Configuration (authorize contracts, set fees)
 */
const deployV3Script = async (): Promise<void> => {
  console.log(green("🚀 Starting V3 Contract Deployment"));
  console.log(yellow(`Deployer Address: ${deployer.address}`));

  // Devnet token addresses (pre-deployed)
  const STRK_TOKEN = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
  const ETH_TOKEN = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

  // Game fee: 0.01 STRK (10000000000000000 wei)
  const GAME_FEE = "10000000000000000";

  try {
    // =====================================
    // STEP 1: Deploy Supporting Contracts
    // =====================================
    console.log(green("\n📦 Step 1: Deploying Supporting Contracts"));

    // 1.1 AirdropFundsV3
    console.log(yellow("Deploying AirdropFundsV3..."));
    const airdropFunds = await deployContract({
      contract: "AirdropFundsV3",
      contractName: "AirdropFundsV3",
      constructorArgs: {
        owner: deployer.address,
      },
    });
    console.log(green(`✅ AirdropFundsV3 deployed: ${airdropFunds.address}`));

    // 1.2 PredictionMarketV3
    console.log(yellow("Deploying PredictionMarketV3..."));
    const predictionMarket = await deployContract({
      contract: "PredictionMarketV3",
      contractName: "PredictionMarketV3",
      constructorArgs: {
        owner: deployer.address,
      },
    });
    console.log(green(`✅ PredictionMarketV3 deployed: ${predictionMarket.address}`));

    // =====================================
    // STEP 2: Deploy Core Infrastructure
    // =====================================
    console.log(green("\n🏗️  Step 2: Deploying Core Infrastructure"));

    // 2.1 GamePaymentHandler
    console.log(yellow("Deploying GamePaymentHandler..."));
    const paymentHandler = await deployContract({
      contract: "GamePaymentHandler",
      contractName: "GamePaymentHandler",
      constructorArgs: {
        owner: deployer.address,
        airdrop: airdropFunds.address,
        prediction_market: predictionMarket.address,
      },
    });
    console.log(green(`✅ GamePaymentHandler deployed: ${paymentHandler.address}`));

    // =====================================
    // STEP 3: Deploy Leaderboard Managers
    // =====================================
    console.log(green("\n📊 Step 3: Deploying Leaderboard Managers"));

    // 3.1 ColorMatch Leaderboard
    console.log(yellow("Deploying LeaderboardManager for ColorMatch..."));
    const leaderboardColorMatch = await deployContract({
      contract: "LeaderboardManager",
      contractName: "LeaderboardManagerColorMatch",
      constructorArgs: {
        owner: deployer.address,
        game_contract: "0x0", // Placeholder, will be updated after game deployment
        max_size: 100,
      },
    });
    console.log(green(`✅ LeaderboardManagerColorMatch deployed: ${leaderboardColorMatch.address}`));

    // 3.2 SpeedMatch Leaderboard
    console.log(yellow("Deploying LeaderboardManager for SpeedMatch..."));
    const leaderboardSpeedMatch = await deployContract({
      contract: "LeaderboardManager",
      contractName: "LeaderboardManagerSpeedMatch",
      constructorArgs: {
        owner: deployer.address,
        game_contract: "0x0", // Placeholder
        max_size: 100,
      },
    });
    console.log(green(`✅ LeaderboardManagerSpeedMatch deployed: ${leaderboardSpeedMatch.address}`));

    // 3.3 MemoryBlitz Leaderboard
    console.log(yellow("Deploying LeaderboardManager for MemoryBlitz..."));
    const leaderboardMemoryBlitz = await deployContract({
      contract: "LeaderboardManager",
      contractName: "LeaderboardManagerMemoryBlitz",
      constructorArgs: {
        owner: deployer.address,
        game_contract: "0x0", // Placeholder
        max_size: 100,
      },
    });
    console.log(green(`✅ LeaderboardManagerMemoryBlitz deployed: ${leaderboardMemoryBlitz.address}`));

    // =====================================
    // STEP 4: Deploy Game Contracts
    // =====================================
    console.log(green("\n🎮 Step 4: Deploying Game Contracts"));

    // 4.1 ColorMatchGameV3
    console.log(yellow("Deploying ColorMatchGameV3..."));
    const colorMatchGame = await deployContract({
      contract: "ColorMatchGameV3",
      contractName: "ColorMatchGameV3",
      constructorArgs: {
        owner: deployer.address,
        payment_handler: paymentHandler.address,
        leaderboard_manager: leaderboardColorMatch.address,
      },
    });
    console.log(green(`✅ ColorMatchGameV3 deployed: ${colorMatchGame.address}`));

    // 4.2 SpeedMatchGameV3
    console.log(yellow("Deploying SpeedMatchGameV3..."));
    const speedMatchGame = await deployContract({
      contract: "SpeedMatchGameV3",
      contractName: "SpeedMatchGameV3",
      constructorArgs: {
        owner: deployer.address,
        payment_handler: paymentHandler.address,
        leaderboard_manager: leaderboardSpeedMatch.address,
      },
    });
    console.log(green(`✅ SpeedMatchGameV3 deployed: ${speedMatchGame.address}`));

    // 4.3 MemoryBlitzGameV3
    console.log(yellow("Deploying MemoryBlitzGameV3..."));
    const memoryBlitzGame = await deployContract({
      contract: "MemoryBlitzGameV3",
      contractName: "MemoryBlitzGameV3",
      constructorArgs: {
        owner: deployer.address,
        payment_handler: paymentHandler.address,
        leaderboard_manager: leaderboardMemoryBlitz.address,
      },
    });
    console.log(green(`✅ MemoryBlitzGameV3 deployed: ${memoryBlitzGame.address}`));

    // =====================================
    // STEP 5: Configuration
    // =====================================
    console.log(green("\n⚙️  Step 5: Configuring Contracts"));

    // TODO: Add configuration calls here
    // These will be execute_calls to:
    // - Authorize games in GamePaymentHandler
    // - Authorize games in PredictionMarket
    // - Authorize GamePaymentHandler in AirdropFunds
    // - Set game fees
    // - Update leaderboard game_contract addresses

    console.log(yellow("Configuration calls needed (manual for now):"));
    console.log(yellow(`1. paymentHandler.authorize_game(${colorMatchGame.address})`));
    console.log(yellow(`2. paymentHandler.authorize_game(${speedMatchGame.address})`));
    console.log(yellow(`3. paymentHandler.authorize_game(${memoryBlitzGame.address})`));
    console.log(yellow(`4. paymentHandler.set_game_fee(${STRK_TOKEN}, ${GAME_FEE})`));
    console.log(yellow(`5. predictionMarket.authorize_game_contract(${colorMatchGame.address})`));
    console.log(yellow(`6. predictionMarket.authorize_game_contract(${speedMatchGame.address})`));
    console.log(yellow(`7. predictionMarket.authorize_game_contract(${memoryBlitzGame.address})`));
    console.log(yellow(`8. airdropFunds.add_authorized_depositor(${paymentHandler.address})`));

    // =====================================
    // STEP 6: Summary
    // =====================================
    console.log(green("\n✨ V3 Deployment Complete!"));
    console.log(green("====================================="));
    console.log(green("Deployed Contracts:"));
    console.log(yellow(`AirdropFundsV3: ${airdropFunds.address}`));
    console.log(yellow(`PredictionMarketV3: ${predictionMarket.address}`));
    console.log(yellow(`GamePaymentHandler: ${paymentHandler.address}`));
    console.log(yellow(`LeaderboardManagerColorMatch: ${leaderboardColorMatch.address}`));
    console.log(yellow(`LeaderboardManagerSpeedMatch: ${leaderboardSpeedMatch.address}`));
    console.log(yellow(`LeaderboardManagerMemoryBlitz: ${leaderboardMemoryBlitz.address}`));
    console.log(yellow(`ColorMatchGameV3: ${colorMatchGame.address}`));
    console.log(yellow(`SpeedMatchGameV3: ${speedMatchGame.address}`));
    console.log(yellow(`MemoryBlitzGameV3: ${memoryBlitzGame.address}`));
    console.log(green("====================================="));

    console.log(green("\n📝 Next Steps:"));
    console.log(yellow("1. Run configuration transactions (see above)"));
    console.log(yellow("2. Update deployedContracts.ts with these addresses"));
    console.log(yellow("3. Test game flow on devnet"));
    console.log(yellow("4. Update frontend to use V3 contracts"));

  } catch (error) {
    console.error(red("❌ Deployment failed:"), error);
    throw error;
  }
};

deployV3Script()
  .then(() => {
    console.log(green("✅ Script completed successfully"));
    process.exit(0);
  })
  .catch((error) => {
    console.error(red("❌ Script failed:"), error);
    process.exit(1);
  });

export default deployV3Script;
