"use client";

import { useState, useEffect, useCallback } from 'react';
import { GameState } from '../types';

export const useGameTimer = (gameState: GameState) => {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Start timer
  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  // Stop timer
  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Reset timer
  const resetTimer = useCallback(() => {
    setTimer(0);
    setIsRunning(false);
  }, []);

  // Pause/resume timer
  const pauseTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  // Handle game state changes
  useEffect(() => {
    switch (gameState) {
      case 'displaying':
      case 'playing':
        if (!isRunning) {
          startTimer();
        }
        break;
      case 'paused':
        setIsRunning(false);
        break;
      case 'idle':
      case 'won':
      case 'lost':
        resetTimer();
        break;
      default:
        break;
    }
  }, [gameState, isRunning, startTimer, resetTimer]);

  return {
    timer,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    pauseTimer,
  };
};