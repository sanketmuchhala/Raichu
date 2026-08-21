# REST API

Base URL: `http://localhost:3001/api/v1` (development)

All authenticated endpoints require `Authorization: Bearer <supabase_access_token>`.

All request and response bodies are JSON.

---

## Public Endpoints

### GET /health

Server health check.

**Response 200**
```json
{ "status": "ok" }
```

---

### GET /version

Server and engine version.

**Response 200**
```json
{
  "version": "1.0.0",
  "engine": "1.0.0"
}
```

---

### POST /bot/move

Compute the best AI move for a given board position. No authentication required.

**Request body**
```json
{
  "board":      "64-character encoded board string",
  "player":     "w",
  "difficulty": "easy | medium | hard",
  "timeBudget": 800
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `board` | string (64 chars) | Yes | Row-major piece encoding |
| `player` | `"w"` or `"b"` | Yes | `"w"` = White's turn |
| `difficulty` | enum | Yes | easy / medium / hard |
| `timeBudget` | number (ms) | No | Overrides difficulty default |

**Response 200**
```json
{
  "move": {
    "from":       { "row": 2, "col": 3 },
    "to":         { "row": 3, "col": 4 },
    "piece":      "w",
    "captured":   null,
    "promotion":  null
  },
  "board":         "...updated 64-char string...",
  "evaluation":    120,
  "nodesSearched": 42381,
  "depth":         6,
  "durationMs":    387
}
```

**Response 400** — Invalid board, unknown player, or no legal moves
```json
{ "error": "No legal moves for player" }
```

---

## Authenticated Endpoints

### POST /games

Create a new game.

**Request body**
```json
{
  "gameType":   "friendly | ranked | bot",
  "difficulty": "easy | medium | hard",
  "playAs":     "white | black | random"
}
```

`difficulty` is required only when `gameType = "bot"`.
`playAs` defaults to `"random"` for ranked games.

**Response 201**
```json
{
  "id":               "uuid",
  "status":           "waiting",
  "game_type":        "friendly",
  "invite_code":      "AB3X7Z",
  "board_state":      "...initial 64-char board...",
  "current_player":   "white",
  "white_player_id":  "uuid",
  "black_player_id":  null,
  "created_at":       "2026-05-12T10:00:00Z"
}
```

Friendly games get a 6-character `invite_code`. Ranked games are matched via the matchmaking queue.

---

### GET /games/my

List the authenticated user's games.

**Response 200**
```json
[
  {
    "id":             "uuid",
    "status":         "playing",
    "game_type":      "ranked",
    "current_player": "black",
    "white_player":   { "username": "alice", "elo_rating": 1240 },
    "black_player":   { "username": "bob",   "elo_rating": 1195 },
    "move_count":     14,
    "created_at":     "2026-05-12T09:30:00Z"
  }
]
```

---

### GET /games/:id

Get full game details including player profiles.

**Response 200**
```json
{
  "id":               "uuid",
  "status":           "playing",
  "board_state":      "...64-char string...",
  "current_player":   "white",
  "game_type":        "ranked",
  "move_count":       8,
  "white_player_id":  "uuid",
  "black_player_id":  "uuid",
  "white_player":     { "id": "uuid", "username": "alice", "elo_rating": 1240, "display_name": "Alice" },
  "black_player":     { "id": "uuid", "username": "bob",   "elo_rating": 1195, "display_name": null },
  "winner_id":        null,
  "invite_code":      null,
  "created_at":       "2026-05-12T09:30:00Z",
  "finished_at":      null
}
```

**Response 403** — Game belongs to another user

---

### GET /games/:id/moves

Full move history for a game.

**Response 200**
```json
[
  {
    "id":            "uuid",
    "game_id":       "uuid",
    "move_number":   1,
    "player":        "white",
    "from_row":      2, "from_col": 3,
    "to_row":        3, "to_col":   4,
    "piece":         "w",
    "captured_piece": null,
    "promotion":     null,
    "board_after":   "...64-char string...",
    "created_at":    "2026-05-12T09:30:05Z"
  }
]
```

---

### POST /games/:id/move

Submit a move for the authenticated user.

**Request body**
```json
{
  "from":     { "row": 2, "col": 3 },
  "to":       { "row": 3, "col": 4 },
  "piece":    "w",
  "captured": null,
  "promotion": null
}
```

The server validates the move against generated legal moves. If `promotion` is not provided but the move reaches the back rank, the server applies it automatically.

**Response 200** — Updated game state (same shape as GET /games/:id)

**Response 400** — Illegal move
```json
{ "error": "Illegal move" }
```

**Response 403** — Not this player's turn, or game is over

---

### POST /games/:id/resign

Forfeit the game.

**Response 200**
```json
{ "winner_id": "uuid-of-opponent" }
```

---

## Matchmaking

### POST /matchmaking/queue

Join the ranked matchmaking queue.

**Response 200**
```json
{ "status": "queued", "queuedAt": "2026-05-12T09:30:00Z" }
```

**Response 409** — Already in queue

---

### DELETE /matchmaking/queue

Leave the queue.

**Response 200**
```json
{ "status": "removed" }
```

---

### GET /matchmaking/status

Check queue position or matched game.

**Response 200 — Still queued**
```json
{
  "status":      "queued",
  "waitSeconds": 12,
  "queueCount":  4
}
```

**Response 200 — Matched**
```json
{
  "status":  "matched",
  "gameId":  "uuid"
}
```

**Response 200 — Not in queue**
```json
{ "status": "idle" }
```

---

## Error Responses

All errors follow the same shape:

```json
{ "error": "Human-readable error message" }
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request (invalid input, illegal move) |
| 401 | Missing or invalid auth token |
| 403 | Authenticated but not authorized for this resource |
| 404 | Resource not found |
| 409 | Conflict (duplicate queue entry, game already over) |
| 500 | Internal server error |
