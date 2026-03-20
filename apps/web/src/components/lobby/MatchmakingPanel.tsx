'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useMatchmakingStore } from '../../store/matchmaking-store';

function RadarIcon({ color }: { color: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="16" stroke={color} strokeWidth="1.5" opacity="0.2" />
      <circle cx="20" cy="20" r="10" stroke={color} strokeWidth="1.5" opacity="0.3" />
      <circle cx="20" cy="20" r="4" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="20" y1="20" x2="20" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" className="animate-radar" style={{ transformOrigin: '20px 20px' }} />
    </svg>
  );
}

function getEloRange(waitSeconds: number): string {
  if (waitSeconds > 60) return 'any ELO';
  if (waitSeconds > 30) return '\u00B1400 ELO';
  if (waitSeconds > 15) return '\u00B1200 ELO';
  return '\u00B1100 ELO';
}

export function MatchmakingPanel() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const router = useRouter();
  const status = useMatchmakingStore((s) => s.status);
  const waitSeconds = useMatchmakingStore((s) => s.waitSeconds);
  const queueCount = useMatchmakingStore((s) => s.queueCount);
  const matchedGameId = useMatchmakingStore((s) => s.matchedGameId);
  const error = useMatchmakingStore((s) => s.error);
  const joinQueue = useMatchmakingStore((s) => s.joinQueue);
  const leaveQueue = useMatchmakingStore((s) => s.leaveQueue);
  const pollStatus = useMatchmakingStore((s) => s.pollStatus);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for match status
  useEffect(() => {
    if (status === 'queued') {
      intervalRef.current = setInterval(pollStatus, 3000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [status, pollStatus]);

  // Redirect on match found
  useEffect(() => {
    if (status === 'matched' && matchedGameId) {
      router.push(`/game/${matchedGameId}`);
    }
  }, [status, matchedGameId, router]);

  const formatWait = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div
      className="p-6 rounded-xl"
      style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}` }}
    >
      <h2 className="text-lg font-bold mb-1" style={{ color: theme.textPrimary }}>
        Find a Match
      </h2>
      <p className="text-xs mb-4" style={{ color: theme.textSecondary }}>
        Ranked matchmaking
      </p>

      {status === 'idle' && (
        <>
          <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
            Play a ranked game against a player of similar skill.
          </p>
          <button
            className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: theme.accent }}
            onClick={joinQueue}
          >
            Find Match
          </button>
        </>
      )}

      {status === 'queued' && (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <RadarIcon color={theme.accent} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>
              Searching for opponent...
            </p>
            <p className="text-xs mt-1" style={{ color: theme.accent }}>
              {getEloRange(waitSeconds)}
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs" style={{ color: theme.textSecondary }}>
              {formatWait(waitSeconds)}
            </span>
            {queueCount > 0 && (
              <span className="text-xs" style={{ color: theme.textSecondary }}>
                {queueCount} in queue
              </span>
            )}
          </div>
          <button
            className="text-xs px-5 py-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ backgroundColor: theme.bgSecondary, color: theme.textSecondary, border: `1px solid ${theme.border}` }}
            onClick={leaveQueue}
          >
            Cancel
          </button>
        </div>
      )}

      {status === 'matched' && (
        <div className="text-center py-4 animate-fade-in">
          <p className="text-base font-semibold" style={{ color: theme.accent }}>
            Match found!
          </p>
          <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
            Redirecting to game...
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm mt-3" style={{ color: '#ef4444' }}>{error}</p>
      )}
    </div>
  );
}
