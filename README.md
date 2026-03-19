# Raichu

A production-quality browser implementation of the Raichu strategy board game — a checkers variant with three piece types (Pichu, Pikachu, Raichu) on an 8x8 board.

## Features

- **Local PvP** — Play against a friend on the same device
- **Bot Play** — Challenge the AI at Easy, Medium, or Hard difficulty
- **3 Themes** — Classic, Slate, and Walnut board themes
- **Click & Drag** — Both click-to-move and drag-and-drop interaction
- **Move History** — Human-readable and coordinate notation
- **Responsive** — Works on desktop and mobile browsers
- **Shared Engine** — Pure TypeScript game logic reusable across platforms

## Architecture

```
raichu/
├── apps/
│   ├── web/           # Next.js 14 frontend
│   ├── api/           # Express REST API
│   └── ios/           # Future iOS placeholder
├── packages/
│   ├── shared-types/  # TypeScript type definitions
│   ├── game-engine/   # Pure TS game logic (board, moves, validation)
│   ├── ai-engine/     # Minimax with alpha-beta pruning
│   ├── ui/            # Shared UI components
│   └── config/        # Shared configuration
└── docs/              # Architecture documentation
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9+

### Setup

```bash
pnpm install
```

### Development

Start both the API server and web frontend:

```bash
# Terminal 1: API server (port 3001)
cd apps/api && pnpm dev

# Terminal 2: Web frontend (port 3000)
cd apps/web && pnpm dev
```

Then open http://localhost:3000

### Run Tests

```bash
# All tests
pnpm test

# Game engine tests only
cd packages/game-engine && pnpm test

# API tests only
cd apps/api && pnpm test
```

## Game Rules

- **Board**: 8x8 grid, white moves first (downward), black moves upward
- **Pichu** (w/b): Moves 1 diagonal forward, captures by jumping over enemy Pichu only
- **Pikachu** (W/B): Moves 1-2 forward/left/right, captures by jumping 2-3 over enemy Pichu/Pikachu
- **Raichu** (@/$): Queen-like movement in 8 directions, captures by jumping over any enemy piece
- **Promotion**: Pichu/Pikachu reaching the far edge becomes a Raichu
- **Win**: Capture all opponent pieces

### Capture Hierarchy

| Attacker | Can Capture |
|----------|-------------|
| Pichu | Enemy Pichu only |
| Pikachu | Enemy Pichu or Pikachu |
| Raichu | Any enemy piece |

## API

### Bot Move

```bash
curl -X POST http://localhost:3001/api/v1/bot/move \
  -H "Content-Type: application/json" \
  -d '{
    "board": "........W.W.W.W..w.w.w.w................b.b.b.b..B.B.B.B........",
    "player": "w",
    "difficulty": "medium"
  }'
```

See [docs/api-contracts.md](docs/api-contracts.md) for full API documentation.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand, Framer Motion
- **Backend**: Express, TypeScript, Zod validation
- **Engine**: Pure TypeScript, zero dependencies
- **AI**: Minimax with alpha-beta pruning, iterative deepening
- **Testing**: Vitest
- **Build**: pnpm workspaces, Turborepo
