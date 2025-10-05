import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GameDifficulty, LeaderboardEntry, Shape } from '../types';
import {
  generateNextShape,
  isCorrectMatch,
  calculateScore,
  calculateFinalScore,
  saveScoreToLocalStorage,
  getLocalLeaderboard,
  prepareStarknetSubmission,
  getDifficultyNumber,
  getGameDuration
} from '../utils/gameLogic';
import { GAME_DIFFICULTIES } from '../utils/constants';

export function useSpeedMatchGame() {
  const [gameState, setGameState] = useState<GameState>({
    prevShape: null,
    currentShape: null,
    score: 0,
    timeLeft: 0,
    playing: false,
    gameStarted: false,
    gameOver: false
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>(GAME_DIFFICULTIES.medium);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load leaderboard on mount
  useEffect(() => {
    setLeaderboard(getLocalLeaderboard());
  }, []);

  const generateNext = useCallback(() => {
    setGameState(prev => {
      const newShape = generateNextShape(prev.currentShape, selectedDifficulty.matchProbability);
      return {
        ...prev,
        prevShape: prev.currentShape,
        currentShape: newShape
      };
    });
  }, [selectedDifficulty.matchProbability]);

  const startGame = useCallback((difficulty?: GameDifficulty) => {
    if (difficulty) {
      setSelectedDifficulty(difficulty);
    }

    const startTime = Date.now();
    setGameStartTime(startTime);

    const usedDifficulty = difficulty || selectedDifficulty;

    setGameState({
      prevShape: null,
      currentShape: null,
      score: 0,
      timeLeft: usedDifficulty.timeLimit,
      playing: true,
      gameStarted: true,
      gameOver: false
    });

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Generate first shape
    const firstShape = generateNextShape(null, usedDifficulty.matchProbability);
    setGameState(prev => ({ ...prev, currentShape: firstShape }));

    // Start timer
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          return { ...prev, timeLeft: 0, playing: false, gameOver: true };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [selectedDifficulty]);

  const endGame = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const duration = getGameDuration(gameStartTime);
    const finalScore = calculateFinalScore(gameState.score, gameState.timeLeft, selectedDifficulty);

    setGameState(prev => ({
      ...prev,
      playing: false,
      gameOver: true,
      score: finalScore
    }));

    // Save to local leaderboard
    const updatedLeaderboard = saveScoreToLocalStorage(finalScore);
    setLeaderboard(updatedLeaderboard);

    // TODO: Submit to Starknet contract
    // const starknetData = prepareStarknetSubmission(
    //   'speedmatch',
    //   finalScore,
    //   getDifficultyNumber(selectedDifficulty.name),
    //   duration
    // );

    console.log('Game ended:', {
      finalScore,
      duration,
      difficulty: selectedDifficulty.name,
      // starknetData
    });
  }, [gameState.score, gameState.timeLeft, selectedDifficulty, gameStartTime]);

  const submitAnswer = useCallback((userAnswer: boolean) => {
    if (!gameState.playing) return;

    // First answer just generates the next shape
    if (!gameState.prevShape) {
      generateNext();
      return;
    }

    const isCorrect = isCorrectMatch(gameState.prevShape, gameState.currentShape, userAnswer);
    const newScore = calculateScore(gameState.score, isCorrect);

    setGameState(prev => ({
      ...prev,
      score: newScore
    }));

    // Generate next shape
    generateNext();
  }, [gameState.playing, gameState.prevShape, gameState.currentShape, gameState.score, generateNext]);

  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setGameState({
      prevShape: null,
      currentShape: null,
      score: 0,
      timeLeft: 0,
      playing: false,
      gameStarted: false,
      gameOver: false
    });
  }, []);

  // Handle game end when time runs out
  useEffect(() => {
    if (gameState.timeLeft === 0 && gameState.playing) {
      endGame();
    }
  }, [gameState.timeLeft, gameState.playing, endGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    gameState,
    leaderboard,
    selectedDifficulty,
    startGame,
    submitAnswer,
    resetGame,
    setSelectedDifficulty,
    // Computed values
    canStart: !gameState.playing && !gameState.gameOver,
    showPlayAgain: gameState.gameOver,
  };
}
