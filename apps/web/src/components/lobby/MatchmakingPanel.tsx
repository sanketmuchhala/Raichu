'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useMatchmakingStore } from '../../store/matchmaking-store';

export function MatchmakingPanel() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const router = useRouter();
  const status = useMatchmakingStore((s) => s.status);
  const waitSeconds = useMatchmakingStore((s) => s.waitSeconds);
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
      className="p-5 rounded-xl"
      style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}` }}
    >
      <h2 className="text-lg font-bold mb-4" style={{ color: theme.textPrimary }}>
        Find a Match
      </h2>

      {status === 'idle' && (
        <>
          <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
            Play a ranked game against a player of similar skill.
          </p>
          <button
            className="w-full py-2.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.accentHover }}
            onClick={joinQueue}
          >
            Find Match
          </button>
        </>
      )}

      {status === 'queued' && (
        <div className="text-center space-y-3">
          <div className="animate-pulse">
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-lg"
              style={{ backgroundColor: theme.accentHover + '20', color: theme.accentHover }}
            >
              ...
            </div>
          </div>
          <p className="text-sm" style={{ color: theme.textPrimary }}>
            Searching for opponent...
          </p>
          <p className="text-xs" style={{ color: theme.textSecondary }}>
            Wait time: {formatWait(waitSeconds)}
          </p>
          <button
            className="text-xs px-4 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ backgroundColor: theme.bgSecondary, color: theme.textSecondary, border: `1px solid ${theme.border}` }}
            onClick={leaveQueue}
          >
            Cancel
          </button>
        </div>
      )}

      {status === 'matched' && (
        <p className="text-sm text-center" style={{ color: theme.accent }}>
          Match found! Redirecting...
        </p>
      )}

      {error && (
        <p className="text-sm mt-2" style={{ color: '#ef4444' }}>{error}</p>
      )}
    </div>
  );
}
