"use client";

import { useState, useCallback, useEffect } from 'react';
import { MemoryGameState, GameState, GameStats } from '../types';
import { MEMORY_GAME_CONSTANTS } from '../utils/constants';
import { useScaffoldWriteContract } from '../../../hooks/scaffold-stark/useScaffoldWriteContract';
import { useAccount } from '@starknet-react/core';
import { toast } from 'react-hot-toast';

export const useMemoryGame = () => {
  const { address } = useAccount();
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

  // Write contract hooks
  const { writeAsync: startGameContract, isPending: isStarting } = useScaffoldWriteContract({
    contractName: 'MemoryBlitzGameV2',
    functionName: 'start_game',
  });

  const { writeAsync: submitScoreContract, isPending: isSubmitting } = useScaffoldWriteContract({
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
    if (!address) {
      toast.error('Please connect your wallet first!');
      return;
    }

    try {
      toast.loading('Starting game on Starknet...', { id: 'start-game' });

      // Call smart contract to start game
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
      toast.error(error?.message || 'Failed to start game. Please try again.', { id: 'start-game' });
    }
  }, [generateSequence, address, startGameContract, STRK_TOKEN]);

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
  const handleTileClick = useCallback((tileIndex: number) => {
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
      if (currentGameId && address && finalScore > 0) {
        try {
          toast.loading('Submitting score to Starknet...', { id: 'submit-score' });

          submitScoreContract({
            args: [
              currentGameId,
              finalScore,
              finalLevel, // level_reached
            ],
          }).then(() => {
            toast.success('Score submitted successfully!', { id: 'submit-score' });
          }).catch((error: any) => {
            console.error('Error submitting score:', error);
            toast.error(error?.message || 'Failed to submit score', { id: 'submit-score' });
          });
        } catch (error: any) {
          console.error('Error submitting score:', error);
          toast.error(error?.message || 'Failed to submit score', { id: 'submit-score' });
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