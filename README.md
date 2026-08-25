# Raichu

A chess-inspired abstract strategy game playable free in the browser. Two players, three piece types, zero luck.

**Live:** [raichu.live](https://raichu.live)

---

## What is Raichu?

Raichu is a two-player abstract strategy board game on an 8x8 grid. Each side commands three piece types: **Pichu** (pawn-like), **Pikachu** (rook-like), and **Raichu** (queen-like). The capture hierarchy is the core mechanic: Pichus can only take Pichus, Pikachus can take Pichus and Pikachus, Raichus can take anything. Promote pieces to the back rank to turn them into Raichus. Capture every enemy piece to win.

No king and no forced captures. Local play includes repetition and no-progress draw protection; persisted online play currently uses decisive or abandoned results.

---

## Features

- Play vs AI at three difficulty levels using an in-browser Web Worker
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
| Frontend | Next.js 16, React 19, TypeScript, Zustand, Framer Motion, Tailwind CSS |
| Backend | Express 4, TypeScript, Zod |
| Database | Supabase (PostgreSQL + Realtime + Auth) |
| Game engine | Pure TypeScript, zero dependencies |
| AI | Minimax + alpha-beta pruning + iterative deepening |
| Native | SwiftUI (iOS 17+) + JavaScriptCore engine bridge |
| Build | pnpm workspaces + Turborepo + esbuild |
| Delivery | Vercel-compatible web, configurable Node API host, GitHub Actions |

---

## Repository Layout

```
raichu.py/
├── apps/
│   ├── web/                  # Next.js 16 frontend
│   ├── api/                  # Express REST API + matchmaking worker
│   └── Ios-app/Raichu/       # Native SwiftUI project (outside Turbo)
├── packages/
│   ├── shared-types/         # TypeScript types shared across all packages
│   ├── game-engine/          # Board, moves, validation, promotion (no deps)
│   ├── ai-engine/            # Minimax search + position evaluation
│   ├── ui/                   # Shared React components
│   └── config/               # Shared ESLint / TS config
├── supabase/
│   └── migrations/           # SQL migrations (run in order)
├── scripts/                  # iOS engine bundle + documentation checks
└── docs/                     # Canonical documentation hub
```

---

## Quick Start

**Prerequisites:** Node 22, pnpm 9.15, and a Supabase project for online features

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
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=https://raichu.live
ANALYTICS_IP_SALT=replace-with-a-private-random-value
```

---

## Commands

```bash
pnpm dev              # start web + api in watch mode
pnpm build            # build all packages and apps
pnpm test             # run all test suites
pnpm build:ios        # build the JavaScriptCore engine bundle
pnpm docs:check       # validate Markdown structure and local links
pnpm lint             # reserved Turbo lint task; package lint scripts are not configured yet

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
- Win by capturing all opponent pieces or leaving the next player with no legal move.
- Web local/bot orchestration adds threefold repetition and a 100-half-move no-progress draw.

Full rules: [rules and notation](docs/game/rules-and-notation.md). Implementation details: [game engine](docs/GAME_ENGINE.md).

---

## Tests

Tests cover the game engine, API, web stores/utilities, and build contracts. Run the complete suite with `pnpm test`; CI also builds the monorepo and iOS JavaScriptCore bundle.

---

## Documentation

Start at the **[documentation hub](docs/README.md)**.

| Area | Contents |
|---|---|
| [Game](docs/game/rules-and-notation.md) | rules, notation, formal game theory, strategy, balance |
| [System design](docs/architecture/system-design.md) | components, trust, deployment, scaling, limitations |
| [Runtime flows](docs/architecture/runtime-flows.md) | local, AI, online, Realtime, auth, and matchmaking sequences |
| [Platforms](docs/README.md#platforms) | detailed web, API, and iOS architecture |
| [Engineering](docs/README.md#engineering) | data, testing, security, operations, contribution |
| [References](docs/README.md#detailed-reference-manuals) | engine, AI, REST, database, glossary |

---

## License

MIT

---

© 2026 Sanket Muchhala
