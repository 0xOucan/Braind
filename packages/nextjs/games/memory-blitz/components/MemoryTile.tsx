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
        "w-24 h-24 pixel-border transition-all duration-200 transform",
        "border-4 border-black",
        "hover:scale-105 active:scale-95",
        {
          "cursor-pointer": isClickable,
          "cursor-not-allowed opacity-60": !isClickable,
          "animate-pulse brightness-150": isActive,
          "shadow-lg shadow-primary/50": isActive,
        }
      )}
      style={{
        backgroundColor: isActive ? color : '#6b7280',
        boxShadow: isActive ? `0 0 20px ${color}80` : 'none',
      }}
      aria-label={`Memory tile ${index + 1}`}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div
          className={cn(
            "w-8 h-8 pixel-border border-2",
            {
              "border-white": isActive,
              "border-gray-600": !isActive,
            }
          )}
          style={{
            backgroundColor: isActive ? 'white' : 'transparent',
          }}
        />
      </div>
    </button>
  );
};