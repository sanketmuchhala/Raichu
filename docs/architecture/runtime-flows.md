# Runtime flows

**Status:** Canonical sequence and state-flow guide.

This document follows commands through the current implementation. Function and file names are included so a reader can move from diagram to code.

## Local player move

```mermaid
sequenceDiagram
    actor Player
    participant Board as Board component
    participant Store as game-store
    participant Engine as game-engine

    Player->>Board: tap or drag piece
    Board->>Store: selectPiece(row, col)
    Store->>Engine: generateMovesForPiece(board, row, col)
    Engine-->>Store: legal moves
    Store-->>Board: selected piece + highlights
    Player->>Board: choose destination
    Board->>Store: makeMove(move)
    Store->>Engine: applyMove(board, move)
    Engine-->>Store: cloned next board
    Store->>Engine: getGameStatus(nextBoard, nextPlayer)
    Engine-->>Store: base status
    Store->>Store: update repetition/no-progress history
    Store-->>Board: next state and animation inputs
```

The move engine is pure. The store owns turn advancement, history, draw counters, analytics, bot scheduling, and UI selection state.

## Browser bot move

```mermaid
sequenceDiagram
    participant Store as game-store
    participant Client as ai-worker-client
    participant Worker as ai.worker.ts
    participant AI as ai-engine
    participant Engine as game-engine

    Store->>Store: set isThinking = true
    Store->>Client: findBestMoveOffThread(board, player, difficulty)
    Client->>Worker: postMessage(request id + position)
    Worker->>AI: findBestMove(...)
    loop iterative depth until cap or timeout
        AI->>Engine: generateAllMoves / applyMove
        Engine-->>AI: child positions
    end
    AI-->>Worker: SearchResult
    Worker-->>Client: postMessage(response id)
    Client-->>Store: resolve matching request
    Store->>Store: discard if game/request changed
    Store->>Store: makeMove(result.move)
```

The client maps request IDs to promises and applies a ten-second safety timeout. In server or test environments without `Worker`, it imports the AI engine and runs synchronously as a compatibility fallback.

## Online move command

```mermaid
sequenceDiagram
    actor Player
    participant UI as Online board
    participant Store as online-game-store
    participant APIClient as apiFetch
    participant API as Express game route
    participant Service as game-service
    participant Engine as game-engine
    participant DB as Supabase PostgreSQL

    Player->>UI: choose legal-looking destination
    UI->>Store: submitMove(move)
    Store->>APIClient: gamesApi.move(gameId, move)
    APIClient->>API: POST /api/v1/games/:id/move + JWT
    API->>API: Zod shape validation + requireAuth
    API->>Service: makeMove(gameId, userId, move)
    Service->>DB: read game row
    DB-->>Service: board, turn, players, status
    Service->>Service: confirm game active and user's turn
    Service->>Engine: isValidMove(board, player, move)
    Engine-->>Service: accepted/rejected
    Service->>Engine: applyMove + getGameStatus
    Service->>DB: insert move row
    Service->>DB: update game row
    DB-->>Service: updated game
    Service-->>Store: HTTP response
    Store-->>UI: render authoritative state
```

The API trusts neither the client board nor client turn. It loads current state and regenerates legal moves. Capture and promotion metadata are effectively derived again when the matched generated move is used by the client; the current matcher itself compares origin and destination.

## Online update propagation and recovery

```mermaid
sequenceDiagram
    participant DB as PostgreSQL
    participant RT as Supabase Realtime
    participant Sub as useGameSubscription
    participant Store as online-game-store
    participant API as REST API

    DB-->>RT: games UPDATE / moves INSERT
    RT-->>Sub: postgres_changes event
    Sub->>Store: handleGameUpdate / handleNewMove
    Store->>Store: update board, status, history

    loop every 3 seconds
        alt Realtime is healthy and game not active
            Sub->>Sub: skip recovery poll
        else recovery check needed
            Sub->>API: GET /api/v1/games/:id
            API-->>Sub: current game row
            alt board or status differs
                Sub->>Store: repair from authoritative state
            end
        end
    end
```

Realtime is a notification transport, not the primary database. Polling allows convergence after dropped events, tab suspension, or reconnects.

## Friendly-game lifecycle

