# AGENTS.md — Raichu Monorepo

Read by OpenAI Codex and other AI coding agents at session start.
This file mirrors CLAUDE.md — keep them in sync when updating either.

---

## Repo overview

Raichu is a chess-inspired two-player strategy game. The monorepo contains:
- `apps/web` — Next.js 15 frontend
- `apps/api` — Express 4 REST API
- `apps/Ios-app/Raichu` — SwiftUI iOS 17+ app
- `packages/shared-types`, `game-engine`, `ai-engine`, `ui`, `config`

**Build system:** pnpm workspaces + Turborepo + esbuild (iOS bundle only)

---

## Commands

```bash
pnpm install                # install all deps
pnpm build                  # turbo build (shared-types → game-engine → ai-engine → api/web)
pnpm test                   # turbo test
pnpm build:ios              # build iOS JavaScriptCore bundle (NOT a turbo task)
pnpm build:ios:minify       # same, minified
```

---

## Critical constraint — iOS engine pipeline

**Do NOT touch these files without explicit human instruction:**

| File | Reason |
|---|---|
| `scripts/build-ios-engine.sh` | Sole builder for iOS JS bundle. Esbuild flags are exact — changing them breaks JSContext. |
| `scripts/ios-engine-entry.ts` | Esbuild entry point. Exported function names are called by string in Swift. |
| `apps/Ios-app/Raichu/Raichu/Engine/raichu-engine.js` | Generated artifact. Gitignored. Do NOT commit manually. |

**The 8 contract exports** (renaming any breaks iOS silently):
`createInitialBoard`, `encodeBoard`, `decodeBoard`, `generateMovesForPiece`,
`generateAllMoves`, `applyMove`, `getGameStatus`, `findBestMove`

**Do NOT:**
- Add a `package.json` inside `apps/Ios-app/`
- Add `apps/Ios-app` or `scripts/` to any turbo task
- Change `--global-name=RaichuEngine`, `--format=iife`, or `--main-fields=main` in the shell script

---

## Turbo task graph

Only these workspace packages are in the turbo graph:

```
shared-types
  └── game-engine
        └── ai-engine
              ├── api
              └── web
```

`apps/Ios-app` and `scripts/` are excluded via `.turboignore`.

---

## iOS app — key facts for coding agents

**Project location:** `apps/Ios-app/Raichu/Raichu/`
**Language:** Swift 5.9 + SwiftUI
**Min iOS:** 17.0
**No Combine** — use Swift async/await only.

### Stores (all `@EnvironmentObject`)
- `GameStore` — offline game, draw detection, bot trigger
- `OnlineGameStore` — multiplayer via REST + Supabase Realtime
- `AuthStore` — Supabase Auth (stubbed until supabase-swift is added)
- `MatchmakingStore` — 2s polling queue
- `UIStore` — theme, boardFlipped, replay, UserDefaults persistence

### Board encoding
- `[[String]]` 8×8, `board[row][col]`
- Piece chars: `w W @ b B $ .`
- White moves down (+row), Black moves up (-row)
- Encoded as 64-char string (row-major) via `RaichuEngine.encodeBoard()`

### Engine bridge
`RaichuEngine.swift` is a singleton JSCore bridge. It loads `raichu-engine.js`
from the app bundle and calls functions via `evaluateScript()`. If the bundle
is missing it falls back to a stub IIFE (for UI development only).

### Piece images
Chess.com Neo/150 set. Bundled in `Assets.xcassets` as `wp bp wr br wq bq`.
`PieceImage.swift` handles loading with CDN `AsyncImage` fallback.
Do NOT use unicode chess symbols as substitutes.

### Theme
`ThemeConfig.swift` — Classic / Slate / Walnut.
Injected via `SwiftUI.Environment`. Driven by `UIStore.currentTheme`.

---

## Phase completion status

| Phase | Status | Notes |
|---|---|---|
| 0.1 — Xcode scaffold | Done | All views, stores, engine bridge created |
| 0.2 — iOS engine bundle | Done | `pnpm build:ios` produces 17.5kb IIFE |
| 1 — Engine bridge verification | Ready to start | See Phase 1 in `07_CODEX_PROMPTS.md` |
| 2+ | Not started | |

---

## Web app key facts

- Next.js 15 App Router, React 18, TypeScript strict
- State: Zustand
- Piece images: CDN `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/`
- Engine: `@raichu/game-engine` package (same TS source as iOS bundle)
- No default exports in packages — named exports only

---

## Supabase

- URL: `https://jfqofulsmcjqudwnxekb.supabase.co`
- Tables: `profiles`, `games`, `moves`, `matchmaking_queue`
- iOS key in `SupabaseClient.swift` is a placeholder — do NOT commit real keys
- ELO: start 1200, K-factor 32/24/16, floor 100

---

## Tests

Must pass before any commit:

```bash
pnpm test
# or per-package:
pnpm --filter @raichu/game-engine test
pnpm --filter @raichu/api test
```

iOS unit tests: `RaichuTests/` (Swift Testing framework)
iOS UI tests: `RaichuUITests/` (XCUIAutomation)

---

## CI pipeline (`.github/workflows/ci.yml`)

Steps in order:
1. `pnpm install --frozen-lockfile`
2. `pnpm build` (turbo)
3. `pnpm test` (turbo)
4. `pnpm build:ios` (esbuild — NOT turbo)
5. Upload `raichu-engine.js` as artifact `raichu-engine-js`

Do NOT reorder or remove steps. The artifact upload uses `if-no-files-found: error` — if `pnpm build:ios` fails, CI fails.

---

## Code style rules

### TypeScript
- Strict mode, no `any`
- `async/await` over Promise chains
- Zod validation at all API boundaries
- Named exports only in packages

### Swift
- PascalCase types, camelCase properties
- `@State private var` for local SwiftUI state
- No force unwrap (`!`)
- No Combine — async/await only
- 4-space indentation
- Comments only for non-obvious logic
