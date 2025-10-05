export interface Shape {
  color: string;
  type: ShapeType;
}

export type ShapeType = "square" | "circle" | "triangle" | "diamond" | "cross";

export interface GameState {
  prevShape: Shape | null;
  currentShape: Shape | null;
  score: number;
  timeLeft: number;
  playing: boolean;
  gameStarted: boolean;
  gameOver: boolean;
}

export interface LeaderboardEntry {
  score: number;
  timestamp: number;
  playerAddress?: string; // For future Starknet integration
}

export interface GameConfig {
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  matchProbability: number; // Probability of generating a match
}

export interface GameSession {
  sessionId?: string;
  gameType: string;
  difficulty: number;
  startTime: number;
  endTime?: number;
  finalScore: number;
  isCompleted: boolean;
}

// Starknet integration types (placeholders for future use)
export interface StarknetGameSession {
  sessionId: string;
  player: string;
  gameType: string;
  difficulty: number;
  startTimestamp: number;
  endTimestamp?: number;
  score?: number;
  reward?: string;
}

export interface StarknetPlayerStats {
  gamesPlayed: number;
  totalScore: number;
  highScore: number;
  totalRewards: string;
  rank: number;
  lastPlayed: number;
}

export interface GameDifficulty {
  name: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  matchProbability: number;
  scoreMultiplier: number;
  starkReward: string; // Reward in wei
}
