'use client';

import { useState } from 'react';
import type { Theme } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';

interface LoginFormProps {
  theme: Theme;
  onSwitchToSignup: () => void;
}

export function LoginForm({ theme, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const loading = useAuthStore((s) => s.loading);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await signInWithPassword(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: theme.bgSecondary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: theme.bgSecondary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
          placeholder="Your password"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: theme.accent }}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full" style={{ borderTop: `1px solid ${theme.border}` }} />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-xs" style={{ backgroundColor: theme.bgPanel, color: theme.textSecondary }}>
            or
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{
          backgroundColor: theme.btnSecondaryBg,
          color: theme.textPrimary,
          border: `1px solid ${theme.border}`,
        }}
      >
        Sign in with Google
      </button>

      <p className="text-center text-xs mt-2" style={{ color: theme.textSecondary }}>
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="underline"
          style={{ color: theme.accent }}
        >
          Sign up
        </button>
      </p>
    </form>
  );
}
