# 🎮 BrainD Games Integration Guide

Welcome to the BrainD games directory! This folder contains all the brain training games for the platform. Each game is organized in its own subfolder with a consistent structure.

## 📁 Folder Structure

```
games/
├── README.md                    # This file - integration guide
├── memory-blitz/               # Example game implementation
│   ├── README.md              # Game-specific documentation
│   ├── components/            # Game React components
│   │   ├── GameBoard.tsx     # Main game component
│   │   ├── GameUI.tsx        # Game interface (score, timer, etc.)
│   │   └── index.ts          # Export barrel
│   ├── hooks/                # Game-specific hooks
│   │   ├── useGameLogic.ts   # Core game logic
│   │   └── useGameState.ts   # Game state management
│   ├── types/                # TypeScript types
│   │   └── index.ts          # Game type definitions
│   ├── utils/                # Game utilities
│   │   ├── gameLogic.ts      # Pure game logic functions
│   │   └── constants.ts      # Game constants
│   └── styles/               # Game-specific styles (optional)
│       └── game.module.css   # CSS modules
├── logic-lab/                 # Logic game (to be implemented)
├── speed-sync/                # Speed game (to be implemented)
├── pattern-pro/               # Pattern game (to be implemented)
├── time-warp/                 # Time game (to be implemented)
├── vision-quest/              # Vision game (to be implemented)
└── shared/                    # Shared game utilities
    ├── components/            # Reusable game components
    ├── hooks/                 # Shared game hooks
    ├── types/                 # Common game types
    └── utils/                 # Shared utilities
```

## 🎯 Available Games

| Game | Status | Difficulty | Cognitive Skill | Reward Range |
|------|--------|------------|-----------------|--------------|
| 🧠 **Memory Blitz** | ✅ Example | Easy-Hard | Memory & Recall | 25-80 $STARK |
| 🔬 **Logic Lab** | 🚧 Pending | Easy-Hard | Problem Solving | 25-80 $STARK |
| ⚡ **Speed Sync** | 🚧 Pending | Easy-Hard | Reaction Time | 25-80 $STARK |
| 🔄 **Pattern Pro** | 🚧 Pending | Easy-Hard | Pattern Recognition | 25-80 $STARK |
| ⏰ **Time Warp** | 🚧 Pending | Easy-Hard | Time Management | 25-80 $STARK |
| 👁️ **Vision Quest** | 🚧 Pending | Easy-Hard | Visual Processing | 25-80 $STARK |

## 🚀 Adding a New Game

### Step 1: Create Game Folder
```bash
mkdir packages/nextjs/games/your-game-name
cd packages/nextjs/games/your-game-name
```

### Step 2: Set Up Game Structure
```bash
mkdir components hooks types utils styles
touch README.md
```

### Step 3: Implement Required Files

#### A. Game Component (`components/GameBoard.tsx`)
```typescript
'use client';

import { useGameSession } from '~/hooks/scaffold-stark';
import { GameDifficulty } from '~/types/game';

interface GameBoardProps {
  difficulty: GameDifficulty;
  onGameEnd: (score: number) => void;
}

export function GameBoard({ difficulty, onGameEnd }: GameBoardProps) {
  // Your game logic here
  return (
    <div className="game-card p-6">
      <h2 className="pixel-font text-2xl mb-4">Your Game Name</h2>
      {/* Game interface */}
    </div>
  );
}
```

#### B. Game Types (`types/index.ts`)
```typescript
export interface GameState {
  score: number;
  level: number;
  isPlaying: boolean;
  timeRemaining: number;
}

export interface GameConfig {
  timeLimit: number;
  targetScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

#### C. Game Logic Hook (`hooks/useGameLogic.ts`)
```typescript
import { useState, useCallback } from 'react';
import { GameState } from '../types';

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    isPlaying: false,
    timeRemaining: 0,
  });

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const endGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  return {
    gameState,
    startGame,
    endGame,
  };
}
```

### Step 4: Register Game in Main Catalog

Update `components/GamesCatalog.tsx` to include your game:

```typescript
// Add to games array
{
  id: "your_game_name",
  name: "Your Game Name",
  description: "Description of cognitive skill trained",
  icon: YourGameIcon,
  difficulty: ["Easy", "Medium", "Hard"],
  rewards: ["25", "50-60", "75-80"],
  color: "border-your-color",
  href: "/games/your-game-name"
}
```

### Step 5: Create Game Page

Create `app/games/your-game-name/page.tsx`:

```typescript
'use client';

