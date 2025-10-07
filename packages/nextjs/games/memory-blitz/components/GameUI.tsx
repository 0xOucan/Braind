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
    <div className="flex flex-col gap-6 p-6 retro-game-container border-4 border-pixel-gray">
      {/* Game Status */}
      <div className="text-center">
        <h2 className="text-3xl pixel-font neon-text-purple mb-4 animate-neon-pulse">
          🧠 MEMORY BLITZ 🧠
        </h2>
        <div className="pixel-font text-sm neon-text-yellow">
          {gameState === 'idle' && '⚡ READY TO PLAY ⚡'}
          {gameState === 'displaying' && '👀 WATCH PATTERN 👀'}
          {gameState === 'playing' && '🎯 REPEAT PATTERN 🎯'}
          {gameState === 'paused' && '⏸ GAME PAUSED ⏸'}
          {gameState === 'won' && '🎉 CORRECT! 🎉'}
          {gameState === 'lost' && '❌ WRONG PATTERN ❌'}
        </div>
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-pixel-black p-4 border-4 border-purple-500 shadow-neon-purple">
          <div className="text-2xl pixel-font neon-text-purple">{stats.level}</div>
          <div className="text-xs pixel-font text-white">LEVEL</div>
        </div>
        <div className="bg-pixel-black p-4 border-4 border-yellow-400 shadow-neon-yellow">
          <div className="text-2xl pixel-font neon-text-yellow">{stats.score}</div>
          <div className="text-xs pixel-font text-white">SCORE</div>
        </div>
        <div className="bg-pixel-black p-4 border-4 border-red-600 shadow-neon-red">
          <div className="text-2xl pixel-font neon-text-red">{formatTime(timer)}</div>
          <div className="text-xs pixel-font text-white">TIME</div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex flex-col gap-3">
        {gameState === 'idle' && (
          <button
            onClick={onStartGame}
            className="arcade-button py-4"
          >
            <span className="pixel-font text-xs">▶ START GAME</span>
          </button>
        )}

        {(gameState === 'displaying' || gameState === 'playing') && (
          <button
            onClick={onPauseGame}
            className="btn-pixel bg-yellow-600 border-2 border-yellow-400 text-black py-3 hover:bg-yellow-500"
          >
            <span className="pixel-font text-xs">⏸ PAUSE</span>
          </button>
        )}

        {gameState !== 'idle' && (
          <button
            onClick={onRestartGame}
            className="btn-pixel bg-gray-700 border-2 border-gray-500 text-white py-3 hover:bg-gray-600"
          >
            <span className="pixel-font text-xs">🔄 RESTART</span>
          </button>
        )}
      </div>

      {/* High Score Display */}
      {stats.highScore > 0 && (
        <div className="text-center bg-pixel-black border-2 border-yellow-400 p-3">
          <div className="text-xs pixel-font text-white mb-1">🏆 BEST SCORE 🏆</div>
          <div className="text-xl pixel-font neon-text-yellow">{stats.highScore}</div>
        </div>
      )}

      {/* Instructions */}
      {gameState === 'idle' && (
        <div className="bg-pixel-black p-4 border-4 border-pixel-gray text-xs scanlines">
          <h3 className="pixel-font neon-text-yellow mb-3 text-center">⚡ HOW TO PLAY ⚡</h3>
          <ul className="pixel-font text-white space-y-2 text-xs">
            <li>► Watch the sequence of colored tiles</li>
            <li>► Repeat the pattern by clicking tiles</li>
            <li>► Each level adds one more tile</li>
            <li>► Complete sequences to advance</li>
          </ul>
        </div>
      )}
    </div>
  );
};