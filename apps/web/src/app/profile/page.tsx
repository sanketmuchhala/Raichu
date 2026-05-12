'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';
import { NavHeader } from '../../components/nav/NavHeader';

type Rank = { label: string; color: string; bg: string; min: number };

const RANKS: Rank[] = [
  { label: 'Bronze',   color: '#cd7f32', bg: '#cd7f3218', min: 0    },
  { label: 'Silver',   color: '#a8b8c8', bg: '#a8b8c818', min: 1400 },
  { label: 'Gold',     color: '#f0c040', bg: '#f0c04018', min: 1600 },
  { label: 'Platinum', color: '#d0e8f0', bg: '#d0e8f018', min: 1800 },
];

function getRank(elo: number): Rank {
  return [...RANKS].reverse().find((r) => elo >= r.min) ?? RANKS[0];
}

function RankProgress({ elo, rank }: { elo: number; rank: Rank }) {
  const next = RANKS.find((r) => r.min > elo);
  if (!next) return <p className="text-xs" style={{ color: rank.color }}>Max rank reached</p>;
  const pct = Math.round(((elo - rank.min) / (next.min - rank.min)) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5" style={{ color: '#7a7a7a' }}>
        <span style={{ color: rank.color }}>{rank.label}</span>
        <span>{elo} / {next.min} → {next.label}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2e2e2e' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: rank.color }}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const theme   = useUIStore((s) => THEMES[s.theme]);
  const user    = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const initialized = useAuthStore((s) => s.initialized);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const router  = useRouter();

  const [editing, setEditing]         = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    if (initialized && !user) router.push('/auth');
  }, [initialized, user, router]);

  useEffect(() => {
    if (profile) setDisplayName(profile.display_name || '');
  }, [profile]);

  if (!initialized || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bgPrimary }}>
        <div className="flex gap-2 items-center" style={{ color: theme.textSecondary }}>
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: theme.accent, borderTopColor: 'transparent' }} />
          <span className="text-sm">Loading…</span>
        </div>
      </main>
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({ display_name: displayName || null });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const winRate   = profile.games_played > 0
    ? Math.round((profile.games_won / profile.games_played) * 100) : 0;
  const gamesLost = profile.games_played - profile.games_won;
  const rank      = getRank(profile.elo_rating);
  const name      = profile.display_name || profile.username;
  const initial   = name[0].toUpperCase();

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
      <NavHeader title="Profile" backHref="/" backLabel="Home" />

      <main className="px-4 py-8 max-w-md mx-auto">

        {/* ── Hero card ───────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden mb-4 animate-fade-in"
          style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}` }}
        >
          {/* Accent banner */}
          <div style={{ height: 6, background: `linear-gradient(90deg, ${theme.accent}AA, ${theme.accent})` }} />

          <div className="p-6">
            {/* Avatar + identity */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0 select-none"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}CC, ${theme.accentHover})`,
                  color: '#fff',
                  boxShadow: `0 4px 20px ${theme.accent}40`,
                  fontFamily: 'var(--font-sans, system-ui)',
                }}
              >
                {initial}
              </div>

              <div className="min-w-0 flex-1">
                <h1
                  className="text-xl font-bold truncate leading-tight"
                  style={{
                    color: theme.textPrimary,
                    fontFamily: 'var(--font-sans, system-ui)',
                  }}
                >
                  {name}
                </h1>
                <p className="text-sm mt-0.5 mb-2" style={{ color: theme.textSecondary }}>
                  @{profile.username}
                </p>
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: rank.bg, color: rank.color, border: `1px solid ${rank.color}28` }}
                >
                  <span style={{ fontSize: '0.5rem' }}>●</span>
                  {rank.label}
                </span>
              </div>

              {/* ELO spotlight */}
              <div className="text-right shrink-0">
                <div
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: theme.accent, fontFamily: 'var(--font-sans, system-ui)' }}
                >
                  {profile.elo_rating}
                </div>
                <div className="text-xs font-medium mt-0.5" style={{ color: theme.textSecondary }}>
                  ELO
                </div>
              </div>
            </div>

            {/* Rank progress bar */}
            <div className="mb-6">
              <RankProgress elo={profile.elo_rating} rank={rank} />
            </div>

            {/* Stats row */}
            <div
              className="grid grid-cols-4 gap-2 mb-6 p-3 rounded-xl"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              {[
                { label: 'Played', value: profile.games_played, hi: false },
                { label: 'Won',    value: profile.games_won,    hi: true  },
                { label: 'Lost',   value: gamesLost,            hi: false },
                { label: 'Win %',  value: `${winRate}%`,        hi: winRate >= 50 },
              ].map((s) => (
                <div key={s.label} className="text-center py-1">
                  <div
                    className="text-lg font-bold tabular-nums"
                    style={{ color: s.hi ? theme.accent : theme.textPrimary }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Win rate bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-2" style={{ color: theme.textSecondary }}>
                <span>Win rate</span>
                <span className="font-semibold" style={{ color: theme.textPrimary }}>{winRate}%</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.bgSecondary }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${winRate}%`,
                    background: `linear-gradient(90deg, ${theme.accentHover}, ${theme.accent})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Edit card ───────────────────────────────── */}
        <div
          className="rounded-2xl p-5 animate-fade-in"
          style={{
            backgroundColor: theme.bgPanel,
            border: `1px solid ${theme.border}`,
            animationDelay: '0.08s',
          }}
        >
          <label className="block text-xs font-semibold mb-3 tracking-wider uppercase" style={{ color: theme.textSecondary }}>
            Display Name
          </label>
          {editing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoFocus
                onFocus={(e) => (e.currentTarget.style.borderColor = theme.accent)}
                onBlur={(e)  => (e.currentTarget.style.borderColor = theme.border)}
                className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: theme.bgSecondary,
                  color: theme.textPrimary,
                  border: `1px solid ${theme.border}`,
                }}
                placeholder={profile.username}
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ backgroundColor: theme.accent }}
              >
                {saving ? '…' : 'Save'}
              </button>
              <button
                onClick={() => { setEditing(false); setDisplayName(profile.display_name || ''); }}
                className="px-3 py-2.5 rounded-lg text-sm transition-opacity hover:opacity-80"
                style={{ color: theme.textSecondary, backgroundColor: theme.bgSecondary }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                {profile.display_name || <span style={{ color: theme.textSecondary, fontStyle: 'italic' }}>Not set</span>}
              </span>
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: theme.bgSecondary, color: theme.accent, border: `1px solid ${theme.border}` }}
              >
                Edit
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
