'use client';

import React from 'react';
import { useColorMatchGame } from '../hooks/useColorMatchGame';
import { GameBoard } from './GameBoard';
import { DifficultySelector } from './DifficultySelector';
import { Leaderboard } from './Leaderboard';

interface GameContainerProps {
  onGameEnd?: (score: number) => void;
  disabled?: boolean;
}

export function GameContainer({ onGameEnd, disabled = false }: GameContainerProps) {
  const {
    gameState,
    leaderboard,
    selectedDifficulty,
    startGame,
    submitAnswer,
    resetGame,
    setSelectedDifficulty,
    showPlayAgain
  } = useColorMatchGame();

  const handleStartGame = () => {
    startGame(selectedDifficulty);
  };

  const handleGameEnd = (score: number) => {
    onGameEnd?.(score);
  };

  // Call onGameEnd when game ends
  React.useEffect(() => {
    if (gameState.gameOver && gameState.score > 0) {
      handleGameEnd(gameState.score);
    }
  }, [gameState.gameOver, gameState.score]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-blue-500">
      {/* Game Title */}
      <div className="mb-6">
        <h1 className="pixel-font text-4xl md:text-6xl text-white text-center mb-2">
          COLOR MATCH
        </h1>
        <p className="pixel-font text-sm md:text-base text-center text-blue-200">
          🧠 Retro Pixel Brain Training
        </p>
      </div>

      {/* Difficulty Selector (only show when not playing) */}
      {!gameState.playing && (
        <DifficultySelector
          selectedDifficulty={selectedDifficulty}
          onSelect={setSelectedDifficulty}
          disabled={disabled}
        />
      )}

      {/* Game Board */}
      <GameBoard
        gameState={gameState}
        onAnswer={submitAnswer}
        onStartGame={handleStartGame}
        onResetGame={resetGame}
        disabled={disabled}
      />

      {/* Game Instructions */}
      {!gameState.gameStarted && (
        <div className="mt-6 max-w-md mx-auto">
          <div className="pixel-font text-white bg-black bg-opacity-50 border-2 border-white p-4 text-center text-sm">
            <div className="mb-2">🎮 HOW TO PLAY:</div>
            <div className="text-xs leading-relaxed">
              Match the COLOR of the text with the WORD meaning.
              <br />
              Click ✔ MATCH if they match, ✘ NO MATCH if they don't.
              <br />
              Score points for correct answers, lose points for wrong ones!
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <Leaderboard entries={leaderboard} />

      {/* Starknet Integration Status */}
      {gameState.gameOver && (
        <div className="mt-4 max-w-md mx-auto">
          <div className="pixel-font text-white bg-purple-900 bg-opacity-50 border-2 border-purple-400 p-3 text-center text-xs">
            🌟 Game Complete! Final Score: {gameState.score}
            <br />
            <span className="text-purple-300">
              🚀 Starknet integration coming soon for rewards!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}