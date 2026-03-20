'use client';

import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { InviteCodeDisplay } from '../lobby/InviteCodeDisplay';

interface WaitingRoomProps {
  inviteCode: string | null;
  gameType: string;
}

export function WaitingRoom({ inviteCode, gameType }: WaitingRoomProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);

  return (
    <div className="text-center space-y-6">
      <div className="animate-pulse">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
          style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
        >
          ...
        </div>
      </div>

      <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
        Waiting for opponent
      </h2>

      {inviteCode && gameType === 'friendly' && (
        <div>
          <p className="text-sm mb-3" style={{ color: theme.textSecondary }}>
            Share this code with your friend:
          </p>
          <div className="flex justify-center">
            <InviteCodeDisplay code={inviteCode} />
          </div>
        </div>
      )}

      {gameType === 'ranked' && (
        <p className="text-sm" style={{ color: theme.textSecondary }}>
          Finding a match...
        </p>
      )}
    </div>
  );
}
