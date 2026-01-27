# Game Overview

**Purpose:** Explains game rules, core loop, and systems.  
**Audience:** Designers, QA, New Engineers  
**Last Verified Commit:** `16274f9`

## Core Loop
1.  **Menu**: Select Mode (Bot, 2P Local, Online).
2.  **Match**: Players take turns moving pieces on an 8x8 grid.
3.  **End**: Game ends when:
    *   One player loses all pieces.
    *   One player has no valid moves.
    *   **Result**: Modal shows "Winner" or "Bot Won".

## Rules: "Raichu" (Pokemon Chess)
A variant of Checkers/Chess.
-   **Board**: 8x8 Grid.
-   **Pieces**:
    -   **Pichu (Pawn)**: Moves diagonal forward 1 step. Captures by jumping diagonal forward.
    -   **Pikachu (Knight-like)**: Moves 1-2 steps in *any* direction (Orthogonal or Diagonal) or jumps.
    -   **Raichu (Queen-like)**: Moves infinite distance in *any* direction.
-   **Evolution (Promotion)**:
    -   Pichu reaches opposite end -> Becomes Raichu.
-   **Capture**: Jumps (Checkers style) or Displacement (Chess style)? *Code Reference*: `detectCapture` logic suggests Checkers-style jumping for Pichu, but potentially displacement for others?
    *   *Correction from Code*: The logic supports jumping over enemies.

## Key Systems
### 1. Board Representation
-   **Data**: Flat Array of 64 strings (strings chars represent pieces).
-   **Mapping**: `0` = Top Left, `63` = Bottom Right.
-   **State**: `gameState.board`.

### 2. Input System
-   **Type**: Mouse/Touch.
-   **Logic**:
    -   Click 1: Select Piece (Calculate `possibleMoves`).
    -   Click 2: Select Target (Validate & `makeMove`).

### 3. AI (Bot)
-   **Algorithm**: Minimax with Alpha-Beta Pruning.
-   **Execution**:
    -   **Client-Side**: Fallback or Main (see architecture).
    -   **Server-Side**: `/api/bot-move` (Python).

### 4. Multiplayer
-   **Type**: Async/Polling.
-   **State**: Stored in DB, synced every ~1.5s via `script.js` polling.

## Data Sources
-   **Runtime**: In-memory `gameState` object.
-   **Storage**: Supabase (Postgres) `rooms` table `jsonb` column.
