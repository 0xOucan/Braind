# ⚡ Speed Match Game

A retro pixel-style brain training game where players must quickly identify if the current shape matches the previous one. Built for the BrainD platform with Starknet integration capabilities.

## 🎮 Game Overview

**Speed Match** challenges players to maintain focus and react quickly by comparing the current shape (color + type) with the previous one. Players must respond with "MATCH" or "NO MATCH" within the time limit.

### Cognitive Skills Trained
- **Visual Memory** - Remember the previous shape
- **Attention** - Focus on shape and color details
- **Reaction Time** - Fast decision making
- **Working Memory** - Hold information temporarily

## 🚀 Features

### Core Gameplay
- **3 Difficulty Levels**: Easy (45s), Medium (30s), Hard (20s)
- **Dynamic Scoring**: +1 for correct, -1 for incorrect (minimum 0)
- **Time Bonus**: Remaining time adds to final score
- **Score Multipliers**: 1x (Easy), 1.5x (Medium), 2x (Hard)
- **Pixel Art Shapes**: 5 shapes (square, circle, triangle, diamond, cross) in 6 vibrant colors

### UI/UX
- **Retro Pixel Design**: Classic 8-bit aesthetic with Press Start 2P font
- **Canvas Rendering**: Pixel-perfect shape drawing with HTML5 Canvas
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Real-time Feedback**: Immediate score updates
- **Local Leaderboard**: Top 10 scores saved locally

### Starknet Integration (Planned)
- **Smart Contract Scoring**: Submit scores to BrainDGameManager
- **Token Rewards**: 25/60/80 STARK for Easy/Medium/Hard
- **Global Leaderboard**: Cross-platform competition
- **Player Statistics**: Track progress on-chain

## 📁 File Structure

```
speed-match/
├── components/
│   ├── GameBoard.tsx          # Main game interface
│   ├── GameCanvas.tsx         # Canvas renderer for shapes
│   ├── GameContainer.tsx      # Game wrapper with all features
│   ├── DifficultySelector.tsx # Difficulty selection UI
│   ├── Leaderboard.tsx        # Score display component
│   └── index.ts              # Component exports
├── hooks/
│   └── useSpeedMatchGame.ts   # Game state management
├── types/
│   └── index.ts              # TypeScript interfaces
├── utils/
│   ├── constants.ts          # Game constants and config
│   ├── gameLogic.ts          # Core game mechanics
│   └── starknetIntegration.ts # Blockchain utilities
└── README.md                 # This file
```

## 🛠 Installation & Usage

### As Standalone Component
```tsx
import { GameContainer } from '~/games/speed-match/components';

export default function SpeedMatchPage() {
  const handleGameEnd = (score: number) => {
    console.log('Game ended with score:', score);
  };

  return (
    <div className="min-h-screen">
      <GameContainer onGameEnd={handleGameEnd} />
    </div>
  );
}
```

### With Custom Configuration
```tsx
import { useSpeedMatchGame } from '~/games/speed-match/hooks/useSpeedMatchGame';
import { GameBoard, DifficultySelector } from '~/games/speed-match/components';
import { GAME_DIFFICULTIES } from '~/games/speed-match/utils/constants';

export default function CustomSpeedMatch() {
  const {
    gameState,
    selectedDifficulty,
    startGame,
    submitAnswer,
    setSelectedDifficulty
  } = useSpeedMatchGame();

  return (
    <div>
      <DifficultySelector
        selectedDifficulty={selectedDifficulty}
        onSelect={setSelectedDifficulty}
      />
      <GameBoard
        gameState={gameState}
        onAnswer={submitAnswer}
        onStartGame={() => startGame(selectedDifficulty)}
        onResetGame={() => window.location.reload()}
      />
    </div>
  );
}
```

## 🎯 Game Logic

### Shape Generation
```typescript
// 50% chance for match at all difficulty levels
function generateNextShape(prevShape: Shape | null, matchProbability: number): Shape {
  if (!prevShape) return randomShape();

  const shouldMatch = Math.random() < matchProbability;

  if (shouldMatch) {
    return { ...prevShape };
  } else {
    let newShape: Shape;
    do {
      newShape = randomShape();
    } while (
      newShape.type === prevShape.type &&
      newShape.color === prevShape.color
    );
    return newShape;
  }
}
```

