import { GameDifficulty, LevelConfig } from '../types';

export const MEMORY_GAME_CONSTANTS = {
  TILE_COLORS: [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Yellow
  ],

  TILE_COUNT: 4,

  ANIMATION_DURATIONS: {
    TILE_ACTIVATION: 300,
    TILE_GLOW: 200,
    SEQUENCE_DISPLAY: 500,
    FEEDBACK_DISPLAY: 800,
  },

  SCORING: {
    BASE_POINTS_PER_LEVEL: 10,
    TIME_BONUS_MULTIPLIER: 2,
    STREAK_BONUS: 5,
    PERFECT_LEVEL_BONUS: 20,
  },

  LIVES: {
    STARTING_LIVES: 3,
    BONUS_LIFE_EVERY: 5, // levels
  },

  REWARDS: {
    EASY_RANGE: [25, 35],
    MEDIUM_RANGE: [50, 60],
    HARD_RANGE: [75, 80],
  },
} as const;

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

export const GAME_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  DISPLAYING: 'displaying',
  WAITING_INPUT: 'waiting_input',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  COMPLETED: 'completed',
} as const;

export const TILE_STATES = {
  IDLE: 'idle',
  ACTIVE: 'active',
  CORRECT: 'correct',
  WRONG: 'wrong',
  DISPLAYING: 'displaying',
} as const;

export const ACHIEVEMENT_THRESHOLDS = {
  FIRST_GAME: 1,
  MEMORY_MASTER: 500,
  SPEED_DEMON: 30000, // milliseconds
  PERFECT_RECALL: 10,
  DIAMOND_MIND: 20,
} as const;

export const SOUND_EFFECTS = {
  TILE_ACTIVATE: '/sounds/tile-activate.wav',
  TILE_SUCCESS: '/sounds/tile-success.wav',
  TILE_ERROR: '/sounds/tile-error.wav',
  LEVEL_COMPLETE: '/sounds/level-complete.wav',
  GAME_OVER: '/sounds/game-over.wav',
  SEQUENCE_START: '/sounds/sequence-start.wav',
} as const;

export const ANIMATIONS = {
  TILE_PULSE: 'pulse 0.3s ease-in-out',
  TILE_GLOW: 'glow 0.5s ease-in-out',
  SCORE_POP: 'scorePop 0.4s ease-out',
  LEVEL_TRANSITION: 'levelTransition 1s ease-in-out',
} as const;