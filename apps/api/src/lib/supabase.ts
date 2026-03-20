import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
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

/** Verify a Supabase JWT and return the user, or null if invalid */
export async function getUserFromToken(
  token: string,
): Promise<{ id: string; email: string } | null> {
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) return null;
  return { id: user.id, email: user.email ?? '' };
}
