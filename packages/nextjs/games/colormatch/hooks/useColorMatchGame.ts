import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GameDifficulty, LeaderboardEntry } from '../types';
import {
  generateWord,
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

export function useColorMatchGame() {
  const [gameState, setGameState] = useState<GameState>({
    current: null,
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

  const generateNextWord = useCallback(() => {
    const word = generateWord(selectedDifficulty.matchProbability);
    setGameState(prev => ({ ...prev, current: word }));
  }, [selectedDifficulty.matchProbability]);

  const startGame = useCallback((difficulty?: GameDifficulty) => {
    if (difficulty) {
      setSelectedDifficulty(difficulty);
    }

    const startTime = Date.now();
    setGameStartTime(startTime);

    setGameState({
      current: null,
      score: 0,
      timeLeft: difficulty?.timeLimit || selectedDifficulty.timeLimit,
      playing: true,
      gameStarted: true,
      gameOver: false
    });

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Generate first word
    const word = generateWord(difficulty?.matchProbability || selectedDifficulty.matchProbability);
    setGameState(prev => ({ ...prev, current: word }));

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
    //   'colormatch',
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
    if (!gameState.playing || !gameState.current) return;

    const isCorrect = isCorrectMatch(gameState.current, userAnswer);
    const newScore = calculateScore(gameState.score, isCorrect);

    setGameState(prev => ({
      ...prev,
      score: newScore
    }));

    // Generate next word
    generateNextWord();
  }, [gameState.playing, gameState.current, gameState.score, generateNextWord]);

  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setGameState({
      current: null,
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
    isMatch: gameState.current ?
      gameState.current.text.toLowerCase() === gameState.current.color.toLowerCase() : false,
    canStart: !gameState.playing && !gameState.gameOver,
    showPlayAgain: gameState.gameOver,
    // Starknet integration placeholders
    // connectWallet: () => {}, // TODO: Implement wallet connection
    // submitToStarknet: () => {}, // TODO: Implement Starknet submission
  };
}