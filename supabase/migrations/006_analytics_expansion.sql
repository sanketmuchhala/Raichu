-- =============================================
-- 006: Analytics expansion
--
-- 1. Privacy: replace the raw IP with a salted hash.
-- 2. Distinguish browser events from server-emitted events.
-- 3. Indexes for the new query shapes.
-- 4. Play-style views derived from the existing `moves` table.
-- 5. Retention helper.
--
-- Additive only — 005 is left untouched.
-- =============================================

-- ---------------------------------------------
-- 1. Privacy — expand phase
--
-- `ip_address INET` is personal data under GDPR/CCPA and the app has no consent
-- mechanism. Country/region/city (captured from Vercel headers) are what the
-- dashboards actually query, so dropping the raw address loses no analysis.
-- The salted hash still supports unique-visitor counting and abuse detection.
--
-- This migration only ADDS ip_hash. It deliberately does not drop ip_address,
-- because there is no safe ordering if it does: applying the migration first
-- breaks the currently deployed code (which still writes ip_address), and
-- deploying first breaks the new code (which writes ip_hash). Both columns are
-- nullable, so with only the additive change either order works and no event
-- is ever rejected.
--
-- `007_drop_ip_address.sql` performs the contract phase once the code writing
-- ip_hash is live.
-- ---------------------------------------------

ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS ip_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_analytics_ip_hash
  ON analytics_events (ip_hash) WHERE ip_hash IS NOT NULL;

-- ---------------------------------------------
-- 2. Event source
--
-- The Express API now emits events too. Without this column server-authoritative
-- outcomes are indistinguishable from browser claims about the same game.
-- ---------------------------------------------

ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS app TEXT NOT NULL DEFAULT 'web'
  CHECK (app IN ('web', 'api', 'ios'));

CREATE INDEX IF NOT EXISTS idx_analytics_app ON analytics_events (app);

-- ---------------------------------------------
-- 3. Indexes for the new query shapes
-- ---------------------------------------------

-- Every dashboard panel filters by event_type and orders by time. The existing
-- single-column indexes cannot serve that combination.
CREATE INDEX IF NOT EXISTS idx_analytics_type_created
  ON analytics_events (event_type, created_at DESC);

-- All new per-event detail lands in `properties`, which was unindexed.
CREATE INDEX IF NOT EXISTS idx_analytics_properties
  ON analytics_events USING GIN (properties);

-- ---------------------------------------------
-- 3b. Keep session-based views browser-only
--
-- Server-emitted events carry a synthetic session_id (a server request has no
-- browser session). Left unfiltered they would inflate DAU and add a null row
-- to the device breakdown, so both views are narrowed to app = 'web'.
-- Column lists are unchanged, so CREATE OR REPLACE is safe.
-- ---------------------------------------------

CREATE OR REPLACE VIEW analytics_dau AS
SELECT
  date_trunc('day', created_at) AS day,
  COUNT(DISTINCT session_id)    AS sessions,
  COUNT(DISTINCT user_id)       AS users
FROM analytics_events
WHERE app = 'web'
GROUP BY 1
ORDER BY 1 DESC;

CREATE OR REPLACE VIEW analytics_devices AS
SELECT
  device_type,
  browser,
  os,
  COUNT(DISTINCT session_id)    AS sessions,
  COUNT(*)                      AS events
FROM analytics_events
WHERE app = 'web'
GROUP BY 1, 2, 3
ORDER BY sessions DESC;

-- ---------------------------------------------
-- 4. Play-style views
--
-- These derive from `moves`, which has recorded piece, captured_piece,
-- coordinates and created_at for every online move since 001. No new
-- collection is required for online games.
--
-- Offline and bot games never touch `moves`, so they arrive as `game_summary`
-- analytics events instead; analytics_player_profile merges both sources.
-- ---------------------------------------------

