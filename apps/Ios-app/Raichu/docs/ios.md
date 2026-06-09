# Raichu iOS App — Complete Implementation Guide

This document is a full specification for building the native iOS app for Raichu. It covers every screen, component, interaction, animation, API call, state model, and UX decision needed to ship. Treat it as ground truth.

---

## 1. Technology Choice

**Recommendation: SwiftUI + JavaScriptCore bridge** for the game engine.

The TypeScript game engine (`packages/game-engine`) is pure logic with zero DOM dependencies. Bundle it into a single JS file at build time and load it into a JSContext. All move generation, board evaluation, and game status runs on-device. The AI engine runs the same way.

```
apps/ios/
├── Raichu.xcodeproj
├── Sources/
│   ├── App/
│   │   ├── RaichuApp.swift          // @main, environment setup
│   │   └── ContentView.swift        // Root NavigationStack
│   ├── Engine/
│   │   ├── RaichuEngine.swift       // JSContext bridge
│   │   ├── EngineTypes.swift        // Swift structs mirroring TS types
│   │   └── raichu-engine.js         // Bundled game + AI engine (built from TS)
│   ├── Stores/
│   │   ├── GameStore.swift          // ObservableObject — offline game state
│   │   ├── AuthStore.swift          // ObservableObject — session / user
│   │   ├── OnlineGameStore.swift    // ObservableObject — live multiplayer
│   │   └── UIStore.swift            // ObservableObject — theme, board flip
│   ├── Views/
│   │   ├── Home/
│   │   ├── Play/
│   │   ├── Game/
│   │   ├── Lobby/
│   │   ├── History/
│   │   ├── Leaderboard/
│   │   ├── Profile/
│   │   ├── Auth/
│   │   └── Shared/
│   ├── Supabase/
│   │   └── SupabaseClient.swift     // Supabase-swift SDK wrapper
│   └── Assets.xcassets
└── raichu-engine/                   // JS bundle build output
```

---

## 2. Engine Bridge

### 2.1 Build Step

Run this during CI/CD or as an Xcode build phase:

```bash
cd packages/game-engine && pnpm build
cd packages/ai-engine  && pnpm build
# Bundle both into a single IIFE
esbuild packages/game-engine/src/index.ts packages/ai-engine/src/index.ts \
  --bundle --format=iife --global-name=RaichuEngine \
  --outfile=apps/ios/Sources/Engine/raichu-engine.js
```

### 2.2 RaichuEngine.swift

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

### 2.3 Swift Types

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

## 3. Data & State Architecture

### 3.1 GameStore (Offline)

```swift
@MainActor
final class GameStore: ObservableObject {
    @Published var board: [[String]]     = RaichuEngine.shared.createInitialBoard()
    @Published var currentPlayer: String = "white"
    @Published var status: String        = "playing"
    @Published var moveHistory: [Move]   = []
    @Published var boardHistory: [[[String]]] = []  // for replay
    @Published var lastMove: Move?       = nil
    @Published var isThinking: Bool      = false
    @Published var selectedPiece: Position? = nil
    @Published var legalMoves: [Move]    = []

    // Config
    var gameMode: String    = "pvp"   // pvp | bot
    var difficulty: String  = "medium" // easy | medium | hard
    var playerColor: String = "white"

    init() {
        boardHistory = [board]
    }

    func selectPiece(at pos: Position) { ... }
    func makeMove(_ move: Move) { ... }
    func clearSelection() { ... }
    func newGame(mode: String, difficulty: String, playerColor: String) { ... }
    func restart() { ... }
    func requestBotMove() async { ... }
}
```

Move execution flow (same logic as game-store.ts):
1. Apply move via engine → `newBoard`
2. Compute `nextPlayer`
3. Call `getGameStatus(newBoard, nextPlayer)`
4. Update all state
5. Append to `moveHistory` and `boardHistory`
6. If bot mode and it's bot's turn → `requestBotMove()` after 300ms

### 3.2 UIStore

