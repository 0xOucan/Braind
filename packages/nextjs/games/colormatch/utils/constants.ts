import { ColorWord, GameDifficulty } from '../types';

export const COLOR_WORDS: ColorWord[] = [
  { text: "RED", color: "#ff4136" },
  { text: "GREEN", color: "#2ecc40" },
  { text: "BLUE", color: "#0074d9" },
  { text: "YELLOW", color: "#ffdc00" },
  { text: "PURPLE", color: "#b10dc9" },
  { text: "CYAN", color: "#7fdbff" },
  { text: "ORANGE", color: "#ff851b" },
  { text: "PINK", color: "#f012be" }
];

export const GAME_DIFFICULTIES: Record<string, GameDifficulty> = {
  easy: {
    name: 'easy',
    timeLimit: 45,
    matchProbability: 0.4,
    scoreMultiplier: 1,
    starkReward: '25000000000000000000' // 25 STARK in wei
  },
  medium: {
    name: 'medium',
    timeLimit: 35,
    matchProbability: 0.3,
    scoreMultiplier: 1.5,
    starkReward: '60000000000000000000' // 60 STARK in wei
  },
  hard: {
    name: 'hard',
    timeLimit: 25,
    matchProbability: 0.2,
    scoreMultiplier: 2,
    starkReward: '80000000000000000000' // 80 STARK in wei
  }
};

export const GAME_CONFIG = {
  LEADERBOARD_SIZE: 10,
  STORAGE_KEY: 'colormatch_leaderboard',
  GAME_TYPE: 'colormatch',
  CORRECT_SCORE: 1,
  INCORRECT_PENALTY: -1,
  MIN_SCORE: 0
};

export const GAME_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished'
} as const;

// Starknet contract constants (placeholders)
export const STARKNET_CONFIG = {
  CONTRACT_NAME: 'BrainDGameManager',
  SUBMIT_SCORE_FUNCTION: 'submit_game_score',
  GET_PLAYER_STATS_FUNCTION: 'get_player_stats',
  GET_LEADERBOARD_FUNCTION: 'get_leaderboard'
} as const;