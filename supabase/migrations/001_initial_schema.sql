-- =============================================
-- Raichu Multiplayer Schema
-- =============================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  elo_rating INTEGER NOT NULL DEFAULT 1200,
  games_played INTEGER NOT NULL DEFAULT 0,
  games_won INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_elo ON profiles(elo_rating DESC);

-- 2. GAMES
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_player_id UUID REFERENCES profiles(id),
  black_player_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'playing', 'white_wins', 'black_wins', 'abandoned')),
  board_state TEXT NOT NULL,
  current_player TEXT NOT NULL DEFAULT 'white'
    CHECK (current_player IN ('white', 'black')),
  game_type TEXT NOT NULL
    CHECK (game_type IN ('friendly', 'ranked', 'bot')),
  difficulty TEXT
    CHECK (difficulty IS NULL OR difficulty IN ('easy', 'medium', 'hard')),
  invite_code TEXT UNIQUE,
  move_count INTEGER NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES profiles(id),
  winner_elo_delta INTEGER,
  loser_elo_delta INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX idx_games_invite_code ON games(invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX idx_games_white_player ON games(white_player_id);
CREATE INDEX idx_games_black_player ON games(black_player_id);
CREATE INDEX idx_games_status ON games(status);

-- 3. MOVES
CREATE TABLE moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  player TEXT NOT NULL CHECK (player IN ('white', 'black')),
  from_row SMALLINT NOT NULL,
  from_col SMALLINT NOT NULL,
  to_row SMALLINT NOT NULL,
  to_col SMALLINT NOT NULL,
  piece CHAR(1) NOT NULL,
  captured_piece CHAR(1),
  captured_row SMALLINT,
  captured_col SMALLINT,
  promotion CHAR(1),
  board_after TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(game_id, move_number)
);

CREATE INDEX idx_moves_game ON moves(game_id, move_number);

-- 4. MATCHMAKING QUEUE
CREATE TABLE matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES profiles(id) UNIQUE,
  elo_rating INTEGER NOT NULL,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_matchmaking_elo ON matchmaking_queue(elo_rating);

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- TRIGGER: Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Profiles: anyone authenticated can read, only own row can be updated
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Games: authenticated users can read games they participate in
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own games"
  ON games FOR SELECT
  TO authenticated
  USING (
    white_player_id = auth.uid()
    OR black_player_id = auth.uid()
    OR status = 'waiting'
  );

-- Moves: authenticated users can read moves from their games
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view moves from their games"
  ON moves FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT id FROM games
      WHERE white_player_id = auth.uid()
        OR black_player_id = auth.uid()
    )
  );

-- Matchmaking queue: no direct access (service role only)
ALTER TABLE matchmaking_queue ENABLE ROW LEVEL SECURITY;

-- =============================================
-- REALTIME: Enable for games and moves tables
-- =============================================
ALTER TABLE games REPLICA IDENTITY FULL;
ALTER TABLE moves REPLICA IDENTITY FULL;

-- Note: Run these in the Supabase dashboard SQL editor if publication doesn't exist yet:
-- ALTER PUBLICATION supabase_realtime ADD TABLE games;
-- ALTER PUBLICATION supabase_realtime ADD TABLE moves;
