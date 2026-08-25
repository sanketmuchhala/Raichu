# REST API reference

**Status:** Canonical endpoint reference for the checked-in Express implementation.

Development base URL: `http://localhost:3001/api/v1`.

Authenticated endpoints require:

```http
Authorization: Bearer <supabase-access-token>
Content-Type: application/json
```

## Endpoint summary

| Method | Path | Auth | Success |
|---|---|---|---:|
| `GET` | `/health` | public | `200` |
| `GET` | `/version` | public | `200` |
| `POST` | `/bot/move` | public | `200` |
| `POST` | `/games` | required | `201` |
| `GET` | `/games/my` | required | `200` |
| `GET` | `/games/:id` | required | `200` |
| `GET` | `/games/:id/moves` | required | `200` |
| `POST` | `/games/:id/move` | required | `200` |
| `POST` | `/games/:id/resign` | required | `200` |
| `POST` | `/games/join/:code` | required | `200` |
| `POST` | `/matchmaking/queue` | required | `200` |
| `DELETE` | `/matchmaking/queue` | required | `200` |
| `GET` | `/matchmaking/status` | required | `200` |

## Public endpoints

### `GET /health`

```json
{ "status": "ok" }
```

This is process liveness only; it does not test Supabase connectivity.

### `GET /version`

```json
{
  "version": "1.0.0",
  "engine": "1.0.0"
}
```

Values are currently constants in the route.

### `POST /bot/move`

Runs server-side AI search.

Request:

```json
{
  "board": "........W.W.W.W..w.w.w.w................b.b.b.b..B.B.B.B........",
  "player": "w",
  "difficulty": "medium",
  "timeBudget": 800
}
```

| Field | Validation |
|---|---|
| `board` | exactly 64 characters from `.wWbB@$` |
| `player` | `w` or `b` |
| `difficulty` | `easy`, `medium`, or `hard` |
| `timeBudget` | optional positive number; currently has no route maximum |

Move response:

```json
{
  "move": {
    "from": { "row": 2, "col": 3 },
    "to": { "row": 3, "col": 4 },
    "piece": "w"
  },
  "board": "...64-character result...",
  "evaluation": 120,
  "nodesSearched": 42381,
  "depth": 6,
  "durationMs": 387
}
```

No legal move is also a `200` in the current implementation:

```json
{
  "error": "No legal moves available",
  "board": "...unchanged board..."
}
```

Malformed input returns `400` with Zod issues. Search exceptions return `500`.

## Game endpoints

All routes in this section pass through `requireAuth`.

### `POST /games`

Request:

```json
{
  "gameType": "friendly",
  "difficulty": "medium",
  "playAs": "white"
}
```

| Field | Required | Values/current behavior |
|---|---|---|
| `gameType` | yes | `friendly`, `ranked`, `bot` |
| `difficulty` | no | `easy`, `medium`, `hard`; stored only for bot, defaults to medium there |
| `playAs` | no | `white`, `black`, `random`; defaults to white |

The endpoint creates a raw `games` row with status `waiting`. Friendly games receive a six-character invite code. Normal ranked pairing is created through matchmaking rather than this endpoint.

Response `201` is the inserted game row:

```json
{
  "id": "uuid",
  "white_player_id": "uuid",
  "black_player_id": null,
  "status": "waiting",
  "board_state": "...initial board...",
  "current_player": "white",
  "game_type": "friendly",
  "difficulty": null,
  "invite_code": "AB3X7Z",
  "move_count": 0
}
```

### `GET /games/my`

Returns up to 20 raw game rows involving the authenticated user, newest `updated_at` first.

```json
[
  {
    "id": "uuid",
    "status": "playing",
    "game_type": "ranked",
    "current_player": "black",
    "move_count": 14,
    "white_player_id": "uuid",
    "black_player_id": "uuid"
  }
]
```

This endpoint does not join profile objects.

### `GET /games/:id`

Returns one game plus `white_player` and `black_player` profile objects where present.

