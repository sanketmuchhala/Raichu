'use client';

import type { PieceChar } from '@raichu/shared-types';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { CapturedPieces } from '../board/CapturedPieces';

interface PlayerBarProps {
  username: string;
  elo?: number;
  detail?: string;
  isCurrentTurn: boolean;
  color: 'white' | 'black';
  capturedPieces?: PieceChar[];
  compact?: boolean;
  statusLabel?: string;
}

export function PlayerBar({
  username,
  elo,
  detail,
  isCurrentTurn,
  color,
  capturedPieces = [],
  compact = false,
  statusLabel = 'Turn',
}: PlayerBarProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);

  return (
    <div
      className={`player-bar${compact ? ' player-bar-compact' : ''}${isCurrentTurn ? ' is-current' : ''}`}
      style={{
        backgroundColor: isCurrentTurn ? theme.accent + '15' : theme.bgSecondary,
        borderColor: isCurrentTurn ? theme.accent : 'transparent',
        ['--glow-color' as string]: theme.accent + '60',
      }}
    >
      <div
        className="player-avatar"
        style={{
          backgroundColor: color === 'white' ? '#f0f0f0' : '#333',
          color: color === 'white' ? '#333' : '#f0f0f0',
          borderColor: color === 'white' ? '#d4d4d4' : '#4a4a4a',
        }}
      >
        {username[0]?.toUpperCase() || '?'}
      </div>

      <div className="player-details">
        <div className="player-name-row">
          <span className="player-name" style={{ color: theme.textPrimary }}>
            {username}
          </span>
          {elo !== undefined && (
            <span className="player-rating" style={{ color: theme.textSecondary }}>
              {elo}
            </span>
          )}
          {detail && (
            <span className="player-rating" style={{ color: theme.textSecondary }}>
              {detail}
            </span>
          )}
        </div>
        {(compact || capturedPieces.length > 0) && (
          <div className="player-captures" aria-label={`${username}'s captured pieces`}>
            {capturedPieces.length > 0 ? (
              <CapturedPieces pieces={capturedPieces} size={compact ? 16 : 18} />
            ) : (
              <span style={{ color: theme.textSecondary }}>No captures</span>
            )}
          </div>
        )}
      </div>

      {isCurrentTurn && (
        <span className="player-turn" style={{ backgroundColor: theme.accent, color: '#fff' }}>
          <span className="player-turn-dot" />
          {statusLabel}
        </span>
      )}
    </div>
  );
}
