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
import { useScaffoldWriteContract } from '../../../hooks/scaffold-stark/useScaffoldWriteContract';
import { useDeployedContractInfo } from '../../../hooks/scaffold-stark';
import { useAccount } from '@starknet-react/core';
import { toast } from 'react-hot-toast';
import { Contract, cairo } from 'starknet';

export function useColorMatchGame() {
  const { address, account } = useAccount();
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
  const [currentGameId, setCurrentGameId] = useState<bigint | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Contract addresses - STRK token on mainnet
  const STRK_TOKEN = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';

  // Get game contract info
  const { data: gameContractInfo } = useDeployedContractInfo('ColorMatchGameV2');

  // Write contract hooks
  const { sendAsync: startGameContract, isPending: isStarting } = useScaffoldWriteContract({
    contractName: 'ColorMatchGameV2',
    functionName: 'start_game',
  });

  const { sendAsync: submitScoreContract, isPending: isSubmitting } = useScaffoldWriteContract({
    contractName: 'ColorMatchGameV2',
    functionName: 'submit_score',
  });

  // Load leaderboard on mount
  useEffect(() => {
    setLeaderboard(getLocalLeaderboard());
  }, []);

  const generateNextWord = useCallback(() => {
    const word = generateWord(selectedDifficulty.matchProbability);
    setGameState(prev => ({ ...prev, current: word }));
  }, [selectedDifficulty.matchProbability]);

  const startGame = useCallback(async (difficulty?: GameDifficulty) => {
    if (!address || !account || !gameContractInfo) {
      toast.error('Please connect your wallet first!');
      return;
    }

    if (difficulty) {
      setSelectedDifficulty(difficulty);
    }

    try {
      // Step 1: Approve STRK tokens
      toast.loading('Approving STRK tokens...', { id: 'start-game' });

      const MAX_APPROVAL = cairo.uint256('0xffffffffffffffffffffffffffffffff');

      const strkContract = new Contract(
        [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              { name: 'spender', type: 'ContractAddress' },
              { name: 'amount', type: 'u256' }
            ],
            outputs: [{ type: 'bool' }],
            state_mutability: 'external'
          }
        ],
        STRK_TOKEN,
        account
      );

      await account.execute([
        strkContract.populate('approve', [gameContractInfo.address, MAX_APPROVAL])
      ]);

      toast.loading('Approval confirmed! Starting game...', { id: 'start-game' });

      // Step 2: Call smart contract to start game
      const result = await startGameContract({
        args: [STRK_TOKEN], // payment_token
      });

      toast.success('Game started! Transaction confirmed.', { id: 'start-game' });

      // Extract game_id from result (first return value)
      const gameId = result && result.length > 0 ? BigInt(result[0]) : null;
      if (gameId) {
        setCurrentGameId(gameId);
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
    } catch (error: any) {
      console.error('Error starting game:', error);
      toast.error(error?.message || 'Failed to start game. Please try again.', { id: 'start-game' });
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
            0, // color_matches (you can track this if needed)
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