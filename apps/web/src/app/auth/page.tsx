'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';
import { LoginForm } from '../../components/auth/LoginForm';
import { SignupForm } from '../../components/auth/SignupForm';

export default function AuthPage() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const user   = useAuthStore((s) => s.user);
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: theme.bgPrimary }}
    >
      {/* Subtle chess grid */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,0.025) 0% 25%, transparent 0% 50%)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />
      {/* Radial vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 70% 70% at 50% 50%, transparent 0%, ${theme.bgPrimary}CC 60%, ${theme.bgPrimary} 100%)`,
          pointerEvents: 'none',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-sans, system-ui)',
              fontWeight: 700,
              fontSize: '2.25rem',
              color: theme.textPrimary,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}
          >
            Raichu
          </Link>
          <p
            className="text-sm mt-2"
            style={{ color: theme.textSecondary }}
          >
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Tab toggle */}
        <div
          className="flex mb-5 rounded-lg p-0.5"
          style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}
        >
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 py-2 text-sm font-semibold rounded-md transition-all"
              style={{
                backgroundColor: mode === m ? theme.bgPanel : 'transparent',
                color: mode === m ? theme.textPrimary : theme.textSecondary,
                boxShadow: mode === m ? `0 1px 4px ${theme.shadow}` : 'none',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: theme.bgPanel,
            border: `1px solid ${theme.border}`,
            boxShadow: `0 8px 32px ${theme.shadow}`,
          }}
        >
          {mode === 'login' ? (
            <LoginForm theme={theme} onSwitchToSignup={() => setMode('signup')} />
          ) : (
            <SignupForm theme={theme} onSwitchToLogin={() => setMode('login')} />
          )}
        </div>

        <p className="text-center text-xs mt-5" style={{ color: theme.textSecondary, opacity: 0.5 }}>
          Strategy Board Game
        </p>
      </div>
    </main>
  );
}
