import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/** Create a Supabase client for server-side usage (Route Handlers, Server Components) */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Can be ignored in Server Components (read-only context)
          }
        },
      },
    },
  );
}
