# 🧠 BrainD - Train Your Brain Onchain!

<div align="center">

![BrainD Logo](./packages/nextjs/public/logo.svg)

**The Ultimate Retro Pixel Art Brain Training Platform on Starknet**

[![Built with Scaffold-Stark](https://img.shields.io/badge/Built%20with-Scaffold--Stark-blue?style=for-the-badge)](https://scaffoldstark.com)
[![Powered by Starknet](https://img.shields.io/badge/Powered%20by-Starknet-orange?style=for-the-badge)](https://starknet.io)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

</div>

## 🎮 About BrainD

BrainD is a revolutionary brain training platform that combines nostalgic pixel art aesthetics with cutting-edge blockchain technology on Starknet. Challenge your mind with cognitive games, earn $STARK rewards, and compete on global leaderboards in this retro-futuristic gaming experience.

Built with [🏗️ Scaffold-Stark 2](https://scaffoldstark.com), BrainD leverages the power of Starknet for low-cost, high-speed blockchain interactions while providing an engaging brain training experience.

### ✨ Key Features

- 🧠 **Cognitive Games** - Memory, Logic, Speed, Pattern, and Visual challenges
- 🎨 **Retro Pixel Art Design** - Nostalgic 8-bit aesthetics with modern UI/UX
- 🏆 **Global Leaderboards** - Compete with players worldwide
- 💰 **$STARK Rewards** - Earn tokens based on performance and difficulty
- 📱 **Progressive Web App** - Play anywhere, anytime with offline support
- 🔗 **Starknet Integration** - Decentralized gaming with low fees
- 👛 **Multi-Wallet Support** - ArgentX, Braavos, and other Starknet wallets

## 🎯 Games & Integration

Your team can easily add new brain training games to the platform:

| Current Games | Status | Integration Guide |
|---------------|--------|-------------------|
| 🧠 **Memory Blitz** | ✅ Example Implementation | See `/packages/nextjs/games/memory-blitz/` |
| 🔬 **Logic Lab** | 🚧 Ready for Implementation | Follow the Memory Blitz pattern |
| ⚡ **Speed Sync** | 🚧 Ready for Implementation | Use the games folder structure |
| 🔄 **Pattern Pro** | 🚧 Ready for Implementation | Reference types and hooks |

📋 **For Game Developers**: Check `/packages/nextjs/games/README.md` for complete integration guidelines.

## ⚡ Quick Start

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** version 18 or higher
- **Yarn** package manager
- **Git** for version control
- A **Starknet wallet** (ArgentX or Braavos recommended)

### Installation

Follow these steps to get BrainD running locally:

```bash
# Clone the repository
git clone https://github.com/0xOucan/Braind.git
cd Braind

# Install dependencies
yarn install

# Copy environment variables (optional)
cd packages/nextjs
cp .env.example .env.local
cd ../..
```

### Development

Start the development environment using Scaffold-Stark commands:

```bash
# Start the frontend development server
yarn start

# The app will be available at:
# 🌐 Local: http://localhost:3000
# 🌐 Network: http://[your-ip]:3000
```

### Alternative Development Commands

```bash
# Same as yarn start
yarn dev

# Start with specific port
PORT=3001 yarn start

# Direct workspace command (not needed)
yarn workspace @braind/nextjs dev
```

## 🏗️ Scaffold-Stark Commands

This project follows the [Scaffold-Stark](https://scaffoldstark.com) framework conventions:

### 🚀 Frontend Commands

```bash
# Development
yarn start                    # Start frontend dev server
yarn dev                      # Same as yarn start

# Building
yarn workspace @braind/nextjs build  # Build production bundle
yarn workspace @braind/nextjs start  # Serve production build

# Code Quality
yarn next:lint              # Run ESLint
yarn next:check-types       # TypeScript type checking
yarn format                 # Format code with Prettier
yarn format:check           # Check code formatting
```

### 🔗 Smart Contract Commands

```bash
# Build contracts
yarn compile                # Compile all Cairo contracts

# Testing
yarn test                   # Run smart contract tests
yarn workspace @ss-2/snfoundry test  # Alternative test command

# Deployment
yarn deploy                 # Deploy contracts to configured network
yarn deploy:clear           # Deploy with state clearing
yarn deploy:no-reset        # Deploy without resetting state

# Development blockchain
yarn chain                  # Start local Starknet devnet
```

### 🧹 Utility Commands

```bash
# Clean up build artifacts
yarn clean

# Verify deployed contracts
yarn verify

# Run all quality checks
yarn format && yarn next:lint && yarn next:check-types
```

## 🛠️ Environment Setup

### Frontend Configuration

Create `packages/nextjs/.env.local`:

```env
# Starknet Network Configuration
NEXT_PUBLIC_PROVIDER_URL="https://starknet-sepolia.public.blastapi.io/rpc/v0_7"
NEXT_PUBLIC_CHAIN_ID="0x534e5f5345504f4c4941"

# Optional: Application Settings
NEXT_PUBLIC_APP_NAME="BrainD"
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your_wallet_connect_id"

# Development Settings
NEXT_PUBLIC_DEBUG=true
```

### Smart Contract Configuration

The contracts are configured in `packages/snfoundry/` following Scaffold-Stark patterns:

```cairo
// Example: BrainD Game Manager Contract
#[starknet::contract]
mod BrainDGameManager {
    // Player statistics and game session management
    // Reward distribution and leaderboard tracking
}
```

## 📁 Project Structure

```
BrainD/
├── packages/
│   ├── nextjs/                     # Next.js Frontend (Scaffold-Stark)
│   │   ├── app/                   # App Router pages
│   │   │   ├── games/             # Games catalog
│   │   │   ├── leaderboard/       # Global rankings
│   │   │   ├── profile/           # User dashboard
│   │   │   ├── debug/             # Contract debugging
│   │   │   ├── blockexplorer/     # Block explorer
│   │   │   └── configure/         # Network configuration
│   │   ├── components/            # React components
│   │   │   ├── scaffold-stark/    # Scaffold-Stark components
│   │   │   └── ui/                # Custom UI components
│   │   ├── hooks/                 # Custom React hooks
│   │   │   └── scaffold-stark/    # Blockchain hooks
│   │   ├── contracts/             # Contract ABIs and addresses
│   │   ├── games/                 # 🎮 Game implementations
│   │   │   ├── memory-blitz/      # Example game
│   │   │   └── README.md          # Game integration guide
│   │   ├── styles/                # Pixel art CSS system
│   │   └── utils/                 # Utility functions
│   └── snfoundry/                 # Smart Contracts (Cairo)
│       ├── contracts/src/         # Cairo contract source
│       ├── scripts/               # Deployment scripts
│       └── tests/                 # Contract tests
├── CLAUDE.md                      # AI Development Guide
└── README.md                      # This file
```

## 🎨 Design System

BrainD features a comprehensive pixel art design system built on top of Scaffold-Stark's UI:

### Color Palette
- **Primary**: `#dc2626` (Retro Red)
- **Secondary**: `#8b45fd` (Electric Purple)
- **Accent**: `#93bbfb` (Pixel Blue)
- **Success**: `#34eeb6` (Neon Green)

### Typography
- **Pixel Font**: Press Start 2P (8px, 12px, 16px)
- **UI Font**: Inter (Scaffold-Stark default)
- **Mono Font**: Geist Mono (code and addresses)

## 🔗 Starknet Integration

### Smart Contract Interaction

BrainD uses Scaffold-Stark's contract interaction patterns:

```typescript
// Read contract data
const { data: playerStats } = useScaffoldReadContract({
  contractName: "BrainDGameManager",
  functionName: "get_player_stats",
  args: [playerAddress],
});

// Write to contract
const { writeAsync: submitScore } = useScaffoldWriteContract({
  contractName: "BrainDGameManager",
  functionName: "submit_game_score",
});
```

### Wallet Integration

```typescript
// Scaffold-Stark wallet hooks
const { address, status } = useAccount();
const { connect, connectors } = useConnect();
const { disconnect } = useDisconnect();
```

## 📱 Progressive Web App

BrainD includes PWA capabilities:

- **Offline Gameplay** - Play games without internet
- **Install Prompt** - Add to homescreen
- **Background Sync** - Sync scores when online
- **Responsive Design** - Works on all devices

## 🚀 Deployment

### Frontend Deployment

Deploy using Scaffold-Stark's Vercel integration:

```bash
# Deploy to Vercel
yarn vercel

# Or with build error override
yarn vercel:yolo
```

### Smart Contract Deployment

```bash
# Deploy to Starknet Sepolia testnet
yarn deploy

# Deploy to specific network
STARKNET_NETWORK=sepolia yarn deploy

# Deploy to mainnet
STARKNET_NETWORK=mainnet yarn deploy
```

## 🧪 Testing

### Frontend Testing

```bash
# Run component tests
yarn workspace @braind/nextjs test

# Run with coverage
yarn workspace @braind/nextjs coverage
```

### Smart Contract Testing

```bash
# Run all contract tests
yarn test

# Run specific test file
yarn workspace @ss-2/snfoundry test tests/test_game_manager.cairo
```

## 🤝 Contributing

We welcome contributions! Follow Scaffold-Stark development patterns:

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow conventions**: Use Scaffold-Stark patterns and pixel art aesthetics
4. **Add tests**: Include tests for new features
5. **Submit PR**: Open a Pull Request with clear description

### Development Guidelines

- Follow Scaffold-Stark component patterns
- Maintain pixel art aesthetic consistency
- Use TypeScript strict mode
- Add comprehensive tests
- Update documentation

## 📚 Documentation

- **🏗️ Scaffold-Stark Docs**: [scaffoldstark.com/docs](https://scaffoldstark.com/docs)
- **⚡ Starknet Documentation**: [docs.starknet.io](https://docs.starknet.io)
- **🎮 Game Integration Guide**: [./packages/nextjs/games/README.md](./packages/nextjs/games/README.md)
- **🤖 AI Development Guide**: [./CLAUDE.md](./CLAUDE.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Scaffold-Stark Team** - Amazing development framework
- **Starknet Foundation** - Revolutionary L2 technology
- **Open Source Community** - Tools and inspiration

## 📞 Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/0xOucan/Braind/issues)
- **Scaffold-Stark Discord**: [Join the community](https://discord.gg/scaffold-stark)
- **Starknet Community**: [Official Starknet Discord](https://discord.gg/starknet)

---

<div align="center">

**🧠 Train Your Brain, Earn Rewards, Compete Globally! 🏆**

Built with ❤️ using [🏗️ Scaffold-Stark](https://scaffoldstark.com) | Powered by Starknet ⚡

[Documentation](https://scaffoldstark.com/docs) • [Smart Contracts](./packages/snfoundry) • [Games Guide](./packages/nextjs/games/README.md)

</div>