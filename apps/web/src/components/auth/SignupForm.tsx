'use client';

import { useState } from 'react';
import type { Theme } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';

interface SignupFormProps {
  theme: Theme;
  onSwitchToLogin: () => void;
}

export function SignupForm({ theme, onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const signUp = useAuthStore((s) => s.signUp);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const loading = useAuthStore((s) => s.loading);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    try {
      await signUp(email, password, username);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
          Check your email
        </p>
        <p className="text-sm" style={{ color: theme.textSecondary }}>
          We sent a confirmation link to <strong>{email}</strong>.
          Click it to activate your account.
        </p>
        <button
          onClick={onSwitchToLogin}
          className="mt-6 text-sm underline"
          style={{ color: theme.accent }}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={24}
          pattern="[a-zA-Z0-9_]+"
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: theme.bgSecondary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
          placeholder="Choose a username"
        />
      </div>

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
          minLength={6}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: theme.bgSecondary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
          placeholder="At least 6 characters"
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
        {loading ? 'Creating account...' : 'Create Account'}
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
        Sign up with Google
      </button>

      <p className="text-center text-xs mt-2" style={{ color: theme.textSecondary }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="underline"
          style={{ color: theme.accent }}
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
