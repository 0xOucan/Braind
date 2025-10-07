'use client';

import { MemoryBlitzGame } from '../../../games/memory-blitz/MemoryBlitzGame';

export default function MemoryBlitzPage() {
  return (
    <div className="min-h-screen bg-main crt-screen pixel-grid-bg">
      <MemoryBlitzGame />
    </div>
  );
}
