'use client';

import React, { useEffect, useRef } from 'react';
import { Shape } from '../types';
import { GAME_CONFIG } from '../utils/constants';

interface GameCanvasProps {
  shape: Shape | null;
  gameOver: boolean;
}

export function GameCanvas({ shape, gameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    if (gameOver) {
      // Draw game over text
      ctx.fillStyle = '#fff';
      ctx.font = "16px 'Press Start 2P'";
      ctx.fillText('GAME OVER', 40, 128);
      return;
    }

    if (!shape) return;

    // Draw the shape
    switch (shape.type) {
      case 'square':
        pixelRect(ctx, 96, 96, 64, 64, shape.color);
        break;
      case 'circle':
        pixelCircle(ctx, 128, 128, 32, shape.color);
        break;
      case 'triangle':
        pixelTriangle(ctx, 128, 128, 36, shape.color);
        break;
      case 'diamond':
        pixelDiamond(ctx, 128, 128, 36, shape.color);
        break;
      case 'cross':
        pixelCross(ctx, 128, 128, 16, shape.color);
        break;
    }
  }, [shape, gameOver]);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_CONFIG.CANVAS_SIZE}
      height={GAME_CONFIG.CANVAS_SIZE}
      className="w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

// Pixel art drawing functions
function pixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function pixelCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string
) {
  ctx.fillStyle = color;
  for (let i = -r; i < r; i++) {
    for (let j = -r; j < r; j++) {
      if (i * i + j * j < r * r) {
        ctx.fillRect(cx + i, cy + j, 2, 2);
      }
    }
  }
}

function pixelTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.fillStyle = color;
  for (let row = -size; row <= size; row++) {
    const half = Math.floor((size - Math.abs(row)) * 1.2);
    ctx.fillRect(x - half, y + row, half * 2, 2);
  }
}

function pixelDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.fillStyle = color;
  for (let row = -size; row <= size; row++) {
    const half = size - Math.abs(row);
    ctx.fillRect(x - half, y + row, half * 2, 2);
  }
}

function pixelCross(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(x - size / 2, y - size * 1.5, size, size * 3);
  ctx.fillRect(x - size * 1.5, y - size / 2, size * 3, size);
}
