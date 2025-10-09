"use client";

import { useState, useCallback, useEffect } from 'react';
import { MemoryGameState, GameState, GameStats } from '../types';
import { MEMORY_GAME_CONSTANTS } from '../utils/constants';
import { useScaffoldWriteContract } from '../../../hooks/scaffold-stark/useScaffoldWriteContract';
import { useScaffoldReadContract } from '../../../hooks/scaffold-stark/useScaffoldReadContract';
import { useDeployedContractInfo } from '../../../hooks/scaffold-stark';
import { useAccount } from '@starknet-react/core';
import { toast } from 'react-hot-toast';
import { cairo } from 'starknet';

export const useMemoryGame = () => {
  const { address, account } = useAccount();
  const [currentGameId, setCurrentGameId] = useState<bigint | null>(null);
  const [gameState, setGameState] = useState<MemoryGameState>({
    sequence: [],
    userSequence: [],
    currentStep: 0,
    isPlaying: false,
    isDisplaying: false,
    isWaitingForInput: false,
    level: 1,
    score: 0,
    lives: 3,
    streak: 0,
    timeRemaining: 0,
    gameStartTime: 0,
    highScore: 0,
    gameState: 'idle',
    activeTile: null,
  });

  // Contract addresses - STRK token on mainnet
  const STRK_TOKEN = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';

  // Get game contract info
  const { data: gameContractInfo } = useDeployedContractInfo('MemoryBlitzGameV2');

  // Read STRK balance (using a simple read - assuming standard ERC20)
  // Note: This is a basic implementation, you may need to adjust based on actual balance display

  // Write contract hooks
  const { sendAsync: startGameContract, isPending: isStarting } = useScaffoldWriteContract({
    contractName: 'MemoryBlitzGameV2',
    functionName: 'start_game',
  });

  const { sendAsync: submitScoreContract, isPending: isSubmitting } = useScaffoldWriteContract({
    contractName: 'MemoryBlitzGameV2',
    functionName: 'submit_score',
  });

  // Initialize high score from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('memory-blitz-high-score');
    if (savedHighScore) {
      setGameState(prev => ({
        ...prev,
        highScore: parseInt(savedHighScore, 10),
      }));
    }
  }, []);

  // Generate random sequence for current level
  const generateSequence = useCallback((level: number): number[] => {
    const sequence = [];
    for (let i = 0; i < level + 2; i++) {
      sequence.push(Math.floor(Math.random() * MEMORY_GAME_CONSTANTS.TILE_COUNT));
    }
    return sequence;
  }, []);

  // Start a new game
  const startGame = useCallback(async () => {
    if (!address || !account || !gameContractInfo) {
      toast.error('Please connect your wallet first!');
      return;
    }

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

      // Step 2: Call smart contract to start game
      const result = await startGameContract({
        args: [STRK_TOKEN], // payment_token
      });

      toast.success('Game started! Transaction confirmed.', { id: 'start-game' });

      // Extract game_id from result
      const gameId = result && result.length > 0 ? BigInt(result[0]) : null;
      if (gameId) {
        setCurrentGameId(gameId);
      }

      const newSequence = generateSequence(1);
      setGameState(prev => ({
        ...prev,
        sequence: newSequence,
        userSequence: [],
        currentStep: 0,
        level: 1,
        score: 0,
        gameState: 'displaying',
        isDisplaying: true,
        isPlaying: false,
        activeTile: null,
      }));
    } catch (error: any) {
      console.error('Error starting game:', error);

      // Check if it's an overflow error (insufficient balance)
      if (error?.message?.includes('u256_sub Overflow') || error?.message?.includes('Overflow')) {
        toast.error('Insufficient STRK balance! You need at least 1 STRK to play.', { id: 'start-game' });
      } else {
        toast.error(error?.message || 'Failed to start game. Please try again.', { id: 'start-game' });
      }
    }
  }, [generateSequence, address, account, gameContractInfo, startGameContract, STRK_TOKEN]);

  // Restart current game
  const restartGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameState: 'idle',
      isDisplaying: false,
      isPlaying: false,
      activeTile: null,
      userSequence: [],
      currentStep: 0,
    }));
  }, []);

  // Pause/resume game
  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameState: prev.gameState === 'paused' ? 'playing' : 'paused',
    }));
  }, []);

  // Display sequence to player
  const displaySequence = useCallback(() => {
    let index = 0;

    const showNextTile = () => {
      if (index < gameState.sequence.length) {
        setGameState(prev => ({ ...prev, activeTile: prev.sequence[index] }));

        setTimeout(() => {
          setGameState(prev => ({ ...prev, activeTile: null }));
          index++;

          if (index < gameState.sequence.length) {
            setTimeout(showNextTile, MEMORY_GAME_CONSTANTS.ANIMATION_DURATIONS.SEQUENCE_PAUSE);
          } else {
            // Sequence display complete, start player input
            setTimeout(() => {
              setGameState(prev => ({
                ...prev,
                isDisplaying: false,
                isPlaying: true,
                gameState: 'playing',
              }));
            }, MEMORY_GAME_CONSTANTS.ANIMATION_DURATIONS.SEQUENCE_PAUSE);
          }
        }, MEMORY_GAME_CONSTANTS.ANIMATION_DURATIONS.TILE_ACTIVATION);
      }
    };

    setTimeout(showNextTile, 500); // Initial delay before starting sequence
  }, [gameState.sequence]);

  // Handle tile click
  const handleTileClick = useCallback(async (tileIndex: number) => {
    if (!gameState.isPlaying || gameState.isDisplaying) return;

    const newUserSequence = [...gameState.userSequence, tileIndex];
    const expectedTile = gameState.sequence[gameState.currentStep];

    // Check if the clicked tile is correct
    if (tileIndex === expectedTile) {
      // Correct tile clicked
      setGameState(prev => ({
        ...prev,
        userSequence: newUserSequence,
        currentStep: prev.currentStep + 1,
        activeTile: tileIndex,
      }));

      // Clear active tile after animation
      setTimeout(() => {
        setGameState(prev => ({ ...prev, activeTile: null }));
      }, MEMORY_GAME_CONSTANTS.ANIMATION_DURATIONS.TILE_ACTIVATION);

      // Check if sequence is complete
      if (newUserSequence.length === gameState.sequence.length) {
        // Level complete!
        const newScore = gameState.score + (gameState.level * 100);
        const newLevel = gameState.level + 1;

        setTimeout(() => {
          setGameState(prev => {
            const newHighScore = Math.max(prev.highScore, newScore);

            // Save high score to localStorage
            if (newHighScore > prev.highScore) {
              localStorage.setItem('memory-blitz-high-score', newHighScore.toString());
            }

            return {
              ...prev,
              score: newScore,
              level: newLevel,
              highScore: newHighScore,
              gameState: 'won',
              isPlaying: false,
            };
          });

          // Start next level after celebration
          setTimeout(() => {
            const nextSequence = generateSequence(newLevel);
            setGameState(prev => ({
              ...prev,
              sequence: nextSequence,
              userSequence: [],
              currentStep: 0,
              gameState: 'displaying',
              isDisplaying: true,
              isPlaying: false,
              activeTile: null,
            }));
          }, 1500);
        }, 500);
      }
    } else {
      // Wrong tile clicked - game over
      const finalScore = gameState.score;
      const finalLevel = gameState.level;

      setGameState(prev => ({
        ...prev,
        gameState: 'lost',
        isPlaying: false,
        activeTile: tileIndex,
      }));

      // Submit score to contract
      console.log('Game over - checking score submission:', {
        currentGameId,
        address,
        finalScore,
        finalLevel,
        sequenceLength: gameState.sequence.length
      });

      if (currentGameId && address && finalScore > 0) {
        try {
          toast.loading('Submitting score to Starknet...', { id: 'submit-score' });

          await submitScoreContract({
            args: [
              currentGameId,
              finalScore,
              finalLevel, // level_reached
              gameState.sequence.length, // sequence_length (current level's sequence length)
            ],
          });

          toast.success('Score submitted successfully!', { id: 'submit-score' });
        } catch (error: any) {
          console.error('Error submitting score:', error);
          toast.error(error?.message || 'Failed to submit score', { id: 'submit-score' });
        }
      } else {
        console.warn('Score submission skipped:', {
          hasGameId: !!currentGameId,
          hasAddress: !!address,
          hasScore: finalScore > 0
        });
        if (!currentGameId) {
          toast.error('No game ID found. Score not submitted.', { id: 'submit-score' });
        }
      }

      // Clear active tile and reset after delay
      setTimeout(() => {
        setGameState(prev => ({ ...prev, activeTile: null }));
        setTimeout(() => {
          restartGame();
        }, 1000);
      }, MEMORY_GAME_CONSTANTS.ANIMATION_DURATIONS.TILE_ACTIVATION);
    }
  }, [gameState, generateSequence, restartGame, currentGameId, address, submitScoreContract]);

  // Auto-display sequence when state changes to displaying
  useEffect(() => {
    if (gameState.gameState === 'displaying' && gameState.isDisplaying) {
      displaySequence();
    }
  }, [gameState.gameState, gameState.isDisplaying, displaySequence]);

  return {
    gameState: gameState.gameState,
    sequence: gameState.sequence,
    userSequence: gameState.userSequence,
    activeTile: gameState.activeTile,
    isDisplaying: gameState.isDisplaying,
    isPlaying: gameState.isPlaying,
    stats: {
      level: gameState.level,
      score: gameState.score,
      highScore: gameState.highScore,
    } as GameStats,
    startGame,
    restartGame,
    pauseGame,
    handleTileClick,
  };
};