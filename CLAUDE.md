# CLAUDE.md — Raichu Monorepo

This file is read automatically by Claude Code at the start of every session.
It is the single source of truth for how AI agents must behave in this repo.

---

## Repo structure

```
raichu.py/
├── apps/
│   ├── web/          Next.js 15 frontend (React, Zustand, Tailwind, Framer Motion)
│   ├── api/          Express 4 REST API + matchmaking worker
│   └── Ios-app/      Xcode project — SwiftUI iOS 17+, JavaScriptCore engine bridge
├── packages/
│   ├── shared-types/ TypeScript types shared across all packages
│   ├── game-engine/  Pure TS board logic, move generation, promotion (no deps)
│   ├── ai-engine/    Minimax + alpha-beta + iterative deepening
│   ├── ui/           Shared React components
│   └── config/       Shared ESLint / TS config
├── scripts/
│   ├── build-ios-engine.sh   !! HANDS OFF — see below
│   └── ios-engine-entry.ts   !! HANDS OFF — see below
├── supabase/migrations/
├── .turboignore
├── turbo.json
└── package.json
```

---

## Build system

| Command | What it does |
|---|---|
| `pnpm install` | Install all workspace deps |
| `pnpm build` | Turbo builds all packages in dep order: shared-types → game-engine → ai-engine → api / web |
| `pnpm test` | Turbo runs all test suites |
| `pnpm build:ios` | Build the iOS JavaScriptCore bundle (separate from turbo — see below) |
| `pnpm build:ios:minify` | Same with minification |

**Turbo dependency order:** `shared-types` → `game-engine` → `ai-engine` → `api`, `web`

---

## iOS engine bundle — HANDS OFF

The files below are OUTSIDE the turbo task graph and must stay that way.

| File | Rule |
|---|---|
| `scripts/build-ios-engine.sh` | Do NOT refactor into a turbo task. Do NOT change esbuild flags. |
| `scripts/ios-engine-entry.ts` | Do NOT import from web/api. Do NOT change exported function names. |
| `apps/Ios-app/Raichu/Raichu/Engine/raichu-engine.js` | Generated artifact. Gitignored. Built by `pnpm build:ios`. |

**Why:** `RaichuEngine.swift` calls the 8 exported functions by string name via `JSContext.evaluateScript()`. Renaming any export silently breaks the iOS app with no compile error.

The 8 contract functions (must always be present on `RaichuEngine` global):
- `createInitialBoard` `encodeBoard` `decodeBoard`
- `generateMovesForPiece` `generateAllMoves` `applyMove`
- `getGameStatus` `findBestMove`

---

## iOS app — Xcode project

**Path:** `apps/Ios-app/Raichu/`
**Bundle ID:** `com.raichugame.ios`
**Minimum deployment:** iOS 17.0
**Language:** Swift 5.9, SwiftUI lifecycle

### Architecture

5 `ObservableObject` stores injected as `@EnvironmentObject` from `RaichuApp.swift`:

| Store | Responsibility |
|---|---|
| `GameStore` | Offline game state (vs bot / local PvP), draw detection, replay |
| `OnlineGameStore` | Multiplayer state, REST + Supabase Realtime |
| `AuthStore` | Supabase Auth session, profile |
| `MatchmakingStore` | Queue polling, 2s interval |
| `UIStore` | Theme, boardFlipped, replay mode, persisted to UserDefaults |

### Piece encoding

| Char | Piece | Color |
|---|---|---|
| `w` | Pichu | White |
| `W` | Pikachu | White |
| `@` | Raichu | White |
| `b` | Pichu | Black |
| `B` | Pikachu | Black |
| `$` | Raichu | Black |
| `.` | Empty | — |

Board is `[[String]]` (8×8, `board[row][col]`). White moves down (+row). Black moves up (-row).

### Piece images

Chess.com Neo/150 set — bundled in `Assets.xcassets` (wp/bp/wr/br/wq/bq).
`PieceImage.swift` loads bundled asset first, falls back to CDN `AsyncImage`.
Same source as web app `PieceSVG.tsx`. Do NOT replace with unicode symbols.

### Themes

Three themes in `ThemeConfig.swift`: Classic / Slate / Walnut.
Distributed via SwiftUI `Environment`. `UIStore.currentTheme` drives the active theme.
Theme accent colors: Classic `#769656`, Slate `#3b82f6`, Walnut `#e07040`.

### Do NOT add to iOS

- Do NOT add a `package.json` inside `apps/Ios-app/`
- Do NOT run `turbo build` against the Xcode project
- Do NOT use Combine framework — use Swift async/await
- Do NOT force-unwrap optionals
- Do NOT import SwiftUI in files that only need Foundation

---

## Web app

- **Framework:** Next.js 15 App Router, React 18
- **State:** Zustand stores
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Piece images:** Chess.com Neo/150 CDN (`https://images.chesscomfiles.com/chess-themes/pieces/neo/150/`)
- **Game engine:** Loaded in-browser from `@raichu/game-engine` (same TS package as iOS bundle)

Do NOT run the Next.js dev server for tasks that only touch `packages/`.

---

## Supabase

- **Project:** `jfqofulsmcjqudwnxekb.supabase.co`
- **Key tables:** `profiles`, `games`, `moves`, `matchmaking_queue`
- **Auth:** Email/password + Google OAuth. JWT auto-managed by supabase-swift on iOS.
- **Realtime:** `games` UPDATE + `moves` INSERT channels for multiplayer sync
- **ELO:** Start 1200, K=32/24/16 (by games played), floor 100

The anon key in `SupabaseClient.swift` is a placeholder. Do NOT commit real keys.

---

## Code style

### TypeScript (web / api / packages)
- Strict TypeScript, no `any`
- Named exports, no default exports in packages
- `async/await` over Promise chains
- Zod for all API request validation in `apps/api/`

### Swift (iOS)
- PascalCase types, camelCase properties/methods
- `@State private var` for SwiftUI local state
- `let` constants wherever possible
- 4-space indentation
- `async/await` — no Combine
- No force unwrap (`!`) on optionals
- Add comments only where logic is non-obvious

---

## Testing

```bash
pnpm test                              # all suites via turbo
pnpm --filter @raichu/game-engine test # single package
```

- `packages/game-engine/__tests__/` — 68 tests (board, pieces, moves, game logic)
- `apps/api/__tests__/` — 10 tests (bot, ELO, matchmaking)
- iOS: `RaichuTests/` (Swift Testing framework), `RaichuUITests/` (XCUIAutomation)

All tests must pass before committing. Do NOT skip or comment out failing tests.

---

## CI

GitHub Actions at `.github/workflows/ci.yml`:
1. `pnpm install --frozen-lockfile`
2. `pnpm build` (turbo)
3. `pnpm test` (turbo)
4. `pnpm build:ios` (esbuild bundle)
5. Upload `raichu-engine.js` as artifact `raichu-engine-js`

The workflow must stay green. Do NOT modify turbo task order.

---

## Current build status (as of Phase 0.2)

| Component | Status |
|---|---|
| Monorepo build (`pnpm build`) | Passing |
| Tests (`pnpm test`) | Passing |
| iOS engine bundle (`pnpm build:ios`) | Passing — 17.5kb |
| Xcode build | Compiles clean |
| Supabase integration | Stubbed — needs supabase-swift package added |
| Online multiplayer | Stubbed — needs supabase-swift package added |

**Next phase:** Phase 1 — verify `EngineTypes.swift` and `RaichuEngine.swift` are complete and correct. See `apps/Ios-app/Raichu/Raichu/ios app/07_CODEX_PROMPTS.md` Phase 1.
