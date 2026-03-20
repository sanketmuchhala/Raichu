'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';

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

  return (
    <main
      className="min-h-screen px-4 py-8 lg:py-16"
      style={{ backgroundColor: theme.bgPrimary }}
    >
      <div className="max-w-lg mx-auto">
        <Link
          href="/"
          className="text-sm mb-6 inline-block hover:underline"
          style={{ color: theme.accent }}
        >
          &larr; Back to Home
        </Link>

        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: theme.bgPanel,
            border: `1px solid ${theme.border}`,
          }}
        >
          {/* Avatar + Name */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: theme.accent, color: '#fff' }}
            >
              {(profile.display_name || profile.username)[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
                {profile.display_name || profile.username}
              </h1>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                @{profile.username}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'ELO Rating', value: profile.elo_rating },
              { label: 'Games Played', value: profile.games_played },
              { label: 'Win Rate', value: `${winRate}%` },
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
  );
}