-- Per-move facts, with think time measured as the gap since the player's
-- previous move in the same game.
CREATE OR REPLACE VIEW analytics_move_facts AS
SELECT
  m.id,
  m.game_id,
  m.player,
  CASE WHEN m.player = 'white' THEN g.white_player_id ELSE g.black_player_id END AS player_id,
  m.move_number,
  m.piece,
  m.captured_piece IS NOT NULL AS is_capture,
  m.promotion IS NOT NULL      AS is_promotion,
  -- White advances down (+row), black advances up (-row); normalise so that
  -- positive always means "toward the opponent".
  CASE WHEN m.player = 'white' THEN m.to_row - m.from_row ELSE m.from_row - m.to_row END AS forward_delta,
  m.created_at,
  EXTRACT(EPOCH FROM (
    m.created_at - LAG(m.created_at) OVER (
      PARTITION BY m.game_id, m.player ORDER BY m.move_number
    )
  )) * 1000 AS think_ms
FROM moves m
JOIN games g ON g.id = m.game_id;

-- One row per player: how they play, from online games.
CREATE OR REPLACE VIEW analytics_play_style AS
SELECT
  f.player_id,
  p.username,
  COUNT(*)                                              AS moves_played,
  COUNT(DISTINCT f.game_id)                             AS games_analyzed,
  ROUND(AVG(CASE WHEN f.is_capture THEN 1 ELSE 0 END)::numeric, 4)   AS aggression,
  ROUND(AVG(CASE WHEN f.is_promotion THEN 1 ELSE 0 END)::numeric, 4) AS promotion_rate,
  ROUND(AVG(f.forward_delta)::numeric, 3)               AS advancement_bias,
  COUNT(*) FILTER (WHERE f.piece IN ('w', 'b'))         AS pichu_moves,
  COUNT(*) FILTER (WHERE f.piece IN ('W', 'B'))         AS pikachu_moves,
  COUNT(*) FILTER (WHERE f.piece IN ('@', '$'))         AS raichu_moves,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY f.think_ms)::numeric, 0)  AS think_ms_p50,
  ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY f.think_ms)::numeric, 0)  AS think_ms_p90,
  -- High stddev relative to the median reads as erratic pacing.
  ROUND(STDDEV_POP(f.think_ms)::numeric, 0)             AS think_ms_stddev
FROM analytics_move_facts f
LEFT JOIN profiles p ON p.id = f.player_id
WHERE f.player_id IS NOT NULL
GROUP BY f.player_id, p.username;

-- Outcome-shaped traits that need the games table rather than individual moves.
CREATE OR REPLACE VIEW analytics_player_outcomes AS
WITH participation AS (
  SELECT white_player_id AS player_id, winner_id, status, move_count, created_at, finished_at
  FROM games WHERE white_player_id IS NOT NULL
  UNION ALL
  SELECT black_player_id AS player_id, winner_id, status, move_count, created_at, finished_at
  FROM games WHERE black_player_id IS NOT NULL
)
SELECT
  player_id,
  COUNT(*)                                                        AS games_total,
  COUNT(*) FILTER (WHERE winner_id = player_id)                   AS games_won,
  COUNT(*) FILTER (WHERE status = 'abandoned')                    AS games_abandoned,
  ROUND(AVG(move_count)::numeric, 1)                              AS avg_move_count,
  ROUND(AVG(EXTRACT(EPOCH FROM (finished_at - created_at)))::numeric, 0) AS avg_duration_s
FROM participation
GROUP BY player_id;

-- The merged profile the dashboard and any "your play style" UI should read.
CREATE OR REPLACE VIEW analytics_player_profile AS
SELECT
  s.player_id,
  s.username,
  s.games_analyzed,
  s.moves_played,
  s.aggression,
  s.advancement_bias,
  s.promotion_rate,
  s.pichu_moves,
  s.pikachu_moves,
  s.raichu_moves,
  s.think_ms_p50,
  s.think_ms_p90,
  s.think_ms_stddev,
  o.games_total,
  o.games_won,
  o.games_abandoned,
  o.avg_move_count,
  o.avg_duration_s,
  CASE WHEN o.games_total > 0
       THEN ROUND(o.games_won::numeric / o.games_total, 4) END    AS win_rate
FROM analytics_play_style s
LEFT JOIN analytics_player_outcomes o ON o.player_id = s.player_id;

