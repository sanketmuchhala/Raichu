import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

// Always render fresh — a cached analytics dashboard is worse than no dashboard.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Analytics',
  robots: { index: false, follow: false },
};

/**
 * Admin analytics dashboard.
 *
 * Server component by design: the service-role key is used to read the
 * analytics views (they are RLS deny-all) and must never reach the browser.
 *
 * `profiles` has no role column, so access is gated on an ADMIN_USER_IDS
 * allowlist rather than a database flag.
 */

function isAdmin(userId: string | undefined): boolean {
  if (!userId) return false;
  const allowlist = (process.env.ADMIN_USER_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  return allowlist.includes(userId);
}

type Row = Record<string, unknown>;

function fmt(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2);
  const s = String(value);
  // Timestamps render far more compactly as a date.
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10);
  return s;
}

function Panel({
  title,
  subtitle,
  rows,
  error,
}: {
  title: string;
  subtitle?: string;
  rows: Row[] | null;
  error?: string | null;
}) {
  const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <h2 className="text-base font-semibold text-neutral-100">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}

      {error ? (
        <p className="mt-3 text-sm text-amber-400">
          {error.includes('does not exist')
            ? 'View not found — apply migration 006 to your Supabase project.'
            : error}
        </p>
      ) : !rows || rows.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500">No data yet.</p>
      ) : (
        // Wide tables scroll inside the panel rather than the page.
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800">
                {columns.map((c) => (
                  <th key={c} className="px-2 py-1.5 font-medium text-neutral-400">
                    {c.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-neutral-800/50 last:border-0">
                  {columns.map((c) => (
                    <td key={c} className="px-2 py-1.5 text-neutral-200">
                      {fmt(row[c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function AdminAnalyticsPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 404 rather than 403: don't confirm the page exists to non-admins.
  if (!isAdmin(user?.id)) notFound();

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const panels: { title: string; subtitle: string; view: string; limit: number }[] = [
    { title: 'Event mix', subtitle: 'Every event type being collected, by source', view: 'analytics_event_counts', limit: 40 },
    { title: 'Daily active', subtitle: 'Distinct browser sessions and signed-in users', view: 'analytics_dau', limit: 14 },
    { title: 'Conversion', subtitle: 'Sessions → CTA → playing → signup', view: 'analytics_conversion', limit: 14 },
    { title: 'Game funnel', subtitle: 'Started vs finished vs matched', view: 'analytics_game_funnel', limit: 14 },
    { title: 'Game mix', subtitle: 'Online vs offline, by source', view: 'analytics_game_mix', limit: 15 },
    { title: 'Play style', subtitle: 'Derived from the moves table — aggression, pacing, piece preference', view: 'analytics_player_profile', limit: 25 },
    { title: 'Engagement', subtitle: 'Time on page and scroll depth at exit', view: 'analytics_engagement', limit: 15 },
    { title: 'Top pages', subtitle: 'Page views and unique sessions', view: 'analytics_top_pages', limit: 15 },
    { title: 'Errors', subtitle: 'Client and server failures', view: 'analytics_errors', limit: 15 },
    { title: 'Web vitals', subtitle: 'p75 / p95 per metric', view: 'analytics_web_vitals', limit: 12 },
    { title: 'Devices', subtitle: 'Device, browser and OS breakdown', view: 'analytics_devices', limit: 10 },
    { title: 'Geography', subtitle: 'Sessions by country', view: 'analytics_geo', limit: 10 },
  ];

  const results = await Promise.all(
    panels.map(async (p) => {
      const { data, error } = await admin.from(p.view).select('*').limit(p.limit);
      return { ...p, rows: data as Row[] | null, error: error?.message ?? null };
    }),
  );

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 sm:px-8">
      <header className="mx-auto mb-6 max-w-6xl">
        <h1 className="text-2xl font-bold text-neutral-50">Analytics</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Raichu product analytics. Signed in as {user?.email ?? 'unknown'}.
        </p>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5">
        {results.map((r) => (
          <Panel
            key={r.view}
            title={r.title}
            subtitle={r.subtitle}
            rows={r.rows}
            error={r.error}
          />
        ))}
      </div>
    </main>
  );
}
