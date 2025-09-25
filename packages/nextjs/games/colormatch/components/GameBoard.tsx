'use client';

import React from 'react';
import { GameState } from '../types';

interface GameBoardProps {
  gameState: GameState;
  onAnswer: (isMatch: boolean) => void;
  onStartGame: () => void;
  onResetGame: () => void;
  disabled?: boolean;
}

export function GameBoard({
  gameState,
  onAnswer,
  onStartGame,
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
    <div className="w-full max-w-md mx-auto p-4 border-8 border-white rounded-lg shadow-2xl bg-gradient-to-br from-amber-800 to-amber-900 retro-game-bg">
      {/* Game Display */}
      <div className="w-full aspect-square border-4 border-yellow-400 bg-black shadow-inner flex items-center justify-center mb-4">
        <div
          className="text-4xl font-bold pixel-font text-center px-4"
          style={{
            color: displayColor,
            textShadow: '2px 2px 0px #000'
          }}
        >
          {displayText}
        </div>
      </div>

      {/* Game Buttons */}
      {gameState.playing && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => onAnswer(true)}
            disabled={disabled}
            className="flex-1 pixel-font text-sm md:text-base py-3 px-2 cursor-pointer border-none bg-green-600 border-4 border-green-800 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              textShadow: '2px 2px 0px #000',
              boxShadow: 'inset -4px -4px #000, inset 4px 4px rgba(255,255,255,0.3)'
            }}
          >
            ✔ MATCH
          </button>
          <button
            onClick={() => onAnswer(false)}
            disabled={disabled}
            className="flex-1 pixel-font text-sm md:text-base py-3 px-2 cursor-pointer border-none bg-red-600 border-4 border-red-800 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              textShadow: '2px 2px 0px #000',
              boxShadow: 'inset -4px -4px #000, inset 4px 4px rgba(255,255,255,0.3)'
            }}
          >
            ✘ NO MATCH
          </button>
        </div>
      )}

      {/* Score and Timer */}
      <div className="flex justify-center gap-4 mb-4">
        <div className="pixel-font text-sm md:text-base text-white bg-gray-800 border-4 border-yellow-400 py-2 px-3">
          SCORE: {gameState.score}
        </div>
        <div className="pixel-font text-sm md:text-base text-white bg-gray-800 border-4 border-yellow-400 py-2 px-3">
          TIME: {gameState.timeLeft}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col gap-2">
        {!gameState.gameStarted && (
          <button
            onClick={onStartGame}
            disabled={disabled}
            className="w-full pixel-font text-sm md:text-base py-3 bg-blue-600 border-4 border-blue-800 text-white cursor-pointer hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              textShadow: '2px 2px 0px #000',
              boxShadow: 'inset -4px -4px #000, inset 4px 4px rgba(255,255,255,0.3)'
            }}
          >
            ▶ START GAME
          </button>
        )}

        {gameState.gameOver && (
          <button
            onClick={onStartGame}
            disabled={disabled}
            className="w-full pixel-font text-sm md:text-base py-3 bg-blue-600 border-4 border-blue-800 text-white cursor-pointer hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              textShadow: '2px 2px 0px #000',
              boxShadow: 'inset -4px -4px #000, inset 4px 4px rgba(255,255,255,0.3)'
            }}
          >
            ▶ PLAY AGAIN
          </button>
        )}

        {(gameState.playing || gameState.gameOver) && (
          <button
            onClick={onResetGame}
            disabled={disabled}
            className="w-full pixel-font text-xs md:text-sm py-2 bg-gray-600 border-4 border-gray-800 text-white cursor-pointer hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              textShadow: '2px 2px 0px #000',
              boxShadow: 'inset -4px -4px #000, inset 4px 4px rgba(255,255,255,0.3)'
            }}
          >
            🔄 RESET
          </button>
        )}
      </div>
    </div>
  );
}