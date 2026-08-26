# Raichu iOS App — Project Overview

> **Purpose of this directory:** Everything a developer (or AI agent like Codex) needs to build the Raichu iOS app from scratch. This is the single source of truth.

---

## What is Raichu?

Raichu is a **two-player abstract strategy board game** on an 8×8 grid, inspired by chess and checkers. Each side commands three piece types:

| Piece | White Char | Black Char | Movement | Captures |
|-------|-----------|-----------|----------|----------|
| **Pichu** | `w` | `b` | 1 square diagonally forward | Pichu only (jump 2 diag) |
| **Pikachu** | `W` | `B` | 1–2 squares forward/left/right | Pichu + Pikachu (jump 2–3) |
| **Raichu** | `@` | `$` | Queen-like (any distance, 8 directions) | Any piece (jump, land beyond) |

**Key Rules:**
- White moves first, moving **down** the board (row+). Black moves **up** (row−).
- Captures are optional. One capture per move. No chain captures.
- Pichu or Pikachu reaching the back rank promotes to Raichu immediately.
- **Win condition:** Capture all opponent pieces. No stalemate, no king, no draws in base rules (web version adds threefold repetition + 50-move rule).
- Games last 5–15 minutes.

**Live site:** [raichu.live](https://raichu.live)

---

## Existing Web Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 18, TypeScript, Zustand, Framer Motion, Tailwind CSS |
| Backend | Express 4, TypeScript, Zod validation |
| Database | Supabase (PostgreSQL + Realtime + Auth) |
| Game engine | Pure TypeScript, zero dependencies |
| AI | Minimax + alpha-beta pruning + iterative deepening |
| Build | pnpm workspaces + Turborepo + esbuild |
| Deploy | Vercel (web), Railway/Fly.io (API) |

---

## iOS App Vision

**Native SwiftUI app** using **JavaScriptCore** to bridge the existing TypeScript game engine. The game logic runs entirely on-device for offline play, while Supabase handles multiplayer, auth, and persistence.

### Core Features for v1
1. Play vs AI (3 difficulty levels) — fully offline
2. Local PvP (pass-and-play on same device)
3. Online multiplayer with Supabase Realtime
4. ELO-based ranked matchmaking
5. Game history with replay
6. Leaderboard
7. Board themes (Classic, Slate, Walnut)
8. Haptic feedback + smooth animations
9. Push notifications for your-turn / match-found

---

## Repository Structure (what already exists)

```
raichu.py/
├── apps/
│   ├── web/                    # Next.js 15 frontend (LIVE)
│   │   ├── src/
│   │   │   ├── app/            # Next.js pages (App Router)
│   │   │   ├── components/     # React components (board, game, lobby, auth, etc.)
│   │   │   ├── store/          # Zustand stores (game, online-game, auth, matchmaking, ui)
│   │   │   └── lib/            # Supabase client, API wrapper, themes, analytics
│   │   └── .env.local          # Web env vars
│   ├── api/                    # Express REST API
│   │   ├── src/
│   │   │   ├── routes/         # game.ts, bot.ts, matchmaking.ts, health.ts, version.ts
│   │   │   ├── middleware/     # auth.ts, error-handler.ts
│   │   │   └── lib/            # game-service, matchmaking-worker, elo
│   │   └── .env                # API env vars
│   ├── ios/                    # Existing iOS scaffolding (Swift Package RaichuKit)
│   └── Ios-app/                # Existing Xcode project shell
├── packages/
│   ├── shared-types/src/       # TypeScript types (Board, Move, Player, etc.)
│   ├── game-engine/src/        # Board, moves, validation, promotion
│   ├── ai-engine/src/          # Minimax + evaluation
│   ├── ui/                     # Shared React components
│   └── config/                 # ESLint/TS config
├── supabase/migrations/        # 5 SQL migration files
├── api/bot-move.py             # Original Python bot (Vercel serverless)
├── logo/raichu logo.png        # App logo
├── docs/                       # Full documentation suite
└── Game Theory/                # Academic context + Claude prompts
```

---

## Document Index

| File | Contents |
|------|----------|
| `00_PROJECT_OVERVIEW.md` | This file — project overview |
| `01_ENVIRONMENT_AND_CONFIG.md` | All environment variables, API keys, Supabase setup |
| `02_SUPABASE_COMPLETE.md` | Database schema, migrations, RLS, Realtime, auth |
| `03_API_REFERENCE.md` | Every REST endpoint with request/response schemas |
| `04_GAME_ENGINE_AND_AI.md` | Game rules, move generation, AI algorithm, engine bridge |
| `05_UI_AND_DESIGN_SYSTEM.md` | Screens, components, themes, colors, animations, haptics |
| `06_STATE_ARCHITECTURE.md` | All stores, data flow, Realtime subscription patterns |
| `07_CODEX_PROMPTS.md` | Ready-to-use prompts for Codex to build each component |
| `assets/raichu logo.png` | App logo |
