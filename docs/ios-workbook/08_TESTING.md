# Testing Guide — Raichu iOS App

> Complete test plan, test cases, fixtures, and instructions for every testable unit in the iOS app.

---

## 1. Overview

| Suite | Framework | File | Tests |
|-------|-----------|------|-------|
| Unit — Engine bridge | Swift Testing | `RaichuTests/RaichuTests.swift` | 20 |
| Unit — GameStore logic | Swift Testing | `RaichuTests/RaichuTests.swift` | 14 |
| Unit — Draw detection | Swift Testing | `RaichuTests/RaichuTests.swift` | 4 |
| Unit — EngineTypes helpers | Swift Testing | `RaichuTests/RaichuTests.swift` | 4 |
| UI — Happy paths | XCUITest | `RaichuUITests/RaichuUITests.swift` | 8 |

**Total: ~50 tests**

---

## 2. Prerequisites

### 2.1 JS Engine Bundle Required

Unit tests that exercise real move generation, AI, and game status require the bundled JS engine. Tests will still compile and run without it (the stub engine returns safe defaults), but move-generation assertions will not pass.

Build the bundle before running tests:
```bash
cd /path/to/raichu.py
pnpm build:ios
```

This produces `apps/Ios-app/Raichu/Raichu/Engine/raichu-engine.js`. Xcode must copy it as a bundle resource (set Copy Phase target = Raichu and RaichuTests).

### 2.2 Running Tests

```bash
# All tests via Xcode (recommended)
Cmd+U

# Unit tests only (no simulator needed for logic tests)
xcodebuild test \
  -scheme Raichu \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -only-testing:RaichuTests

# UI tests only
xcodebuild test \
  -scheme Raichu \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -only-testing:RaichuUITests
```

---

## 3. Test Fixtures

These board strings are used across multiple test cases. All are 64-character row-major encodings.

```swift
// MARK: - Board Fixtures

/// Standard starting position (8 white, 8 black pieces)
let INITIAL_BOARD = "........W.W.W.W..w.w.w.w................b.b.b.b..B.B.B.B........"

/// White has only one Raichu at (0,0). Black has only one Pichu at (7,7).
/// getGameStatus(nextPlayer: "white") → "playing"
/// getGameStatus(nextPlayer: "black") → "playing"
let ONE_EACH_BOARD = "@...............................................................b"

/// White has a Raichu at (3,3). Black has zero pieces.
/// getGameStatus(nextPlayer: "black") → "white_wins"
let WHITE_WINS_BOARD = "................................@..............................."

/// Black has a Raichu at (4,4). White has zero pieces.
/// getGameStatus(nextPlayer: "white") → "black_wins"
let BLACK_WINS_BOARD = ".....................................$..........................."

/// White Pichu at (6,0) — one move from promotion (row 7).
/// generateMovesForPiece(row:6, col:0) should include a move to (7,1) with promotion="@"
let PRE_PROMOTION_BOARD = "..............................................................w....."

/// White Pichu at (2,0), Black Pichu at (3,1) — white can capture black.
/// Capture move: from (2,0) to (4,2), captured at (3,1)
let PICHU_CAPTURE_BOARD = "................w...............b....................................."

/// Board where white Pikachu at (1,0) can make a 2-square forward move.
let PIKACHU_QUIET_BOARD = "........W......................................................."
```

---

## 4. Engine Bridge Tests (`EngineBridgeTests`)

### 4.1 Board Structure

| Test | Description | Requires real JS bundle |
|------|-------------|------------------------|
| `initialBoardIs8x8` | `createInitialBoard()` returns `[[String]]` with 8 rows × 8 cols | No |
| `initialBoardHasCorrectPieces` | Row 1 has white Pikachus at even cols; row 2 has white Pichus at odd cols; rows 5/6 have black | No |
| `initialBoardEncoding` | `encodeBoard(initialBoard)` == `INITIAL_BOARD` | Yes |
| `decodeBoardRoundtrip` | `decodeBoard(encodeBoard(board))` == `board` for any board | Yes |
| `encodeBoardLength` | Encoded board is always exactly 64 characters | Yes |

### 4.2 Move Generation

