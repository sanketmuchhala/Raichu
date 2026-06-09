# Database

Supabase (PostgreSQL). All tables live in the `public` schema.

Migrations are in `supabase/migrations/` and run in order.

---

## Schema Diagram

```
┌─────────────────────┐         ┌─────────────────────────────────────┐
│     auth.users      │         │             profiles                 │
│  (Supabase managed) │         │                                     │
│                     │ 1 ──► 1 │  id            UUID  PK (= auth.id) │
│  id UUID            │         │  username      TEXT  UNIQUE          │
│  email TEXT         │         │  display_name  TEXT  nullable        │
│  ...                │         │  elo_rating    INT   DEFAULT 1200    │
└─────────────────────┘         │  games_played  INT   DEFAULT 0       │
                                 │  games_won     INT   DEFAULT 0       │
                                 │  avatar_url    TEXT  nullable        │
                                 │  created_at    TIMESTAMPTZ           │
                                 │  updated_at    TIMESTAMPTZ           │
                                 └──────────────┬──────────────────────┘
                                                │
                              ┌─────────────────┘
                              │  white_player_id / black_player_id
                              ▼
              ┌───────────────────────────────────────────────┐
              │                    games                       │
              │                                               │
              │  id               UUID  PK                    │
              │  white_player_id  UUID  FK → profiles         │
              │  black_player_id  UUID  FK → profiles (null)  │
              │  status           TEXT  CHECK (see below)      │
              │  board_state      TEXT  (64-char encoding)     │
              │  current_player   TEXT  ('white'|'black')      │
              │  game_type        TEXT  ('friendly'|'ranked'|'bot') │
              │  difficulty       TEXT  nullable               │
              │  invite_code      TEXT  UNIQUE nullable        │
              │  move_count       INT   DEFAULT 0              │
              │  winner_id        UUID  FK → profiles null     │
              │  winner_elo_delta INT   nullable               │
              │  loser_elo_delta  INT   nullable               │
              │  created_at       TIMESTAMPTZ                  │
              │  updated_at       TIMESTAMPTZ                  │
              │  finished_at      TIMESTAMPTZ nullable         │
              └──────────────────┬────────────────────────────┘
                                 │
                                 │  game_id (CASCADE delete)
                                 ▼
              ┌───────────────────────────────────────────────┐
              │                    moves                       │
              │                                               │
              │  id             UUID   PK                     │
              │  game_id        UUID   FK → games (CASCADE)   │
              │  move_number    INT    NOT NULL                │
              │  player         TEXT   ('white'|'black')       │
              │  from_row       SMALLINT                       │
              │  from_col       SMALLINT                       │
              │  to_row         SMALLINT                       │
              │  to_col         SMALLINT                       │
              │  piece          CHAR(1)                        │
              │  captured_piece CHAR(1) nullable               │
              │  captured_row   SMALLINT nullable              │
              │  captured_col   SMALLINT nullable              │
              │  promotion      CHAR(1) nullable               │
              │  board_after    TEXT   (64-char snapshot)      │
              │  created_at     TIMESTAMPTZ                    │
              │  UNIQUE(game_id, move_number)                  │
              └───────────────────────────────────────────────┘

              ┌───────────────────────────────────────────────┐
              │              matchmaking_queue                 │
              │                                               │
              │  id         UUID  PK                          │
              │  player_id  UUID  UNIQUE  FK → profiles       │
              │  elo_rating INT   NOT NULL                     │
              │  queued_at  TIMESTAMPTZ  DEFAULT now()         │
              └───────────────────────────────────────────────┘
```

---

## Table Details

### profiles

Extended user information. One row per Supabase auth user.

