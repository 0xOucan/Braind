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
import { useScaffoldWriteContract } from '../../../hooks/scaffold-stark/useScaffoldWriteContract';
import { useDeployedContractInfo } from '../../../hooks/scaffold-stark';
import { useAccount } from '@starknet-react/core';
import { toast } from 'react-hot-toast';
import { cairo } from 'starknet';

export function useSpeedMatchGame() {
  const { address, account } = useAccount();
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
  const [currentGameId, setCurrentGameId] = useState<bigint | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Contract addresses - STRK token on mainnet
  const STRK_TOKEN = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';

  // Get game contract info
  const { data: gameContractInfo } = useDeployedContractInfo('SpeedMatchGameV2');

  // Write contract hooks
  const { sendAsync: startGameContract, isPending: isStarting } = useScaffoldWriteContract({
    contractName: 'SpeedMatchGameV2',
    functionName: 'start_game',
  });

  const { sendAsync: submitScoreContract, isPending: isSubmitting } = useScaffoldWriteContract({
    contractName: 'SpeedMatchGameV2',
    functionName: 'submit_score',
  });

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

  const startGame = useCallback(async (difficulty?: GameDifficulty) => {
    if (!address || !account || !gameContractInfo) {
      toast.error('Please connect your wallet first!');
      return;
    }

    if (difficulty) {
      setSelectedDifficulty(difficulty);
    }

    const usedDifficulty = difficulty || selectedDifficulty;

    try {
      // Step 1: Approve STRK tokens (1.01 STRK to cover game fee)
      toast.loading('Approving STRK tokens...', { id: 'start-game' });

      // Approve 1.01 STRK (1010000000000000000 wei = 1.01 * 10^18)
      const APPROVAL_AMOUNT = cairo.uint256('1010000000000000000');

      // Use account.execute with direct call structure
      await account.execute([
        {
          contractAddress: STRK_TOKEN,
          entrypoint: 'approve',
          calldata: [gameContractInfo.address, APPROVAL_AMOUNT.low, APPROVAL_AMOUNT.high]
        }
      ]);

      toast.loading('Approval confirmed! Starting game...', { id: 'start-game' });

      // Step 2: Call smart contract to start game - SpeedMatch requires difficulty parameter
      const difficultyNumber = getDifficultyNumber(usedDifficulty.name);
      const result = await startGameContract({
        args: [difficultyNumber, STRK_TOKEN], // difficulty, payment_token
      });

      toast.success('Game started! Transaction confirmed.', { id: 'start-game' });

      // Extract game_id from result
      const gameId = result && result.length > 0 ? BigInt(result[0]) : null;
      if (gameId) {
        setCurrentGameId(gameId);
      }

      const startTime = Date.now();
      setGameStartTime(startTime);

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
    } catch (error: any) {
      console.error('Error starting game:', error);

      // Check if it's an overflow error (insufficient balance)
      if (error?.message?.includes('u256_sub Overflow') || error?.message?.includes('Overflow')) {
        toast.error('Insufficient STRK balance! You need at least 1 STRK to play.', { id: 'start-game' });
      } else {
        toast.error(error?.message || 'Failed to start game. Please try again.', { id: 'start-game' });
      }
    }
  }, [selectedDifficulty, address, account, gameContractInfo, startGameContract, STRK_TOKEN]);

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

    // Submit to Starknet contract
    if (currentGameId && address && finalScore > 0) {
      try {
        toast.loading('Submitting score to Starknet...', { id: 'submit-score' });

        await submitScoreContract({
          args: [
            currentGameId,
            finalScore,
            BigInt(duration), // time_taken in milliseconds
          ],
        });

        toast.success('Score submitted successfully!', { id: 'submit-score' });
      } catch (error: any) {
        console.error('Error submitting score:', error);
        toast.error(error?.message || 'Failed to submit score', { id: 'submit-score' });
      }
    }

    console.log('Game ended:', {
      finalScore,
      duration,
      difficulty: selectedDifficulty.name,
      gameId: currentGameId,
    });
  }, [gameState.score, gameState.timeLeft, selectedDifficulty, gameStartTime, currentGameId, address, submitScoreContract]);

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
