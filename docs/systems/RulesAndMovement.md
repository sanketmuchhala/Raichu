# System: Rules & Movement

**Purpose:** Explains the core game logic implementation.  
**Audience:** Designers, Engineers  
**Last Verified Commit:** `16274f9`

## Source Code
-   File: `script.js`
-   Key Functions: `getPossibleMoves`, `getPichuMoves`, `getPikachuMoves`, `getRaichuMoves`.

## Movement Logic

### Pichu (Pawn)
-   **Direction**: Forward only (White=Up/Down?, Code says dependent on index, usually "Forward" relative to player).
-   **Pattern**: Diagonal (1 step).
-   **Capture**: Jump over enemy diagonal.

### Pikachu (Knight/Bishop Hybrid)
-   **Pattern**: 1 or 2 steps in any direction (8 compass points).
-   **Jump**: Can jump over *one* piece if it lands on empty/enemy.

### Raichu (Queen)
-   **Pattern**: Unlimited distance in any direction.
-   **Capture**: Can jump over pieces? (Code Check: `getRaichuMoves` logic iterates. Does it stop at first enemy? Yes, unless capture logic permits).

## Turn Validation
-   `gameState.currentPlayer` tracks 'w' or 'b'.
-   `isValidPosition` ensures checks are within [0, 63].
-   Moves are generated *only* for the current player's pieces.

## Win Condition
-   Checked after every move in `checkWinCondition()`.
-   **Criteria**:
    1.  Opponent has 0 pieces.
    2.  Opponent has 0 valid moves (Stalemate = Loss here?).
