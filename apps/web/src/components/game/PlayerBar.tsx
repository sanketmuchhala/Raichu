'use client';

import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';

interface PlayerBarProps {
  username: string;
  elo: number;
  isCurrentTurn: boolean;
  color: 'white' | 'black';
}

export function PlayerBar({ username, elo, isCurrentTurn, color }: PlayerBarProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg${isCurrentTurn ? ' animate-turn-glow' : ''}`}
      style={{
        backgroundColor: isCurrentTurn ? theme.accent + '15' : theme.bgSecondary,
        border: `2px solid ${isCurrentTurn ? theme.accent : 'transparent'}`,
        ['--glow-color' as string]: theme.accent + '60',
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{
          backgroundColor: color === 'white' ? '#f0f0f0' : '#333',
          color: color === 'white' ? '#333' : '#f0f0f0',
        }}
      >
        {username[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium truncate" style={{ color: theme.textPrimary }}>
          {username}
        </span>
        <span className="text-xs ml-2" style={{ color: theme.textSecondary }}>
          ({elo})
        </span>
      </div>
      {isCurrentTurn && (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: theme.accent, color: '#fff' }}>
          Turn
        </span>
      )}
    </div>
  );
}
