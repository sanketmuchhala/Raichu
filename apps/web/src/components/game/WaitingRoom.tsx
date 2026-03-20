'use client';

import Link from 'next/link';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { InviteCodeDisplay } from '../lobby/InviteCodeDisplay';

interface WaitingRoomProps {
  inviteCode: string | null;
  gameType: string;
}

function RadarIcon({ color }: { color: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="1.5" opacity="0.2" />
      <circle cx="24" cy="24" r="12" stroke={color} strokeWidth="1.5" opacity="0.3" />
      <circle cx="24" cy="24" r="4" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="24" y1="24" x2="24" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" className="animate-radar" style={{ transformOrigin: '24px 24px' }} />
    </svg>
  );
}

export function WaitingRoom({ inviteCode, gameType }: WaitingRoomProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);

  const copyLink = async () => {
    if (!inviteCode) return;
    const url = `${window.location.origin}/join/${inviteCode}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback ignored
    }
  };

  return (
    <div
      className="text-center p-8 rounded-xl animate-fade-in"
      style={{
        backgroundColor: theme.bgPanel,
        border: `1px solid ${theme.border}`,
        boxShadow: `0 4px 24px ${theme.shadow}`,
      }}
    >
      {gameType === 'ranked' ? (
        <>
          <div className="flex justify-center mb-4">
            <RadarIcon color={theme.accent} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>
            Finding opponent...
          </h2>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            Searching for a player of similar skill
          </p>
        </>
      ) : (
        <>
          <div className="mb-4">
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
              style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>
            Waiting for opponent
          </h2>
          <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>
            Share the code or link with a friend
          </p>

          {inviteCode && (
            <div className="space-y-3">
              <div className="flex justify-center">
                <InviteCodeDisplay code={inviteCode} />
              </div>
              <button
                onClick={copyLink}
                className="text-xs px-4 py-1.5 rounded-md transition-opacity hover:opacity-80"
                style={{ backgroundColor: theme.bgSecondary, color: theme.textSecondary, border: `1px solid ${theme.border}` }}
              >
                Copy Invite Link
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-6">
        <Link
          href="/lobby"
          className="text-xs hover:underline"
          style={{ color: theme.textSecondary }}
        >
          Cancel and return to lobby
        </Link>
      </div>
    </div>
  );
}
