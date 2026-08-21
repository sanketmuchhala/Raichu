/**
 * Supabase connection health check.
 *
 * Run from the repo root with `pnpm check:supabase`.
 *
 * Verifies that every Supabase connection the apps depend on is actually working:
 * env vars, table access, analytics views, Realtime, and RLS enforcement.
 * Exits non-zero if anything fails, so it can gate a deploy.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

// ─── Results table ─────────────────────────────────────────────────────────

type Status = 'pass' | 'fail' | 'warn';
const results: { name: string; status: Status; detail: string }[] = [];

function record(name: string, status: Status, detail = '') {
  results.push({ name, status, detail });
  const icon = status === 'pass' ? '✓' : status === 'warn' ? '!' : '✗';
  console.log(`  ${icon} ${name}${detail ? ` — ${detail}` : ''}`);
}

// ─── Env loading ───────────────────────────────────────────────────────────

/** Parse a .env file into a plain object without mutating process.env. */
function parseEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

const apiEnv = parseEnvFile(resolve(REPO_ROOT, 'apps/api/.env'));
const webEnv = parseEnvFile(resolve(REPO_ROOT, 'apps/web/.env.local'));

/** Every env var the code actually reads, and where it is read from. */
const REQUIRED_ENV: { file: string; env: Record<string, string>; keys: [string, string][] }[] = [
  {
    file: 'apps/api/.env',
    env: apiEnv,
    keys: [
      ['SUPABASE_URL', 'src/lib/supabase.ts:3'],
      ['SUPABASE_SERVICE_ROLE_KEY', 'src/lib/supabase.ts:4'],
    ],
  },
  {
    file: 'apps/web/.env.local',
    env: webEnv,
    keys: [
      ['NEXT_PUBLIC_SUPABASE_URL', 'src/lib/supabase/client.ts:10'],
      ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'src/lib/supabase/client.ts:11'],
      ['SUPABASE_SERVICE_ROLE_KEY', 'src/app/api/track/route.ts:91'],
      ['NEXT_PUBLIC_API_URL', 'next.config.js:30'],
      ['NEXT_PUBLIC_SITE_URL', 'src/lib/seo.ts:3'],
    ],
  },
];

console.log('\nEnvironment variables');
for (const { file, env, keys } of REQUIRED_ENV) {
  for (const [key, readAt] of keys) {
    if (env[key]) record(`${file} → ${key}`, 'pass');
    else record(`${file} → ${key}`, 'fail', `missing; read at ${readAt}`);
  }
}

const url = apiEnv.SUPABASE_URL ?? webEnv.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = apiEnv.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = webEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !serviceKey) {
  console.error('\nCannot continue: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY unavailable.\n');
  process.exit(1);
}

if (webEnv.NEXT_PUBLIC_SUPABASE_URL && webEnv.NEXT_PUBLIC_SUPABASE_URL !== apiEnv.SUPABASE_URL) {
  record('api and web point at the same project', 'fail', 'URLs differ');
} else {
  record('api and web point at the same project', 'pass');
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const anon = anonKey ? createClient(url, anonKey, { auth: { persistSession: false } }) : null;

// ─── Checks ────────────────────────────────────────────────────────────────

/** Row count via the service role, which bypasses RLS. */
async function countRows(table: string): Promise<number | null> {
  const { count, error } = await admin.from(table).select('*', { count: 'exact', head: true });
  return error ? null : (count ?? 0);
}

async function checkTables() {
  console.log('\nTables (migrations 001–005)');
  const tables: [string, string][] = [
    ['profiles', '001'],
    ['games', '001'],
    ['moves', '001'],
    ['matchmaking_queue', '001'],
    ['analytics_events', '005'],
  ];
  for (const [table, migration] of tables) {
    const { count, error } = await admin.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      record(`table ${table}`, 'fail', `${error.message} — is migration ${migration} applied?`);
    } else {
      record(`table ${table}`, 'pass', `${count ?? 0} rows`);
    }
  }
}

async function checkViews() {
  console.log('\nAnalytics views (migration 005)');
  const views = [
    'analytics_dau',
    'analytics_top_pages',
    'analytics_devices',
    'analytics_geo',
    'analytics_game_funnel',
  ];
  for (const view of views) {
    const { error } = await admin.from(view).select('*').limit(1);
    if (error) record(`view ${view}`, 'fail', `${error.message} — is migration 005 applied?`);
    else record(`view ${view}`, 'pass');
  }
}

async function checkMigration006() {
  console.log('\nMigration 006 (analytics expansion)');

  // The track route writes ip_hash and the API writes app, so if 006 has not
  // been applied every analytics insert fails. Check the columns explicitly
  // rather than inferring it from a failed insert.
  for (const column of ['ip_hash', 'app']) {
    const { error } = await admin.from('analytics_events').select(column).limit(1);
    if (error) {
      record(`analytics_events.${column}`, 'fail', 'missing — apply migration 006');
    } else {
      record(`analytics_events.${column}`, 'pass');
    }
  }

  const views = [
    'analytics_event_counts',
    'analytics_play_style',
    'analytics_player_profile',
    'analytics_errors',
    'analytics_web_vitals',
    'analytics_engagement',
    'analytics_conversion',
    'analytics_game_mix',
  ];
  for (const view of views) {
    const { error } = await admin.from(view).select('*').limit(1);
    if (error) record(`view ${view}`, 'fail', 'missing — apply migration 006');
    else record(`view ${view}`, 'pass');
  }
}