import { GameBoard } from '~/games/your-game-name/components/GameBoard';
import { useGameSession } from '~/hooks/scaffold-stark';

export default function YourGamePage() {
  const { startGame, submitScore } = useGameSession();

  const handleGameEnd = async (score: number) => {
    try {
      await submitScore(score);
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  return (
    <div className="min-h-screen bg-main pt-24">
      <div className="pixel-container">
        <GameBoard difficulty={1} onGameEnd={handleGameEnd} />
      </div>
    </div>
  );
}
```

## 🎨 Design Guidelines

### Colors & Themes
- Use the BrainD pixel art color palette
- Primary: `#dc2626` (Retro Red)
- Secondary: `#8b45fd` (Electric Purple)
- Accent: `#93bbfb` (Pixel Blue)
- Success: `#34eeb6` (Neon Green)

### Typography
- Headers: `pixel-font` class (Press Start 2P)
- UI Text: `retro-font` class (Orbitron)
- Body: Default system fonts

### Components
- Use `game-card` class for game containers
- Apply `retro-shadow` for depth effects
- Use `btn-pixel` for game buttons

### Animations
- Keep animations minimal and retro-style
- Use `pixel-float` for hover effects
- Apply `retro-glow` for important elements

## 🔗 Integration with BrainD Platform

### Game Session Management
```typescript
import { useGameSession } from '~/hooks/scaffold-stark';

const {
  currentSession,
  startGame,
  submitScore,
  endGame,
  isSubmitting
} = useGameSession();

// Start a game session
startGame('your_game_type', difficulty);

// Submit final score
await submitScore(finalScore);
```

### Starknet Integration
```typescript
import { useScaffoldWriteContract } from '~/hooks/scaffold-stark';

const { writeAsync: submitGameScore } = useScaffoldWriteContract({
  contractName: "YourContract",
  functionName: "submit_game_score",
});
```

### Leaderboard Integration
Your game scores automatically appear in:
- Global leaderboards (`/leaderboard`)
- Player profiles (`/profile`)
- Game statistics

## 📱 Responsive Design

Ensure your game works on:
- Desktop (1920x1080+)
- Tablet (768x1024)
- Mobile (375x667+)

Use Tailwind's responsive prefixes:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## 🧪 Testing Your Game

### 1. Component Testing
```bash
yarn test:nextjs games/your-game-name
```

### 2. Manual Testing
```bash
yarn workspace @braind/nextjs dev
```
Navigate to: `http://localhost:3001/games/your-game-name`

### 3. Build Testing
```bash
yarn workspace @braind/nextjs build
```

## 📝 Documentation Requirements

Each game must include:

1. **README.md** - Game description, rules, implementation details
2. **Component documentation** - JSDoc comments for all components
3. **Type definitions** - Complete TypeScript interfaces
4. **Usage examples** - How to integrate and customize

## 🚀 Deployment

Games are automatically deployed with the main BrainD platform:

1. **Development**: Auto-deployed on commit to `develop` branch
2. **Staging**: Auto-deployed on PR to `main` branch
3. **Production**: Auto-deployed on merge to `main` branch

## 🤝 Contribution Guidelines

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b game/your-game-name`
3. **Implement** your game following this guide
4. **Test** thoroughly on all devices
5. **Document** everything properly
6. **Submit** a Pull Request

## 🆘 Need Help?

- 📚 Check the example game: `memory-blitz/`
- 🔍 Review existing components in `/components/`
- 💬 Ask questions in team Discord
- 📧 Contact: dev@braind.app

---

**Happy Gaming! 🎮✨**

Built with ❤️ for the BrainD Community