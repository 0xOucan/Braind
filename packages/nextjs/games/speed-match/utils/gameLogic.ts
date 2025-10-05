import { Shape, GameDifficulty, LeaderboardEntry } from '../types';
import { COLORS, SHAPE_TYPES, GAME_CONFIG } from './constants';

export function randomShape(): Shape {
  return {
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    type: SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)]
  };
}

export function generateNextShape(
  prevShape: Shape | null,
  matchProbability: number
): Shape {
  if (!prevShape) {
    return randomShape();
  }

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

export function isCorrectMatch(
  prevShape: Shape | null,
  currentShape: Shape | null,
  userAnswer: boolean
): boolean {
  if (!prevShape || !currentShape) return false;

  const actualMatch =
    prevShape.type === currentShape.type &&
    prevShape.color === currentShape.color;

  return actualMatch === userAnswer;
}

export function calculateScore(currentScore: number, isCorrect: boolean): number {
  const newScore = currentScore + (isCorrect ? GAME_CONFIG.CORRECT_SCORE : GAME_CONFIG.INCORRECT_PENALTY);
  return Math.max(GAME_CONFIG.MIN_SCORE, newScore);
}

export function calculateFinalScore(
  baseScore: number,
  timeBonus: number,
  difficulty: GameDifficulty
): number {
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
