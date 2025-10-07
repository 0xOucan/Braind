# 🚀 BrainD Quick Start Guide

Get up and running with BrainD in 5 minutes!

## ⚡ Quick Setup

```bash
# 1. Navigate to the frontend
cd packages/nextjs

# 2. Install dependencies (if needed)
yarn install

# 3. Start development server
yarn dev
```

**🎮 Open browser: http://localhost:3000**

---

## 🎯 Test Games Immediately

### Without Wallet Connection

Games work **out of the box** without any wallet connection!

1. **Go to Games**: Click "Games" in navigation or visit `/games`
2. **Pick a Game**:
   - Color Match: `/games/colormatch`
   - Speed Match: `/games/speed-match`
3. **Select Difficulty**: Easy, Medium, or Hard
4. **Play**: Click "START GAME" and have fun!

Scores save automatically to browser localStorage.

---

## 🧪 Quick Testing Commands

### Test in Browser Console

Open DevTools (F12) and paste:

```javascript
// Load test helpers
import('/utils/testHelpers.js').then(({ runAllTests }) => {
  runAllTests();
});

// Or test individual games
import('/utils/testHelpers.js').then(({ testColorMatchRandomness }) => {
  testColorMatchRandomness(0.5, 100); // 50% match rate, 100 rounds
});
```

### Verify Game Randomness

```javascript
// Test Color Match fairness (in console)
import { testColorMatchRandomness } from './utils/testHelpers';

// Test with 50% match probability (medium difficulty)
testColorMatchRandomness(0.5, 200);
// Should show ~50% actual match rate

// Test all difficulties
testColorMatchRandomness(0.7, 200); // Easy: ~70%
testColorMatchRandomness(0.3, 200); // Hard: ~30%
```

---

## 🎨 Visual Theme Checklist

Open the site and verify:

✅ **Night Mode Active**
- Dark background (`#0f172a`)
- Neon glowing text (red, yellow, purple)
- CRT scanlines on game screens
- Pixel-perfect shadows on cards

✅ **Retro Elements**
- Floating logo in header
- Arcade-style buttons with press effect
- Pixel grid backgrounds
- 8-bit font (Press Start 2P)

✅ **Animations**
- Title floats up/down
- Icons bounce
- Text blinks
- CRT flicker effect

---

## 📱 Test as PWA

```bash
# 1. Build for production
yarn build

# 2. Start production server
yarn start

# 3. Open http://localhost:3000

# 4. Install PWA
# Click install icon in browser address bar
```

---

## 🔧 Quick Fixes

### Games not loading?
```bash
rm -rf .next
yarn dev
```

### Styles missing?
```bash
# Restart dev server
Ctrl+C
yarn dev
```

### Want to test wallet features?
```javascript
// In browser console
import { walletSimulator } from './utils/walletSimulation';
walletSimulator.connect('alice');
```

---

## 🎮 Game URLs

Quick access:

- **Home**: http://localhost:3000
- **Games Hub**: http://localhost:3000/games
- **Color Match**: http://localhost:3000/games/colormatch
- **Speed Match**: http://localhost:3000/games/speed-match
- **Leaderboard**: http://localhost:3000/leaderboard
- **Profile**: http://localhost:3000/profile

---

## 📊 Test Checklist (2 minutes)

Do this quick test before committing:

```bash
# 1. Type check
yarn next:check-types

# 2. Lint
yarn next:lint

# 3. Build
yarn build

# All pass? You're good! ✅
```

---

## 🎯 Common Testing Scenarios

### Test Score Persistence

1. Play Color Match
2. Get a score (e.g., 500)
3. Refresh page
4. Go to Color Match again
5. Check leaderboard - your score should be there ✅

### Test Difficulty Levels

1. Play Easy (70s, 1x multiplier)
2. Play Medium (60s, 1.5x multiplier)
3. Play Hard (45s, 2x multiplier)
4. Verify: Harder = shorter time, higher score multiplier ✅

### Test Responsive Design

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)
4. All games should work ✅

---

## 🐛 Debug Mode

```javascript
// Enable verbose logging (in console)
localStorage.setItem('debug', 'braind:*');

// Now play a game and check console for detailed logs
```

---

## 🚀 Production Build Test

```bash
# Complete production test
yarn build && yarn start

# Then test:
# - Games work
# - PWA installs
# - Offline mode works (DevTools > Network > Offline)
# - No console errors
```

---

## 💡 Pro Tips

1. **Use keyboard shortcuts**: F12 for DevTools, Ctrl+Shift+C for inspect
2. **Test in incognito**: Clean slate, no cached data
3. **Check mobile**: Real device > emulator for best results
4. **Monitor console**: Look for warnings/errors
5. **Test offline**: PWA should work without internet

---

## 📚 Next Steps

- Read full [TESTING.md](./TESTING.md) for comprehensive guide
- Check [CLAUDE.md](./packages/nextjs/CLAUDE.md) for project structure
- Review game logic in `packages/nextjs/games/*/utils/gameLogic.ts`

---

**Happy Testing! 🎮✨**

Need help? Check console for errors or review the testing documentation.
