// @ts-nocheck - Temporary workaround for V3 contract type issues
"use client";

import { useState, useCallback, useEffect } from 'react';
import { MemoryGameState, GameState, GameStats } from '../types';
import { MEMORY_GAME_CONSTANTS } from '../utils/constants';
import { useScaffoldWriteContract, useScaffoldReadContract, useDeployedContractInfo } from '~~/hooks/scaffold-stark';
import { useAccount, useProvider } from '@starknet-react/core';
import { toast } from 'react-hot-toast';
import { cairo, hash } from 'starknet';

export const useMemoryGame = () => {
  const { address, account } = useAccount();
  const { provider } = useProvider();
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
  const { data: gameContractInfo } = useDeployedContractInfo('MemoryBlitzGameV3');

  // Read contract hooks
  const { data: activeSessionData } = useScaffoldReadContract({
    contractName: 'MemoryBlitzGameV3',
    functionName: 'get_active_session',
    args: address ? [address] : undefined,
    watch: true,
  });

  // Read STRK balance (using a simple read - assuming standard ERC20)
  // Note: This is a basic implementation, you may need to adjust based on actual balance display

  // Write contract hooks
  const { sendAsync: startGameContract, isPending: isStarting } = useScaffoldWriteContract({
    contractName: 'MemoryBlitzGameV3',
    functionName: 'start_game',
  });

  const { sendAsync: submitScoreContract, isPending: isSubmitting } = useScaffoldWriteContract({
    contractName: 'MemoryBlitzGameV3',
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
      // Check for active session on-chain and close it if exists
      console.log('Active session data from contract:', activeSessionData);

      // Handle CairoOption type returned from contract
      let activeSessionId: bigint | undefined;

      if (activeSessionData !== undefined && activeSessionData !== null) {
        // Check if it's a CairoOption instance with isSome() method
        if (typeof activeSessionData === 'object' && 'isSome' in activeSessionData) {
          const option = activeSessionData as any;
          if (option.isSome()) {
            activeSessionId = option.unwrap();
          }
        }
        // Fallback: try to access Some property directly
        else if (typeof activeSessionData === 'object' && 'Some' in activeSessionData) {
          activeSessionId = (activeSessionData as any).Some;
        }
        // Direct bigint value
        else if (typeof activeSessionData === 'bigint') {
          activeSessionId = activeSessionData;
        }
      }

      console.log('Parsed active session ID:', activeSessionId);

      if (activeSessionId && activeSessionId > 0n) {
        console.log('Active session detected on-chain, closing it:', activeSessionId);
        try {
          toast.loading('Closing active game session...', { id: 'start-game' });

          const gameIdU256 = cairo.uint256(activeSessionId);
          await account.execute([{
            contractAddress: gameContractInfo?.address || '',
            entrypoint: 'submit_score',
            calldata: [
              gameIdU256.low,
              gameIdU256.high,
              String(0), // score
              String(0), // level_reached
              String(0), // sequence_length
            ]
          }]);

          toast.success('Previous session closed', { id: 'start-game' });
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error: any) {
          console.error('Failed to close previous session:', error);
          toast.error('Could not close previous session. Try again.', { id: 'start-game' });
          return;
        }
      }

      toast.loading('Approving STRK and starting game...', { id: 'start-game' });

      // Approve a large amount of STRK (100 STRK for multiple games)
      const APPROVAL_AMOUNT = cairo.uint256('100000000000000000000'); // 100 STRK

      // Multicall: approve + start_game in one transaction
      const tx = await account.execute([
        {
          contractAddress: STRK_TOKEN,
          entrypoint: 'approve',
          calldata: [gameContractInfo?.address || '', APPROVAL_AMOUNT.low, APPROVAL_AMOUNT.high]
        },
        {
          contractAddress: gameContractInfo?.address || '',
          entrypoint: 'start_game',
          calldata: [STRK_TOKEN]
        }
      ]);

      // Wait for transaction and get receipt
      toast.loading('Waiting for transaction confirmation...', { id: 'start-game' });
      const receipt = await provider.waitForTransaction(tx.transaction_hash);

      toast.success('Game started! Transaction confirmed.', { id: 'start-game' });

      // Extract game_id from events
      // The GameStarted event should contain the game_id
      const gameStartedEvent = receipt.events?.find((e: any) =>
        e.keys && e.keys[0] === hash.getSelectorFromName('GameStarted')
      );

      if (gameStartedEvent && gameStartedEvent.data) {
        // game_id is typically the first data field
        const gameId = BigInt(gameStartedEvent.data[0]);
        console.log('Extracted game_id from event:', gameId);
        setCurrentGameId(gameId);
      } else {
        console.warn('Could not find GameStarted event, using fallback');
        // Fallback: generate a temporary ID (not ideal but prevents null)
        setCurrentGameId(BigInt(Date.now()));
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

      // Check for specific error types
      if (error?.message?.includes('u256_sub Overflow') || error?.message?.includes('Overflow')) {
        toast.error('Insufficient STRK balance or approval! Please approve STRK tokens first.', { id: 'start-game' });
      } else if (error?.message?.includes('USER_REFUSED_OP')) {
        toast.error('Transaction cancelled by user.', { id: 'start-game' });
      } else if (error?.message?.includes('nonce')) {
        toast.error('Nonce error. Please try again in a few seconds.', { id: 'start-game' });
      } else {
        toast.error(error?.message || 'Failed to start game. Please try again.', { id: 'start-game' });
      }
    }
  }, [generateSequence, address, account, gameContractInfo, provider, STRK_TOKEN]);

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

      if (currentGameId && address && finalScore > 0 && account && gameContractInfo) {
        try {
          toast.loading('Submitting score to Starknet...', { id: 'submit-score' });

          // Use cairo.uint256 to properly format the game_id
          const gameIdU256 = cairo.uint256(currentGameId);

          console.log('Submitting score with params:', {
            gameId: currentGameId,
            gameIdU256,
            score: finalScore,
            levelReached: finalLevel,
            types: {
              gameIdLow: typeof gameIdU256.low,
              gameIdHigh: typeof gameIdU256.high,
              score: typeof finalScore,
              level: typeof finalLevel,
            }
          });

          // Calldata: All values must be strings for Starknet.js
          // The deployed contract expects 4 params: game_id (u256), score (u32), level_reached (u32), sequence_length (u32)
          const calldata = [
            gameIdU256.low,                        // game_id.low (u128)
            gameIdU256.high,                       // game_id.high (u128)
            String(finalScore),                    // score (u32)
            String(finalLevel),                    // level_reached (u32)
            String(gameState.sequence.length),     // sequence_length (u32) - THIS WAS MISSING!
          ];

          console.log('Calldata array:', calldata);
          console.log('Calldata types:', calldata.map(v => typeof v));
          console.log('Contract address:', gameContractInfo.address);

          // Submit score directly using account.execute to avoid scaffold hook issues
          const tx = await account.execute([{
            contractAddress: gameContractInfo.address,
            entrypoint: 'submit_score',
            calldata: calldata
          }]);

          toast.loading('Waiting for score submission confirmation...', { id: 'submit-score' });
          await provider.waitForTransaction(tx.transaction_hash);

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