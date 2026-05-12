'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useMatchmakingStore } from '../../store/matchmaking-store';

interface GameOverOverlayProps {
  status: string;
  winnerId: string | null;
  myId: string;
  onReplay?: () => void;
}

export function GameOverOverlay({ status, winnerId, myId, onReplay }: GameOverOverlayProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const router = useRouter();
  const joinQueue = useMatchmakingStore((s) => s.joinQueue);

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

  const handlePlayAgain = () => {
    joinQueue();
    router.push('/lobby');
  };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-10 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', borderRadius: 12 }}
    >
      <div
        className="p-8 rounded-xl text-center space-y-4 animate-slide-up"
        style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}`, minWidth: 240 }}
      >
        <h2 className="text-2xl font-bold" style={{ color: titleColor }}>
          {title}
        </h2>
        <p className="text-sm" style={{ color: theme.textSecondary }}>
          {status === 'white_wins' ? 'White wins' : status === 'black_wins' ? 'Black wins' : 'Game over'}
        </p>
        <div className="flex flex-col gap-2 pt-2">
          {onReplay && (
            <button
              onClick={onReplay}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: theme.bgSecondary, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5C4 1.5 1.5 4 1.5 7S4 12.5 7 12.5 12.5 10 12.5 7 10 1.5 7 1.5Z" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M5.5 5L9.5 7L5.5 9V5Z" fill="currentColor"/>
              </svg>
              Watch Replay
            </button>
          )}
          <button
            onClick={handlePlayAgain}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.accent }}
          >
            Play Again
          </button>
          <Link
            href="/lobby"
            className="px-5 py-2 rounded-lg text-sm transition-opacity hover:opacity-80"
            style={{ color: theme.textSecondary }}
          >
            Back to Lobby
          </Link>
        </div>
      </div>
    </div>
  );
}
