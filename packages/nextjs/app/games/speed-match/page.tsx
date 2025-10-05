'use client';

import { GameContainer } from '../../../games/speed-match/components';

export default function SpeedMatchPage() {
  const handleGameEnd = (score: number) => {
    console.log('⚡ Game ended with final score:', score);
  };

  return (
    <div className="min-h-screen bg-blue-500">
      <GameContainer onGameEnd={handleGameEnd} />
    </div>
  );
}
