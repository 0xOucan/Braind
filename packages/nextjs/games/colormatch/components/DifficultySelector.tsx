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
  const difficulties = Object.values(GAME_DIFFICULTIES);

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <h3 className="pixel-font neon-text-yellow text-center mb-4 text-sm">
        🎯 SELECT DIFFICULTY 🎯
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {difficulties.map((difficulty) => {
          const isSelected = selectedDifficulty.name === difficulty.name;
          const rewardAmount = parseInt(difficulty.starkReward) / 1e18;

          return (
            <button
              key={difficulty.name}
              onClick={() => onSelect(difficulty)}
              disabled={disabled}
              className={`pixel-font text-xs py-4 px-3 border-4 transition-all duration-200 shadow-pixel ${
                isSelected
                  ? 'bg-yellow-400 border-yellow-600 text-black scale-105 shadow-neon-yellow'
                  : 'bg-pixel-dark-gray border-pixel-gray text-white hover:bg-pixel-gray hover:shadow-neon-purple'
              } ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="uppercase font-bold mb-1">
                {difficulty.name}
              </div>
              <div className="text-xs opacity-90">
                ⏱ {difficulty.timeLimit}s
              </div>
              <div className="text-xs mt-1 font-bold">
                {rewardAmount} $STARK
              </div>
            </button>
          );
        })}
      </div>

      {/* Difficulty Info */}
      <div className="mt-4 p-4 retro-game-container border-pixel-gray">
        <div className="pixel-font text-white text-xs text-center">
          <div className="mb-3">
            <span className="neon-text-yellow text-sm">⚡ {selectedDifficulty.name.toUpperCase()} ⚡</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-pixel-black p-2 border border-gray-700">
              ⏱ TIME<br/>{selectedDifficulty.timeLimit}s
            </div>
            <div className="bg-pixel-black p-2 border border-gray-700">
              ✖ MULTI<br/>{selectedDifficulty.scoreMultiplier}x
            </div>
            <div className="bg-pixel-black p-2 border border-gray-700">
              🎯 MATCH<br/>{Math.round(selectedDifficulty.matchProbability * 100)}%
            </div>
            <div className="bg-pixel-black p-2 border border-gray-700">
              💰 REWARD<br/>{parseInt(selectedDifficulty.starkReward) / 1e18}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}