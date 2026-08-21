# AI Engine

Package: `@raichu/ai-engine`
Location: `packages/ai-engine/`

---

## Algorithm

The AI uses **minimax with alpha-beta pruning** and **iterative deepening**.

### Iterative Deepening

Search depth 1, then 2, then 3, and so on until the time budget expires. The best move from the completed depth is returned if the next depth times out mid-search.

```
depth=1 search completes → store best_move
depth=2 search completes → store best_move
depth=3 search starts    → time budget exceeded mid-search
return best_move from depth=2
```

This guarantees a result even on very short time budgets, while using all available time for deeper search when possible.

### Alpha-Beta Pruning

Standard minimax with alpha-beta. Cuts off branches that cannot improve the current best result.

```
minimax(board, depth, alpha, beta, maximizing):
  if depth == 0 or terminal:
    return evaluate(board, rootPlayer)

  if maximizing:
    value = -INF
    for move in orderedMoves(board, currentPlayer):
      child = applyMove(board, move)
      value = max(value, minimax(child, depth-1, alpha, beta, false))
      alpha = max(alpha, value)
      if alpha >= beta: break   // beta cutoff
    return value
  else:
    // same with min and beta cutoff
```

### Move Ordering

Moves are sorted before searching to increase beta cutoffs:

```
1. Captures (sorted by MVV-LVA: high-value victim, low-value attacker)
2. Promotion moves
3. Quiet moves
```

Ordering is approximate (no full see/SEE), but captures first is enough to significantly improve pruning efficiency in practice.

### Time Budget Enforcement

```
nodesSearched counter
every 1000 nodes: check elapsed time
if elapsed >= timeBudget: set timeExceeded flag, unwind recursion
```

The timeout is checked every 1000 nodes rather than every node to avoid the overhead of `Date.now()` on every call.

### Early Termination

If the evaluation at any root child reaches `WIN_SCORE - 100` or above, the search stops immediately and returns that move. A forced win does not need deeper confirmation.

### Forced Move Shortcut

If only one legal move exists, return it immediately without any search. Saves time in endgame positions.

---

## Evaluation Function

```typescript
evaluate(board: Board, player: Player): number
```

Returns a signed integer: positive = good for `player`, negative = bad.

### Material Values

```
Pichu:   100
Pikachu: 300
Raichu:  900
```

Raw material score = sum of own piece values minus sum of enemy piece values.

### Advancement Bonus

Pieces closer to promotion are worth more. The bonus is quadratic to emphasize pieces near the back rank.

```typescript
// For white piece at row r (destination is row 7):
advancement = r / 7                  // 0.0 at start, 1.0 at promotion
advancementBonus = pieceValue * 0.3 * advancement^2
```

For black, advancement is `(7 - r) / 7`.

This creates natural pressure to advance pieces toward promotion without explicitly programming it.

### Center Bonus

Pieces in central squares are worth slightly more.

```typescript
centerBonus = pieceValue * 0.05 * (4 - manhattanDistFromCenter) / 4
```

Small enough to not override material or advancement, but encourages pieces away from edge squares.

### Terminal Positions

```
WIN_SCORE  =  100,000   (forced win)
LOSE_SCORE = -100,000   (forced loss)
```

Terminal positions detected by `getGameStatus(board, nextPlayer)`. If the position is winning, return `WIN_SCORE - depth` (prefer faster wins). If losing, return `LOSE_SCORE + depth` (prefer slower losses).

---

## Difficulty Settings

```typescript
easy:   { maxDepth: 6,  timeBudgetMs: 400  }
medium: { maxDepth: 8,  timeBudgetMs: 800  }
hard:   { maxDepth: 12, timeBudgetMs: 1500 }
```

`maxDepth` is a hard cap. `timeBudgetMs` is the soft cap via iterative deepening. In practice:

- Easy: typically reaches depth 3-4 in 400ms
- Medium: typically reaches depth 5-6 in 800ms
- Hard: typically reaches depth 7-9 in 1500ms

Actual depth varies with position complexity (branching factor).

---

## Search Result

```typescript
interface SearchResult {
  move:          Move | null;    // best move found (null if no legal moves)
  board:         Board | null;   // board after applying best move
  evaluation:    number;         // score from the moving player's perspective
  nodesSearched: number;         // total nodes evaluated
  depth:         number;         // deepest completed iteration
  durationMs:    number;         // wall-clock time of search
}
```

---

## Performance Notes

The AI runs synchronously on the JavaScript main thread. Before starting the search, the caller should yield to React to let the UI render the "Thinking..." state:

```typescript
await new Promise<void>(resolve => setTimeout(resolve, 50));
const result = findBestMove(board, player, difficulty);
```

Typical node counts per search:
- Easy: ~5,000-20,000 nodes
- Medium: ~20,000-100,000 nodes
- Hard: ~100,000-500,000 nodes

For reference, the branching factor of Raichu is roughly 20-40 moves per position in the midgame, so depth-8 search can theoretically visit 40^8 = 6.5 billion nodes. Alpha-beta pruning reduces this to approximately the square root in the best case (depth 16 equivalent), but actual savings depend heavily on move ordering quality.

---

## Future Improvements

- **Web Worker:** Move AI search off the main thread to prevent UI jank on hard difficulty
- **Transposition table:** Hash visited positions to avoid re-evaluating identical board states reached by different move sequences
- **Killer moves heuristic:** Track moves that caused beta cutoffs and try them first in sibling nodes
- **Quiescence search:** Extend search at leaf nodes when captures are available, to avoid the horizon effect
