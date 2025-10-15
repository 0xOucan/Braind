'use client';

import React from 'react';
import { GameState } from '../types';

interface GameBoardProps {
  gameState: GameState;
  onAnswer: (isMatch: boolean) => void;
  onStartGame: () => void;
  onPlayAgain: () => void;
  onResetGame: () => void;
  disabled?: boolean;
}

export function GameBoard({
  gameState,
  onAnswer,
  onStartGame,
  onPlayAgain,
  onResetGame,
  disabled = false
}: GameBoardProps) {
  const displayText = gameState.gameOver
    ? "GAME OVER"
    : gameState.current?.text || "COLOR MATCH";

  const displayColor = gameState.gameOver
    ? "#fff"
    : gameState.current?.color || "#fff";

  return (
    <div className="w-full max-w-md mx-auto retro-game-container border-4 border-pixel-gray p-6">
      {/* Game Display - CRT Screen */}
      <div className="w-full aspect-square border-4 border-yellow-400 bg-pixel-black shadow-pixel-lg flex items-center justify-center mb-6 relative overflow-hidden">
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none scanlines opacity-20"></div>

        <div
          className="text-4xl md:text-5xl font-bold pixel-font text-center px-4 z-10 animate-crt-flicker"
          style={{
            color: displayColor,
            textShadow: `0 0 10px ${displayColor}, 0 0 20px ${displayColor}, 2px 2px 0px #000`
          }}
        >
          {displayText}
        </div>
      </div>

      {/* Game Buttons */}
      {gameState.playing && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => onAnswer(true)}
            disabled={disabled}
            className="flex-1 arcade-button bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-4"
          >
            <span className="pixel-font text-xs">✔ MATCH</span>
          </button>
          <button
            onClick={() => onAnswer(false)}
            disabled={disabled}
            className="flex-1 arcade-button text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-4"
          >
            <span className="pixel-font text-xs">✘ NO MATCH</span>
          </button>
        </div>
      )}

      {/* Score and Timer */}
      <div className="flex justify-center gap-4 mb-6">
        <div className="retro-score text-base px-4 py-2 bg-pixel-dark-gray border-2 border-yellow-400">
          SCORE: {gameState.score}
        </div>
        <div className="pixel-font text-base neon-text-yellow px-4 py-2 bg-pixel-dark-gray border-2 border-yellow-400">
          TIME: {gameState.timeLeft}s
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col gap-3">
        {!gameState.gameStarted && (
          <button
            onClick={onStartGame}
            disabled={disabled}
            className="w-full arcade-button py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="pixel-font text-xs">▶ START GAME</span>
          </button>
        )}

        {gameState.gameOver && (
          <button
            onClick={onPlayAgain}
            disabled={disabled}
            className="w-full arcade-button py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="pixel-font text-xs">▶ PLAY AGAIN</span>
          </button>
        )}

        {(gameState.playing || gameState.gameOver) && (
          <button
            onClick={onResetGame}
            disabled={disabled}
            className="w-full btn-pixel bg-gray-700 border-2 border-gray-500 text-white py-3 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="pixel-font text-xs">🔄 RESET</span>
          </button>
        )}
      </div>
    </div>
  );
}