```json
{
  "id": "uuid",
  "status": "playing",
  "board_state": "...64-character board...",
  "current_player": "white",
  "white_player_id": "uuid",
  "black_player_id": "uuid",
  "white_player": { "id": "uuid", "username": "alice", "elo_rating": 1240 },
  "black_player": { "id": "uuid", "username": "bob", "elo_rating": 1195 }
}
```

Missing games return `404`.

**Known authorization limitation:** the API uses the service role and currently checks only that the caller is authenticated, not that they participate in the requested game. Direct Supabase reads remain protected by RLS. Add participant authorization before treating game IDs as private capabilities.

### `GET /games/:id/moves`

Returns move rows in ascending `move_number` order:

```json
[
  {
    "id": "uuid",
    "game_id": "uuid",
    "move_number": 1,
    "player": "white",
    "from_row": 2,
    "from_col": 3,
    "to_row": 3,
    "to_col": 4,
    "piece": "w",
    "captured_piece": null,
    "captured_row": null,
    "captured_col": null,
    "promotion": null,
    "board_after": "...64-character board..."
  }
]
```

The same service-role authorization limitation currently applies to this endpoint.

### `POST /games/:id/move`

Request:

```json
{
  "from": { "row": 2, "col": 3 },
  "to": { "row": 3, "col": 4 },
  "piece": "w",
  "captured": {
    "position": { "row": 4, "col": 5 },
    "piece": "b"
  },
  "promotion": "@"
}
```

`captured` and `promotion` are optional. Coordinates are integers from 0 through 7; piece fields are currently validated as one-character strings.

The service loads the game, checks status and turn ownership, generates legal moves, and matches the submitted origin/destination. It returns the updated raw game row.

Current error mapping:

- malformed shape: `400`;
- `Not your turn` or `Invalid move`: `400`;
- other service failures, including some not-found/not-playing cases: `500`.

**Known metadata limitation:** validation matches origin and destination, but the submitted `captured`, `piece`, and `promotion` metadata is then applied. Callers must currently send the canonical generated move. The service should be hardened to apply the matched server-generated move instead.

### `POST /games/:id/resign`

Returns the updated raw game row. A participant resigning from a playing game gives the opponent a win; leaving a waiting game marks it `abandoned`. Any service error is currently returned as `400`.

### `POST /games/join/:code`

Fills the empty color slot for a waiting invite-code game and changes status to `playing`. The invite code is normalized to uppercase.

The creator cannot join their own game again. Invalid, started, or self-join attempts return `400`.

## Matchmaking endpoints

### `POST /matchmaking/queue`

Reads the authenticated profile's current ELO and upserts one queue row per player.

```json
{
  "status": "queued",
  "queueCount": 4
}
```

Rejoining refreshes ELO and `queued_at`; it does not return a duplicate-entry conflict.

### `DELETE /matchmaking/queue`

```json
{ "status": "left" }
```

Deleting an absent row is effectively idempotent.

### `GET /matchmaking/status`

Queued:

```json
{
  "status": "queued",
  "waitSeconds": 12,
  "queueCount": 4
}
```

Matched:

```json
{
  "status": "matched",
  "gameId": "uuid"
}
```

Idle:

```json
{ "status": "idle" }
```

When a queue row is absent, the service searches the last five minutes for a waiting/playing ranked game involving the caller.

## Error shapes

Most errors include:

```json
{ "error": "Human-readable message" }
```

Zod errors also include `details`. The public bot route can include `message` on an internal failure. The global error handler includes `message` only in development.

The current API does not use one fully normalized error envelope. Clients should rely primarily on status plus `error` and treat additional fields as diagnostic.

## Consistency and security notes

- Online move persistence spans separate move, game, statistics, and rating writes; it is not one transaction.
- There is no move idempotency key or optimistic game version.
- Online terminal status currently checks piece elimination but does not pass `nextPlayer` for immobility detection.
- Persisted online status has no `draw` value.
- The public bot endpoint is compute-expensive and has no authentication/rate limit.
- Service-role reads must add explicit resource authorization because RLS is bypassed.

See [API platform architecture](platforms/api.md), [data and Realtime](engineering/data-and-realtime.md), and [shared API contracts](api-contracts.md).
