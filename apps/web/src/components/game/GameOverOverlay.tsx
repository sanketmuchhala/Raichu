'use client';

import Link from 'next/link';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';

interface GameOverOverlayProps {
  status: string;
  winnerId: string | null;
  myId: string;
}

export function GameOverOverlay({ status, winnerId, myId }: GameOverOverlayProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);

  const isWinner = winnerId === myId;
  const isDraw = status === 'abandoned';

  const title = isDraw
    ? 'Game Abandoned'
    : isWinner
      ? 'You Won!'
      : 'You Lost';

  const titleColor = isDraw
    ? theme.textSecondary
    : isWinner
      ? '#22c55e'
      : '#ef4444';

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-10"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', borderRadius: 12 }}
    >
      <div
        className="p-6 rounded-xl text-center space-y-4"
        style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}` }}
      >
        <h2 className="text-2xl font-bold" style={{ color: titleColor }}>
          {title}
        </h2>
        <p className="text-sm" style={{ color: theme.textSecondary }}>
          {status === 'white_wins' ? 'White wins' : status === 'black_wins' ? 'Black wins' : 'Game over'}
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/lobby"
            className="px-5 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: theme.accent }}
          >
            Back to Lobby
          </Link>
        </div>
      </div>
    </div>
  );
}
