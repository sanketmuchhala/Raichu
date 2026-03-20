-- Phase 4: ELO tracking
-- The winner_elo_delta and loser_elo_delta columns already exist in the games table
-- from the initial migration. This migration adds any additional indexes needed.

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_elo_desc
  ON profiles (elo_rating DESC);

-- Index for matchmaking queue ELO matching
CREATE INDEX IF NOT EXISTS idx_matchmaking_elo
  ON matchmaking_queue (elo_rating);
