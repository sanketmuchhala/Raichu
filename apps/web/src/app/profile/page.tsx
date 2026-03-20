'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';
import { NavHeader } from '../../components/nav/NavHeader';

function getRankBadge(elo: number): { label: string; color: string; bg: string } {
  if (elo >= 1800) return { label: 'Platinum', color: '#e5e4e2', bg: '#5c6bc020' };
  if (elo >= 1600) return { label: 'Gold', color: '#ffd700', bg: '#ffd70020' };
  if (elo >= 1400) return { label: 'Silver', color: '#c0c0c0', bg: '#c0c0c020' };
  return { label: 'Bronze', color: '#cd7f32', bg: '#cd7f3220' };
}

export default function ProfilePage() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const initialized = useAuthStore((s) => s.initialized);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
  }, [profile]);

  if (!initialized || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bgPrimary }}>
        <p style={{ color: theme.textSecondary }}>Loading...</p>
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

  const winRate = profile.games_played > 0
    ? Math.round((profile.games_won / profile.games_played) * 100)
    : 0;

  const gamesLost = profile.games_played - profile.games_won;
  const rank = getRankBadge(profile.elo_rating);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
      <NavHeader title="Profile" backHref="/lobby" backLabel="Lobby" />
      <main className="px-4 py-8 lg:py-16">
        <div className="max-w-lg mx-auto">
          <div
            className="p-6 rounded-xl animate-fade-in"
            style={{
              backgroundColor: theme.bgPanel,
              border: `1px solid ${theme.border}`,
            }}
          >
            {/* Avatar + Name + Rank */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shrink-0"
                style={{ backgroundColor: theme.accent, color: '#fff' }}
              >
                {(profile.display_name || profile.username)[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold truncate" style={{ color: theme.textPrimary }}>
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  @{profile.username}
                </p>
                <span
                  className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1"
                  style={{ backgroundColor: rank.bg, color: rank.color }}
                >
                  {rank.label}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'ELO', value: profile.elo_rating },
                { label: 'Played', value: profile.games_played },
                { label: 'Won', value: profile.games_won },
                { label: 'Lost', value: gamesLost },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-3 rounded-lg"
                  style={{ backgroundColor: theme.bgSecondary }}
                >
                  <div className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                    {stat.value}
                  </div>
                  <div className="text-xs" style={{ color: theme.textSecondary }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Win rate bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: theme.textSecondary }}>Win Rate</span>
                <span className="text-xs font-bold" style={{ color: theme.textPrimary }}>{winRate}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.bgSecondary }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${winRate}%`, backgroundColor: theme.accent }}
                />
              </div>
            </div>

            {/* Edit Display Name */}
            <div
              className="pt-4"
              style={{ borderTop: `1px solid ${theme.border}` }}
            >
              <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>
                Display Name
              </label>
              {editing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      backgroundColor: theme.bgSecondary,
                      color: theme.textPrimary,
                      border: `1px solid ${theme.border}`,
                    }}
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {saving ? '...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setDisplayName(profile.display_name || '');
                    }}
                    className="px-4 py-2 rounded-lg text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: theme.textPrimary }}>
                    {profile.display_name || profile.username}
                  </span>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs underline"
                    style={{ color: theme.accent }}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
