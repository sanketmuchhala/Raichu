'use client';

import Link from 'next/link';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';

// ─── types ────────────────────────────────────────────────────────────────

export interface GameResultModalProps {
  status: 'white_wins' | 'black_wins' | 'abandoned';

  // Who is the viewer — determines "You Won" vs "You Lost"
  myColor?: 'white' | 'black' | null;

  // Display names for both sides
  whiteName: string;
  blackName: string;

  // Game stats
  moveCount: number;

  // ELO (online games only)
  eloChange?: number | null;
  newElo?: number | null;

  // Callbacks
  onNewGame?: () => void;
  onReplay?: () => void;
  onPlayAgain?: () => void;   // online "play again"
  onClose?: () => void;
}

// ─── helpers ──────────────────────────────────────────────────────────────

function Avatar({ name, color, size = 44 }: { name: string; color: 'white' | 'black'; size?: number }) {
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: '50%',
        backgroundColor: color === 'white' ? '#f0f0f0' : '#2a2a2a',
        border: color === 'white' ? '2px solid #ccc' : '2px solid #555',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 800,
        color: color === 'white' ? '#333' : '#f0ece8',
        flexShrink: 0,
      }}
    >
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

// ─── component ────────────────────────────────────────────────────────────

export function GameResultModal({
  status,
  myColor,
  whiteName,
  blackName,
  moveCount,
  eloChange,
  newElo,
  onNewGame,
  onReplay,
  onPlayAgain,
  onClose,
}: GameResultModalProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);

  const isAbandoned = status === 'abandoned';
  const whiteWon    = status === 'white_wins';
  const blackWon    = status === 'black_wins';

  // Personal result
  const iWon  = myColor ? (myColor === 'white' ? whiteWon : blackWon) : false;
  const iLost = myColor ? (myColor === 'white' ? blackWon : whiteWon) : false;

  const resultTitle = isAbandoned
    ? 'Game Abandoned'
    : myColor
      ? (iWon ? 'You Won!' : 'You Lost')
      : (whiteWon ? 'White Wins' : 'Black Wins');

  const resultColor = isAbandoned
    ? theme.textSecondary
    : (iWon || (!myColor && whiteWon)) ? '#22c55e' : '#ef4444';

  const topBarColor = isAbandoned ? theme.border : resultColor;

  const resultSubtitle = isAbandoned
    ? 'by abandonment'
    : 'by no legal moves';

  // Score display
  const scoreLeft  = whiteWon ? '1' : (blackWon ? '0' : '½');
  const scoreRight = blackWon ? '1' : (whiteWon ? '0' : '½');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative animate-slide-up"
        style={{
          backgroundColor: theme.bgPanel,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          width: 'min(96vw, 380px)',
          boxShadow: `0 24px 64px rgba(0,0,0,0.55)`,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colored top accent bar */}
        <div style={{ height: 4, backgroundColor: topBarColor, width: '100%' }} />

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'none', border: 'none', cursor: 'pointer',
              color: theme.textSecondary, padding: 4, lineHeight: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        <div style={{ padding: '24px 28px 28px' }}>
          {/* Result */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: '0.8125rem', color: theme.textSecondary, marginBottom: 6 }}>
              {resultSubtitle}
            </p>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: resultColor, lineHeight: 1, margin: 0 }}>
              {resultTitle}
            </h2>
          </div>

          {/* Player row — chess.com style */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: theme.bgSecondary,
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 16,
            }}
          >
            {/* White player */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
              <Avatar name={whiteName} color="white" size={40} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textPrimary, maxWidth: 80, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {whiteName}
              </span>
            </div>

            {/* Score */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: '1.75rem', fontWeight: 900, lineHeight: 1,
                  color: whiteWon ? '#22c55e' : (isAbandoned ? theme.textSecondary : '#ef4444'),
                }}>
                  {scoreLeft}
                </span>
                <span style={{ fontSize: '1rem', color: theme.textSecondary, fontWeight: 400 }}>-</span>
                <span style={{
                  fontSize: '1.75rem', fontWeight: 900, lineHeight: 1,
                  color: blackWon ? '#22c55e' : (isAbandoned ? theme.textSecondary : '#ef4444'),
                }}>
                  {scoreRight}
                </span>
              </div>
              <span style={{ fontSize: '0.6875rem', color: theme.textSecondary }}>
                {moveCount} moves
              </span>
            </div>

            {/* Black player */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
              <Avatar name={blackName} color="black" size={40} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textPrimary, maxWidth: 80, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {blackName}
              </span>
            </div>
          </div>

          {/* ELO change (online games) */}
          {eloChange != null && newElo != null && (
            <div
              style={{
                textAlign: 'center',
                marginBottom: 16,
                padding: '10px',
                backgroundColor: theme.bgSecondary,
                borderRadius: 8,
              }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'ui-monospace, monospace', color: theme.textPrimary }}>
                {newElo}
              </span>
              <span
                style={{
                  fontSize: '0.875rem', fontWeight: 700, fontFamily: 'ui-monospace, monospace',
                  color: eloChange >= 0 ? '#22c55e' : '#ef4444',
                  marginLeft: 6,
                }}
              >
                ({eloChange >= 0 ? '+' : ''}{eloChange})
              </span>
              <span style={{ fontSize: '0.75rem', color: theme.textSecondary, marginLeft: 4 }}>ELO</span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {onReplay && (
              <button
                onClick={onReplay}
                style={{
                  width: '100%', padding: '11px 0',
                  backgroundColor: theme.bgSecondary,
                  color: theme.textPrimary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8, cursor: 'pointer',
                  fontSize: '0.9rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5.5 5L9.5 7L5.5 9V5Z" fill="currentColor"/>
                </svg>
                Watch Replay
              </button>
            )}
            {(onNewGame || onPlayAgain) && (
              <button
                onClick={onNewGame ?? onPlayAgain}
                style={{
                  width: '100%', padding: '12px 0',
                  backgroundColor: theme.accent, color: '#fff',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  fontSize: '0.9375rem', fontWeight: 700,
                }}
              >
                {onPlayAgain ? 'Play Again' : 'New Game'}
              </button>
            )}
            <Link
              href="/lobby"
              style={{
                display: 'block', textAlign: 'center',
                padding: '9px 0',
                color: theme.textSecondary,
                fontSize: '0.875rem',
                textDecoration: 'none',
              }}
            >
              Back to Lobby
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
