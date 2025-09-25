'use client';

import React from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  maxEntries?: number;
}

export function Leaderboard({
  entries,
  title = "🏆 Leaderboard",
  maxEntries = 10
}: LeaderboardProps) {
  const displayEntries = entries.slice(0, maxEntries);

  if (displayEntries.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto mt-6">
        <div className="pixel-font text-white bg-gray-900 border-4 border-pink-500 p-4">
          <h3 className="text-center mb-3 text-lg">{title}</h3>
          <div className="text-center text-gray-400 text-sm">
            No scores yet. Be the first to play!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <div className="pixel-font text-white bg-gray-900 border-4 border-pink-500 p-4">
        <h3 className="text-center mb-3 text-lg">{title}</h3>

        <ol className="space-y-2">
          {displayEntries.map((entry, index) => {
            const isTopThree = index < 3;
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

            return (
              <li
                key={`${entry.score}-${entry.timestamp}-${index}`}
                className={`flex justify-between items-center py-2 px-3 rounded ${
                  isTopThree
                    ? 'bg-yellow-900 bg-opacity-50 border border-yellow-600'
                    : 'bg-gray-800 bg-opacity-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm w-6">
                    {medal || `#${index + 1}`}
                  </span>
                  {entry.playerAddress && (
                    <span className="text-xs text-blue-400">
                      {entry.playerAddress.slice(0, 6)}...{entry.playerAddress.slice(-4)}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`font-bold ${isTopThree ? 'text-yellow-400' : 'text-white'}`}>
                    {entry.score} pts
                  </span>
                  {entry.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {entries.length > maxEntries && (
          <div className="text-center text-gray-400 text-xs mt-3">
            Showing top {maxEntries} of {entries.length} scores
          </div>
        )}

        {/* Starknet Integration Placeholder */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="text-center text-xs text-gray-500">
            🚀 Global Starknet leaderboard coming soon!
          </div>
        </div>
      </div>
    </div>
  );
}