-- ---------------------------------------------
-- 5. Dashboard views for the new event types
-- ---------------------------------------------

-- Client and server errors over time.
CREATE OR REPLACE VIEW analytics_errors AS
SELECT
  date_trunc('day', created_at)      AS day,
  app,
  event_type,
  properties ->> 'reason'            AS reason,
  COUNT(*)                           AS occurrences,
  COUNT(DISTINCT session_id)         AS sessions_affected
FROM analytics_events
WHERE event_type IN ('api_error', 'auth_error', 'invalid_move_rejected', 'server_error', 'realtime_lost')
GROUP BY 1, 2, 3, 4
ORDER BY 1 DESC, occurrences DESC;

-- Core Web Vitals percentiles per metric per day.
CREATE OR REPLACE VIEW analytics_web_vitals AS
SELECT
  date_trunc('day', created_at)                                    AS day,
  properties ->> 'metric'                                          AS metric,
  COUNT(*)                                                         AS samples,
  ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (
    ORDER BY (properties ->> 'value')::numeric)::numeric, 2)       AS p75,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (
    ORDER BY (properties ->> 'value')::numeric)::numeric, 2)       AS p95
FROM analytics_events
WHERE event_type = 'web_vitals' AND properties ->> 'value' IS NOT NULL
GROUP BY 1, 2
ORDER BY 1 DESC, 2;

-- Engagement: how long sessions actually last and how far people scroll.
CREATE OR REPLACE VIEW analytics_engagement AS
SELECT
  date_trunc('day', created_at)                                     AS day,
  page,
  COUNT(*)                                                          AS exits,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY (properties ->> 'time_on_page_ms')::numeric)::numeric, 0) AS median_time_ms,
  ROUND(AVG((properties ->> 'max_scroll_pct')::numeric), 1)         AS avg_scroll_pct
FROM analytics_events
WHERE event_type = 'page_exit'
GROUP BY 1, 2
ORDER BY 1 DESC, exits DESC;

-- Where players come from and whether they convert into a game.
CREATE OR REPLACE VIEW analytics_conversion AS
SELECT
  date_trunc('day', created_at)                                                  AS day,
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'page_view')              AS sessions,
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'cta_click')              AS cta_sessions,
  COUNT(DISTINCT session_id) FILTER (WHERE event_type IN ('game_started', 'online_game_started')) AS playing_sessions,
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'signup')                 AS signup_sessions
FROM analytics_events
GROUP BY 1
ORDER BY 1 DESC;

-- Online vs offline game mix, using the server-authoritative events where present.
CREATE OR REPLACE VIEW analytics_game_mix AS
SELECT
  date_trunc('day', created_at)                                       AS day,
  COALESCE(properties ->> 'mode', properties ->> 'gameType')           AS mode,
  app,
  COUNT(*)                                                            AS games
FROM analytics_events
WHERE event_type IN ('game_summary', 'online_game_ended', 'server_game_finished')
GROUP BY 1, 2, 3
ORDER BY 1 DESC, games DESC;

-- Event-type mix. PostgREST cannot express GROUP BY, so the dashboard needs
-- this as a view rather than an ad-hoc query.
CREATE OR REPLACE VIEW analytics_event_counts AS
SELECT
  event_type,
  app,
  COUNT(*)                    AS events,
  COUNT(DISTINCT session_id)  AS sessions,
  MAX(created_at)             AS last_seen
FROM analytics_events
GROUP BY 1, 2
ORDER BY events DESC;

-- ---------------------------------------------
-- 6. Retention
--
-- The free tier allows 500 MB. The new event types multiply row count, so keep
-- growth bounded. Call periodically (Supabase scheduled function or by hand):
--   SELECT prune_analytics_events();
-- ---------------------------------------------

CREATE OR REPLACE FUNCTION prune_analytics_events(retain_days INTEGER DEFAULT 180)
RETURNS INTEGER AS $$
DECLARE
  deleted INTEGER;
BEGIN
  DELETE FROM analytics_events
  WHERE created_at < now() - (retain_days || ' days')::interval;
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$ LANGUAGE plpgsql;
