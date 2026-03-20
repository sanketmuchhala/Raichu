import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieHeader = request.headers.get('cookie') ?? '';

    // Collect cookies that Supabase wants to set so we can put them on the redirect response
    const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // Parse cookies from the incoming request header
            return cookieHeader.split(';').map((c) => {
              const [name, ...rest] = c.trim().split('=');
              return { name, value: rest.join('=') };
            }).filter((c) => c.name);
          },
          setAll(cookies) {
            cookiesToSet.push(...cookies);
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      // Apply all session cookies to the redirect response
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(name, value, options);
      }
      return response;
    }

    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
}
