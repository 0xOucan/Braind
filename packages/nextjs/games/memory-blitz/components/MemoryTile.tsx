"use client";

import React from 'react';
import { cn } from '~~/lib/utils';

interface MemoryTileProps {
  index: number;
  color: string;
  isActive: boolean;
  isClickable: boolean;
  onClick: () => void;
}

export const MemoryTile: React.FC<MemoryTileProps> = ({
  index,
  color,
  isActive,
  isClickable,
  onClick,
}) => {
  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={cn(
        "w-28 h-28 transition-all duration-200 transform relative z-10",
        "border-4",
        "hover:scale-105 active:scale-95",
        {
          "cursor-pointer": isClickable,
          "cursor-not-allowed opacity-60": !isClickable,
          "animate-neon-pulse brightness-150": isActive,
        }
      )}
      style={{
        backgroundColor: isActive ? color : '#2a2a2a',
        borderColor: isActive ? color : '#404040',
        boxShadow: isActive
          ? `0 0 20px ${color}, 0 0 40px ${color}80, inset 0 0 20px ${color}40`
          : 'inset 0 0 10px rgba(0,0,0,0.5)',
      }}
      aria-label={`Memory tile ${index + 1}`}
    >
      <div className="w-full h-full flex items-center justify-center relative">
        {/* Inner pixel decoration */}
        <div
          className={cn(
            "w-10 h-10 border-4 transition-all duration-200",
            {
              "border-white animate-pixel-float": isActive,
              "border-gray-700": !isActive,
            }
          )}
          style={{
            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
            boxShadow: isActive ? `0 0 10px ${color}` : 'none',
          }}
        />
      </div>
    </button>
  );
};