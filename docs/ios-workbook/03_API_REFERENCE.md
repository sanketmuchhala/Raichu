# API Reference

> Every REST endpoint the iOS app needs to call, with request/response schemas.

---

## Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://raichu.live/api/v1` |
| Development | `http://localhost:3001/api/v1` |

**Authentication:** All authenticated endpoints require `Authorization: Bearer <supabase_access_token>`.

**Content-Type:** All request and response bodies are JSON.

---

## Public Endpoints (No Auth Required)

### `GET /health`

```json
// Response 200
{ "status": "ok" }
```

### `GET /version`

```json
// Response 200
{ "version": "1.0.0", "engine": "1.0.0" }
```

### `POST /bot/move`

Compute the best AI move for a given board position.

**Request:**
```json
{
  "board":      "........W.W.W.W..w.w.w.w................b.b.b.b..B.B.B.B........",
  "player":     "w",
  "difficulty": "medium",
  "timeBudget": 800
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `board` | string (64 chars) | Yes | Row-major piece encoding. Valid: `.wWbB@$` |
| `player` | `"w"` or `"b"` | Yes | `"w"` = White's turn |
| `difficulty` | `"easy"` \| `"medium"` \| `"hard"` | Yes | AI difficulty |
| `timeBudget` | number (ms) | No | Overrides difficulty default |

**Response 200:**
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

**Response 400:** Invalid board, unknown player, or no legal moves.

> **Note for iOS:** The game engine runs locally via JavaScriptCore. This endpoint is only needed if you want server-side AI computation. For v1, run AI on-device.

---

## Authenticated Endpoints

### Games

#### `POST /games` — Create a new game

**Request:**
```json
{
  "gameType":   "friendly",
  "difficulty": "medium",
  "playAs":     "white"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `gameType` | `"friendly"` \| `"ranked"` \| `"bot"` | Yes | — |
| `difficulty` | `"easy"` \| `"medium"` \| `"hard"` | Only for bot | — |
| `playAs` | `"white"` \| `"black"` \| `"random"` | No | Defaults to `"random"` for ranked |

**Response 201:**
```json
{
  "id":               "uuid",
  "status":           "waiting",
  "game_type":        "friendly",
  "invite_code":      "AB3X7Z",
  "board_state":      "........W.W.W.W..w.w.w.w................b.b.b.b..B.B.B.B........",
  "current_player":   "white",
  "white_player_id":  "uuid",
  "black_player_id":  null,
  "created_at":       "2026-05-12T10:00:00Z"
}
```

#### `GET /games/my` — List user's games

**Response 200:** Array of game summary objects with joined player profiles.

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

#### `GET /games/:id` — Full game details

**Response 200:**
```json
{
  "id":               "uuid",
  "status":           "playing",
  "board_state":      "...64-char...",
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

#### `GET /games/:id/moves` — Move history

**Response 200:**
```json
[
  {
    "id":             "uuid",
    "game_id":        "uuid",
    "move_number":    1,
    "player":         "white",
    "from_row":       2, "from_col": 3,
    "to_row":         3, "to_col":   4,
    "piece":          "w",
    "captured_piece": null,
    "promotion":      null,
    "board_after":    "...64-char...",
    "created_at":     "2026-05-12T09:30:05Z"
  }
]
```

#### `POST /games/:id/move` — Submit a move

**Request:**
```json
{
  "from":      { "row": 2, "col": 3 },
  "to":        { "row": 3, "col": 4 },
  "piece":     "w",
  "captured":  null,
  "promotion": null
}
```

**Response 200:** Updated game state (same shape as GET /games/:id).

**Response 400:** `{ "error": "Illegal move" }` or `{ "error": "Not your turn" }`

#### `POST /games/:id/resign` — Forfeit

**Response 200:** `{ "winner_id": "uuid-of-opponent" }`

#### `POST /games/join/:code` — Join by invite code

**Response 200:** Full game detail with both players.

---

### Matchmaking

#### `POST /matchmaking/queue` — Join ranked queue

**Response 200:** `{ "status": "queued", "queuedAt": "..." }`

**Response 409:** Already in queue.

#### `DELETE /matchmaking/queue` — Leave queue

**Response 200:** `{ "status": "removed" }`

#### `GET /matchmaking/status` — Poll queue

**Queued:**
```json
{ "status": "queued", "waitSeconds": 12, "queueCount": 4 }
```

**Matched:**
```json
{ "status": "matched", "gameId": "uuid" }
```

**Idle:**
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
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate queue entry) |
| 500 | Internal server error |

---

## iOS API Client Pattern

```swift
/// Typed fetch wrapper that attaches JWT auth header
func apiFetch<T: Decodable>(
    path: String,
    method: String = "GET",
    body: (any Encodable)? = nil
) async throws -> T {
    let session = try await supabase.auth.session
    let token = session.accessToken

    var request = URLRequest(url: URL(string: "\(API_BASE_URL)\(path)")!)
    request.httpMethod = method
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    if let body = body {
        request.httpBody = try JSONEncoder().encode(body)
    }

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let httpResponse = response as? HTTPURLResponse,
          (200...299).contains(httpResponse.statusCode) else {
        let errorBody = try? JSONDecoder().decode(APIError.self, from: data)
        throw APIClientError.serverError(errorBody?.error ?? "Unknown error")
    }

    return try JSONDecoder().decode(T.self, from: data)
}

struct APIError: Decodable {
    let error: String
}
```

---

## Matchmaking Worker (Server-Side)

The API runs a background matchmaking worker every 3 seconds:

```
ELO Range Expansion by Wait Time:
  0-15s:  ±100 ELO
  15-30s: ±200 ELO
  30-60s: ±400 ELO
  60s+:   any ELO
```

The iOS client polls `GET /matchmaking/status` every 2 seconds while queued. On `status: "matched"`, navigate to the game.
