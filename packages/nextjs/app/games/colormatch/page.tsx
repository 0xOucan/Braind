'use client';

import { GameContainer } from '../../../games/colormatch/components';

export default function ColorMatchPage() {
  const handleGameEnd = (score: number) => {
    console.log('🎮 Game ended with final score:', score);
  };

  return (
    <div className="min-h-screen bg-main crt-screen pixel-grid-bg">
      <GameContainer onGameEnd={handleGameEnd} />
    </div>
  );
}