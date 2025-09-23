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

BrainD is a revolutionary brain training platform that combines nostalgic pixel art aesthetics with cutting-edge blockchain technology on Starknet. Challenge your mind with 6 unique cognitive games, earn $STARK rewards, and compete on global leaderboards in this retro-futuristic gaming experience.

### ✨ Key Features

- 🧩 **6 Unique Brain Games** - Memory, Logic, Speed, Pattern, Time, and Vision challenges
- 🎨 **Retro Pixel Art Design** - Nostalgic 8-bit aesthetics with modern UI/UX
- 🏆 **Global Leaderboards** - Compete with players worldwide
- 💰 **$STARK Rewards** - Earn tokens based on performance and difficulty
- 📱 **Progressive Web App** - Play anywhere, anytime with offline support
- 🔗 **Starknet Integration** - Decentralized gaming with low fees
- 👛 **Multi-Wallet Support** - ArgentX, Braavos, and other Starknet wallets

## 🎯 Brain Training Games

| Game | Cognitive Skill | Difficulty | Reward Range |
|------|----------------|------------|--------------|
| 🧠 **Memory Blitz** | Memory & Recall | Easy-Hard | 25-80 $STARK |
| 🔬 **Logic Lab** | Problem Solving | Easy-Hard | 25-80 $STARK |
| ⚡ **Speed Sync** | Reaction Time | Easy-Hard | 25-80 $STARK |
| 🔄 **Pattern Pro** | Pattern Recognition | Easy-Hard | 25-80 $STARK |
| ⏰ **Time Warp** | Time Management | Easy-Hard | 25-80 $STARK |
| 👁️ **Vision Quest** | Visual Processing | Easy-Hard | 25-80 $STARK |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- Starknet wallet (ArgentX or Braavos)

### Installation

```bash
# Clone the repository
git clone git@github.com:0xOucan/Braind.git
cd Braind

# Install dependencies
yarn install

# Start development server
yarn workspace @braind/nextjs dev
```

