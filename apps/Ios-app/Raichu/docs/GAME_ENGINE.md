# Game Engine

Package: `@raichu/game-engine`
Location: `packages/game-engine/`

Zero external dependencies. Runs identically in browser and Node.

---

## Board Representation

The board is an 8x8 grid represented as `CellValue[][]` (a 2D array of strings).

```typescript
type CellValue = PieceChar | '.';   // '.' = empty square
type Board     = CellValue[][];     // board[row][col], 0-indexed
```

**Coordinate system:**
- Row 0 is the top of the board (Black's back rank)
- Row 7 is the bottom (White's back rank)
- Col 0 is the left edge
- White pieces start at rows 1-2, move DOWN (+row direction)
- Black pieces start at rows 5-6, move UP (-row direction)

**Starting position:**
```
Row 0:  . . . . . . . .   (empty)
Row 1:  W . W . W . W .   (White Pikachus, even cols)
Row 2:  . w . w . w . w   (White Pichus, odd cols)
Row 3:  . . . . . . . .   (empty)
Row 4:  . . . . . . . .   (empty)
Row 5:  b . b . b . b .   (Black Pichus, even cols)
Row 6:  . B . B . B . B   (Black Pikachus, odd cols)
Row 7:  . . . . . . . .   (empty)
```

---

## Piece Encoding

| Piece | White | Black |
|-------|-------|-------|
| Pichu | `w` | `b` |
| Pikachu | `W` | `B` |
| Raichu | `@` | `$` |
| Empty | `.` | `.` |

---

## Board Encoding

Boards are serialized as 64-character strings for storage and transmission.

```typescript
encodeBoard(board: Board): string
// Row-major: board[0][0], board[0][1], ..., board[7][7]
// Example: "....W.W.W.W..w.w.w.w.....................b.b.b.b..B.B.B.B........"

decodeBoard(encoded: string): Board
// Splits into 8 rows of 8 characters each
```

---

## Capture Hierarchy

The core rule that differentiates Raichu from standard checkers.

```typescript
canCapture(attacker: PieceChar, target: PieceChar): boolean
```

| Attacker | Valid targets |
|----------|--------------|
| Pichu (w/b) | Pichu only (w or b, opposite color) |
| Pikachu (W/B) | Pichu and Pikachu (not Raichu) |
| Raichu (@/$) | Any enemy piece |

A piece can never capture a friendly piece. A piece can never capture a same-type match where colors match.

---

## Move Generation

### Pichu

```
Quiet move:
  Forward one square diagonally (white: row+1, black: row-1)
  Destination must be empty
  Two directions: diagonal-left and diagonal-right

Capture:
  Enemy Pichu must be at diagonal-forward distance 1
  Landing square at distance 2 must be empty
  Promotes if landing square is the back rank
```

```
Example (white Pichu at (3,3)):
  Quiet:   → (4,2)  or  (4,4)   if empty
  Capture: → (5,2) jumping over (4,2) enemy Pichu
           → (5,4) jumping over (4,4) enemy Pichu
```

### Pikachu

```
Quiet moves (no piece may be jumped):
  Forward:  1 or 2 squares (+row for white, -row for black)
  Left:     1 or 2 squares (-col)
  Right:    1 or 2 squares (+col)
  Distance-2 move requires distance-1 square to be empty

Captures (exactly one enemy Pichu or Pikachu in path):
  Case A - enemy at distance 1:
    [P] [x] [.]  →  land at distance 2  (enemy at dist 1)
  Case B - empty then enemy at distance 2:
    [P] [.] [x] [.]  →  land at distance 3  (empty at 1, enemy at 2)

  Only forward, left, right directions (not diagonal, not backward)
  Promotes if landing square is the back rank
```

### Raichu

```
Movement (queen-like, all 8 directions):
  Directions: N, S, E, W, NE, NW, SE, SW
  Quiet moves: any number of squares until first occupied square
               stops before the occupied square (cannot pass through pieces)

Captures:
  Scan ray in one direction
  First piece encountered:
    if it's an enemy: can capture, landing on any empty square beyond
    if it's a friendly: ray ends, no capture possible
  Second piece encountered beyond the captured piece: terminates landing options
  (Can only jump exactly one enemy per capture)
```

---

## Move Structure

```typescript
interface Move {
  from:       Position;              // { row, col } of the piece
  to:         Position;              // { row, col } of the destination
  piece:      PieceChar;             // piece being moved
  captured?:  {                      // present only for captures
    position: Position;              // where the captured piece was
    piece:    PieceChar;             // what was captured
  };
  promotion?: PieceChar;             // '@' or '$' if this move promotes
}
```

---

## Promotion

```typescript
checkPromotion(row: number, piece: PieceChar): PieceChar | undefined
```

- White Pichu or Pikachu reaching row 7 promotes to `@`
- Black Pichu or Pikachu reaching row 0 promotes to `$`
- Raichus do not promote
- Promotion is checked inside move generation and encoded in the `Move` object
- `applyMove` writes `move.promotion ?? move.piece` to the destination square

---

## Game Status

```typescript
type GameStatus = 'playing' | 'white_wins' | 'black_wins';

getGameStatus(board: Board, nextPlayer?: Player): GameStatus
```

Checks in order:
1. If Black has 0 pieces: `white_wins`
2. If White has 0 pieces: `black_wins`
3. If `nextPlayer` is provided and has 0 legal moves: the other player wins
4. Otherwise: `playing`

The `nextPlayer` parameter is critical for detecting the "no legal moves = loss" condition. It is always passed by `game-store` and the API after computing the next player.

---

## Move Validation

```typescript
isValidMove(board: Board, player: Player, move: Move): boolean
```

Generate-and-match validation: generate all legal moves for the player, then check if the submitted move is in that set (matching `from` and `to` positions). This is O(n) where n is the number of legal moves, and is used both in the API and the frontend selection logic.

---

## Key Functions Reference

| Function | File | Purpose |
|----------|------|---------|
| `createInitialBoard()` | board.ts | 8x8 starting position |
| `encodeBoard(board)` | board.ts | 2D array to 64-char string |
| `decodeBoard(str)` | board.ts | 64-char string to 2D array |
| `cloneBoard(board)` | board.ts | Deep copy (avoids mutation) |
| `generateAllMoves(board, player)` | moves/index.ts | All legal moves for a player |
| `generateMovesForPiece(board, r, c)` | moves/index.ts | Legal moves for one square |
| `applyMove(board, move)` | game.ts | Returns new board (never mutates) |
| `getGameStatus(board, next?)` | game.ts | 'playing' / 'white_wins' / 'black_wins' |
| `isValidMove(board, player, move)` | game.ts | Validate a submitted move |
| `countPieces(board)` | game.ts | `{ white, black }` piece counts |
| `canCapture(attacker, target)` | pieces.ts | Enforce capture hierarchy |
| `forwardDir(player)` | pieces.ts | +1 for white, -1 for black |
| `promotionRow(player)` | pieces.ts | 7 for white, 0 for black |

---

## Tests

```
packages/game-engine/__tests__/
  board.test.ts      19 tests  - encoding, cloning, initial position
  pichu.test.ts      14 tests  - movement, captures, promotion, edge/corners
  pikachu.test.ts    17 tests  - quiet moves, distance captures, no-wrap
  raichu.test.ts      9 tests  - ray movement, multi-square captures
  game.test.ts       13 tests  - status detection, no-legal-moves, applyMove
```

Run: `pnpm --filter @raichu/game-engine test`
