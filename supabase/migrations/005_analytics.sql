-- =============================================
-- Analytics Events Table
-- Captures every meaningful interaction:
-- page views, game events, auth events, device info, geo from Vercel headers
-- =============================================

CREATE TABLE analytics_events (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session & identity
  session_id       UUID         NOT NULL,
  user_id          UUID         REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event classification
  event_type       TEXT         NOT NULL,
  page             TEXT,
  referrer         TEXT,

  -- Network / Geo (populated server-side from Vercel / CF headers)
  ip_address       INET,
  country          CHAR(2),        -- ISO 3166-1 alpha-2 (e.g. 'US', 'IN')
  region           TEXT,           -- state / province code
  city             TEXT,

  -- User agent raw + parsed
  user_agent       TEXT,
  device_type      TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser          TEXT,
  browser_version  TEXT,
  os               TEXT,
  os_version       TEXT,

  -- Display
  screen_width     SMALLINT,
  screen_height    SMALLINT,
  viewport_width   SMALLINT,
  viewport_height  SMALLINT,
  device_pixel_ratio REAL,

  -- Locale
  language         TEXT,
  timezone         TEXT,

  -- Flexible per-event payload
  properties       JSONB,

  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- =============================================
-- Indexes for common query patterns
-- =============================================

CREATE INDEX idx_analytics_created_at    ON analytics_events (created_at DESC);
CREATE INDEX idx_analytics_event_type    ON analytics_events (event_type);
CREATE INDEX idx_analytics_user_id       ON analytics_events (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_analytics_session_id    ON analytics_events (session_id);
CREATE INDEX idx_analytics_country       ON analytics_events (country) WHERE country IS NOT NULL;
CREATE INDEX idx_analytics_device_type   ON analytics_events (device_type);
CREATE INDEX idx_analytics_page          ON analytics_events (page);
-- For daily/hourly bucketing
CREATE INDEX idx_analytics_created_date  ON analytics_events (date_trunc('day', created_at));

-- =============================================
-- Row Level Security
-- Events are written server-side only (service role key).
-- No client can read or write directly.
-- =============================================

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Deny all by default (service role bypasses RLS, so server inserts work fine)
-- No public SELECT policies intentionally — raw analytics data is private.

-- =============================================
-- Handy views for the dashboard
-- =============================================

-- Daily active users (distinct sessions per day)
CREATE VIEW analytics_dau AS
SELECT
  date_trunc('day', created_at) AS day,
  COUNT(DISTINCT session_id)    AS sessions,
  COUNT(DISTINCT user_id)       AS users
FROM analytics_events
GROUP BY 1
ORDER BY 1 DESC;

-- Top pages
CREATE VIEW analytics_top_pages AS
SELECT
  page,
  COUNT(*)                      AS views,
  COUNT(DISTINCT session_id)    AS unique_sessions
FROM analytics_events
WHERE event_type = 'page_view'
GROUP BY 1
ORDER BY views DESC;

-- Device breakdown
CREATE VIEW analytics_devices AS
SELECT
  device_type,
  browser,
  os,
  COUNT(DISTINCT session_id)    AS sessions,
  COUNT(*)                      AS events
FROM analytics_events
GROUP BY 1, 2, 3
ORDER BY sessions DESC;

-- Country breakdown
CREATE VIEW analytics_geo AS
SELECT
  country,
  COUNT(DISTINCT session_id)    AS sessions,
  COUNT(DISTINCT user_id)       AS users
FROM analytics_events
WHERE country IS NOT NULL
GROUP BY 1
ORDER BY sessions DESC;

-- Game funnel: started vs finished
CREATE VIEW analytics_game_funnel AS
SELECT
  date_trunc('day', created_at) AS day,
  SUM(CASE WHEN event_type = 'game_started' THEN 1 ELSE 0 END) AS games_started,
  SUM(CASE WHEN event_type = 'game_ended'   THEN 1 ELSE 0 END) AS games_ended,
  SUM(CASE WHEN event_type = 'match_found'  THEN 1 ELSE 0 END) AS matches_found
FROM analytics_events
GROUP BY 1
ORDER BY 1 DESC;
