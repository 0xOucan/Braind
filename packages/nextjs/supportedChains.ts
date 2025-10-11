import * as chains from "@starknet-react/chains";

const rpcUrlDevnet =
  process.env.NEXT_PUBLIC_DEVNET_PROVIDER_URL || "http://127.0.0.1:5050";

const rpcUrlSepolia =
  process.env.NEXT_PUBLIC_SEPOLIA_PROVIDER_URL ||
  "https://starknet-sepolia.public.blastapi.io/rpc/v0_9";

const rpcUrlMainnet =
  process.env.NEXT_PUBLIC_MAINNET_PROVIDER_URL ||
  "https://starknet-mainnet.public.blastapi.io/rpc/v0_7";

// Local development with mainnet contracts
// This configuration allows you to test locally while connecting to real mainnet contracts
const mainnetFork = {
  id: BigInt("0x534e5f4d41494e"), // Mainnet chain ID
  network: "mainnet",
  name: "Starknet Mainnet (Local)",
  nativeCurrency: {
    address:
      "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    name: "STRK",
    symbol: "STRK",
    decimals: 18,
  },
  testnet: false,
  rpcUrls: {
    default: {
      http: [rpcUrlMainnet],
    },
    public: {
      http: [rpcUrlMainnet],
    },
  },
  paymasterRpcUrls: {
    default: {
      http: [],
    },
  },
} as chains.Chain;

const devnet = {
  ...chains.devnet,
  rpcUrls: {
    default: {
      http: [],
    },
    public: {
      http: [`${rpcUrlDevnet}/rpc`],
    },
  },
} as const satisfies chains.Chain;

const sepolia = {
  ...chains.sepolia,
  rpcUrls: {
    default: {
      http: [rpcUrlSepolia],
    },
    public: {
      http: [rpcUrlSepolia],
    },
  },
} as const satisfies chains.Chain;

export const supportedChains = { ...chains, devnet, sepolia, mainnetFork };
