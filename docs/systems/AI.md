# System: AI (Bot)

**Purpose:** Explains how the single-player bot works.  
**Audience:** Engineers  
**Last Verified Commit:** `16274f9`

## Logic Location
-   **Primary**: `script.js` (Client-Side Fallback logic inside `requestBotMove`).
-   **Server**: `/api/bot-move` (Python endpoint attempting Minimax).
*Note: The system acts as a hybrid. It tries to call the API, but often relies on client-side logic if implemented or fallback.* 

## Algorithm: Minimax with Alpha-Beta Pruning
1.  **Depth**: Determined by Difficulty (Easy=1, Medium=3, Hard=5+).
2.  **Evaluation Function**:
    *   Material Count (Raichu > Pikachu > Pichu).
    *   Position (Center control).
    *   Mobility (Number of valid moves).
3.  **Pruning**: Skips branches that are mathematically worse than already found options.

## Flow
1.  Player moves.
2.  `makeMove` detects turn change -> Checks `gameMode === 'bot'`.
3.  Calls `requestBotMove()`.
4.  UI shows "Bot is thinking...".
5.  Calculates best move -> Returns `from` and `to` indices.
6.  Executes move on board.
