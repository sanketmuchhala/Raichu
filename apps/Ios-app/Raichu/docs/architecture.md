# Architecture

## System Overview

Raichu is a full-stack monorepo. The game engine runs entirely in the browser for bot games, so no server round-trip is needed for AI moves. Online multiplayer uses Supabase Realtime for live board sync. The Express API handles game state persistence, ELO calculation, and matchmaking.

---

## High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser                                │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js 15 App                         │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │  Game UI    │  │  Auth UI     │  │  SEO / Blog     │  │  │
│  │  │  (SVG board)│  │  (Supabase)  │  │  (Static pages) │  │  │
│  │  └──────┬──────┘  └──────┬───────┘  └─────────────────┘  │  │
│  │         │                │                                  │  │
│  │  ┌──────▼──────────────────────────┐                       │  │
│  │  │          Zustand Stores         │                       │  │
│  │  │  game-store  online-game-store  │                       │  │
│  │  │  auth-store  matchmaking-store  │                       │  │
│  │  └──────┬──────────────┬───────────┘                       │  │
│  │         │              │                                    │  │
│  │  ┌──────▼──────┐  ┌───▼──────────────────────────────┐    │  │
│  │  │ game-engine │  │         Supabase Client           │    │  │
│  │  │  ai-engine  │  │  Auth  |  DB queries  |  Realtime │    │  │
│  │  │ (in-browser)│  └───────────────────────────────────┘    │  │
│  │  └─────────────┘                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                              │
         │ REST /api/v1/*               │ WebSocket (Realtime)
         ▼                              ▼
┌─────────────────┐          ┌──────────────────────┐
│   Express API   │          │   Supabase Platform   │
│                 │          │                        │
│  game routes    │◄────────►│  PostgreSQL            │
│  matchmaking    │  service  │  Auth (JWT)            │
│  bot route      │  role key │  Realtime pub/sub      │
│  worker (3s)    │          │  Row-Level Security    │
└─────────────────┘          └──────────────────────┘
```

---

## Package Dependency Graph

```
shared-types          (no dependencies)
     │
     ├── game-engine  (shared-types only)
     │        │
     │        └── ai-engine  (shared-types + game-engine)
     │
     ├── apps/web     (shared-types + game-engine + ai-engine + ui)
     │
     └── apps/api     (shared-types + game-engine)
```

The game engine has zero external dependencies. It can run in:
- Browser (via Next.js `transpilePackages`)
- Node.js (Express API, Vitest tests)
- React Native (future iOS)
- Web Workers (future parallel search)

---

## Data Flow: Bot Game

```
User clicks square
       │
       ▼
game-store.selectPiece()
  generateMovesForPiece(board, row, col)
  highlights legal destinations
       │
User clicks destination
       │
       ▼
game-store.makeMove(move)
  applyMove(board, move)               <- game-engine
  nextPlayer = opposite of current
  getGameStatus(board, nextPlayer)     <- game-engine (checks 0 legal moves)
  set state, React re-renders
       │
       ▼  (if bot's turn and game still playing)
setTimeout(requestBotMove, 300ms)
       │
       ▼
game-store.requestBotMove()
  await 50ms microtask yield           <- lets UI render "Thinking..."
  findBestMove(board, player, diff)    <- ai-engine (synchronous, time-budgeted)
  makeMove(result.move)
```

The AI runs on the main thread. The 50ms yield before the search lets React paint the "Thinking..." indicator first. Hard difficulty uses a 1500ms time budget.

---

## Data Flow: Online Multiplayer

```
Player A makes move
       │
       ▼
online-game-store.submitMove(move)
  POST /api/v1/games/:id/move
       │
       ▼
Express API  (auth middleware validates JWT)
  isValidMove(board, player, move)       <- game-engine
  newBoard = applyMove(board, move)      <- game-engine
  nextPlayer = opponent
  status = getGameStatus(newBoard, next) <- game-engine
  supabase.from('games').update({
    board_state, current_player, status
  })
  supabase.from('moves').insert(moveRecord)
  if status !== 'playing':
    calculateElo(winner, loser)
    updatePlayerStats(winner, loser, delta)
       │
       ▼
Supabase Realtime  (REPLICA IDENTITY FULL on games + moves)
  publishes UPDATE on games row
  publishes INSERT on moves row
       │
       ▼  Player B's browser
use-game-subscription.ts
  onMoveInsert  -> online-game-store.handleNewMove()
  onGameUpdate  -> online-game-store.handleGameUpdate()
  applyMove locally, React re-renders
```

---

## Data Flow: Matchmaking

```
Player joins ranked queue
       │
       ▼
POST /api/v1/matchmaking/queue
  INSERT into matchmaking_queue { player_id, elo_rating, queued_at }
       │
       ▼  (background, every 3 seconds)
matchmaking-worker.ts: processQueue()
  SELECT all rows ORDER BY queued_at ASC
  for each unmatched player P:
    wait_seconds = now - P.queued_at
    elo_range = expand(wait_seconds):
      0-15s:  +/- 100
      15-30s: +/- 200
      30-60s: +/- 400
      60s+:   any
    find first Q where |P.elo - Q.elo| <= elo_range
    if found:
      INSERT into games { white=P, black=Q, status='playing' }
      DELETE P and Q from matchmaking_queue
       │
       ▼
Frontend polls GET /api/v1/matchmaking/status every 2 seconds
  returns { status: 'matched', gameId: '...' }
       │
       ▼
Browser redirects to /game/:id
```

---

## Authentication Flow

```
User signs up / signs in
       │
       ▼
Supabase Auth (email+password or Google OAuth)
  on new signup: trigger creates profiles row automatically
  issues JWT: access_token (1h) + refresh_token (long-lived)
       │
       ▼
auth-store.ts
  stores user + profile in Zustand
  @supabase/ssr handles token refresh automatically
       │
For all API requests that need auth:
       ▼
Authorization: Bearer <access_token>
       │
       ▼
Express requireAuth middleware
  getUserFromToken(token):
    check LRU cache (5-min TTL, 100 entries max)
    cache miss: supabase.auth.getUser(token)
    attach req.user to request
  unauthorized: 401
       │
       ▼
Route handler proceeds with req.user
```

---

## State Management (Zustand)

All client state is flat Zustand stores.

| Store | Responsibility |
|-------|---------------|
| `game-store` | Local PvP + bot game: board, moves, AI trigger |
| `online-game-store` | Multiplayer: board, Realtime handlers, submit/resign |
| `auth-store` | Session, profile, sign in/up/out, updateProfile |
| `matchmaking-store` | Queue status, poll timer, matched game ID |
| `ui-store` | Theme, drag state, dialog open/close |

---

## Deployment

```
┌──────────────┐     ┌─────────────────────────────┐
│   Vercel     │     │   Railway / Fly.io            │
│              │     │                               │
│  Next.js     │────►│  Express API (Node, Docker)   │
│  Static SSR  │     │  matchmaking worker (3s loop) │
│  Edge CDN    │     │  PORT=3001                    │
└──────────────┘     └──────────────┬────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │         Supabase Cloud         │
                    │                               │
                    │  PostgreSQL                   │
                    │  Auth (JWT / Google OAuth)     │
                    │  Realtime (WebSocket)          │
                    │  Row-Level Security            │
                    └───────────────────────────────┘
```

The Next.js `rewrites` config proxies `/api/*` to the Express API URL at build time, keeping a single origin for the browser and avoiding CORS issues.

---

## Key Design Decisions

**Engine is pure, dependency-free TypeScript.** No DOM, no Node-only APIs, no external libraries. Runs identically in browser and Node. All state is passed explicitly; nothing lives globally.

**AI runs in the browser.** Eliminates round-trip latency for bot games. Trade-off: hard difficulty blocks the main thread for up to 1.5s. Future fix: Web Worker.

**Board encoding is a 64-char string.** `encodeBoard()` serializes the 2D array row-major. Compact for DB storage, easy to diff in move history, human-readable in test fixtures.

**`getGameStatus` checks for zero legal moves.** Not just piece counts. A player with pieces but no legal moves loses immediately, preventing UI freezes in cornered positions.

**Supabase service role for the API only.** The browser uses the anon key with RLS. The API uses the service role key for trusted operations (ELO updates, matchmaking inserts across user boundaries).

**Auth token cache in the API.** JWT verification is cached for 5 minutes with LRU eviction at 100 entries. Prevents a Supabase call on every API request from every user.