```swift
@MainActor
final class UIStore: ObservableObject {
    @Published var theme: String        = "classic"
    @Published var boardFlipped: Bool   = true  // white at bottom by default
    @Published var replayMode: Bool     = false
    @Published var replayStep: Int      = 0

    func enterReplay(step: Int) { replayMode = true; replayStep = step }
    func exitReplay()           { replayMode = false; replayStep = 0 }
    func setReplayStep(_ s: Int){ replayStep = s }
    func flipBoard()            { boardFlipped.toggle() }
}
```

### 3.3 AuthStore

```swift
@MainActor
final class AuthStore: ObservableObject {
    @Published var user: User?          = nil
    @Published var initialized: Bool    = false
    @Published var loading: Bool        = false

    func signIn(email: String, password: String) async throws { ... }
    func signUp(email: String, password: String, username: String) async throws { ... }
    func signOut() async throws { ... }
    func refresh() async { ... }   // called on app launch
}
```

### 3.4 OnlineGameStore

Mirrors the TypeScript `online-game-store.ts`:

```swift
@MainActor
final class OnlineGameStore: ObservableObject {
    @Published var game: OnlineGameDetail? = nil
    @Published var board: [[String]]       = emptyBoard()
    @Published var currentPlayer: String   = "white"
    @Published var status: String          = "playing"
    @Published var moves: [GameMove]       = []
    @Published var lastMove: Move?         = nil
    @Published var myColor: String?        = nil
    @Published var loading: Bool           = false
    @Published var error: String?          = nil
    @Published var selectedPiece: Position? = nil
    @Published var legalMoves: [Move]       = []
    @Published var isThinking: Bool         = false

    private var realtimeChannel: RealtimeChannel?

    func loadGame(_ id: String) async { ... }
    func selectPiece(at pos: Position) { ... }
    func submitMove(_ move: Move) async { ... }
    func clearSelection() { ... }
    func resign() async { ... }
    func subscribeRealtime(gameId: String) { ... }  // Supabase Realtime
    func unsubscribe() { ... }
    func reset() { ... }
}
```

---

## 4. Supabase Client

Use the official `supabase-swift` package.

```swift
import Supabase

let supabase = SupabaseClient(
    supabaseURL: URL(string: "https://YOUR_PROJECT.supabase.co")!,
    supabaseKey: "YOUR_ANON_KEY"
)
```

**Tables accessed:**
- `games` — read/write game rows
- `game_moves` — read all moves for a game, subscribe to inserts
- `profiles` — read username, elo_rating, display_name
- `leaderboard` (view) — read top players

**Realtime subscription pattern:**

```swift
func subscribeRealtime(gameId: String) {
    realtimeChannel = supabase.realtime
        .channel("game-\(gameId)")
        .on(.postgres, schema: "public", table: "games",
            filter: "id=eq.\(gameId)") { [weak self] payload in
            // handleGameUpdate
        }
        .on(.postgres, schema: "public", table: "game_moves",
            filter: "game_id=eq.\(gameId)") { [weak self] payload in
            // handleNewMove
        }
        .subscribe()
}
```

---

## 5. Screens & Navigation

### 5.1 Navigation Structure

```
NavigationStack (root)
├── HomeView                     /
├── PlayView                     /play
├── OnlineGameView               /game/:id
├── LobbyView                    /lobby
├── JoinGameView                 /join/:code
├── HistoryView                  /history
├── LeaderboardView              /leaderboard
├── ProfileView                  /profile
├── AuthView                     /auth
├── RulesView                    /rules
├── HowToPlayView                /how-to-play
└── SettingsView                 (no web equivalent — iOS only)
```

Tab bar at root (bottom tab bar, iOS convention):
- **Play** (gamecontroller icon) → PlayView
- **Online** (network icon) → LobbyView (requires auth)
- **History** (clock icon) → HistoryView (requires auth)
- **Profile** (person icon) → ProfileView / AuthView

---

## 6. Screen Specifications

### 6.1 HomeView

**Purpose:** Landing / marketing screen shown on first launch.

