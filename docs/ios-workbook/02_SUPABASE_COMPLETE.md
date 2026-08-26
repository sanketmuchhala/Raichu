# Supabase Complete Reference

> Every table, column, index, trigger, RLS policy, Realtime setting, and migration for the Raichu database.

---

## 1. Schema Diagram

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
              │  status           TEXT  CHECK (below)          │
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

              ┌───────────────────────────────────────────────┐
              │              analytics_events                  │
              │                                               │
              │  id, session_id, user_id, event_type, page,   │
              │  referrer, ip_address, country, region, city,  │
              │  user_agent, device_type, browser, os,         │
              │  screen dimensions, language, timezone,        │
              │  properties (JSONB), created_at                │
              └───────────────────────────────────────────────┘
```

---

## 2. Table Details

### 2.1 `profiles`

Extended user information. One row per Supabase auth user.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | UUID | — | PK, FK → auth.users(id) ON DELETE CASCADE |
| `username` | TEXT | — | UNIQUE, NOT NULL |
| `display_name` | TEXT | null | — |
| `avatar_url` | TEXT | null | — |
| `elo_rating` | INTEGER | 1200 | Starting ELO for all users |
| `games_played` | INTEGER | 0 | — |
| `games_won` | INTEGER | 0 | — |
| `created_at` | TIMESTAMPTZ | now() | — |
| `updated_at` | TIMESTAMPTZ | now() | Auto-updated via trigger |

**Indexes:**
- `idx_profiles_elo` on `elo_rating DESC` (leaderboard)
- `idx_profiles_elo_desc` on `elo_rating DESC` (duplicate from migration 002)

**RLS:**
- `SELECT`: Any authenticated user can read any profile
- `UPDATE`: User can update only their own (`auth.uid() = id`)
- `INSERT`: Service role can insert (for trigger)

### 2.2 `games`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | UUID | gen_random_uuid() | PK |
| `white_player_id` | UUID | — | FK → profiles |
| `black_player_id` | UUID | null | FK → profiles (null when waiting) |
| `status` | TEXT | 'waiting' | CHECK: waiting, playing, white_wins, black_wins, abandoned |
| `board_state` | TEXT | — | 64-character row-major encoding |
| `current_player` | TEXT | 'white' | CHECK: white, black |
| `game_type` | TEXT | — | CHECK: friendly, ranked, bot |
| `difficulty` | TEXT | null | CHECK: easy, medium, hard (null if not bot) |
| `invite_code` | TEXT | null | UNIQUE, 6-char alphanumeric (friendly only) |
| `move_count` | INTEGER | 0 | — |
| `winner_id` | UUID | null | FK → profiles |
| `winner_elo_delta` | INTEGER | null | ELO gained by winner |
| `loser_elo_delta` | INTEGER | null | ELO lost by loser |
| `created_at` | TIMESTAMPTZ | now() | — |
| `updated_at` | TIMESTAMPTZ | now() | Auto-updated via trigger |
| `finished_at` | TIMESTAMPTZ | null | Set when game ends |

**Indexes:**
- `idx_games_invite_code` on `invite_code` WHERE NOT NULL
- `idx_games_white_player` on `white_player_id`
- `idx_games_black_player` on `black_player_id`
- `idx_games_status` on `status`

**RLS:**
- `SELECT`: User is white_player_id OR black_player_id OR status = 'waiting'
- `INSERT`/`UPDATE`: No direct client access — API (service role) only

**Realtime:** `REPLICA IDENTITY FULL` enabled. UPDATE events published.

### 2.3 `moves`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `game_id` | UUID | FK → games ON DELETE CASCADE |
| `move_number` | INTEGER | NOT NULL |
| `player` | TEXT | 'white' or 'black' |
| `from_row` | SMALLINT | — |
| `from_col` | SMALLINT | — |
| `to_row` | SMALLINT | — |
| `to_col` | SMALLINT | — |
| `piece` | CHAR(1) | w, W, @, b, B, $ |
| `captured_piece` | CHAR(1) | nullable |
| `captured_row` | SMALLINT | nullable |
| `captured_col` | SMALLINT | nullable |
| `promotion` | CHAR(1) | nullable (@ or $) |
| `board_after` | TEXT | 64-char board snapshot after move |
| `created_at` | TIMESTAMPTZ | — |

**Constraints:** UNIQUE(game_id, move_number)

**Indexes:** `idx_moves_game` on `(game_id, move_number)`

**RLS:** `SELECT`: User can read moves for games they participate in

**Realtime:** `REPLICA IDENTITY FULL` enabled. INSERT events published.

### 2.4 `matchmaking_queue`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `player_id` | UUID | UNIQUE, FK → profiles |
| `elo_rating` | INTEGER | NOT NULL |
| `queued_at` | TIMESTAMPTZ | DEFAULT now() |

**RLS:** None — service role only. No client access.

### 2.5 `analytics_events`

Captures every meaningful interaction. Written server-side only.

**No client read/write access** — RLS enabled with no policies (service role bypasses).

---

## 3. Triggers

### `on_auth_user_created`
Fires on INSERT into `auth.users`. Creates profile with:
- `id` = user's UUID
- `username` = metadata username → email prefix → `user_<8-char-id>`
- `display_name` = full_name → name → display_name → username
- `avatar_url` = avatar_url → picture
- ON CONFLICT (id) DO NOTHING

### `profiles_updated_at` / `games_updated_at`
Auto-set `updated_at = now()` on UPDATE.

---

## 4. Migrations (in order)

| File | Description |
|------|-------------|
| `001_initial_schema.sql` | All tables, indexes, RLS, triggers, REPLICA IDENTITY |
| `002_elo_tracking.sql` | Additional ELO indexes |
| `003_fix_profile_trigger.sql` | Robust OAuth profile creation, username uniqueness |
| `004_enable_realtime.sql` | `ALTER PUBLICATION supabase_realtime ADD TABLE games, moves` |
| `005_analytics.sql` | Analytics events table + dashboard views (DAU, top pages, devices, geo, game funnel) |

---

## 5. ELO System

| Setting | Value |
|---------|-------|
| Starting ELO | 1200 |
| Minimum floor | 100 |
| K-factor (< 30 games) | 32 |
| K-factor (30–100 games) | 24 |
| K-factor (> 100 games) | 16 |

**Formula:**
```
expected = 1 / (1 + 10^((opponent_elo - player_elo) / 400))
delta = K * (actual_score - expected)
actual_score = 1.0 for win, 0.0 for loss
```

Both players updated atomically after game result.

---

## 6. Realtime Configuration

**Tables with Realtime:**
- `games` — UPDATE events (board_state, status, current_player changes)
- `moves` — INSERT events (new move records)

**iOS Subscription Pattern:**

```swift
func subscribeRealtime(gameId: String) {
    realtimeChannel = supabase.realtime
        .channel("game-\(gameId)")
        .on(.postgres, schema: "public", table: "games",
            filter: "id=eq.\(gameId)") { [weak self] payload in
            // handleGameUpdate — decode board_state, update UI
        }
        .on(.postgres, schema: "public", table: "game_moves",
            filter: "game_id=eq.\(gameId)") { [weak self] payload in
            // handleNewMove — apply move animation, update board
        }
        .subscribe()
}
```

**Polling Fallback:** Poll `GET /games/:id` every 3 seconds when Realtime isn't delivering, same pattern as the web client.

---

## 7. Authentication Flow

```
User signs up / signs in
       │
       ▼
