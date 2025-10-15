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
    playAgain,
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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative z-20">
      {/* Game Title */}
      <div className="mb-6">
        <h1 className="pixel-font text-4xl md:text-6xl text-center mb-2 neon-text-red animate-pixel-float">
          COLOR MATCH
        </h1>
        <p className="pixel-font text-sm md:text-base text-center neon-text-purple">
          🧠 RETRO BRAIN TRAINING 🧠
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
        onPlayAgain={playAgain}
        onResetGame={resetGame}
        disabled={disabled}
      />

      {/* Game Instructions */}
      {!gameState.gameStarted && (
        <div className="mt-6 max-w-md mx-auto">
          <div className="pixel-font retro-game-container border-yellow-400 p-4 text-center text-sm">
            <div className="mb-2 neon-text-yellow">🎮 HOW TO PLAY 🎮</div>
            <div className="text-xs leading-relaxed text-white">
              Match COLOR of text with WORD meaning
              <br />
              ✔ MATCH if same • ✘ NO MATCH if different
              <br />
              Score +pts for correct • -pts for wrong
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <Leaderboard entries={leaderboard} />

      {/* Starknet Integration Status */}
      {gameState.gameOver && (
        <div className="mt-4 max-w-md mx-auto">
          <div className="pixel-font game-over-screen p-4 text-center text-sm">
            <div className="neon-text-red mb-2">GAME COMPLETE</div>
            <div className="retro-score mb-2">SCORE: {gameState.score}</div>
            <div className="text-xs neon-text-purple">
              🚀 STARKNET REWARDS COMING SOON 🚀
            </div>
          </div>
        </div>
      )}
    </div>
  );
}