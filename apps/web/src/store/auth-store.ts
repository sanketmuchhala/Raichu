import { create } from 'zustand';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { Profile } from '@raichu/shared-types';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { analytics } from '../lib/analytics';

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    const supabase = getSupabaseBrowserClient();

    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      set({ user: session.user });
      await get().fetchProfile();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      set({ user: session?.user ?? null });

      if (session?.user) {
        await get().fetchProfile();
      } else {
        set({ profile: null });
      }
    });

    set({ initialized: true });
  },

  signUp: async (email, password, username) => {
    set({ loading: true });
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });
      if (error) throw error;

      // If auto-confirm is on, a session is returned immediately
      if (data.session?.user) {
        set({ user: data.session.user });
        await get().fetchProfile();
        analytics.signup(data.session.user.id);
      }
    } finally {
      set({ loading: false });
    }
  },

  signInWithPassword: async (email, password) => {
    set({ loading: true });
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        set({ user: data.user });
        await get().fetchProfile();
        analytics.login(data.user.id);
      }
    } finally {
      set({ loading: false });
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    const { user } = get();
    analytics.logout(user?.id ?? null);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);

    if (error) throw error;
    await get().fetchProfile();
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      set({ profile: data as Profile });
    }
  },
}));
