-- =============================================
-- 008: Close the analytics view leak
--
-- All 5 tables already have RLS enabled (001, 005). The views over them did
-- not inherit that protection.
--
-- In PostgreSQL a view executes with the privileges of its OWNER, not the
-- caller. These views are owned by `postgres`, which bypasses RLS, and Supabase
-- grants SELECT on public-schema objects to `anon` and `authenticated` by
-- default. The anon key ships in the browser bundle and is public, so every
-- analytics view was readable by anyone on the internet:
--
--   analytics_move_facts    every move of every game, with player ids
--   analytics_play_style    per-player profiling keyed to username
--   analytics_player_*      win rates and ELO history per player
--   analytics_dau/geo/...   full site traffic
--
-- Verified by querying each view with the public anon key before this fix.
--
-- Two independent defences, because either alone would be enough and both
-- together survive one of them being undone:
--
--   1. security_invoker = on  — the view runs as the CALLER, so RLS on the
--      underlying tables applies. Requires PG15+; this project is on 17.6.
--   2. REVOKE from anon/authenticated — no client role can reach the views at
--      all, regardless of how RLS evolves.
--
-- The admin dashboard is unaffected: it queries with the service-role key,
-- which bypasses both RLS and table grants. No client code reads these views
-- (the leaderboard reads the `profiles` table directly, which has its own RLS
-- policy), so nothing in the app loses access.
--
-- Table grants are deliberately NOT revoked. RLS, not the grant, is what
-- filters rows on tables; revoking SELECT there would break the leaderboard,
-- game loading and move history.
-- =============================================

DO $$
DECLARE
  v record;
BEGIN
  FOR v IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'v'
  LOOP
    EXECUTE format('ALTER VIEW public.%I SET (security_invoker = on)', v.relname);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', v.relname);
    RAISE NOTICE 'secured view: %', v.relname;
  END LOOP;
END $$;

-- Note for future migrations: a newly created view defaults to definer mode and
-- picks up the default anon/authenticated grants again. Any new view added to
-- the public schema must repeat both statements above, or be created with
-- `WITH (security_invoker = on)`. `pnpm check:supabase` fails the build if a
-- view ever becomes readable with the anon key.
