-- Player Stats Database Schema
-- Run this in Supabase SQL Editor to enable player tracking and statistics

-- 1. Players Table
CREATE TABLE IF NOT EXISTS players (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text UNIQUE NOT NULL,
    email text UNIQUE,
    created_at timestamp with time zone DEFAULT now(),
    last_played_at timestamp with time zone DEFAULT now(),
    
    -- Statistics
    total_games integer DEFAULT 0,
    wins integer DEFAULT 0,
    losses integer DEFAULT 0,
    draws integer DEFAULT 0,
    rating integer DEFAULT 1200, -- ELO rating system
    peak_rating integer DEFAULT 1200,
    
    -- Preferences
    preferred_color text DEFAULT 'random', -- 'white', 'black', 'random'
    avatar_url text,
    settings jsonb DEFAULT '{
        "sounds_enabled": true,
        "animations_enabled": true,
        "board_theme": "classic"
    }'::jsonb,
    
    CONSTRAINT valid_preferred_color CHECK (preferred_color IN ('white', 'black', 'random'))
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_players_rating ON players(rating DESC);

-- 2. Game History Table
CREATE TABLE IF NOT EXISTS game_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id text NOT NULL,
    
    -- Players
    white_player_id uuid REFERENCES players(id) ON DELETE SET NULL,
    black_player_id uuid REFERENCES players(id) ON DELETE SET NULL,
    white_player_name text,
    black_player_name text,
    
    -- Game Data
    moves jsonb NOT NULL, -- Array of moves: [{from: 0, to: 8, piece: 'w', notation: 'e2-e4', timestamp: '...'}]
    final_board jsonb NOT NULL,
    initial_board jsonb NOT NULL,
    
    -- Result
    winner text, -- 'white', 'black', 'draw', null if abandoned
    win_reason text, -- 'checkmate', 'resignation', 'timeout', 'stalemate'
    game_mode text NOT NULL, -- 'bot', '2player', 'online'
    difficulty integer, -- For bot games: 1=Easy, 2=Medium, 3=Hard
    
    -- Metadata
    started_at timestamp with time zone DEFAULT now(),
    ended_at timestamp with time zone,
    duration_seconds integer,
    total_moves integer,
    
    CONSTRAINT valid_winner CHECK (winner IN ('white', 'black', 'draw') OR winner IS NULL),
    CONSTRAINT valid_game_mode CHECK (game_mode IN ('bot', '2player', 'online'))
);

-- Indexes for game history
CREATE INDEX IF NOT EXISTS idx_game_history_white_player ON game_history(white_player_id);
CREATE INDEX IF NOT EXISTS idx_game_history_black_player ON game_history(black_player_id);
CREATE INDEX IF NOT EXISTS idx_game_history_started_at ON game_history(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_history_room_id ON game_history(room_id);

-- 3. Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid REFERENCES players(id) ON DELETE CASCADE,
    achievement_type text NOT NULL,
    unlocked_at timestamp with time zone DEFAULT now(),
    metadata jsonb, -- Additional data like streak count, etc.
    
    UNIQUE(player_id, achievement_type)
);

-- Achievement types:
-- 'first_win', 'win_streak_5', 'win_streak_10', 'win_streak_25'
-- 'perfect_game' (no pieces lost), 'speed_demon' (win in <2 min)
-- 'comeback_king' (win from material disadvantage)
-- 'centurion' (100 games played), 'master' (rating > 1600)

CREATE INDEX IF NOT EXISTS idx_achievements_player ON achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);

-- 4. Leaderboard View
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    username,
    rating,
    wins,
    losses,
    total_games,
    CASE 
        WHEN total_games > 0 THEN ROUND((wins::numeric / total_games::numeric) * 100, 1)
        ELSE 0 
    END as win_rate,
    peak_rating,
    created_at
FROM players
WHERE total_games >= 5 -- Only show players with at least 5 games
ORDER BY rating DESC
LIMIT 100;

-- 5. Player Stats View
CREATE OR REPLACE VIEW player_stats_summary AS
SELECT 
    p.id,
    p.username,
    p.rating,
    p.total_games,
    p.wins,
    p.losses,
    p.draws,
    CASE 
        WHEN p.total_games > 0 THEN ROUND((p.wins::numeric / p.total_games::numeric) * 100, 1)
        ELSE 0 
    END as win_rate,
    COUNT(DISTINCT a.achievement_type) as achievements_count,
    (
        SELECT COUNT(*) 
        FROM game_history gh 
        WHERE (gh.white_player_id = p.id OR gh.black_player_id = p.id)
        AND gh.started_at > now() - interval '7 days'
    ) as games_last_week
FROM players p
LEFT JOIN achievements a ON a.player_id = p.id
GROUP BY p.id, p.username, p.rating, p.total_games, p.wins, p.losses, p.draws;

-- 6. Functions for updating player stats
CREATE OR REPLACE FUNCTION update_player_stats(
    p_player_id uuid,
    p_result text, -- 'win', 'loss', 'draw'
    p_rating_change integer DEFAULT 0
)
RETURNS void AS $$
BEGIN
    UPDATE players
    SET 
        total_games = total_games + 1,
        wins = wins + CASE WHEN p_result = 'win' THEN 1 ELSE 0 END,
        losses = losses + CASE WHEN p_result = 'loss' THEN 1 ELSE 0 END,
        draws = draws + CASE WHEN p_result = 'draw' THEN 1 ELSE 0 END,
        rating = rating + p_rating_change,
        peak_rating = GREATEST(peak_rating, rating + p_rating_change),
        last_played_at = now()
    WHERE id = p_player_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Function to calculate ELO rating change
CREATE OR REPLACE FUNCTION calculate_elo_change(
    player_rating integer,
    opponent_rating integer,
    result numeric -- 1.0 for win, 0.5 for draw, 0.0 for loss
)
RETURNS integer AS $$
DECLARE
    k_factor integer := 32; -- Standard K-factor
    expected_score numeric;
    rating_change integer;
BEGIN
    -- Calculate expected score
    expected_score := 1.0 / (1.0 + POWER(10.0, (opponent_rating - player_rating)::numeric / 400.0));
    
    -- Calculate rating change
    rating_change := ROUND(k_factor * (result - expected_score));
    
    RETURN rating_change;
END;
$$ LANGUAGE plpgsql;

-- 8. Sample data (optional - for testing)
-- INSERT INTO players (username, email) VALUES 
-- ('TestPlayer1', 'test1@example.com'),
-- ('TestPlayer2', 'test2@example.com');

-- Grant permissions (adjust as needed for your security model)
-- ALTER TABLE players ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize based on your auth setup):
-- CREATE POLICY "Players can view their own data" ON players
--     FOR SELECT USING (auth.uid() = id);
-- 
-- CREATE POLICY "Players can update their own settings" ON players
--     FOR UPDATE USING (auth.uid() = id);

COMMENT ON TABLE players IS 'Stores player profiles and statistics';
COMMENT ON TABLE game_history IS 'Complete history of all games played';
COMMENT ON TABLE achievements IS 'Player achievements and milestones';
COMMENT ON VIEW leaderboard IS 'Top 100 players by rating';
COMMENT ON VIEW player_stats_summary IS 'Comprehensive player statistics';