**Status values:** none (profiles don't have a status)

**Auto-created:** The `on_auth_user_created` trigger creates a profile row automatically when a user signs up. Username defaults to `user_<8-char-id>` if not provided in metadata.

**ELO starting value:** 1200 for all new users.

**Indexes:**
- `idx_profiles_elo` on `elo_rating DESC` (leaderboard queries)

**RLS Policies:**
- `SELECT`: Any authenticated user can read any profile (needed for leaderboard and opponent display)
- `UPDATE`: A user can update only their own profile (enforced by `auth.uid() = id`)

---

### games

A game session between two players (or one player vs bot).

**Status values:**
- `waiting` — Friendly game created, waiting for second player to join via invite code
- `playing` — Both players present, game in progress
- `white_wins` — Game over, White won
- `black_wins` — Game over, Black won
- `abandoned` — Game timed out or left in a dead state

`board_state` is always the current board after the last move, stored as a 64-character row-major string.

`invite_code` is a 6-character alphanumeric code, present only for `game_type = 'friendly'`.

**Indexes:**
- `idx_games_invite_code` on `invite_code` (JOIN by invite code)
- `idx_games_white_player` on `white_player_id`
- `idx_games_black_player` on `black_player_id`
- `idx_games_status` on `status` (filter active games)

**RLS Policies:**
- `SELECT`: Authenticated user can read a game if they are `white_player_id` or `black_player_id`, OR if `status = 'waiting'` (needed for lobby browsing)
- `INSERT`/`UPDATE`: No direct client access. Only the API (service role) can write.

**Realtime:**
`REPLICA IDENTITY FULL` enabled. Supabase Realtime publishes UPDATE events. The frontend subscribes by `game_id` to receive live board updates.

---

### moves

Immutable record of every move in every game.

`board_after` stores a snapshot of the board immediately after the move was applied. This allows replaying or seeking to any point in the game without replaying all moves.

**Unique constraint:** `(game_id, move_number)` ensures no duplicate or out-of-order move records.

**Indexes:**
- `idx_moves_game` on `(game_id, move_number ASC)` (fetch ordered history)

**RLS Policies:**
- `SELECT`: A user can read moves for games they are part of (white or black player)

**Realtime:**
`REPLICA IDENTITY FULL` enabled. INSERT events published when new moves are recorded. The opponent's browser receives the move via subscription and applies it locally.

---

### matchmaking_queue

Transient table for ranked matchmaking. Rows are deleted when a match is found.

`player_id` has a UNIQUE constraint — a player can only be in the queue once.

**RLS:** None. This table is accessed exclusively by the API via the service role key. No client-side access.

**Processed by:** `matchmaking-worker.ts` in the API, running a loop every 3 seconds.

---

## Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| profiles | `elo_rating DESC` | Leaderboard page |
| games | `invite_code` | JOIN by invite |
| games | `white_player_id`, `black_player_id` | User's game history |
| games | `status` | Filter active games |
| moves | `(game_id, move_number)` | Ordered move history |
| matchmaking_queue | `elo_rating` | ELO range matching |

---

## Triggers

### on_auth_user_created

Fires on INSERT into `auth.users`. Creates a corresponding row in `profiles` with:
- `id` = new user's UUID
- `username` = `raw_user_meta_data->>'username'` if provided, else `user_<first-8-chars-of-id>`

### profiles_updated_at / games_updated_at

Fire on INSERT or UPDATE of their respective tables. Set `updated_at = now()` automatically.

---

## Migrations

Run in order:

| File | Description |
|------|-------------|
| `001_initial_schema.sql` | Creates all tables, indexes, RLS policies, triggers |
| `002_elo_tracking.sql` | Adds ELO delta columns and leaderboard index |
| `003_fix_profile_trigger.sql` | Fixes edge case in auto-profile creation on signup |
| `004_enable_realtime.sql` | Sets REPLICA IDENTITY FULL, adds tables to supabase_realtime publication |

---

## ELO System

Starting ELO: 1200 for all players.

K-factor by experience:
```
games_played < 30:   K = 32   (high volatility for new players)
games_played 30-100: K = 24
games_played > 100:  K = 16   (stable for experienced players)
```

Formula:
```
expected = 1 / (1 + 10^((opponent_elo - player_elo) / 400))
delta = K * (actual_score - expected)
actual_score = 1.0 for win, 0.0 for loss
```

Minimum ELO floor: 100 (cannot drop below this).

Both players' ELO is updated atomically after the game result is written.
