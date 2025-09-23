"use client";

import React from 'react';
import { GameState, GameStats } from '../types';

interface GameUIProps {
  gameState: GameState;
  stats: GameStats;
  timer: number;
  onStartGame: () => void;
  onRestartGame: () => void;
  onPauseGame: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  stats,
  timer,
  onStartGame,
  onRestartGame,
  onPauseGame,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Game Status */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Memory Blitz</h2>
        <div className="text-lg font-mono">
          {gameState === 'idle' && 'Ready to Play'}
          {gameState === 'displaying' && 'Watch the Pattern'}
          {gameState === 'playing' && 'Repeat the Pattern'}
          {gameState === 'paused' && 'Game Paused'}
          {gameState === 'won' && '🎉 Correct!'}
          {gameState === 'lost' && '❌ Wrong Pattern'}
        </div>
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-base-200 p-4 pixel-border border-2 border-primary">
          <div className="text-2xl font-bold text-primary">{stats.level}</div>
          <div className="text-sm">Level</div>
        </div>
        <div className="bg-base-200 p-4 pixel-border border-2 border-secondary">
          <div className="text-2xl font-bold text-secondary">{stats.score}</div>
          <div className="text-sm">Score</div>
        </div>
        <div className="bg-base-200 p-4 pixel-border border-2 border-accent">
          <div className="text-2xl font-bold text-accent">{formatTime(timer)}</div>
          <div className="text-sm">Time</div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex gap-4 justify-center">
        {gameState === 'idle' && (
          <button
            onClick={onStartGame}
            className="btn btn-primary btn-lg pixel-button"
          >
            🎮 Start Game
          </button>
        )}

        {(gameState === 'displaying' || gameState === 'playing') && (
          <button
            onClick={onPauseGame}
            className="btn btn-warning pixel-button"
          >
            ⏸️ Pause
          </button>
        )}

        {gameState !== 'idle' && (
          <button
            onClick={onRestartGame}
            className="btn btn-secondary pixel-button"
          >
            🔄 Restart
          </button>
        )}
      </div>

      {/* High Score Display */}
      {stats.highScore > 0 && (
        <div className="text-center">
          <div className="text-sm text-base-content/70">Best Score</div>
          <div className="text-xl font-bold text-primary">{stats.highScore}</div>
        </div>
      )}

      {/* Instructions */}
      {gameState === 'idle' && (
        <div className="bg-base-200 p-4 pixel-border border-2 border-base-300 text-sm">
          <h3 className="font-bold mb-2">How to Play:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Watch the sequence of colored tiles</li>
            <li>Repeat the pattern by clicking the tiles</li>
            <li>Each level adds one more tile to remember</li>
            <li>Complete sequences to advance levels</li>
          </ul>
        </div>
      )}
    </div>
  );
};