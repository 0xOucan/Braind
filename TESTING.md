# 🎮 BrainD Testing Guide

Complete guide for testing the BrainD platform locally with retro pixel art theme and game functionality.

## 📋 Table of Contents
- [Local Development Setup](#local-development-setup)
- [Testing Games Without Wallet](#testing-games-without-wallet)
- [Testing with Simulated Wallet](#testing-with-simulated-wallet)
- [Game Randomness & Fairness](#game-randomness--fairness)
- [PWA Testing](#pwa-testing)
- [Visual Theme Testing](#visual-theme-testing)

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ and Yarn
- Git

### Installation Steps

```bash
# 1. Navigate to the Next.js package
cd packages/nextjs

# 2. Install dependencies (if not already done)
yarn install

# 3. Start the development server
yarn dev
```

The application will be available at **http://localhost:3000**

---

## 🎯 Testing Games Without Wallet

Games can be tested locally **without connecting a wallet**. The games work in standalone mode with local storage for leaderboards.

### Color Match Game

1. Navigate to `/games/colormatch` or click "Color Match" from the games page
2. Select difficulty (Easy/Medium/Hard)
3. Click **START GAME**
4. Match the color of the text with the word meaning
5. Click **✔ MATCH** if they match, **✘ NO MATCH** if different

**Testing Tips:**
- Try all difficulty levels to see different time limits and scoring multipliers
- Game saves scores to localStorage automatically
- Leaderboard shows top 5 local scores
- Refresh to verify scores persist

### Speed Match Game

1. Navigate to `/games/speed-match` or select from games catalog
2. Choose difficulty level
3. Start game and match current shape with previous one
4. Quick reactions earn more points

**Testing Tips:**
- First click generates the second shape (nothing to compare yet)
- Subsequent clicks compare current with previous
- Different shapes: circle, square, triangle, star, hexagon
- High difficulty = faster time limit, higher multiplier

---

## 🔗 Testing with Simulated Wallet

For testing wallet-connected features without real wallet extensions:

### Using Browser Console

```javascript
// Open DevTools Console (F12)

// Import the simulator
import { walletSimulator } from './utils/walletSimulation';

// Connect simulated wallet
walletSimulator.connect('alice'); // Options: 'alice', 'bob', 'charlie'

// Check connection
console.log(walletSimulator.getWallet());

// Simulate a transaction
await walletSimulator.simulateTransaction({
  contractAddress: '0x123...',
  entrypoint: 'submit_score',
  calldata: ['1000', '2']
});

// Disconnect
walletSimulator.disconnect();
```

### Alternative: Use Browser DevTools

1. Open DevTools (F12)
2. Go to **Application** > **Local Storage**
3. Manually set wallet state:
   ```javascript
   localStorage.setItem('simulated-wallet', JSON.stringify({
     address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
     isConnected: true
   }));
   ```
4. Refresh the page

### Testing Wallet Features

- ✅ Games unlock when wallet connected
- ✅ Score submission to contract (simulated)
- ✅ Leaderboard with addresses
- ✅ Wallet balance display
- ✅ Connect/Disconnect flows

---

## 🎲 Game Randomness & Fairness

### Verifying Random Generation

#### Color Match
File: `packages/nextjs/games/colormatch/utils/gameLogic.ts`

```typescript
// Test randomness in console
import { generateWord } from './gameLogic';

// Generate 100 words and check distribution
const results = Array.from({ length: 100 }, () =>
  generateWord(0.5) // 50% match probability
);

const matches = results.filter(w =>
  w.text.toLowerCase() === w.color.toLowerCase()
).length;

console.log(`Matches: ${matches}/100 (expected ~50)`);
```

**Expected Results:**
- Easy (70% match): ~70 matches per 100
- Medium (50% match): ~50 matches per 100
- Hard (30% match): ~30 matches per 100

#### Speed Match
File: `packages/nextjs/games/speed-match/utils/gameLogic.ts`

```typescript
// Test shape generation
import { generateNextShape } from './gameLogic';

const shapes = Array.from({ length: 100 }, (_, i) =>
  generateNextShape(
    i === 0 ? null : shapes[i-1],
    0.5
  )
);

const matches = shapes.filter((s, i) =>
  i > 0 && s.type === shapes[i-1].type && s.color === shapes[i-1].color
).length;

console.log(`Consecutive matches: ${matches}/99 (expected ~50)`);
```

### Fairness Verification

All games use:
1. **Math.random()** for RNG (sufficient for casual games)
2. **Consistent scoring**: Same difficulty = same point values
3. **Time-based bonuses**: Reward speed but fairly
4. **No hidden advantages**: Open source, verifiable logic

To verify:
```bash
# Check game logic files
cat packages/nextjs/games/colormatch/utils/gameLogic.ts
cat packages/nextjs/games/speed-match/utils/gameLogic.ts
```

---

## 📱 PWA Testing

### Testing PWA Functionality

#### 1. Build for Production
```bash
cd packages/nextjs
yarn build
yarn start
```

#### 2. Verify PWA in Chrome DevTools

1. Open http://localhost:3000
2. Open DevTools (F12)
3. Go to **Application** tab
4. Check sections:
   - ✅ **Manifest**: Should show BrainD manifest
   - ✅ **Service Workers**: Should be registered
   - ✅ **Cache Storage**: Should show cached resources

#### 3. Install as App

**Desktop:**
- Chrome: Click install icon in address bar
- Or: Menu > Install BrainD...

**Mobile:**
- Visit site on phone
- Tap "Add to Home Screen"
- App icon appears on home screen

#### 4. Offline Testing

1. Install PWA
2. Open DevTools > Network tab
3. Check "Offline" checkbox
4. Navigate around app
5. Games should still load (from cache)

**Note:** PWA service worker is **disabled in development** (see next.config.mjs)

---

## 🎨 Visual Theme Testing

### Retro Pixel Art Verification

#### Night Mode (Default)
- ✅ Dark background: `#0f172a` (deep space blue)
- ✅ Neon red text: Glowing effect on titles
- ✅ Neon yellow accents: Score displays, highlights
- ✅ Neon purple: Secondary elements
- ✅ CRT scanlines: Visible on game screens
- ✅ Pixel shadows: 3D blocky effects
- ✅ Arcade buttons: Press animation

#### Test Checklist

```bash
# Visual elements to verify:
□ Header: Floating logo with neon text
□ Hero: Animated title with glow effects
□ Game Cards: Pixel borders with hover effects
□ Game Screens: CRT effect with scanlines
□ Buttons: Arcade-style 3D press effect
□ Score Display: Neon glow on numbers
□ Difficulty Selector: Pixel-perfect buttons
□ Leaderboard: Retro styling
```

### Theme Switching

```javascript
// Test in console
document.documentElement.setAttribute('data-theme', 'pixel-light');
// Should switch to light mode

document.documentElement.setAttribute('data-theme', 'pixel-dark');
// Back to dark mode
```

### Animation Testing

- ✅ `animate-pixel-float`: Logo floats up/down
- ✅ `animate-pixel-bounce`: Icons bounce
- ✅ `animate-retro-blink`: Text blinks
- ✅ `animate-crt-flicker`: Subtle CRT flicker
- ✅ Arcade button press: Translates down on click

---

## 🐛 Troubleshooting

### Games not loading
```bash
# Clear Next.js cache
rm -rf .next
yarn dev
```

### Styles not applying
```bash
# Rebuild Tailwind
yarn build
# Or restart dev server
```

### PWA not installing
- Must use HTTPS (or localhost)
- Check manifest.json is accessible
- Verify Service Worker registration

### Wallet simulation not working
```javascript
// Check if module loaded
import { walletSimulator } from '~/utils/walletSimulation';
console.log(walletSimulator);
```

---

## 📊 Performance Testing

### Lighthouse Audit
```bash
# Build production
yarn build
yarn start

# Run Lighthouse in Chrome DevTools
# Or use CLI:
npx lighthouse http://localhost:3000 --view
```

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+
- PWA: 100 (in production)

---

## 🎮 Game Testing Checklist

### Pre-Release Testing

- [ ] Color Match works on all difficulties
- [ ] Speed Match generates random shapes correctly
- [ ] Scores persist in localStorage
- [ ] Leaderboard updates correctly
- [ ] Timer counts down properly
- [ ] Game over state displays correctly
- [ ] Reset button works
- [ ] Play Again restarts properly
- [ ] No console errors during gameplay
- [ ] Responsive on mobile (320px - 1920px)
- [ ] PWA installs correctly
- [ ] Offline mode works
- [ ] All retro styling renders correctly
- [ ] Animations smooth (60fps target)
- [ ] Neon effects visible in dark theme

---

## 📝 Reporting Issues

If you find bugs:

1. Check console for errors (F12)
2. Note browser and version
3. Describe steps to reproduce
4. Include screenshot if visual bug
5. Share any console errors

---

## 🚀 Quick Test Commands

```bash
# Full test suite
cd packages/nextjs

# Type check
yarn next:check-types

# Lint
yarn next:lint

# Build test
yarn build

# Start production server
yarn start

# Run all checks
yarn next:check-types && yarn next:lint && yarn build
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Starknet React](https://starknet-react.com/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

---

**Happy Testing! 🎮✨**

For questions or issues, check the GitHub repository or reach out to the development team.
