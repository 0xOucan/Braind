"use client";

import React from 'react';
import { MemoryTile } from './MemoryTile';
import { MEMORY_GAME_CONSTANTS } from '../utils/constants';

interface GameBoardProps {
  sequence: number[];
  userSequence: number[];
  activeTile: number | null;
  isDisplaying: boolean;
  isPlaying: boolean;
  onTileClick: (index: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  sequence,
  userSequence,
  activeTile,
  isDisplaying,
  isPlaying,
  onTileClick,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-6 bg-base-200 border-4 border-primary pixel-border">
      {Array.from({ length: MEMORY_GAME_CONSTANTS.TILE_COUNT }, (_, index) => (
        <MemoryTile
          key={index}
          index={index}
          color={MEMORY_GAME_CONSTANTS.TILE_COLORS[index]}
          isActive={activeTile === index}
          isClickable={isPlaying && !isDisplaying}
          onClick={() => onTileClick(index)}
        />
      ))}
    </div>
  );
};