### Pixel Art Drawing
The game uses custom pixel art drawing functions:
- `pixelRect()` - Draws square shapes
- `pixelCircle()` - Draws circular shapes with pixel precision
- `pixelTriangle()` - Draws triangular shapes
- `pixelDiamond()` - Draws diamond shapes
- `pixelCross()` - Draws cross/plus shapes

### Scoring System
```typescript
// Base scoring: +1 correct, -1 incorrect (min 0)
const newScore = Math.max(0, currentScore + (isCorrect ? 1 : -1));

// Final score with time bonus and difficulty multiplier
const finalScore = Math.floor(
  (baseScore + timeBonus * 0.1) * difficulty.scoreMultiplier
);
```

## 🔧 Configuration

### Difficulty Settings
```typescript
export const GAME_DIFFICULTIES = {
  easy: {
    timeLimit: 45,          // 45 seconds
    matchProbability: 0.5,  // 50% matches
    scoreMultiplier: 1,     // 1x score
    starkReward: '25000000000000000000' // 25 STARK
  },
  medium: {
    timeLimit: 30,          // 30 seconds
    matchProbability: 0.5,  // 50% matches
    scoreMultiplier: 1.5,   // 1.5x score
    starkReward: '60000000000000000000' // 60 STARK
  },
  hard: {
    timeLimit: 20,          // 20 seconds
    matchProbability: 0.5,  // 50% matches
    scoreMultiplier: 2,     // 2x score
    starkReward: '80000000000000000000' // 80 STARK
  }
};
```

### Colors and Shapes
```typescript
export const COLORS = ["#0ff", "#f0f", "#ff0", "#0f0", "#f44", "#ffa500"];
// Cyan, Magenta, Yellow, Green, Red, Orange

export const SHAPE_TYPES = ["square", "circle", "triangle", "diamond", "cross"];
```

## 🌟 Starknet Integration

### Contract Interaction (Planned)
```typescript
// Submit score to smart contract
const { writeAsync: submitScore } = useScaffoldWriteContract({
  contractName: "BrainDGameManager",
  functionName: "submit_game_score",
});

await submitScore(['speedmatch', finalScore, difficulty, duration]);
```

### Player Stats (Planned)
```typescript
// Read player statistics
const { data: playerStats } = useScaffoldReadContract({
  contractName: "BrainDGameManager",
  functionName: "get_player_stats",
  args: [playerAddress],
});
```

## 🎨 Styling

Uses Tailwind CSS with custom pixel-art styling:
- **Font**: Press Start 2P for retro feel
- **Colors**: Vibrant retro palette
- **Effects**: Pixel-perfect borders, retro shadows
- **Responsive**: Mobile-first design
- **Canvas**: HTML5 Canvas with `pixelated` image rendering

## 🧪 Testing

### Manual Testing Checklist
- [ ] Game starts correctly on all difficulties
- [ ] Timer counts down properly
- [ ] Score updates for correct/incorrect answers
- [ ] Shapes render correctly on canvas
- [ ] First answer generates second shape (no scoring)
- [ ] Subsequent answers compare with previous shape
- [ ] Game ends when timer reaches 0
- [ ] Leaderboard saves and displays scores
- [ ] Responsive design works on mobile
- [ ] All buttons function correctly

### Future Testing
- [ ] Smart contract integration tests
- [ ] E2E testing with real Starknet transactions
- [ ] Performance testing with canvas rendering
- [ ] Cross-browser compatibility

## 📈 Future Enhancements

### Gameplay
- [ ] Power-ups and special effects
- [ ] Different game modes (speed round, endless mode)
- [ ] Sound effects and music
- [ ] Animations for correct/incorrect answers
- [ ] Streak bonuses for consecutive correct answers

### Starknet Features
- [ ] NFT rewards for high scores
- [ ] Tournament system
- [ ] Player profiles and achievements
- [ ] Social features (challenges, sharing)

### Technical
- [ ] Progressive Web App (PWA) features
- [ ] Offline play capability
- [ ] Advanced analytics and telemetry
- [ ] A/B testing for game balance
- [ ] WebGL rendering for better performance

## 🤝 Contributing

1. Follow the BrainD game development guidelines
2. Test all difficulty levels thoroughly
3. Ensure responsive design works
4. Ensure canvas renders correctly on all devices
5. Add JSDoc comments for new functions
6. Update this README for any feature changes

## 📝 License

Part of the BrainD platform - see main project license.

---

**Built with ❤️ for cognitive training on Starknet**
