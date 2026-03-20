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
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: theme.bgPrimary }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-2xl font-bold"
            style={{ color: theme.textPrimary, textDecoration: 'none' }}
          >
            Raichu
          </Link>
          <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: theme.bgPanel,
            border: `1px solid ${theme.border}`,
          }}
        >
          {mode === 'login' ? (
            <LoginForm theme={theme} onSwitchToSignup={() => setMode('signup')} />
          ) : (
            <SignupForm theme={theme} onSwitchToLogin={() => setMode('login')} />
          )}
        </div>
      </div>
    </main>
  );
}
