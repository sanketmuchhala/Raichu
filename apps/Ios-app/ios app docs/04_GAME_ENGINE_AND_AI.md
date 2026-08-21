# Game Engine & AI — Complete Reference

> Everything about game rules, move generation, board encoding, the AI algorithm, and the JavaScriptCore bridge.

---

## 1. Board Representation

The board is an 8×8 grid represented as `CellValue[][]` (2D array of strings).

```
type CellValue = PieceChar | '.'   // '.' = empty square
type Board     = CellValue[][]     // board[row][col], 0-indexed
```

### Coordinate System
- Row 0 = top of the board (Black's back rank)
- Row 7 = bottom (White's back rank)
- Col 0 = left edge
- White pieces start at rows 1–2, move **DOWN** (+row direction)
- Black pieces start at rows 5–6, move **UP** (−row direction)

### Starting Position
```
Row 0: . . . . . . . .  (empty)
Row 1: W . W . W . W .  (White Pikachus, even cols)
Row 2: . w . w . w . w  (White Pichus, odd cols)
Row 3: . . . . . . . .  (empty)
Row 4: . . . . . . . .  (empty)
Row 5: b . b . b . b .  (Black Pichus, even cols)
Row 6: . B . B . B . B  (Black Pikachus, odd cols)
Row 7: . . . . . . . .  (empty)
```

### Piece Encoding

| Piece | White | Black |
|-------|-------|-------|
| Pichu | `w` | `b` |
| Pikachu | `W` | `B` |
| Raichu | `@` | `$` |
| Empty | `.` | `.` |

### Board Encoding (64-char string)

```typescript
encodeBoard(board: Board): string
// Row-major: board[0][0], board[0][1], ..., board[7][7]
// Initial: "........W.W.W.W..w.w.w.w................b.b.b.b..B.B.B.B........"

decodeBoard(encoded: string): Board
// Splits into 8 rows of 8 characters each
```

---

## 2. Capture Hierarchy (CRITICAL)

This is the **core mechanic** that differentiates Raichu from chess/checkers.

| Attacker | Can Capture |
|----------|-------------|
| Pichu (`w`/`b`) | Pichu only (opposite color) |
| Pikachu (`W`/`B`) | Pichu + Pikachu (not Raichu) |
| Raichu (`@`/`$`) | Any enemy piece |

**A piece can NEVER capture a friendly piece.**

---

## 3. Move Generation Rules

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

**White Pichu vectors (zero-based):**
- Quiet: `(+1, -1)`, `(+1, +1)`
- Jump:  `(+2, -2)`, `(+2, +2)` (over enemy Pichu at `(+1, -1)`, `(+1, +1)`)

**Black Pichu vectors:**
- Quiet: `(-1, -1)`, `(-1, +1)`
- Jump:  `(-2, -2)`, `(-2, +2)`

### Pikachu
```
Quiet moves (3 directions: forward, left, right):
  Distance 1 or 2
  All traversed squares must be empty
  No diagonal, no backward

Captures (same 3 directions):
  Case A — enemy at distance 1: jump to distance 2
  Case B — empty at distance 1, enemy at distance 2: jump to distance 3
  Only captures Pichu or Pikachu (NOT Raichu)
  Promotes if landing on back rank
```

### Raichu
```
Queen-like movement (all 8 directions):
  Quiet: any number of squares until first occupied square
  
Captures (jump-style, NOT chess-style):
  Scan ray in one direction
  First piece encountered:
    If enemy → can capture; land on ANY empty square beyond it on same ray
    If friendly → ray ends, no capture
  Second piece encountered beyond captured piece → terminates landing options
  Captures ANY enemy piece type
```

---

## 4. Move Structure

```typescript
interface Move {
  from:       { row: number; col: number };
  to:         { row: number; col: number };
  piece:      PieceChar;
  captured?:  {
    position: { row: number; col: number };
    piece:    PieceChar;
  };
  promotion?: PieceChar;  // '@' or '$'
}
```

### Swift Equivalent
```swift
struct Position: Codable, Hashable {
    let row: Int
    let col: Int
}

struct CapturedInfo: Codable {
    let position: Position
    let piece: String
}

struct Move: Codable, Identifiable {
    var id: String { "\(from.row)\(from.col)\(to.row)\(to.col)" }
    let from: Position
    let to: Position
    let piece: String
    let captured: CapturedInfo?
    let promotion: String?
}
```

---

## 5. Promotion

- White Pichu or Pikachu reaching **row 7** → promotes to `@`
- Black Pichu or Pikachu reaching **row 0** → promotes to `$`
- Raichus do not promote
- Promotion is automatic and immediate
- `applyMove` writes `move.promotion ?? move.piece` to destination

---

## 6. Game Status

```typescript
type GameStatus = 'playing' | 'white_wins' | 'black_wins' | 'draw';

getGameStatus(board: Board, nextPlayer?: Player): GameStatus
```

Check order:
1. If Black has 0 pieces → `white_wins`
2. If White has 0 pieces → `black_wins`
3. If `nextPlayer` has 0 legal moves → the other player wins
4. Otherwise → `playing`

**Draw detection (web-only, implement in iOS too):**
- Threefold repetition: position key = `boardEncoded:nextPlayer` appears 3+ times
- 50-move rule: 100 half-moves without capture or promotion

---

## 7. Key Engine Functions

| Function | Purpose |
|----------|---------|
| `createInitialBoard()` | 8×8 starting position |
| `encodeBoard(board)` | 2D array → 64-char string |
| `decodeBoard(str)` | 64-char string → 2D array |
| `cloneBoard(board)` | Deep copy |
| `generateAllMoves(board, player)` | All legal moves for a player |
| `generateMovesForPiece(board, r, c)` | Legal moves for one piece |
| `applyMove(board, move)` | Returns new board (never mutates) |
| `getGameStatus(board, nextPlayer?)` | Check win/loss/playing |
| `isValidMove(board, player, move)` | Validate a submitted move |
| `countPieces(board)` | `{ white, black }` counts |
| `canCapture(attacker, target)` | Enforce hierarchy |
| `findBestMove(board, player, difficulty)` | AI best move |

---

## 8. AI Engine

### Algorithm
**Minimax + alpha-beta pruning + iterative deepening**

```
depth=1 search completes → store best_move
depth=2 search completes → store best_move
depth=3 search starts    → time budget exceeded
return best_move from depth=2
```

### Move Ordering (for better pruning)
1. Captures (MVV-LVA: high-value victim, low-value attacker)
2. Promotion moves
3. Quiet moves

### Evaluation Function

**Material values:**
```
Pichu:   100
Pikachu: 300
Raichu:  900
```

**Advancement bonus:** Quadratic — pieces closer to promotion worth more:
```
advancement = row / 7  (for white)
bonus = pieceValue * 0.3 * advancement²
```

**Center bonus:** `pieceValue * 0.05 * (4 - manhattanDistFromCenter) / 4`

**Terminal:** WIN_SCORE = 100,000 (prefer faster wins: −depth), LOSE_SCORE = −100,000

### Difficulty Settings

| Level | Max Depth | Time Budget | Typical Depth Reached |
|-------|-----------|-------------|----------------------|
| Easy | 6 | 400ms | 3–4 |
| Medium | 8 | 800ms | 5–6 |
| Hard | 12 | 1500ms | 7–9 |

### Forced Move / Early Termination
- If only 1 legal move → return immediately, no search
- If evaluation ≥ WIN_SCORE − 100 → stop, forced win found

---

## 9. JavaScriptCore Bridge

### Build Step
```bash
esbuild packages/game-engine/src/index.ts packages/ai-engine/src/index.ts \
  --bundle --format=iife --global-name=RaichuEngine \
  --outfile=apps/ios/Sources/Engine/raichu-engine.js
```

### RaichuEngine.swift

```swift
import JavaScriptCore

final class RaichuEngine {
    static let shared = RaichuEngine()
    private let context: JSContext

    private init() {
        context = JSContext()!
        context.exceptionHandler = { _, e in
            print("[JSEngine] \(e?.toString() ?? "unknown error")")
        }
        let bundle = Bundle.main.path(forResource: "raichu-engine", ofType: "js")!
        let source = try! String(contentsOfFile: bundle)
        context.evaluateScript(source)
    }

    func createInitialBoard() -> [[String]] {
        let result = context.evaluateScript("RaichuEngine.createInitialBoard()")
        return parseBoard(result)
    }

    func generateMovesForPiece(board: [[String]], row: Int, col: Int) -> [Move] {
        let boardJSON = encodeBoard(board)
        let result = context.evaluateScript(
            "JSON.stringify(RaichuEngine.generateMovesForPiece(\(boardJSON), \(row), \(col)))"
        )
        return parseMoves(result?.toString() ?? "[]")
    }

    func generateAllMoves(board: [[String]], player: String) -> [Move] {
        let boardJSON = encodeBoard(board)
        let result = context.evaluateScript(
            "JSON.stringify(RaichuEngine.generateAllMoves(\(boardJSON), '\(player)'))"
        )
        return parseMoves(result?.toString() ?? "[]")
    }

    func applyMove(board: [[String]], move: Move) -> [[String]] {
        let boardJSON = encodeBoard(board)
        let moveJSON = encodeMoveJSON(move)
        let result = context.evaluateScript(
            "RaichuEngine.applyMove(\(boardJSON), \(moveJSON))"
        )
        return parseBoard(result)
    }

    func getGameStatus(board: [[String]], nextPlayer: String) -> String {
        let boardJSON = encodeBoard(board)
        let result = context.evaluateScript(
            "RaichuEngine.getGameStatus(\(boardJSON), '\(nextPlayer)')"
        )
        return result?.toString() ?? "playing"
    }

    func findBestMove(board: [[String]], player: String, difficulty: String) -> Move? {
        let boardJSON = encodeBoard(board)
        let result = context.evaluateScript(
            "JSON.stringify(RaichuEngine.findBestMove(\(boardJSON), '\(player)', '\(difficulty)').move)"
        )
        guard let json = result?.toString(), json != "null" else { return nil }
        return parseSingleMove(json)
    }
}
```

### Important Notes
- AI runs on main thread (same as web). The caller should yield before search:
  ```swift
  try await Task.sleep(nanoseconds: 50_000_000) // 50ms yield for UI
  let result = RaichuEngine.shared.findBestMove(board, player, difficulty)
  ```
- Hard difficulty blocks for up to 1.5s. Consider running in a Task for responsiveness.
- For App Store: bundle piece images locally, don't use CDN.

---

## 10. Move Notation

```swift
func formatMoveShort(_ move: GameMove) -> String {
    let cols = "abcdefgh"
    let from = "\(cols[move.fromCol])\(8 - move.fromRow)"
    let to   = "\(cols[move.toCol])\(8 - move.toRow)"
    let sep  = move.capturedPiece != nil ? "x" : "-"
    return "\(from)\(sep)\(to)"
}
```

---

## 11. Existing Python Bot (Legacy Reference)

The original Python bot (`api/bot-move.py`) implements the same algorithm in Python, used as a Vercel serverless function. The TypeScript engine supersedes it for the web and iOS app.
