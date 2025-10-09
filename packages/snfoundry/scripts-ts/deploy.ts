import {
  deployContract,
  executeDeployCalls,
  exportDeployments,
  deployer,
  assertDeployerDefined,
  assertRpcNetworkActive,
  assertDeployerSignable,
} from "./deploy-contract";
import { green } from "./helpers/colorize-log";

/**
 * Deploy a contract using the specified parameters.
 *
 * @example (deploy contract with constructorArgs)
 * const deployScript = async (): Promise<void> => {
 *   await deployContract(
 *     {
 *       contract: "YourContract",
 *       contractName: "YourContractExportName",
 *       constructorArgs: {
 *         owner: deployer.address,
 *       },
 *       options: {
 *         maxFee: BigInt(1000000000000)
 *       }
 *     }
 *   );
 * };
 *
 * @example (deploy contract without constructorArgs)
 * const deployScript = async (): Promise<void> => {
 *   await deployContract(
 *     {
 *       contract: "YourContract",
 *       contractName: "YourContractExportName",
 *       options: {
 *         maxFee: BigInt(1000000000000)
 *       }
 *     }
 *   );
 * };
 *
 *
 * @returns {Promise<void>}
 */
const deployScript = async (): Promise<void> => {
  // Mainnet token addresses
  // STRK: Official STRK token on Starknet mainnet
  const STARK_TOKEN = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
  // USDC: Bridged USDC on Starknet mainnet
  const USDC_TOKEN = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
  // ETH: Ethereum token on Starknet mainnet
  const ETH_TOKEN = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

  // Deploy AirdropFunds first (needed by PredictionMarket)
  const airdropFunds = await deployContract({
    contract: "AirdropFunds",
    contractName: "AirdropFunds",
    constructorArgs: {
      owner: deployer.address,
    },
  });

  // Deploy PredictionMarket
  await deployContract({
    contract: "PredictionMarket",
    contractName: "PredictionMarket",
    constructorArgs: {
      owner: deployer.address,
      airdrop_contract: airdropFunds.address,
    },
  });

  // Deploy V2 Game Contracts (Round-based with prize distribution)
  await deployContract({
    contract: "ColorMatchGameV2",
    contractName: "ColorMatchGameV2",
    constructorArgs: {
      owner: deployer.address,
      stark_token: STARK_TOKEN,
      usdc_token: USDC_TOKEN,
      eth_token: ETH_TOKEN,
      airdrop_contract: airdropFunds.address,
    },
  });

  await deployContract({
    contract: "SpeedMatchGameV2",
    contractName: "SpeedMatchGameV2",
    constructorArgs: {
      owner: deployer.address,
      stark_token: STARK_TOKEN,
      usdc_token: USDC_TOKEN,
      eth_token: ETH_TOKEN,
      airdrop_contract: airdropFunds.address,
    },
  });

  await deployContract({
    contract: "MemoryBlitzGameV2",
    contractName: "MemoryBlitzGameV2",
    constructorArgs: {
      owner: deployer.address,
      stark_token: STARK_TOKEN,
      usdc_token: USDC_TOKEN,
      eth_token: ETH_TOKEN,
      airdrop_contract: airdropFunds.address,
    },
  });

  // Deploy V1 Game Contracts (Simple payment) - Optional
  await deployContract({
    contract: "MemoryBlitzGame",
    contractName: "MemoryBlitzGameV1",
    constructorArgs: {
      owner: deployer.address,
      stark_token: STARK_TOKEN,
      usdc_token: USDC_TOKEN,
      eth_token: ETH_TOKEN,
    },
  });

  await deployContract({
    contract: "SpeedMatchGame",
    contractName: "SpeedMatchGameV1",
    constructorArgs: {
      owner: deployer.address,
      stark_token: STARK_TOKEN,
      usdc_token: USDC_TOKEN,
      eth_token: ETH_TOKEN,
    },
  });
};

const main = async (): Promise<void> => {
  try {
    assertDeployerDefined();

    await Promise.all([assertRpcNetworkActive(), assertDeployerSignable()]);

    await deployScript();
    await executeDeployCalls();
    exportDeployments();

    console.log(green("All Setup Done!"));
  } catch (err) {
    console.log(err);
    process.exit(1); //exit with error so that non subsequent scripts are run
  }
};

main();
