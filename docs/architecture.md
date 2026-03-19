# Architecture

## Monorepo Structure

The project uses pnpm workspaces with Turborepo for build orchestration.

### Package Dependency Graph

```
apps/web ──→ packages/shared-types
         ──→ packages/game-engine ──→ packages/shared-types

apps/api ──→ packages/shared-types
         ──→ packages/game-engine ──→ packages/shared-types
         ──→ packages/ai-engine ──→ packages/game-engine
                                ──→ packages/shared-types
```

### Data Flow

```
User Interaction
      │
      ▼
   Board.tsx (SVG rendering, click/drag handlers)
      │
      ▼
   game-store.ts (Zustand - selectPiece, makeMove)
      │
      ├──→ game-engine (generateMovesForPiece, applyMove)
      │       Pure TS, no side effects
      │
      └──→ API /bot/move (in bot mode)
              │
              ├──→ game-engine (decodeBoard, generateAllMoves)
              └──→ ai-engine (findBestMove)
                      │
                      ├──→ game-engine (generateAllMoves, applyMove)
                      └──→ evaluation (material + positional scoring)
```

## Key Design Decisions

### 1. Pure TypeScript Engine
The game engine has zero DOM dependencies and no side effects. All state is passed explicitly. This enables reuse in:
- Browser (frontend)
- Node.js (backend bot)
- React Native (future iOS)
- Web Workers (future background computation)

### 2. Move-Based Architecture
Moves are structured objects (`Move` type) rather than board-diff strings. This enables:
- Rich move history with piece types and captured info
- Animation (we know from/to positions)
- Human-readable formatting
- Efficient undo (future feature)

### 3. Generate-and-Match Validation
Move validation is done by generating all legal moves and checking if the requested move matches. This ensures the frontend can never execute an illegal move.

### 4. Zustand over Redux
Zustand was chosen for state management because:
- Simpler API for this project size
- No boilerplate (actions, reducers)
- First-class React hooks support
- Easy to split into game/UI stores

### 5. SVG Board Rendering
The board uses SVG rather than canvas or DOM grid because:
- Scales perfectly at any resolution
- Easy to animate with Framer Motion
- Precise hit detection for click/drag
- Works well on mobile with viewBox scaling

## Future Extension Points

### Multiplayer (WebSocket)
- `apps/api/src/routes/game.ts` — Game session CRUD stubs
- `apps/api/src/index.ts` — WebSocket server setup comments
- State would move to authoritative server; client becomes thin

### Persistence
- Add a database (Postgres + Prisma recommended)
- Store game sessions, move history, user accounts
- Add to `apps/api/src/routes/game.ts` handlers

### Puzzle Mode
- `apps/web/src/app/puzzles/page.tsx` — Route placeholder
- Define `Puzzle` type in shared-types
- Add puzzle API endpoint
- Validate solutions against engine legal moves
