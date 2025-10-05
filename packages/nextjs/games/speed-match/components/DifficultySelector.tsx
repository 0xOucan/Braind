'use client';

import React from 'react';
import { GameDifficulty } from '../types';
import { GAME_DIFFICULTIES } from '../utils/constants';

interface DifficultySelectorProps {
  selectedDifficulty: GameDifficulty;
  onSelect: (difficulty: GameDifficulty) => void;
  disabled?: boolean;
}

export function DifficultySelector({
  selectedDifficulty,
  onSelect,
  disabled = false
}: DifficultySelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="pixel-font text-sm md:text-base text-white text-center mb-3">
        SELECT DIFFICULTY
      </h3>
      <div className="flex gap-2 justify-center">
        {Object.values(GAME_DIFFICULTIES).map((difficulty) => (
          <button
            key={difficulty.name}
            onClick={() => onSelect(difficulty)}
            disabled={disabled}
            className={`pixel-font text-xs md:text-sm py-2 px-3 cursor-pointer border-4 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedDifficulty.name === difficulty.name
                ? 'bg-yellow-400 border-yellow-600 text-black'
                : 'bg-gray-700 border-gray-900 text-white'
            }`}
            style={{
              textShadow: selectedDifficulty.name === difficulty.name ? 'none' : '2px 2px 0px #000',
              boxShadow: 'inset -4px -4px #000, inset 4px 4px rgba(255,255,255,0.3)'
            }}
          >
            {difficulty.name.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="text-center mt-2 pixel-font text-xs text-white opacity-80">
        {selectedDifficulty.timeLimit}s • {selectedDifficulty.scoreMultiplier}x Score
      </div>
    </div>
  );
}
