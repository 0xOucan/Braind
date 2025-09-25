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
      <h3 className="pixel-font text-white text-center mb-4 text-lg">
        🎯 SELECT DIFFICULTY
      </h3>

      <div className="grid grid-cols-3 gap-2">
        {difficulties.map((difficulty) => {
          const isSelected = selectedDifficulty.name === difficulty.name;
          const rewardAmount = parseInt(difficulty.starkReward) / 1e18; // Convert wei to STARK

          return (
            <button
              key={difficulty.name}
              onClick={() => onSelect(difficulty)}
              disabled={disabled}
              className={`pixel-font text-xs py-3 px-2 border-4 transition-all duration-200 ${
                isSelected
                  ? 'bg-yellow-400 border-yellow-600 text-black scale-105'
                  : 'bg-gray-700 border-gray-900 text-white hover:bg-gray-600 hover:scale-102'
              } ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              style={{
                textShadow: isSelected ? '1px 1px 0px #000' : '1px 1px 0px #000',
                boxShadow: 'inset -2px -2px #000, inset 2px 2px rgba(255,255,255,0.3)'
              }}
            >
              <div className="uppercase font-bold mb-1">
                {difficulty.name}
              </div>
              <div className="text-xs opacity-90">
                {difficulty.timeLimit}s
              </div>
              <div className="text-xs opacity-75 mt-1">
                {rewardAmount} STARK
              </div>
            </button>
          );
        })}
      </div>

      {/* Difficulty Info */}
      <div className="mt-4 p-3 bg-black bg-opacity-50 border-2 border-gray-600 rounded">
        <div className="pixel-font text-white text-xs text-center">
          <div className="mb-2">
            <span className="text-yellow-400">⚡ {selectedDifficulty.name.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Time: {selectedDifficulty.timeLimit}s</div>
            <div>Multiplier: {selectedDifficulty.scoreMultiplier}x</div>
            <div>Match Rate: {Math.round(selectedDifficulty.matchProbability * 100)}%</div>
            <div>Reward: {parseInt(selectedDifficulty.starkReward) / 1e18} STARK</div>
          </div>
        </div>
      </div>
    </div>
  );
}