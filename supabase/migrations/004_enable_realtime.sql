-- Enable Supabase Realtime for games and moves tables
-- These were missing from 001_initial_schema.sql (commented out)
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE moves;
