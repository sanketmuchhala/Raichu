# API Contracts

Base URL: `http://localhost:3001/api/v1`

## Endpoints

### GET /health

Health check endpoint.

**Response** `200 OK`
```json
{ "status": "ok" }
```

### GET /version

Returns server and engine version information.

**Response** `200 OK`
```json
{
  "version": "1.0.0",
  "engine": "1.0.0"
}
```

### POST /bot/move

Request the AI to compute the best move for a given board position.

**Request Body**
```json
{
  "board": "........W.W.W.W..w.w.w.w................b.b.b.b..B.B.B.B........",
  "player": "w",
  "difficulty": "medium",
  "timeBudget": 3000
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `board` | string | Yes | 64-character row-major board encoding. Valid chars: `.wWbB@$` |
| `player` | `"w"` or `"b"` | Yes | Which player to compute a move for |
| `difficulty` | `"easy"`, `"medium"`, `"hard"` | Yes | AI difficulty level |
| `timeBudget` | number | No | Optional time budget in milliseconds (overrides difficulty default) |

**Response** `200 OK`
```json
{
  "move": {
    "from": { "row": 2, "col": 1 },
    "to": { "row": 3, "col": 2 },
    "piece": "w",
    "captured": null,
    "promotion": null
  },
  "board": "........W.W.W.W..w...w.w..w.............b.b.b.b..B.B.B.B........",
  "evaluation": 15,
  "nodesSearched": 2841,
  "depth": 4,
  "durationMs": 45
}
```

| Field | Type | Description |
|-------|------|-------------|
| `move` | Move | The chosen move object |
| `board` | string | New board state after the move |
| `evaluation` | number | Board evaluation score (positive = good for the moving player) |
| `nodesSearched` | number | Number of positions evaluated |
| `depth` | number | Search depth reached |
| `durationMs` | number | Time spent computing in milliseconds |

**Error Response** `400 Bad Request`
```json
{
  "error": "Invalid request",
  "details": [
    { "path": ["board"], "message": "Board string must be exactly 64 characters" }
  ]
}
```

## Board Encoding

The board is encoded as a 64-character string in row-major order (left to right, top to bottom).

### Piece Characters

| Char | Meaning |
|------|---------|
| `.` | Empty square |
| `w` | White Pichu |
| `W` | White Pikachu |
| `@` | White Raichu |
| `b` | Black Pichu |
| `B` | Black Pikachu |
| `$` | Black Raichu |

### Initial Board

```
........W.W.W.W..w.w.w.w................b.b.b.b..B.B.B.B........
```

Decodes to:
```
Row 0: . . . . . . . .
Row 1: W . W . W . W .
Row 2: . w . w . w . w
Row 3: . . . . . . . .
Row 4: . . . . . . . .
Row 5: b . b . b . b .
Row 6: . B . B . B . B
Row 7: . . . . . . . .
```

## Difficulty Presets

| Level | Max Depth | Time Budget | Description |
|-------|-----------|-------------|-------------|
| Easy | 2 | 1000ms | Quick, shallow search |
| Medium | 4 | 3000ms | Balanced play |
| Hard | 8 | 5000ms | Deep search, strongest play |
