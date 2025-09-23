"use client";

import React from 'react';
import { GameBoard } from './components/GameBoard';
import { GameUI } from './components/GameUI';
import { useMemoryGame } from './hooks/useMemoryGame';
import { useGameTimer } from './hooks/useGameTimer';

export const MemoryBlitzGame: React.FC = () => {
  const {
    gameState,
    sequence,
    userSequence,
    activeTile,
    isDisplaying,
    isPlaying,
    stats,
    startGame,
    restartGame,
    pauseGame,
    handleTileClick,
  } = useMemoryGame();

  const { timer } = useGameTimer(gameState);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-300 to-base-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
          {/* Game Controls and Stats */}
          <div className="order-2 lg:order-1">
            <GameUI
              gameState={gameState}
              stats={stats}
              timer={timer}
              onStartGame={startGame}
              onRestartGame={restartGame}
              onPauseGame={pauseGame}
            />
          </div>

          {/* Game Board */}
          <div className="order-1 lg:order-2 flex justify-center">
            <GameBoard
              sequence={sequence}
              userSequence={userSequence}
              activeTile={activeTile}
              isDisplaying={isDisplaying}
              isPlaying={isPlaying}
              onTileClick={handleTileClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};