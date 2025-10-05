import { GameDifficulty } from '../types';

export const COLORS = ["#0ff", "#f0f", "#ff0", "#0f0", "#f44", "#ffa500"];

export const SHAPE_TYPES = ["square", "circle", "triangle", "diamond", "cross"] as const;

export const GAME_DIFFICULTIES: Record<string, GameDifficulty> = {
  easy: {
    name: 'easy',
    timeLimit: 45,
    matchProbability: 0.5,
    scoreMultiplier: 1,
    starkReward: '25000000000000000000' // 25 STARK in wei
  },
  medium: {
    name: 'medium',
    timeLimit: 30,
    matchProbability: 0.5,
    scoreMultiplier: 1.5,
    starkReward: '60000000000000000000' // 60 STARK in wei
  },
  hard: {
    name: 'hard',
    timeLimit: 20,
    matchProbability: 0.5,
    scoreMultiplier: 2,
    starkReward: '80000000000000000000' // 80 STARK in wei
  }
};

export const GAME_CONFIG = {
  LEADERBOARD_SIZE: 10,
  STORAGE_KEY: 'speedmatch_leaderboard',
  GAME_TYPE: 'speedmatch',
  CORRECT_SCORE: 1,
  INCORRECT_PENALTY: -1,
  MIN_SCORE: 0,
  CANVAS_SIZE: 256
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