**Layout (ScrollView, vertical):**
1. Logo + title "Raichu" (large, bold)
2. Tagline: "Chess-inspired. No luck. 5–15 minutes."
3. Two CTAs: "Play vs AI" (primary, green #769656) | "Play Online" (secondary)
4. Stats strip: 4 cells — "5-15 min / game", "0 luck", "3 piece types", "Free"
5. Piece guide: 3 cards (Pichu/Pikachu/Raichu) with icon + name + capture rule
6. Capture Hierarchy section: visual table with arrows
7. How to Play: 3 numbered steps
8. "Start Playing" CTA button

**Animations:**
- On appear: staggered fade-up for each section (0.15s delay between sections)
- Stats cells: count-up animation (0 → final value over 0.8s) using `withAnimation`
- Piece cards: scale-in from 0.9 to 1.0 on scroll reveal

**Navigation:** "Play vs AI" → PlayView, "Play Online" → LobbyView

---

### 6.2 PlayView (Offline Game)

**Purpose:** Local game vs AI or vs second player on same device.

**Layout:**
```
VStack {
  NavBar (back + title + settings)
  CapturedPiecesRow(pieces: topCaptured)   // opponent's side
  BoardView(flipped: boardFlipped)
  CapturedPiecesRow(pieces: bottomCaptured) // player's side
  HStack {
    GameInfoPanel
    Spacer
    ReplayControls (when moves exist)
  }
  MoveHistoryPanel (collapsible)
  ControlsPanel (New Game | Restart | Flip)
}
```

**Board orientation:** White at bottom by default (`boardFlipped = true`). User can flip with button.

**Interactions:**
- Tap piece → highlight + show legal move dots (60% opacity circles on empty squares, red ring on capture squares)
- Tap legal move target → execute move with slide animation
- Long-press piece → drag with haptic feedback (UIImpactFeedbackGenerator, .medium)
- Drag to legal square → release triggers move; drag to illegal → snap back animation
- Tap empty square or opponent piece → clear selection

**Bot thinking state:**
- Spinner (ActivityIndicator) overlaid on board, 40% opacity black overlay
- Board interaction disabled
- "Thinking..." text in GameInfoPanel

---

### 6.3 BoardView

**Core component — used in PlayView and OnlineGameView.**

```swift
struct BoardView: View {
    let board: [[String]]
    let selectedPiece: Position?
    let legalMoves: [Move]
    let lastMove: Move?
    let flipped: Bool
    let canInteract: Bool

    var onTap: (Position) -> Void
    var onDrop: (Position, Position) -> Void  // from, to

    // Piece animation state
    @State private var animatingMove: MoveAnimation? = nil
    @State private var dragState: DragState? = nil
}
```

**Geometry:**
- Board fills available width (GeometryReader)
- 8×8 grid, each square = boardWidth / 8 (plus 20pt coordinate margins)
- Coordinate labels: 20pt wide on left, 20pt tall at bottom
- With `flipped = true`: row/col display order reversed; 'a' on left, '1' at bottom

**Square colors (Classic theme):**
- Light: #F0D9B5
- Dark: #B58863
- Selected: rgba(255,215,0, 0.4) overlay
- Legal move dot: rgba(0,0,0,0.2) circle
- Capture ring: rgba(220,50,50,0.45) ring stroke
- Last move highlight: rgba(255,215,0,0.2) overlay

**Piece rendering:**
- Images loaded from chess.com CDN (or bundled locally for offline):
  ```
  w (Pichu)    → wp.png  |  b (Pichu)    → bp.png
  W (Pikachu)  → wr.png  |  B (Pikachu)  → br.png
  @ (Raichu)   → wq.png  |  $ (Raichu)   → bq.png
  ```
  CDN: `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/`
  
  **Important:** For App Store release, bundle piece images locally (no CDN in production iOS) to avoid network dependency and latency.

**Move slide animation:**
- Duration: 260ms
- Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94) — `Animation.timingCurve(0.25, 0.46, 0.45, 0.94, duration: 0.26)`
- The piece at the source square disappears; an animated copy slides to destination
- Captured piece: separate fade-out animation (180ms, easeOut)
- After animation completes (340ms): show static piece at destination

