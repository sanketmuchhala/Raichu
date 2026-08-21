# Future iOS Integration Notes

## Overview

The Raichu game engine (`@raichu/game-engine`) is designed for cross-platform reuse. This document outlines how to integrate it into an iOS application.

## Architecture Options

### Option A: React Native (Recommended)

**Pros**: Maximum code reuse, shared TS/JS ecosystem
**Cons**: Not fully native feel

1. Create a React Native project in `apps/ios/`
2. Import `@raichu/game-engine` directly (it's pure TypeScript)
3. Reuse the Zustand game store logic from `apps/web/src/store/game-store.ts`
4. Build native-style board UI using React Native SVG
5. The AI engine can also run on-device via the JS runtime

### Option B: Native Swift + JavaScriptCore Bridge

**Pros**: Native performance, native UI
**Cons**: Bridge maintenance, slightly more complex

1. Bundle `@raichu/game-engine` into a single JS file
2. Load it in JavaScriptCore on iOS
3. Create a Swift bridge class:

```swift
class RaichuEngine {
    let context: JSContext

    func generateMoves(board: [[String]], player: String) -> [Move] {
        // Call JS function via JSContext
    }

    func applyMove(board: [[String]], move: Move) -> [[String]] {
        // Call JS function via JSContext
    }
}
```

4. Build SwiftUI board interface
5. Connect UI gestures to engine through the bridge

### Option C: Full Swift Port

**Pros**: Maximum native performance
**Cons**: Must maintain two engine implementations

Not recommended unless performance requirements demand it.

## Engine API Surface to Expose

The following functions from `@raichu/game-engine` are needed:

| Function | Description |
|----------|-------------|
| `createInitialBoard()` | Returns starting board position |
| `generateMovesForPiece(board, row, col)` | Legal moves for a piece |
| `generateAllMoves(board, player)` | All legal moves for a player |
| `applyMove(board, move)` | Apply a move, return new board |
| `getGameStatus(board)` | Check for win/loss/playing |
| `encodeBoard(board)` | Serialize board to string |
| `decodeBoard(str)` | Deserialize string to board |

From `@raichu/ai-engine`:

| Function | Description |
|----------|-------------|
| `findBestMove(board, player, difficulty)` | Compute best AI move |

## Type Compatibility

The `Board` type is `string[][]` (2D array of single chars), which maps naturally to:
- Swift: `[[Character]]` or `[[String]]`
- Kotlin: `Array<Array<String>>`

The `Move` type is a simple struct that maps to any language's struct/data class.

## Testing Strategy

1. Port the Vitest test cases from `packages/game-engine/__tests__/` to XCTest
2. Verify roundtrip compatibility: encode board in TS → decode in Swift → re-encode should match
3. Verify move generation produces identical results on both platforms
