# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Scaffold-Stark 2 project - a modern development toolkit for building decentralized applications (dApps) on Starknet blockchain. It's built using NextJS, Starknet.js, Scarb, Starknet-React, and Starknet Foundry with TypeScript throughout.

## Architecture

### Monorepo Structure
- `packages/nextjs/` - Next.js frontend application with Starknet integration
- `packages/snfoundry/` - Smart contract development using Starknet Foundry
- `braind-platform/` - Additional platform components

### Key Technologies
- **Frontend**: Next.js 15, React 19, Tailwind CSS, daisyUI
- **Starknet Integration**: Starknet-React, Starknet.js 8.5.3
- **Smart Contracts**: Cairo with Starknet Foundry (Scarb, Snforge)
- **Development Tools**: TypeScript, Yarn workspaces, Husky

## Essential Commands

### Development Workflow
- `yarn chain` - Start local Starknet devnet (starknet-devnet)
- `yarn deploy` - Deploy smart contracts to local network
- `yarn start` - Start Next.js development server (http://localhost:3000)

### Smart Contract Development
- `yarn compile` - Compile Cairo smart contracts
- `yarn test` - Run smart contract tests with snforge
- `yarn deploy --network sepolia` - Deploy to Sepolia testnet
- `yarn deploy --network mainnet` - Deploy to mainnet
- `yarn verify --network <network>` - Verify contracts on block explorer

### Frontend Development
- `yarn next:lint` - Run Next.js linting
- `yarn next:check-types` - TypeScript type checking
- `yarn test:nextjs` - Run frontend tests with Vitest
- `yarn format` - Format code (both frontend and contracts)
- `yarn format:check` - Check code formatting

### Deployment
- `yarn vercel` - Deploy to Vercel
- `yarn vercel:yolo` - Deploy to Vercel ignoring build errors

## Development Setup

1. Install dependencies: `yarn install`
2. Start local blockchain: `yarn chain`
3. Deploy contracts: `yarn deploy`
4. Start frontend: `yarn start`
5. Visit http://localhost:3000

## Key Directories and Files

### Smart Contracts
- `packages/snfoundry/contracts/src/` - Cairo smart contracts
- `packages/snfoundry/scripts-ts/deploy.ts` - Deployment scripts
- `packages/snfoundry/scripts-ts/helpers/networks.ts` - Network configurations

### Frontend
- `packages/nextjs/app/` - Next.js app directory structure
- `packages/nextjs/components/scaffold-stark/` - Scaffold-Stark components
- `packages/nextjs/hooks/scaffold-stark/` - Custom Starknet hooks
- `packages/nextjs/contracts/deployedContracts.ts` - Auto-generated contract ABIs/addresses
- `packages/nextjs/scaffold.config.ts` - Scaffold configuration

### Configuration
- `.cursorrules` - Comprehensive development guidelines and coding standards
- `scaffold.config.ts` - Target networks, polling intervals, wallet settings
- Environment files: `.env` in both packages for network configurations

## Custom Hooks and Components

The project includes custom React hooks for Starknet interactions:
- `useScaffoldReadContract` - Read from smart contracts
- `useScaffoldWriteContract` - Write to smart contracts
- `useScaffoldWatchContractEvent` - Listen to contract events
- `useScaffoldEventHistory` - Fetch historical events

Pre-built components available in `packages/nextjs/components/scaffold-stark/`:
- `Address` - Display Starknet addresses with utilities
- `Balance` - Show STRK balance
- `CustomConnectButton` - Enhanced wallet connection

## Network Configuration

Supported networks configured in scaffold.config.ts:
- Devnet (local development)
- Sepolia (testnet)
- Mainnet

RPC URLs configured via environment variables:
- `NEXT_PUBLIC_DEVNET_PROVIDER_URL`
- `NEXT_PUBLIC_SEPOLIA_PROVIDER_URL`
- `NEXT_PUBLIC_MAINNET_PROVIDER_URL`

## Important Notes

- Always run `yarn chain` before deploying contracts locally
- Contract deployments update `packages/nextjs/contracts/deployedContracts.ts` automatically
- Use the comprehensive guidelines in `.cursorrules` for development best practices
- The project uses TypeScript throughout - ensure type safety
- Environment variables are required for testnet/mainnet deployments