**Drag and drop:**
- On gesture begin: `UIImpactFeedbackGenerator(.medium).impactOccurred()`
- Dragged piece renders above all board elements (zIndex 100)
- 85% opacity while dragging (matches web)
- Source square shows empty (piece hidden during drag)
- Drop on invalid square: rubber-band back to source (spring animation, 0.4s)
- Drop on valid square: no slide animation needed (piece already at dest visually)

**Coordinate labels:**
- When `flipped = false`: col 'a' → left, '8' → top; standard orientation
- When `flipped = true` (default): col 'a' → left, '1' → bottom (white's perspective)
- Row labels: `flipped ? i + 1 : 8 - i` (matches web implementation)
- Col labels: `flipped ? COL_LABELS[7 - i] : COL_LABELS[i]`

---

### 6.4 CapturedPiecesRow

```swift
struct CapturedPiecesRow: View {
    let pieces: [String]  // piece chars captured

    var body: some View {
        let sorted = pieces.sorted { sortOrder($0) < sortOrder($1) }
        HStack(spacing: 1) {
            ForEach(sorted.indices, id: \.self) { i in
                PieceImage(piece: sorted[i], size: 22)
                    .opacity(0.78)
            }
            Spacer()
        }
        .frame(minHeight: 26)
        .padding(.horizontal, 4)
    }
    
    private func sortOrder(_ p: String) -> Int {
        switch p { case "w","b": return 0; case "W","B": return 1; default: return 2 }
    }
}
```

---

### 6.5 MoveHistory Panel (Offline + Online)

**Features:**
- Paired rows: move number | white move | black move
- Tapping any move enters/sets replay step
- Navigation arrows: ⏮ ◀ ▶ ⏭
- "Reviewing" badge + "Live" button when in replay mode
- Current step highlighted in accent color
- Auto-scrolls to latest move when not in replay

**Replay step indicator:** "Move X / Y" shown in subtitle when `replayMode = true`.

**Implementation:** Collapsible in compact layouts (modal sheet on iPhone). Always visible on iPad.

---

### 6.6 GameInfoPanel

Shows:
- Color dot (white circle / black circle) + turn text "White to move" / "Bot thinking..."
- Mode label: "vs AI (Medium)" or "PvP"
- Move counter: "Move 12"
- Animated spinner when `isThinking = true`

---

### 6.7 ControlsPanel

Buttons:
- **New Game** (primary, green) → opens NewGameSheet
- **Restart** (secondary)
- **Flip Board** (secondary)
- **Theme** segmented control: Classic | Slate | Walnut

**NewGameSheet:**
- Modal bottom sheet
- Segmented: vs AI | vs Friend
- If vs AI: difficulty picker (Easy / Medium / Hard), color picker (White / Black / Random)
- Confirm button

---

### 6.8 OnlineGameView

**Purpose:** Live multiplayer game.

**Layout:**
```
VStack {
  NavBar ("← Lobby" back button)
  PlayerBar(player: topPlayer, color: topColor, capturedPieces: topCaptured)
  BoardView (flipped: myColor == "black")
  PlayerBar(player: bottomPlayer, color: bottomColor, capturedPieces: bottomCaptured)
  [mobile: resign button]
}
// iPad/landscape: board + OnlineGameSidebar side-by-side
```

**PlayerBar component:**
```swift
struct PlayerBar: View {
    let username: String
    let elo: Int
    let isCurrentTurn: Bool
    let color: String            // "white" | "black"
    let capturedPieces: [String]

    // Turn glow: pulsing border animation on accent color when isCurrentTurn
    // Border: 2pt accent when turn, transparent when not
    // Avatar circle: initial letter, bg #f0f0f0 (white) or #333 (black)
}
```

**Turn glow animation:**
```swift
// Pulsing accent border when isCurrentTurn
.overlay(
    RoundedRectangle(cornerRadius: 10)
        .stroke(isCurrentTurn ? Color.accentColor : .clear, lineWidth: 2)
        .opacity(glowOpacity)
)
.onAppear {
    guard isCurrentTurn else { return }
    withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true)) {
        glowOpacity = 0.4
    }
}
```

**GameOverOverlay:**
- Semi-transparent dark overlay on top of the board
- "You Won!" (green) or "You Lost" (muted) depending on `winnerId == myId`
- "Resigned" if status == "abandoned"
- Replay button (enters replay mode at step 0)
- "Back to Lobby" link

**Realtime subscription:**
- Subscribe in `.onAppear`, unsubscribe in `.onDisappear`
- Handle game row updates → update board + status
- Handle new move inserts → replay last move animation

---

### 6.9 WaitingRoom (Online)

Shown when `game.status == "waiting"`.

**Layout:**
- Title: "Waiting for opponent..."
- Invite code displayed in monospace, large, with copy button
- Animated dots / spinner
- "Cancel" button → resign + pop

**Copy button:** `UIPasteboard.general.string = inviteCode`  + haptic + brief "Copied!" label

---

### 6.10 LobbyView

Requires authentication. Shows:
1. **Quick Match** button (ranked) → POST `/api/matchmaking/join`
   - Polling or Supabase Realtime while matchmaking
   - Cancel button
   - "Finding opponent..." with animated dots
2. **Create Game** panel:
   - Ranked / Friendly toggle
   - "Create" → POST `/api/games` → navigate to OnlineGameView
3. **Join by Code** panel:
   - Text field for 6-char invite code
   - "Join" → POST `/api/games/:id/join` → navigate
4. **Active Games** list: games where status == "waiting" or "playing"

---

### 6.11 HistoryView

- Requires auth; redirect to AuthView if not signed in
- Segment filter: All | Ranked | Friendly
- List of completed games (status not "waiting"/"playing")
- Each row: colored left border (green=won, red=lost, gray=abandoned) + game info + ELO delta
- Tap → navigates to OnlineGameView in replay mode (starts at step 0, full replay from initial position)

**Row layout:**
```
[left border: 3pt] [game type + color + move count] [date] [ELO delta] [result label]
```

---

### 6.12 LeaderboardView

- Static fetch from Supabase `leaderboard` view or `profiles` table ordered by elo_rating DESC
- Top 3 highlighted with rank icons (gold/silver/bronze)
- Current user row pinned with accent highlight
- Pull-to-refresh

---

### 6.13 ProfileView

**Sections:**
1. Avatar (initials circle) + username + ELO rating
2. Stats: Wins / Losses / Win rate / Games played
3. Recent games (last 5, same format as HistoryView rows)
4. Settings button → SettingsSheet
5. Sign out button

**ELO chart:** Simple line chart (Swift Charts) showing ELO over last 20 games.

---

### 6.14 AuthView

Two tabs: Sign In | Sign Up

**Sign In:**
- Email + password fields
- "Sign In" button → `supabase.auth.signIn(email:, password:)`
- Error label below button
- "Continue as Guest" link

**Sign Up:**
- Email + password + username fields
- Validation: username 3–20 chars, alphanumeric + underscores
- "Create Account" → `supabase.auth.signUp(...)` + POST `/api/auth/profile`
- Error label

**Input style:**
- Rounded rectangle border (#333 idle, accent on focus)
- Secure field for password with show/hide toggle

---

### 6.15 SettingsView (iOS-only screen)

- **Theme:** Classic | Slate | Walnut (segmented)
- **Board orientation:** "White at bottom" toggle
- **Sound effects:** on/off toggle
- **Haptics:** on/off toggle
- **Notifications:** push notification permission prompt
- **App version:** shown in footer

---

## 7. Themes

Identical to web. Store in `ThemeConfig.swift`:

```swift
struct ThemeConfig {
    let boardLight: Color
    let boardDark: Color
    let selected: Color
    let legalMove: Color
    let captureIndicator: Color
    let lastMove: Color
    let bgPrimary: Color
    let bgSecondary: Color
    let bgPanel: Color
    let textPrimary: Color
    let textSecondary: Color
    let accent: Color
    let border: Color
}

static let classic = ThemeConfig(
    boardLight:        Color(hex: "F0D9B5"),
    boardDark:         Color(hex: "B58863"),
    selected:          Color.yellow.opacity(0.4),
    legalMove:         Color.black.opacity(0.2),
    captureIndicator:  Color(hex: "DC3232").opacity(0.45),
    lastMove:          Color.yellow.opacity(0.2),
    bgPrimary:         Color(hex: "1a1a1a"),
    bgSecondary:       Color(hex: "111111"),
    bgPanel:           Color(hex: "242424"),
    textPrimary:       Color(hex: "f0ece8"),
    textSecondary:     Color(hex: "7a7a7a"),
    accent:            Color(hex: "769656"),
    border:            Color(hex: "333333")
)
```

Dark background (`#1a1a1a`) everywhere. The chess.com green (`#769656`) for accents.

---

## 8. API Contracts

Base URL: `https://raichu.live/api`  
Auth: Supabase JWT in `Authorization: Bearer <token>` header.

### Games

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/games/:id` | — | `OnlineGameDetail` |
| POST | `/games` | `{game_type, time_control?}` | `OnlineGameDetail` |
| POST | `/games/:id/join` | `{invite_code?}` | `OnlineGameDetail` |
| POST | `/games/:id/move` | `Move` object | `{success: true}` |
| POST | `/games/:id/resign` | — | `{success: true}` |
| GET | `/games/:id/moves` | — | `GameMove[]` |

### Matchmaking

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/matchmaking/join` | — | `{status: 'waiting'|'matched', gameId?: string}` |
| DELETE | `/matchmaking/leave` | — | `{success: true}` |

### Profiles

| Method | Path | Response |
|--------|------|----------|
| GET | `/profiles/me` | `UserProfile` |
| PATCH | `/profiles/me` | `UserProfile` |

### Leaderboard

| Method | Path | Response |
|--------|------|----------|
| GET | `/leaderboard` | `UserProfile[]` (top 50) |

---

## 9. Move Notation

Functions `formatMoveHuman` and `formatMoveCoordinate` are in the game engine bundle. For the iOS sidebar/history, either call them via JSContext or re-implement:

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

## 10. Piece Rules (Critical — no lookup needed)

| Piece | Char | Can Capture |
|-------|------|-------------|
| Pichu (white) | `w` | Pichu only (`b`) |
| Pikachu (white) | `W` | Pichu + Pikachu (`b`, `B`) |
| Raichu (white) | `@` | Everything |
| Pichu (black) | `b` | Pichu only (`w`) |
| Pikachu (black) | `B` | Pichu + Pikachu (`w`, `W`) |
| Raichu (black) | `$` | Everything |

Movement:
- **Pichu:** One step diagonally forward only. Promotes to Raichu on far rank.
- **Pikachu:** One step forward, left, or right (no diagonal, no backward). Promotes to Raichu on far rank.
- **Raichu:** Queen-like (any direction, any distance) BUT captures by jumping (not sliding through pieces).
- **White moves DOWN** (row increases), **Black moves UP** (row decreases).
- No mandatory captures. No multi-jump. First player with no legal moves loses.

---

## 11. Animations Checklist

| Animation | Trigger | Duration | Easing |
|-----------|---------|----------|--------|
| Piece slide | Move executed | 260ms | `timingCurve(0.25, 0.46, 0.45, 0.94)` |
| Captured piece fade | Capture move | 180ms | `easeOut` |
| Drag lift | Gesture begins | 80ms | `easeOut` (scale 1→1.08) |
| Drag snap-back | Invalid drop | 350ms | `spring(response: 0.35, dampingFraction: 0.7)` |
| Selection highlight | Tap piece | 100ms | `easeOut` |
| Legal move dots | Selection shown | 150ms | `easeOut` (opacity 0→1) |
| Turn glow pulse | `isCurrentTurn` | 1000ms | `easeInOut`, repeats |
| Game over overlay | Status change | 300ms | `easeOut` (opacity 0→1) |
| Board flip | "Flip" tapped | 400ms | `spring(response: 0.4, dampingFraction: 0.85)` (3D Y-axis rotation) |
| Stagger reveal | Screen appear | 150ms per element | `easeOut` |
| Stats count-up | HomeView appear | 800ms | `easeOut` |
| Replay step change | Nav arrow tap | board fades 100ms, new position appears | `easeInOut` |

**Board flip implementation (3D):**
```swift
.rotation3DEffect(
    .degrees(boardFlipped ? 180 : 0),
    axis: (x: 0, y: 1, z: 0),
    perspective: 0.5
)
```
Note: pieces must counter-rotate to stay readable during flip.

---

## 12. Haptics

| Event | Feedback type |
|-------|--------------|
| Piece picked up | `.impact(.medium)` |
| Piece placed (valid move) | `.impact(.light)` |
| Invalid drop / snap-back | `.notification(.warning)` |
| Capture | `.impact(.heavy)` |
| Game over (win) | `.notification(.success)` |
| Game over (loss) | `.notification(.error)` |
| Button tap | `.selection` |
| Copy invite code | `.impact(.light)` |

---

## 13. Push Notifications

Register on first sign-in. Notification types:
- `YOUR_TURN` — "It's your turn in game #..." → deep link to `/game/:id`
- `GAME_ENDED` — "Game ended. You won/lost." → history
- `MATCH_FOUND` — "Opponent found! Game starting." → `/game/:id`

APNs token sent to: `POST /api/notifications/register` with `{ token, platform: "ios" }`.

---

## 14. Offline Support

The game engine runs entirely on-device. These features work without internet:
- Play vs AI (any difficulty)
- Local PvP (two players on one device)
- View game rules
- Browse previously loaded game history (cache last 20 games in CoreData/UserDefaults)

Online features require connection: matchmaking, live games, leaderboard, profile sync.

Show a banner "You're offline — online features disabled" when `NetworkMonitor.isConnected == false`.

---

## 15. App Store Metadata

- **Bundle ID:** `com.raichugame.ios`
- **Category:** Games → Board
- **Age Rating:** 4+
- **Keywords:** chess, strategy game, abstract, board game, two player, no luck
- **Description:** "Raichu is a chess-inspired abstract strategy game. Three piece types. No luck. Games in 5–15 minutes. Play against AI or challenge friends online."
- **Privacy:** No tracking. Auth data stored in Supabase. No third-party analytics unless opted in.

---

## 16. Dependency List

```
// Package.swift dependencies
.package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0")
// For JS engine bundling (dev only, not in app):
// esbuild (npm)
```

No other third-party iOS dependencies needed. SwiftUI handles everything natively.

---

## 17. Build Phases

1. **Bundle JS Engine**: Run esbuild to produce `raichu-engine.js` from TS source
2. **Copy to bundle**: Xcode copies `raichu-engine.js` as a resource
3. **Unit tests**: `XCTest` suite verifying:
   - `createInitialBoard()` returns 8×8 grid
   - Move generation matches known positions (port key cases from `game.test.ts`)
   - `getGameStatus` returns correct winner with 0 legal moves
   - Roundtrip: encode board in Swift → decode in JS → re-encode → compare
4. **UI tests**: XCUITest for happy paths (new game, make moves, game over)

---

## 18. Key Differences From Web

| Feature | Web | iOS |
|---------|-----|-----|
| Piece images | CDN fetch | Bundled locally |
| State management | Zustand stores | `@ObservableObject` + `@Published` |
| Board SVG | SVG element | Custom SwiftUI View + Canvas |
| Animation | Framer Motion | SwiftUI animations + UIKit haptics |
| Realtime | `supabase-js` channel | `supabase-swift` channel |
| Auth | Supabase session cookie | Supabase JWT, stored in Keychain |
| Routing | Next.js App Router | NavigationStack |
| Theming | CSS variables | `ThemeConfig` struct passed via Environment |
| Board flip default | `boardFlipped: true` (white at bottom) | Same |