Visit [http://localhost:3001](http://localhost:3001) to start training your brain!

### Alternative Start Methods

```bash
# Using specific package commands
cd packages/nextjs
npm run dev

# Or from root with yarn workspaces
yarn dev:nextjs
```

## 🏗️ Project Structure

```
BrainD/
├── packages/
│   ├── nextjs/                 # Next.js Frontend Application
│   │   ├── app/               # App Router pages
│   │   │   ├── games/         # Games catalog page
│   │   │   ├── leaderboard/   # Global leaderboards
│   │   │   ├── profile/       # User dashboard
│   │   │   └── debug/         # Development tools
│   │   ├── components/        # React components
│   │   │   ├── ui/            # Shadcn/ui components
│   │   │   ├── scaffold-stark/ # Blockchain components
│   │   │   ├── Header.tsx     # Navigation header
│   │   │   ├── HeroSection.tsx # Landing hero
│   │   │   ├── GamesCatalog.tsx # Games display
│   │   │   ├── Leaderboard.tsx # Rankings component
│   │   │   └── StarknetIntegration.tsx # Wallet integration
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── scaffold-stark/ # Blockchain hooks
│   │   ├── styles/            # Global styles & themes
│   │   ├── contracts/         # Contract ABIs & addresses
│   │   └── public/            # Static assets
│   └── snfoundry/             # Smart Contracts (Cairo)
│       ├── contracts/         # Cairo contract source
│       │   └── src/
│       │       └── braind_game_manager.cairo
│       ├── scripts/           # Deployment scripts
│       └── tests/             # Contract tests
├── CLAUDE.md                  # AI Development Guide
└── README.md                  # This file
```

## 🎨 Design System

BrainD features a comprehensive pixel art design system:

### 🎨 Color Palette
- **Primary**: `#dc2626` (Retro Red)
- **Secondary**: `#8b45fd` (Electric Purple)
- **Accent**: `#93bbfb` (Pixel Blue)
- **Success**: `#34eeb6` (Neon Green)
- **Warning**: `#ffcf72` (Amber)

### 🔤 Typography
- **Pixel Font**: Press Start 2P (8px, 12px, 16px)
- **Modern Font**: Orbitron (headers and UI)
- **Mono Font**: Geist Mono (code and addresses)

### 🎭 Themes
- **Light Mode**: Clean pixel aesthetic with bright colors
- **Dark Mode**: Retro terminal vibes with neon accents
- **Pixel Shadows**: 4px-8px offset shadows for depth
- **Retro Animations**: Smooth floating and blinking effects

## 🔗 Blockchain Integration

### Smart Contracts (Cairo)

```cairo
// BrainD Game Manager Contract
#[starknet::contract]
mod BrainDGameManager {
    // Player statistics and game session management
    // Reward distribution and leaderboard tracking
    // Achievement system and progress tracking
}
```

### Contract Features

- **Game Session Management** - Start/end game sessions with score tracking
- **Reward Distribution** - Automatic $STARK payouts based on performance
- **Leaderboard System** - Global and time-filtered rankings
- **Player Statistics** - Comprehensive stats and progress tracking
- **Achievement System** - Unlock badges and milestones

### Starknet Integration

```typescript
// Connect wallet and read player stats
const { address } = useAccount();
const { data: playerStats } = useScaffoldReadContract({
  contractName: "BrainDGame",
  functionName: "get_player_stats",
  args: [address],
});

// Submit game score
const { writeAsync: submitScore } = useScaffoldWriteContract({
  contractName: "BrainDGame",
  functionName: "submit_game_score",
});
```

## 📱 Progressive Web App

BrainD is built as a PWA with:

- **Offline Gameplay** - Play games without internet connection
- **Install Prompt** - Add to homescreen on mobile/desktop
- **Push Notifications** - Game reminders and achievement alerts
- **Background Sync** - Sync scores when connection returns
- **Responsive Design** - Optimized for all screen sizes

## 🎯 Gameplay Mechanics

### Difficulty Levels
- **Easy (1)**: 25 $STARK reward - Perfect for beginners
- **Medium (2)**: 50-60 $STARK reward - Balanced challenge
- **Hard (3)**: 75-80 $STARK reward - Expert level difficulty

### Scoring System
- **Base Score**: Performance-based points (0-1000)
- **Time Bonus**: Faster completion = higher multiplier
- **Streak Bonus**: Consecutive correct answers boost score
- **Difficulty Multiplier**: Higher difficulty = better rewards

### Leaderboard Rankings
- **Global Rankings** - All-time best players
- **Weekly Leaderboards** - Fresh competition cycles
- **Daily Challenges** - 24-hour competitions
- **Game-Specific Rankings** - Best players per game type

## 🛠️ Development

### Tech Stack

- **Frontend**: Next.js 15.2.4, React 18, TypeScript
- **Styling**: Tailwind CSS 4.1.9, daisyUI 5.1.9, Custom Pixel CSS
- **Blockchain**: Starknet, Cairo, Starknet-React
- **UI Components**: Radix UI, Shadcn/ui, Lucide Icons
- **Development**: Scaffold-Stark 2, ESLint, TypeScript

### Scripts

```bash
# Development
yarn dev                # Start all services
yarn workspace @braind/nextjs dev  # Frontend only
yarn workspace @ss-2/snfoundry build  # Contracts only

# Building
yarn build              # Build all packages
yarn workspace @braind/nextjs build   # Frontend build

# Testing
yarn test               # Run all tests
yarn workspace @ss-2/snfoundry test   # Contract tests

# Linting
yarn lint               # Lint all packages
yarn workspace @braind/nextjs lint    # Frontend lint

# Deployment
yarn deploy:contracts   # Deploy to Starknet
yarn deploy:frontend    # Deploy frontend
```

### Environment Setup

Create `.env.local` in `packages/nextjs/`:

```env
# Starknet Configuration
NEXT_PUBLIC_STARKNET_NETWORK="mainnet" # or "sepolia" for testnet
NEXT_PUBLIC_RPC_URL="your_rpc_url"

# Optional: Analytics & Monitoring
NEXT_PUBLIC_ANALYTICS_ID="your_analytics_id"
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

```bash
# Deploy to Vercel
vercel --prod

# Or using GitHub integration
git push origin main  # Auto-deploy on push
```

### Smart Contract Deployment

```bash
# Deploy to Starknet Sepolia (testnet)
cd packages/snfoundry
scarb build
starkli declare --network sepolia target/dev/braind_BrainDGameManager.contract_class.json

# Deploy to Starknet Mainnet
starkli declare --network mainnet target/dev/braind_BrainDGameManager.contract_class.json
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow TypeScript strict mode
- Use conventional commits
- Add tests for new features
- Update documentation
- Ensure pixel art aesthetic consistency

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Scaffold-Stark Team** - Amazing development framework
- **Starknet Foundation** - Revolutionary L2 technology
- **Pixel Art Community** - Inspiration for retro aesthetics
- **Brain Training Research** - Scientific cognitive training principles

## 📞 Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/0xOucan/Braind/issues)
- **Discord**: Join our gaming community
- **Twitter**: [@BrainDGaming](https://twitter.com/BrainDGaming)
- **Telegram**: BrainD Official

---

<div align="center">

**🧠 Train Your Brain, Earn Rewards, Compete Globally! 🏆**

Built with ❤️ by the BrainD Team | Powered by Starknet ⚡

[Play Now](https://braind.app) • [Documentation](./CLAUDE.md) • [Smart Contracts](./packages/snfoundry)

</div>