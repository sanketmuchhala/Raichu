# Testing Strategy

**Purpose:** How to ensure quality.  
**Audience:** QA, Engineers  
**Last Verified Commit:** `16274f9`

## Current State
**Manual Testing Only.** There is no automated test suite (Jest/PyTest) in the repository currently.

## Manual Test Cases

### 1. Bot Match
1.  Open Game.
2.  Select "vs Bot".
3.  Make a move as White.
4.  **Expect**: Bot responds within 2 seconds.

### 2. Multiplayer Flow
1.  **Browser A**: Open -> Online -> Create Room. Copy Code.
2.  **Browser B**: Open -> Online -> Browse/Join (or Paste Code).
3.  **Verification**: 
    *   Both screens show Board.
    *   Browser B (Black) status says "Opponent's Turn" (or "Your Turn" if Black goes first? Rules say White first).
4.  **Play**:
    *   Browser A moves.
    *   **Expect**: Browser B updates within ~2s.

### 3. Edge Cases
-   **Invalid Room**: Try joining `GAME-INVALID`. Expect Error Alert.
-   **Disconnect**: Close Browser A. Browser B continues (Polling fails silently or shows error).

## Future Improvements
-   Add **Jest** for `script.js` unit tests (Move validation, win condition).
-   Add **PyTest** for `api/*.py` (Mocking Supabase calls).