async function checkRealtime() {
  console.log('\nRealtime (migration 004)');
  if (!anon) {
    record('realtime subscription', 'fail', 'no anon key to test with');
    return;
  }

  // Subscribing successfully proves only that the websocket connects. It does
  // NOT prove that Postgres changes are actually delivered — those are separate
  // systems, and change delivery can be broken while the socket is perfectly
  // healthy. So this creates a throwaway game row, subscribes, updates it, and
  // waits for the event, then cleans up.
  const probeId = crypto.randomUUID();
  const { error: seedErr } = await admin.from('games').insert({
    id: probeId,
    status: 'waiting',
    board_state: '.'.repeat(64),
    current_player: 'white',
    game_type: 'friendly',
    move_count: 0,
  });

  if (seedErr) {
    record('realtime delivery', 'fail', `could not seed probe row: ${seedErr.message}`);
    return;
  }

  try {
    let delivered = false;
    const channel = anon
      .channel(`healthcheck:${probeId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${probeId}` },
        () => { delivered = true; },
      );

    const status = await new Promise<string>((resolveStatus) => {
      const timer = setTimeout(() => resolveStatus('TIMED_OUT'), 20000);
      channel.subscribe((s: string) => {
        if (s === 'SUBSCRIBED' || s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
          clearTimeout(timer);
          resolveStatus(s);
        }
      });
    });

    if (status !== 'SUBSCRIBED') {
      record('realtime subscription', 'fail', `status ${status}`);
      return;
    }
    record('realtime subscription (websocket)', 'pass');

    // Give the server a moment to register the subscription before writing.
    await new Promise((r) => setTimeout(r, 3000));
    await admin.from('games').update({ updated_at: new Date().toISOString() }).eq('id', probeId);
    await new Promise((r) => setTimeout(r, 8000));

    if (delivered) {
      record('realtime delivers postgres changes', 'pass');
    } else {
      record(
        'realtime delivers postgres changes',
        'fail',
        'websocket connected but no change event arrived — multiplayer will fall back to 3s polling',
      );
    }

    await anon.removeChannel(channel);
  } finally {
    await admin.from('games').delete().eq('id', probeId);
  }
}

async function checkRls() {
  console.log('\nRLS enforcement (anon key must not read service-only tables)');
  if (!anon) {
    record('anon RLS', 'fail', 'no anon key to test with');
    return;
  }

  for (const table of ['matchmaking_queue', 'analytics_events']) {
    const adminCount = await countRows(table);
    const { data, error } = await anon.from(table).select('*').limit(1);

    if (error) {
      // An outright error is also acceptable — the row is denied either way.
      record(`anon cannot read ${table}`, 'pass', 'denied');
    } else if (data && data.length > 0) {
      record(`anon cannot read ${table}`, 'fail', 'anon key returned rows — RLS is misconfigured');
    } else if (adminCount === 0) {
      // Empty table means the test proves nothing; say so rather than claiming a pass.
      record(`anon cannot read ${table}`, 'warn', 'inconclusive — table is empty');
    } else {
      record(`anon cannot read ${table}`, 'pass', `service role sees ${adminCount}, anon sees 0`);
    }
  }
}

async function checkViewLeaks() {
  console.log('\nView exposure (the anon key is public — no view may be readable with it)');
  if (!anon) {
    record('anon view access', 'fail', 'no anon key to test with');
    return;
  }

  // Postgres views run as their OWNER by default, which bypasses RLS on the
  // underlying tables. Migration 008 set security_invoker and revoked the
  // client grants; this guards against a new view reintroducing the leak,
  // since a freshly created view defaults back to definer mode.
  const views = [
    'analytics_dau', 'analytics_top_pages', 'analytics_devices', 'analytics_geo',
    'analytics_game_funnel', 'analytics_event_counts', 'analytics_play_style',
    'analytics_player_profile', 'analytics_player_outcomes', 'analytics_move_facts',
    'analytics_errors', 'analytics_web_vitals', 'analytics_engagement',
    'analytics_conversion', 'analytics_game_mix',
  ];

  let leaked = 0;
  for (const view of views) {
    const { data, error } = await anon.from(view).select('*').limit(1);
    if (!error && data && data.length > 0) {
      record(`anon cannot read ${view}`, 'fail', 'READABLE WITH THE PUBLIC ANON KEY');
      leaked++;
    }
  }

  if (leaked === 0) {
    record(`no view readable by anon (${views.length} checked)`, 'pass');
  }
}

async function checkAnalyticsIngestion() {
  console.log('\nAnalytics ingestion');
  if (!webEnv.SUPABASE_SERVICE_ROLE_KEY) {
    record(
      'web can write analytics_events',
      'fail',
      'apps/web/.env.local has no SUPABASE_SERVICE_ROLE_KEY — /api/track will 500 on every event',
    );
    return;
  }
  const web = createClient(url!, webEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { error } = await web
    .from('analytics_events')
    .insert({ session_id: crypto.randomUUID(), event_type: 'healthcheck', page: '/healthcheck' });

  if (error) record('web can write analytics_events', 'fail', error.message);
  else record('web can write analytics_events', 'pass', 'inserted a healthcheck row');
}

// ─── Run ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nChecking Supabase project: ${url}`);

  await checkTables();
  await checkViews();
  await checkMigration006();
  await checkRealtime();
  await checkRls();
  await checkViewLeaks();
  await checkAnalyticsIngestion();

  const failed = results.filter((r) => r.status === 'fail');
  const warned = results.filter((r) => r.status === 'warn');

  console.log(
    `\n${results.length - failed.length - warned.length} passed, ` +
      `${warned.length} inconclusive, ${failed.length} failed\n`,
  );

  if (failed.length > 0) {
    console.log('Failures:');
    for (const f of failed) console.log(`  ✗ ${f.name} — ${f.detail}`);
    console.log('');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\ncheck-supabase crashed:', err);
  process.exit(1);
});
