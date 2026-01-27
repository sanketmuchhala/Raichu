# Multiplayer Deep Dive

**Purpose:** Detailed explanation of networking, state synchronization, and data models.  
**Audience:** Backend Engineers  
**Last Verified Commit:** `16274f9`

## Networking Model
-   **Architecture**: Client-Server / Polling.
-   **Protocol**: HTTP/1.0 (REST-like).
-   **Frequency**: ~1.5 seconds (Polled by client).
-   **State Authority**: **Server-Authoritative** for storage, **Client-Authoritative** for move logic (Backend validates basic turns, but complex rules are duplicated or trusted).

## Database Schema (Supabase)
Table: `rooms`
-   `id`: BigInt (Primary Key)
-   `room_id`: Text (Unique, Public ID, e.g., "GAME-X9Y2Z")
-   `data`: JSONB (Stores the entire game state blob)
-   `created_at`: Timestamp

### `data` JSON Structure
```json
{
  "roomId": "GAME-X9Y2Z",
  "players": {
    "white": { "id": "uuid", "name": "Bob", "connected": true },
    "black": { "id": "uuid", "name": "Alice", "connected": true }
  },
  "board": ["w", ".", ...], // 64-char Array OR String (Handled robustly)
  "currentPlayer": "w",
  "status": "playing", // "waiting", "playing", "finished"
  "gameOver": false,
  "winner": null
}
```

## Session Flow

### 1. Create Room (Host)
1.  Client: `handleCreateRoom` -> POST `/api/multiplayer-create`
2.  Server: Generates ID -> Inserts Row -> Returns Room Data.
3.  Client: Enters `waiting` state -> Polls for opponent.

### 2. Join Room (Guest)
1.  Client: `handleJoinRoom` -> POST `/api/multiplayer-join`
2.  Server:
    *   Loads Room (Single atomic fetch).
    *   Checks if full/playing.
    *   Updates `players.black`.
    *   **PATCH** Supabase (Atomic Update).
    *   *Verification*: Checks if 0 rows updated (RLS Error).
3.  Client: Receives success -> Renders board -> Starts polling.

### 3. Gameplay (Move)
1.  Client: `makeMove` -> Updates Local State (Prediction).
2.  Client: POST `/api/multiplayer-move`.
3.  Server:
    *   Loads Room.
    *   Validates `currentPlayer` matches `playerId` (Basic Anti-Cheat).
    *   Updates Board & Turn.
    *   **PATCH** Supabase.
4.  Opponent Client: Polls `/api/multiplayer-state` -> Sees new board -> Updates UI.

## Critical Implementation Details
-   **Atomic Updates**: We do **not** use "Read-All -> Modify -> Write-All". We use specific column patches where possible, or atomic Row replacements restricted by `room_id`.
-   **Robust Parsing**: The backend handles both `String` and `JSONB` responses from Supabase (PostgREST) to prevent 500 errors.
-   **RLS (Row Level Security)**: MUST be disabled (`DISABLE ROW LEVEL SECURITY`) for the current public logic to work, as we don't handle Supabase Auth Users (JWTs).

## Known Issues / Gotchas
-   **Latency**: 1.5s poll rate means moves feel "laggy" to the observer.
-   **Race Conditions**: Two people joining perfectly simultaneously *might* glitch (mitigated by atomic insert/check).
-   **Disappearing Pieces**: Fixed by ensuring Frontend validates board data before rendering.
