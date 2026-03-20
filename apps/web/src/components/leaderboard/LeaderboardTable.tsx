'use client';

import type { Profile } from '@raichu/shared-types';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';

interface LeaderboardTableProps {
  players: Profile[];
  currentUserId?: string;
}

export function LeaderboardTable({ players, currentUserId }: LeaderboardTableProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${theme.border}` }}
    >
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: theme.bgSecondary }}>
            <th className="text-xs font-medium text-left px-4 py-2.5" style={{ color: theme.textSecondary }}>#</th>
            <th className="text-xs font-medium text-left px-4 py-2.5" style={{ color: theme.textSecondary }}>Player</th>
            <th className="text-xs font-medium text-right px-4 py-2.5" style={{ color: theme.textSecondary }}>ELO</th>
            <th className="text-xs font-medium text-right px-4 py-2.5" style={{ color: theme.textSecondary }}>Played</th>
            <th className="text-xs font-medium text-right px-4 py-2.5" style={{ color: theme.textSecondary }}>Win %</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, i) => {
            const isMe = player.id === currentUserId;
            const winRate = player.games_played > 0
              ? Math.round((player.games_won / player.games_played) * 100)
              : 0;

            return (
              <tr
                key={player.id}
                style={{
                  backgroundColor: isMe ? theme.accent + '10' : theme.bgPanel,
                  borderTop: `1px solid ${theme.border}`,
                }}
              >
                <td className="px-4 py-2.5 text-sm font-medium" style={{ color: theme.textSecondary }}>
                  {i + 1}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: theme.accent, color: '#fff' }}
                    >
                      {(player.display_name || player.username)[0].toUpperCase()}
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: isMe ? theme.accent : theme.textPrimary }}
                    >
                      {player.display_name || player.username}
                      {isMe && <span className="text-xs ml-1" style={{ color: theme.textSecondary }}>(you)</span>}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-sm font-bold text-right" style={{ color: theme.textPrimary }}>
                  {player.elo_rating}
                </td>
                <td className="px-4 py-2.5 text-sm text-right" style={{ color: theme.textSecondary }}>
                  {player.games_played}
                </td>
                <td className="px-4 py-2.5 text-sm text-right" style={{ color: theme.textSecondary }}>
                  {winRate}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
