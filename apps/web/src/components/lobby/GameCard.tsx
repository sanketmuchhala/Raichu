'use client';

import Link from 'next/link';
import type { OnlineGame } from '@raichu/shared-types';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';

interface GameCardProps {
  game: OnlineGame;
  userId: string;
}

export function GameCard({ game, userId }: GameCardProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);

  const isMyTurn =
    game.status === 'playing' &&
    ((game.current_player === 'white' && game.white_player_id === userId) ||
     (game.current_player === 'black' && game.black_player_id === userId));

  const myColor =
    game.white_player_id === userId ? 'White' : 'Black';

  const statusLabel = (() => {
    if (game.status === 'waiting') return 'Waiting for opponent';
    if (game.status === 'playing') return isMyTurn ? 'Your turn' : "Opponent's turn";
    if (game.status === 'white_wins') return game.white_player_id === userId ? 'You won!' : 'You lost';
    if (game.status === 'black_wins') return game.black_player_id === userId ? 'You won!' : 'You lost';
    return 'Abandoned';
  })();

  // Left border color: green = your turn, yellow = waiting, gray = other
  const borderColor =
    isMyTurn ? theme.accent :
    game.status === 'waiting' ? '#eab308' :
    theme.border;

  const statusColor =
    game.status === 'waiting' ? '#eab308' :
    isMyTurn ? theme.accent :
    game.status === 'playing' ? theme.textSecondary :
    (game.winner_id === userId ? '#22c55e' : '#ef4444');

  return (
    <Link
      href={`/game/${game.id}`}
      className="block p-4 rounded-lg transition-all hover:brightness-110"
      style={{
        backgroundColor: theme.bgSecondary,
        borderLeft: `3px solid ${borderColor}`,
        borderTop: `1px solid ${theme.border}`,
        borderRight: `1px solid ${theme.border}`,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
            {game.game_type === 'friendly' ? 'Friendly' : 'Ranked'} — {myColor}
          </span>
          <span className="text-xs ml-2" style={{ color: theme.textSecondary }}>
            Move {game.move_count}
          </span>
        </div>
        <span className="text-xs font-medium" style={{ color: statusColor }}>
          {statusLabel}
        </span>
      </div>
    </Link>
  );
}
