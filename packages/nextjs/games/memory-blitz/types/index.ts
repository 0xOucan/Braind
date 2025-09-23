export interface MemoryGameState {
  sequence: number[];
  userSequence: number[];
  currentStep: number;
  isPlaying: boolean;
  isDisplaying: boolean;
  isWaitingForInput: boolean;
  score: number;
  level: number;
  lives: number;
  streak: number;
  timeRemaining: number;
  gameStartTime: number;
  highScore: number;
  gameState: GameState;
  activeTile: number | null;
}

export interface MemoryGameConfig {
  sequenceLength: number;
  displayTime: number;
  totalLevels: number;
  lives: number;
  timeLimit: number;
  colors: string[];
}

export interface MemoryTileProps {
  id: number;
  color: string;
  isActive: boolean;
  isDisplaying: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  onClick: (id: number) => void;
  disabled: boolean;
}

export interface GameUIProps {
  score: number;
  level: number;
  lives: number;
  timeRemaining: number;
  streak: number;
  isPlaying: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export interface MemoryGameHookReturn {
  gameState: MemoryGameState;
  config: MemoryGameConfig;
  handleTileClick: (tileId: number) => void;
  startGame: () => void;
  pauseGame: () => void;
  resetGame: () => void;
  isGameOver: boolean;
  isGameWon: boolean;
}

export type GameDifficulty = 1 | 2 | 3; // Easy, Medium, Hard
export type TileState = 'idle' | 'active' | 'correct' | 'wrong' | 'displaying';
export type GameState = 'idle' | 'displaying' | 'playing' | 'paused' | 'won' | 'lost';

export interface GameStats {
  level: number;
  score: number;
  highScore: number;
}

export interface ScoreData {
  baseScore: number;
  timeBonus: number;
  streakBonus: number;
  totalScore: number;
}

export interface LevelConfig {
  sequenceLength: number;
  displayTime: number;
  timeLimit: number;
}

export const DIFFICULTY_CONFIGS: Record<GameDifficulty, LevelConfig> = {
  1: { // Easy
    sequenceLength: 4,
    displayTime: 3000,
    timeLimit: 60000,
  },
  2: { // Medium
    sequenceLength: 6,
    displayTime: 2500,
    timeLimit: 45000,
  },
  3: { // Hard
    sequenceLength: 8,
    displayTime: 2000,
    timeLimit: 30000,
  },
};

export interface GameEndData {
  score: number;
  level: number;
  difficulty: GameDifficulty;
  duration: number;
  streak: number;
  accuracy: number;
}