Supabase Auth (email+password or Google OAuth)
  → on_auth_user_created trigger creates profiles row
  → issues JWT: access_token (1h) + refresh_token (long-lived)
       │
       ▼
iOS App
  → store JWT in Keychain (supabase-swift handles this)
  → attach to all API requests: Authorization: Bearer <access_token>
  → supabase-swift handles automatic token refresh
       │
       ▼
Express API
  → requireAuth middleware validates JWT
  → LRU cache (5-min TTL, 100 entries max)
  → cache miss: supabase.auth.getUser(token)
  → attach req.user to request
```

---

## 8. Supabase Swift SDK Usage

### Auth
```swift
// Sign up
let result = try await supabase.auth.signUp(
    email: email,
    password: password,
    data: ["username": .string(username)]
)

// Sign in
let session = try await supabase.auth.signIn(
    email: email,
    password: password
)

// Sign in with Google
try await supabase.auth.signInWithOAuth(provider: .google)

// Sign out
try await supabase.auth.signOut()

// Get current session
let session = try await supabase.auth.session

// Listen for auth changes
supabase.auth.onAuthStateChange { event, session in
    // Update AuthStore
}
```

### Database Queries
```swift
// Fetch profile
let profile: Profile = try await supabase
    .from("profiles")
    .select()
    .eq("id", value: userId)
    .single()
    .execute()
    .value

// Fetch leaderboard
let profiles: [Profile] = try await supabase
    .from("profiles")
    .select()
    .order("elo_rating", ascending: false)
    .limit(50)
    .execute()
    .value

// Fetch user's games
let games: [OnlineGame] = try await supabase
    .from("games")
    .select("*, white_player:profiles!white_player_id(*), black_player:profiles!black_player_id(*)")
    .or("white_player_id.eq.\(userId),black_player_id.eq.\(userId)")
    .order("created_at", ascending: false)
    .execute()
    .value
```
