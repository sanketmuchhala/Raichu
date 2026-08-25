# Glossary

**Status:** Canonical terminology reference.

| Term | Meaning in Raichu |
|---|---|
| AI engine | `@raichu/ai-engine`, the minimax/alpha-beta search and evaluation package. |
| Anon key | Supabase public client key; safe to distribute only because RLS protects data. It is not the service-role key. |
| Apply move | Pure engine transition that clones a board, removes an optional capture, clears origin, and writes destination/promotion. |
| Board | An 8×8 `CellValue[][]`, addressed as `board[row][col]`. |
| Board encoding | 64-character row-major representation using `.wWbB@$`. |
| Capture hierarchy | Pichu captures Pichu; Pikachu captures Pichu/Pikachu; Raichu captures any enemy. |
| Cell value | One piece character or `.` for empty. |
| Command | A requested state change, such as make move, resign, join queue. Commands require validation/authorization. |
| Draw history | Repetition counts and half-moves without capture/promotion, stored above the core engine. |
| ELO | Rating system using expected score and experience-dependent K-factor. Repository spelling is `ELO`, though Elo is a name rather than an acronym. |
| Engine | Usually `@raichu/game-engine`, the source of legal move and board-transition truth. |
| Friendly game | Invite-code online game; not ranked. |
| Game snapshot | Latest online board/turn/status stored in a `games` row. |
| Game status | Local union includes `draw`; persisted online status currently does not. |
| Half-move | One player's move (one ply). The local no-progress draw threshold is 100 half-moves. |
| Idempotency | Repeating the same command has the same effect as executing it once. Online move commands do not yet expose an idempotency key. |
| IIFE | Immediately invoked function expression. The iOS engine bundle is an IIFE exposing global `RaichuEngine`. |
| JavaScriptCore / JSCore | Apple's JavaScript runtime used by the Swift app to execute the bundled TypeScript engine. |
| Legal move | A move produced by the engine for the current board and player. |
| Matchmaking queue | Transient ranked-player rows scanned oldest-first by the API worker. |
| Move event | Append-only `moves` row containing coordinates, optional capture/promotion, and `board_after`. |
| No-progress counter | Half-moves since the last capture or promotion. |
| Online authority | Express service plus persisted PostgreSQL state, not the client store. |
| Pichu | Short-range diagonal-forward piece, encoded `w`/`b`. |
| Pikachu | Short-range forward/sideways piece, encoded `W`/`B`. |
| Player | `white` or `black`; White moves first and advances toward increasing rows. |
| Ply | One move by one player; equivalent to half-move here. |
| Position | Board plus side to move and, when draws matter, relevant history. Also used for a `{ row, col }` coordinate in code; context matters. |
| Promotion | Immediate conversion of Pichu/Pikachu to Raichu on the far rank. |
| Ranked game | Matchmade online game that changes ELO on decisive completion. |
| Raichu | Long-range eight-direction apex piece, encoded `@`/`$`. |
| Realtime | Supabase database-change WebSocket notifications. It is a transport, not game authority. |
| Replay | Client view of a prior board-history step; it does not change authoritative state. |
| RLS | PostgreSQL row-level security controlling direct Supabase client access. |
| Service role | Secret Supabase server credential that bypasses RLS. |
| Store | Zustand state container on web or observable state object on iOS. |
| Threefold repetition | Local draw when the same board plus side-to-move key occurs three times. |
| Turbo graph | TypeScript workspace build/test dependency graph. The native iOS project is excluded. |
| Web Worker | Browser background thread used for bot search. |

## Coordinate vocabulary

| Representation | Example | Notes |
|---|---|---|
| Engine coordinate | `{ row: 2, col: 3 }` | zero-based, top-left origin |
| Human square | `d6` | column letter + `8 - row` |
| Quiet notation | `d6-e5` | hyphen in coordinate formatter |
| Capture notation | `d6xf4` | `x` in coordinate formatter |

## Naming cautions

- “Raichu” can mean the game, repository, product, or promoted piece. Use a qualifier when ambiguity matters.
- “Engine” should mean game engine unless “AI engine” is explicit.
- “Online draw” is not a current persisted state.
- “Realtime” does not imply transactional or guaranteed single delivery.
- “Authenticated” does not automatically mean “authorized for this game.”