| Test | Description | Requires real JS bundle |
|------|-------------|------------------------|
| `whitePichuMovesAtStart` | Pichu at (2,1) generates exactly 2 quiet moves on initial board | Yes |
| `blackPichuMovesAtStart` | Pichu at (5,0) generates exactly 1 quiet move (edge of board, only (4,1)) | Yes |
| `pichuCaptureMove` | Pichu at (2,0) with enemy at (3,1) generates capture to (4,2) | Yes |
| `pikachuForwardMoves` | Pikachu at (1,0) on clear board generates forward-1 and forward-2 moves | Yes |
| `pikachuCannotCapRaichu` | Pikachu adjacent to enemy Raichu has zero capture moves involving Raichu | Yes |
| `raichuQueenlikeMoves` | Raichu at (3,3) on empty board generates 8-directional rays | Yes |
| `noMovesForEmptySquare` | `generateMovesForPiece(row:0, col:0)` on empty square returns `[]` | Yes |

### 4.3 Apply Move

| Test | Description | Requires real JS bundle |
|------|-------------|------------------------|
| `applyMoveUpdatesPiece` | After quiet move, piece is at new position and old position is empty | Yes |
| `applyCaptureClearsCapturedSquare` | After capture move, captured position is `.` | Yes |
| `applyMoveDoesNotMutate` | Original board array is unchanged after `applyMove` | Yes |
| `promotionApplied` | After move to back rank with Pichu, destination has `@` or `$` | Yes |

### 4.4 Game Status

| Test | Description | Requires real JS bundle |
|------|-------------|------------------------|
| `initialBoardIsPlaying` | `getGameStatus(initialBoard, "white")` == `"playing"` | Yes |
| `whiteWinsWhenBlackHasNoPieces` | `getGameStatus(WHITE_WINS_BOARD, "black")` == `"white_wins"` | Yes |
| `blackWinsWhenWhiteHasNoPieces` | `getGameStatus(BLACK_WINS_BOARD, "white")` == `"black_wins"` | Yes |

### 4.5 AI

| Test | Description | Requires real JS bundle |
|------|-------------|------------------------|
| `findBestMoveReturnsValidMove` | `findBestMove` on initial board returns a non-nil Move | Yes |
| `findBestMoveIsLegal` | Returned move's `from` position matches a piece of the current player | Yes |
| `findBestMoveEasyFasterThanHard` | Easy search finishes faster than hard (rough timing, ≥ 50ms difference) | Yes |

---

## 5. GameStore Tests (`GameStoreTests`)

All GameStore tests run on `@MainActor`.

### 5.1 Initialization

| Test | Description |
|------|-------------|
| `newGameStartsWithInitialBoard` | After `init()`, `board` is 8×8 and has the correct starting pieces |
| `newGameStartsWithWhiteToMove` | `currentPlayer == "white"` |
| `newGameStatusIsPlaying` | `status == "playing"` |
| `newGameHistoryIsEmpty` | `moveHistory.isEmpty && boardHistory.isEmpty` |

### 5.2 Piece Selection

| Test | Description |
|------|-------------|
| `selectOwnPieceSetsMoves` | Selecting a white piece on white's turn sets `selectedPiece` and non-empty `legalMoves` (with real JS bundle) |
| `selectOpponentPieceClearsSelection` | Selecting a black piece on white's turn clears selection |
| `selectEmptySquareClearsSelection` | Selecting row 0, col 0 (empty at start) clears selection |
| `selectLegalDestinationMakesMove` | After selecting piece then tapping a legal move target, `moveHistory.count == 1` |

### 5.3 Move Execution

| Test | Description |
|------|-------------|
| `makeMoveChangesCurrentPlayer` | After white makes a move, `currentPlayer == "black"` |
| `makeMoveAppendsMoveHistory` | `moveHistory.count` increments by 1 |
| `makeMoveSavesLastMove` | `lastMove` matches the move just made |
| `makeMoveAppendsBoardHistory` | `boardHistory.count` increments |
| `capturedPiecesTrackedCorrectly` | After a capture move, `capturedByWhite` / `capturedByBlack` includes the captured piece |

### 5.4 Draw Detection

| Test | Description |
|------|-------------|
| `halfMoveClockResetsOnCapture` | Making a capture move resets `halfMovesSinceProgress` to 0 |
| `halfMoveClockResetsOnPromotion` | Making a promotion move resets `halfMovesSinceProgress` to 0 |
| `halfMoveClockIncrements` | Making a quiet move increments `halfMovesSinceProgress` by 1 |
| `fiftyMoveRuleDrawAt100HalfMoves` | Forcing `halfMovesSinceProgress` to 99 then making a quiet move sets `status == "draw"` and `drawReason` is non-nil |
| `threefoldRepetitionDraw` | Reaching the same position 3 times sets `status == "draw"` |

