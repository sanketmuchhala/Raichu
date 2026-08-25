# Contributing

## Prerequisites

- Node.js 22 (matches CI)
- pnpm 9.15 (matches `packageManager`)
- A Supabase project (free tier works)
- Git

---

## Local Setup

```bash
# 1. Clone
git clone https://github.com/sanketmuchhala/Raichu.git
cd Raichu

# 2. Install all dependencies
pnpm install

# 3. Copy env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 4. Fill in Supabase credentials in both files
#    SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (api)
#    NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (web)

# 5. Run migrations
#    Option A: Supabase CLI
supabase link --project-ref <your-project-ref>
supabase db push
#    Option B: Paste each supabase/migrations/*.sql file into the Supabase SQL editor in order

# 6. Start everything
pnpm dev
```

Open http://localhost:3000

---

## Project Structure

```
raichu.py/
├── apps/
│   ├── web/src/
│   │   ├── app/              # Next.js pages (App Router)
│   │   ├── components/       # React components
│   │   ├── store/            # Zustand stores
│   │   └── lib/              # Utilities, Supabase client, themes
│   ├── api/src/
│   │   ├── routes/           # Express route handlers
│   │   ├── middleware/       # Auth, error handling
│   │   └── lib/              # Game service, ELO, matchmaking
│   └── Ios-app/Raichu/       # Native Xcode project (outside Turbo)
└── packages/
    ├── shared-types/src/     # All TypeScript types
    ├── game-engine/src/      # Board, moves, game logic
    └── ai-engine/src/        # Minimax search, evaluation
```

---

## Commands

```bash
# Development
pnpm dev                          # start web (3000) + api (3001) concurrently
pnpm --filter @raichu/web dev     # web only
pnpm --filter @raichu/api dev     # api only

# Building
pnpm build                        # build all packages
pnpm --filter @raichu/web build   # web only

# Testing
pnpm test                         # all test suites
pnpm --filter @raichu/game-engine test
pnpm --filter @raichu/api test

# Documentation
pnpm docs:check

# iOS JavaScriptCore bundle (separate from Turbo)
pnpm build:ios

# Type checking
pnpm --filter @raichu/web exec tsc --noEmit
pnpm --filter @raichu/api exec tsc --noEmit

# Linting
pnpm lint
```

---

## Making Changes

### Game Engine Changes

The game engine (`packages/game-engine`) is the most critical package. Any change to move generation, capture rules, or game status detection should:

1. Add a regression test in `packages/game-engine/__tests__/` before changing code
2. Run the full test suite: `pnpm --filter @raichu/game-engine test`
3. Verify the AI engine still passes: `pnpm --filter @raichu/api test`

The engine has 72 tests covering all piece types, edge cases, and game logic. All must pass.

### AI Engine Changes

The AI engine (`packages/ai-engine`) uses the game engine internally. Changes to the evaluation function or search algorithm should be benchmarked:

1. Check that `findBestMove` still returns a valid move for the initial board
2. Check that easy difficulty responds faster than hard
3. The API tests in `apps/api/__tests__/bot.test.ts` verify these invariants

### Frontend Changes

1. The game board component is `apps/web/src/components/board/Board.tsx`
2. Animation is in `usePieceMoveAnimation` (same directory)
3. Shared game/session state lives in Zustand; ephemeral visual state can remain local
4. No direct Supabase calls from components: all DB operations go through stores or the API

### Database Changes

Add a new numbered migration file in `supabase/migrations/`:

```sql
-- supabase/migrations/009_my_change.sql
ALTER TABLE profiles ADD COLUMN ...;
```

Never modify existing migration files. Always add a new one.

---

## Code Style

- TypeScript strict mode (`strict: true` in all tsconfigs)
- No `any` types without a comment explaining why
- Prefer `const` over `let`
- No comments explaining what code does. Comments should explain why when non-obvious
- No trailing whitespace or unused imports
- Preserve the surrounding formatter/style until a repository formatter is configured

---

## Package Notes

**shared-types** has no dependencies. Keep it that way. It should contain only type definitions, no runtime logic.

**game-engine** depends only on shared-types. Keep it that way. No DOM APIs, no Node-only APIs, no external libraries.

**ai-engine** depends on shared-types and game-engine only. Same rules apply.

This isolation allows the engine to run in browser, Web Worker, Node, and the
iOS JavaScriptCore bundle without separate rule implementations.

---

## Pull Request Process

1. Branch from `main`: `git checkout -b feature/my-feature`
2. Make changes with tests
3. Run `pnpm test`, `pnpm build`, `pnpm build:ios`, and `pnpm docs:check`
4. Open a PR against `main`
5. Describe what changed and why

---

## Questions

Open a GitHub issue or check the docs:

- [Documentation hub](README.md) — organized entry point
- [Architecture](architecture.md) — system design index
- [GAME_ENGINE.md](GAME_ENGINE.md) — Rules and move generation
- [AI_ENGINE.md](AI_ENGINE.md) — AI algorithm
- [API.md](API.md) — REST endpoints
- [DATABASE.md](DATABASE.md) — Schema and migrations
