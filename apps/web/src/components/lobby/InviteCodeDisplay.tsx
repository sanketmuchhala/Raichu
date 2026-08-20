'use client';

import { useState } from 'react';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { analytics } from '../../lib/analytics';
import { useAuthStore } from '../../store/auth-store';

interface InviteCodeDisplayProps {
  code: string;
}

export function InviteCodeDisplay({ code }: InviteCodeDisplayProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      analytics.inviteCopied({ gameId: code }, useAuthStore.getState().user?.id ?? null);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className="text-2xl font-mono font-bold tracking-[0.3em] px-4 py-2 rounded-lg"
        style={{ backgroundColor: theme.bgSecondary, color: theme.textPrimary }}
      >
        {code}
      </span>
      <button
        onClick={handleCopy}
        className="text-xs px-3 py-1.5 rounded-md transition-opacity hover:opacity-80"
        style={{ backgroundColor: theme.accent, color: '#fff' }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
