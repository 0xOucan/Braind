'use client';

import React from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export function Leaderboard({ entries }: LeaderboardProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 max-w-md mx-auto">
      <div className="pixel-font text-white bg-black bg-opacity-70 border-4 border-pink-500 p-4">
        <h3 className="text-center text-sm md:text-base mb-3">🏆 LEADERBOARD</h3>
        <ol className="text-xs md:text-sm space-y-1 pl-6">
          {entries.map((entry, index) => (
            <li key={`${entry.score}-${entry.timestamp}`}>
              #{index + 1} — {entry.score} pts
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
