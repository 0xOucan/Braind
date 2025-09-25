# 🎨 Color Match Game

A retro pixel-style brain training game where players match color names with their displayed colors. Built for the BrainD platform with Starknet integration capabilities.

## 🎮 Game Overview

**Color Match** challenges players to quickly determine if a color word matches the color it's displayed in. Players must respond with "MATCH" or "NO MATCH" within the time limit.

### Cognitive Skills Trained
- **Visual Processing** - Quick color recognition
- **Attention** - Focus on word vs color conflict
- **Reaction Time** - Fast decision making
- **Cognitive Flexibility** - Switching between text and color meaning

## 🚀 Features

### Core Gameplay
- **3 Difficulty Levels**: Easy (45s), Medium (35s), Hard (25s)
- **Dynamic Scoring**: +1 for correct, -1 for incorrect (minimum 0)
- **Time Bonus**: Remaining time adds to final score
- **Score Multipliers**: 1x (Easy), 1.5x (Medium), 2x (Hard)

### UI/UX
- **Retro Pixel Design**: Classic 8-bit aesthetic with Press Start 2P font
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
colormatch/
├── components/
│   ├── GameBoard.tsx          # Main game interface
│   ├── GameContainer.tsx      # Game wrapper with all features
│   ├── DifficultySelector.tsx # Difficulty selection UI
│   ├── Leaderboard.tsx        # Score display component
│   └── index.ts              # Component exports
├── hooks/
│   └── useColorMatchGame.ts   # Game state management
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
import { GameContainer } from '~/games/colormatch/components';

export default function ColorMatchPage() {
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
import { useColorMatchGame } from '~/games/colormatch/hooks/useColorMatchGame';
import { GameBoard, DifficultySelector } from '~/games/colormatch/components';
import { GAME_DIFFICULTIES } from '~/games/colormatch/utils/constants';

export default function CustomColorMatch() {
  const {
    gameState,
    selectedDifficulty,
    startGame,
    submitAnswer,
    setSelectedDifficulty
  } = useColorMatchGame();

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

### Word Generation
```typescript
// 40% chance for match in Easy, 30% Medium, 20% Hard
function generateWord(matchProbability: number): ColorWord {
  const forceMatch = Math.random() < matchProbability;

  if (forceMatch) {
    const pick = COLOR_WORDS[Math.floor(Math.random() * COLOR_WORDS.length)];
    return { text: pick.text, color: pick.color };
  } else {
    const textWord = COLOR_WORDS[Math.floor(Math.random() * COLOR_WORDS.length)];
    const colorWord = COLOR_WORDS[Math.floor(Math.random() * COLOR_WORDS.length)];
    return { text: textWord.text, color: colorWord.color };
  }
}
```

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
    matchProbability: 0.4,  // 40% matches
    scoreMultiplier: 1,     // 1x score
    starkReward: '25000000000000000000' // 25 STARK
  },
  // ... medium and hard
};
```

### Color Palette
```typescript
export const COLOR_WORDS = [
  { text: "RED", color: "#ff4136" },
  { text: "GREEN", color: "#2ecc40" },
  { text: "BLUE", color: "#0074d9" },
  { text: "YELLOW", color: "#ffdc00" },
  { text: "PURPLE", color: "#b10dc9" },
  { text: "CYAN", color: "#7fdbff" },
  { text: "ORANGE", color: "#ff851b" },
  { text: "PINK", color: "#f012be" }
];
```

## 🌟 Starknet Integration

### Contract Interaction (Planned)
```typescript
// Submit score to smart contract
const { writeAsync: submitScore } = useScaffoldWriteContract({
  contractName: "BrainDGameManager",
  functionName: "submit_game_score",
});

await submitScore(['colormatch', finalScore, difficulty, duration]);
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

## 🧪 Testing

### Manual Testing Checklist
- [ ] Game starts correctly on all difficulties
- [ ] Timer counts down properly
- [ ] Score updates for correct/incorrect answers
- [ ] Game ends when timer reaches 0
- [ ] Leaderboard saves and displays scores
- [ ] Responsive design works on mobile
- [ ] All buttons function correctly

### Future Testing
- [ ] Smart contract integration tests
- [ ] E2E testing with real Starknet transactions
- [ ] Performance testing with multiple games
- [ ] Cross-browser compatibility

## 📈 Future Enhancements

### Gameplay
- [ ] Power-ups and special effects
- [ ] Different game modes (speed round, endless mode)
- [ ] Sound effects and music
- [ ] Animations for correct/incorrect answers

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

## 🤝 Contributing

1. Follow the BrainD game development guidelines
2. Test all difficulty levels thoroughly
3. Ensure responsive design works
4. Add JSDoc comments for new functions
5. Update this README for any feature changes

## 📝 License

Part of the BrainD platform - see main project license.