```mermaid
stateDiagram-v2
    [*] --> Waiting: creator posts friendly game
    Waiting --> Playing: second user joins invite code
    Waiting --> Abandoned: creator exits/cancels through future policy
    Playing --> WhiteWins: terminal move or Black resigns
    Playing --> BlackWins: terminal move or White resigns
    Playing --> Abandoned: current resignation implementation
    WhiteWins --> [*]
    BlackWins --> [*]
    Abandoned --> [*]
```

The persisted enum has no draw state. Check actual service behavior before building UI assumptions around resignation labels because `abandoned` and winner assignment are distinct concepts.

## Ranked matchmaking

```mermaid
sequenceDiagram
    actor Player
    participant Store as matchmaking-store
    participant API as matchmaking routes
    participant Queue as matchmaking_queue
    participant Worker as 5-second worker
    participant Games as games table

    Player->>Store: join queue
    Store->>API: POST /matchmaking/queue
    API->>Queue: upsert player + current ELO + timestamp
    API-->>Store: queued + approximate queue count

    loop every 2 seconds on client
        Store->>API: GET /matchmaking/status
        API->>Queue: check membership
        API-->>Store: queued / matched / idle
    end

    loop every 5 seconds on API process
        Worker->>Queue: oldest-first queue read
        Worker->>Worker: expand ELO window by wait time
        Worker->>Games: insert playing ranked game
        Worker->>Queue: delete paired players
    end

    Store->>Player: navigate to matched game
```

ELO window:

| Oldest player's wait | Accepted difference |
|---|---:|
| 0–15 seconds | ±100 |
| over 15–30 seconds | ±200 |
| over 30–60 seconds | ±400 |
| over 60 seconds | effectively unrestricted |

Colors are assigned randomly at match creation.

## Authentication

```mermaid
sequenceDiagram
    actor User
    participant Web as Web/iOS auth client
    participant Auth as Supabase Auth
    participant Store as auth store
    participant APIClient as API client
    participant API as Express middleware
    participant Cache as token cache

    User->>Web: sign in or OAuth
    Web->>Auth: credentials/authorization code
    Auth-->>Web: session and tokens
    Web->>Store: user + profile state
    Store->>APIClient: authenticated command
    APIClient->>API: Authorization: Bearer token
    API->>Cache: lookup token
    alt unexpired cached identity
        Cache-->>API: user
    else cache miss
        API->>Auth: getUser(token)
        Auth-->>API: verified user or error
        API->>Cache: cache for 5 minutes
    end
    API->>API: route handler with req.user
```

The cache is process-local. It improves repeat-request latency but does not create a session of its own.

## Ranked game completion and ELO

```mermaid
sequenceDiagram
    participant Service as game-service
    participant Engine as game-engine
    participant DB as PostgreSQL
    participant Elo as elo.ts

    Service->>Engine: evaluate post-move status
    Engine-->>Service: winner or playing
    alt terminal ranked game
        Service->>DB: load both profiles
        Service->>DB: increment games played/won
        Service->>Elo: calculateElo(ratings, games played)
        Elo-->>Service: new ratings and deltas
        Service->>DB: update profiles and game deltas
    end
```

The expected score is the standard logistic ELO formula. K is 32 below 30 games, 24 below 100, and 16 afterward. The rating floor is 100.

## Analytics flow

```mermaid
flowchart LR
    Browser[Browser events] --> Track[Next.js /api/track]
    API[Server outcomes] --> Events[(analytics_events)]
    Track --> Events
    Online[Online move records] --> Moves[(moves)]
    Events --> Views[Secured aggregate views]
    Moves --> Views
    Views --> Admin[Server-rendered admin dashboard]
```

Offline games emit compact summary events because they never create move rows. Online play-style analytics derive from persisted moves.

## Failure behavior quick reference

| Failure | User-visible effect | Recovery |
|---|---|---|
| AI worker error | bot move fails and thinking state clears | worker resets; next request creates a new worker |
| AI worker timeout | promise rejects after ten seconds | worker terminates and pending request is removed |
| Realtime disconnect | opponent move may appear late | three-second REST recovery polling |
| API unavailable | online commands fail | client surfaces request error; local modes remain available |
| Supabase unavailable | auth, persistence, matching fail | API returns errors; matchmaker counts failures |
| Matchmaker fails three intervals | new ranked pairs stop | worker pauses; operator/process restart required |
| Partial move write | history/game row can diverge | no automatic transaction repair currently |

## Related documents

- [System design](system-design.md)
- [Web platform](../platforms/web.md)
- [API platform](../platforms/api.md)
- [Data and Realtime](../engineering/data-and-realtime.md)
