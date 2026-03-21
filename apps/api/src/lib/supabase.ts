import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Whether Supabase credentials are configured */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseServiceKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — Supabase features will be unavailable',
  );
}

/** Admin Supabase client (service role — bypasses RLS) */
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseServiceKey || 'placeholder',
  { auth: { persistSession: false } },
);

/** In-memory auth cache: token → { user, expiresAt } */
const authCache = new Map<string, { user: { id: string; email: string }; expiresAt: number }>();
const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/** Verify a Supabase JWT and return the user, or null if invalid */
export async function getUserFromToken(
  token: string,
): Promise<{ id: string; email: string } | null> {
  // Check cache first
  const cached = authCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    authCache.delete(token);
    return null;
  }

  const result = { id: user.id, email: user.email ?? '' };
  authCache.set(token, { user: result, expiresAt: Date.now() + AUTH_CACHE_TTL });

  // Evict expired entries periodically (keep cache from growing unbounded)
  if (authCache.size > 100) {
    const now = Date.now();
    for (const [k, v] of authCache) {
      if (v.expiresAt <= now) authCache.delete(k);
    }
  }

  return result;
}