### 5.5 Game Control

| Test | Description |
|------|-------------|
| `restartResetsAllState` | After moves, `restart()` resets board, history, status, player, draw state |
| `newGameConfigUpdatesMode` | `newGame(mode: "bot", difficulty: "hard", playerColor: "black")` updates config properties |

---

## 6. EngineTypes Helper Tests (`EngineTypeTests`)

| Test | Description |
|------|-------------|
| `isWhitePieceExtension` | `"w".isWhitePiece`, `"W".isWhitePiece`, `"@".isWhitePiece` are true; `"b"` is false |
| `isBlackPieceExtension` | `"b".isBlackPiece`, `"B".isBlackPiece`, `"$".isBlackPiece` are true; `"w"` is false |
| `pieceColorExtension` | `"w".pieceColor == .white`, `"$".pieceColor == .black`, `".".pieceColor == nil` |
| `playerOpposite` | `Player.white.opposite == .black` and vice versa |
| `gameMoveAsMove` | `GameMove.asMove` converts correctly (from/to positions, piece, captured, promotion) |

---

## 7. UI Tests (`RaichuUITests`)

UI tests use `XCUIApplication` and run against the live simulator. All tests call `app.launch()` in `setUpWithError`.

> **Note:** UI tests require the app to be runnable. If the JS bundle is missing, the stub engine serves the initial board, so launch and navigation tests still pass.

| Test | Checks |
|------|--------|
| `testAppLaunchesWithoutCrash` | App reaches foreground without crash (implicit in any test) |
| `testHomeViewKeyElementsVisible` | Title label "Raichu" and at least one CTA button are visible |
| `testNavigateToPlayView` | Tapping "Play vs AI" button navigates to a screen containing a board grid |
| `testBoardGridHas64Squares` | Board region contains 64 tappable/interactive cells |
| `testTapPieceHighlightsSelection` | Tapping a piece cell changes its visual state (accessibility value changes) |
| `testNewGameButtonExists` | New Game / Settings button is reachable from PlayView |
| `testNavigateToProfileTab` | Tapping the Profile tab shows a sign-in prompt or profile screen |
| `testLaunchPerformanceMeasure` | App cold-launch completes within 2s (XCTApplicationLaunchMetric) |

---

## 8. Test-Running Checklist

Before committing:

```
[ ] pnpm build:ios ran successfully (raichu-engine.js present)
[ ] All unit tests pass (Cmd+U in Raichu target → RaichuTests)
[ ] All UI tests pass (Cmd+U in Raichu target → RaichuUITests)
[ ] No tests skipped or commented out
[ ] No force-unwrap crashes in test output
```

---

## 9. Stub vs Real Engine Behavior

| Engine state | `createInitialBoard` | `generateMovesForPiece` | `applyMove` | `getGameStatus` | `findBestMove` |
|---|---|---|---|---|---|
| **Stub** (no JS bundle) | Returns 8×8 starting board (Swift hardcoded) | Returns `[]` | Returns original board unchanged | Returns `"playing"` | Returns `nil` |
| **Real JS bundle** | Returns engine-computed starting board | Returns full legal moves | Returns correct new board | Returns actual status | Returns best move |

Tests that assert on move count, board changes, or AI output require the real bundle. Tests for draw detection, `makeMove` structure, and history tracking work with the stub because `GameStore.makeMove` uses the board returned by `applyMove` (stub returns the same board, game logic still runs).

---

## 10. Adding New Tests

When adding a new game feature:

1. Add a board fixture to the fixtures section at the top of `RaichuTests.swift`
2. Add a `@Test` inside the relevant `@Suite`
3. Use `#expect(...)` for assertions; `#require(...)` for preconditions that stop the test if false
4. Mark `@MainActor` any test that accesses `GameStore` or `OnlineGameStore`
5. Keep each test focused on one behavior; avoid long multi-step tests

---

## 11. Known Limitations

- **OnlineGameStore** is not unit tested because it requires a live Supabase connection. Integration testing against a local Supabase instance is out of scope for CI.
- **AuthStore** and **MatchmakingStore** require network access. Their business logic is thin (wrapping SDK calls); trust the supabase-swift SDK tests.
- **BoardView** interaction is tested via UI tests. Drag-and-drop gesture testing with XCUITest is fragile; covered via tap-to-move path only.
