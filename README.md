# Raichu

A chess-inspired abstract strategy game playable free in the browser. Two players, three piece types, zero luck, no draws.

**Live:** [raichu.live](https://raichu.live)

---

## What is Raichu?

Raichu is a two-player abstract strategy board game on an 8x8 grid. Each side commands three piece types: **Pichu** (pawn-like), **Pikachu** (rook-like), and **Raichu** (queen-like). The capture hierarchy is the core mechanic: Pichus can only take Pichus, Pikachus can take Pichus and Pikachus, Raichus can take anything. Promote pieces to the back rank to turn them into Raichus. Capture every enemy piece to win.

No king. No draws. Games in 5-15 minutes.

---

## Features

- Play vs AI at three difficulty levels (runs entirely in-browser, no server round-trip)
- Online multiplayer with Supabase Realtime sync
- ELO-based ranked matchmaking
- Click-to-move and drag-and-drop
- Move animations (chess.com-style piece slides)
- Full move history in human and coordinate notation
- Board themes
- Mobile responsive

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 18, TypeScript, Zustand, Framer Motion, Tailwind CSS |
| Backend | Express 4, TypeScript, Zod |
| Database | Supabase (PostgreSQL + Realtime + Auth) |
| Game engine | Pure TypeScript, zero dependencies |
| AI | Minimax + alpha-beta pruning + iterative deepening |
| Build | pnpm workspaces + Turborepo + esbuild |
| Deploy | Vercel (web), Railway/Fly.io (api) |

---

## Repository Layout

```
raichu.py/
├── apps/
│   ├── web/                  # Next.js 15 frontend
│   └── api/                  # Express REST API + matchmaking worker
├── packages/
│   ├── shared-types/         # TypeScript types shared across all packages
│   ├── game-engine/          # Board, moves, validation, promotion (no deps)
│   ├── ai-engine/            # Minimax search + position evaluation
│   ├── ui/                   # Shared React components
│   └── config/               # Shared ESLint / TS config
├── supabase/
│   └── migrations/           # SQL migrations (run in order)
└── docs/                     # Architecture and API documentation
```

---

## Quick Start

**Prerequisites:** Node 18+, pnpm 9+, a Supabase project

```bash
git clone https://github.com/sanketmuchhala/Raichu.git
cd Raichu
pnpm install

# Copy and fill in env files
cp apps/api/.env.example   apps/api/.env
cp apps/web/.env.example   apps/web/.env.local

# Run Supabase migrations (requires supabase CLI)
supabase db push

# Start everything
pnpm dev
```

| Service | URL |
|---------|-----|
| Web frontend | http://localhost:3000 |
| REST API | http://localhost:3001 |

---

## Environment Variables

**apps/api/.env**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PORT=3001
NODE_ENV=development
```

**apps/web/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=https://raichu.live
```

---

## Commands

```bash
pnpm dev              # start web + api in watch mode
pnpm build            # build all packages and apps
pnpm test             # run all test suites
pnpm lint             # lint all packages

# Scope to a single package
pnpm --filter @raichu/game-engine test
pnpm --filter @raichu/web         build
pnpm --filter @raichu/api         dev
```

---

## Game Rules

| Piece | White / Black | Movement | Captures |
|-------|--------------|----------|----------|
| Pichu | `w` / `b` | 1 square diagonally forward | Pichu only (jump 2 diag) |
| Pikachu | `W` / `B` | 1-2 squares forward, left, or right | Pichu and Pikachu (jump 2-3) |
| Raichu | `@` / `$` | Any distance in any of 8 directions | Any piece (jump, land anywhere beyond) |

- White moves first. White pieces move **down** the board (increasing row), Black moves **up**.
- Captures are optional. One capture per move. No chain captures.
- Pichu or Pikachu reaching the far back rank promotes to Raichu immediately.
- Win by capturing all opponent pieces. No stalemate, no draws.

Full rules: [docs/GAME_ENGINE.md](docs/GAME_ENGINE.md)

---

## Tests

```
packages/game-engine/__tests__/   68 tests  (board, pieces, moves, game logic)
apps/api/__tests__/               10 tests  (bot endpoint, ELO, matchmaking)
```

All passing. Run with `pnpm test`.

---

## Documentation

| File | Contents |
|------|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, component diagram, data flow |
| [docs/GAME_ENGINE.md](docs/GAME_ENGINE.md) | Board encoding, move generation, capture rules |
| [docs/AI_ENGINE.md](docs/AI_ENGINE.md) | Minimax, alpha-beta, evaluation function, difficulty |
| [docs/API.md](docs/API.md) | All REST endpoints with request/response schemas |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema, indexes, RLS policies, realtime setup |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Local setup, code style, PR guide |

---

## License

MIT

---

© 2026 Sanket Muchhala
