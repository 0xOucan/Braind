import { ColorWord, GameDifficulty, LeaderboardEntry } from '../types';
import { COLOR_WORDS, GAME_CONFIG } from './constants';

export function generateWord(matchProbability: number): ColorWord {
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

export function isCorrectMatch(word: ColorWord, userAnswer: boolean): boolean {
  const actualMatch = word.text.toLowerCase() === getColorName(word.color).toLowerCase();
  return actualMatch === userAnswer;
}

export function getColorName(hexColor: string): string {
  const colorMap: Record<string, string> = {
    '#ff4136': 'red',
    '#2ecc40': 'green',
    '#0074d9': 'blue',
    '#ffdc00': 'yellow',
    '#b10dc9': 'purple',
    '#7fdbff': 'cyan',
    '#ff851b': 'orange',
    '#f012be': 'pink'
  };
  return colorMap[hexColor] || 'unknown';
}

export function calculateScore(currentScore: number, isCorrect: boolean): number {
  const newScore = currentScore + (isCorrect ? GAME_CONFIG.CORRECT_SCORE : GAME_CONFIG.INCORRECT_PENALTY);
  return Math.max(GAME_CONFIG.MIN_SCORE, newScore);
}

export function calculateFinalScore(baseScore: number, timeBonus: number, difficulty: GameDifficulty): number {
  const bonusScore = timeBonus > 0 ? Math.floor(timeBonus * 0.1) : 0;
  return Math.floor((baseScore + bonusScore) * difficulty.scoreMultiplier);
}

export function saveScoreToLocalStorage(score: number): LeaderboardEntry[] {
  const leaderboard = getLocalLeaderboard();
  const newEntry: LeaderboardEntry = {
    score,
    timestamp: Date.now()
  };

  leaderboard.push(newEntry);
  leaderboard.sort((a, b) => b.score - a.score);
  const trimmedBoard = leaderboard.slice(0, GAME_CONFIG.LEADERBOARD_SIZE);

  localStorage.setItem(GAME_CONFIG.STORAGE_KEY, JSON.stringify(trimmedBoard));
  return trimmedBoard;
}

export function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem(GAME_CONFIG.STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    // Handle legacy format (just numbers) vs new format (objects)
    return parsed.map((item: any) => {
      if (typeof item === 'number') {
        return { score: item, timestamp: Date.now() };
      }
      return item;
    });
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return [];
  }
}

export function formatTime(seconds: number): string {
  return `${seconds}s`;
}

export function formatScore(score: number): string {
  return `${score} pts`;
}

// Starknet integration helpers (placeholders for future use)
export function prepareStarknetSubmission(
  gameType: string,
  score: number,
  difficulty: number,
  duration: number
) {
  return {
    contractName: 'BrainDGameManager',
    functionName: 'submit_game_score',
    args: [
      gameType,
      score,
      difficulty,
      duration
    ]
  };
}

export function getDifficultyNumber(difficulty: 'easy' | 'medium' | 'hard'): number {
  const difficultyMap = {
    'easy': 1,
    'medium': 2,
    'hard': 3
  };
  return difficultyMap[difficulty];
}

export function getGameDuration(startTime: number): number {
  return Math.floor((Date.now() - startTime) / 1000);
}