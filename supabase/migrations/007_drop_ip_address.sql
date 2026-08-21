-- =============================================
-- 007: Drop the raw IP column (contract phase)
--
-- Run this ONLY after the code writing `ip_hash` is deployed everywhere.
-- Until then `ip_address` must keep existing, because the previously deployed
-- track route still writes to it — see the note in 006.
--
-- Verify before running:
--   SELECT count(*) FROM analytics_events
--   WHERE ip_address IS NOT NULL AND created_at > now() - interval '1 hour';
-- A zero count means nothing is writing the column any more and it is safe.
-- =============================================

ALTER TABLE analytics_events DROP COLUMN IF EXISTS ip_address;
