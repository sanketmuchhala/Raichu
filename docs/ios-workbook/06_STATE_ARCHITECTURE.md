# State Architecture

> Complete specification of every store, data flow, and Realtime subscription pattern for the iOS app.

---

## 1. Store Overview

The iOS app mirrors the web's Zustand stores as SwiftUI `@ObservableObject` classes.

| Store | Web Equivalent | Responsibility |
|-------|---------------|----------------|
| `GameStore` | `game-store.ts` | Offline PvP + bot game: board, moves, AI trigger |
| `OnlineGameStore` | `online-game-store.ts` | Multiplayer: board, Realtime handlers, submit/resign |
| `AuthStore` | `auth-store.ts` | Session, profile, sign in/up/out |
| `MatchmakingStore` | `matchmaking-store.ts` | Queue status, poll timer, matched game ID |
| `UIStore` | `ui-store.ts` | Theme, board flip, drag state, replay mode |

---

## 2. GameStore (Offline)

```swift
@MainActor
final class GameStore: ObservableObject {
    // Game state
    @Published var board: [[String]]     = RaichuEngine.shared.createInitialBoard()
    @Published var currentPlayer: String = "white"
    @Published var status: String        = "playing"
    @Published var moveHistory: [Move]   = []
    @Published var boardHistory: [[[String]]] = []
    @Published var lastMove: Move?       = nil
    @Published var isThinking: Bool      = false
    @Published var selectedPiece: Position? = nil
    @Published var legalMoves: [Move]    = []

    // Draw detection
    @Published var positionCounts: [String: Int] = [:]
    @Published var halfMovesSinceProgress: Int   = 0
    @Published var drawReason: String?           = nil

    // Config
    var gameMode: String    = "pvp"      // pvp | bot
    var difficulty: String  = "medium"   // easy | medium | hard
    var playerColor: String = "white"

    // Actions
    func selectPiece(at pos: Position) { ... }
    func makeMove(_ move: Move) { ... }
    func clearSelection() { ... }
    func newGame(mode: String, difficulty: String, playerColor: String) { ... }
    func restart() { ... }
    func requestBotMove() async { ... }
}
```

### Move Execution Flow (mirrors web `game-store.ts`)

```
1. User taps piece
   → selectPiece(at:)
   → generateMovesForPiece(board, row, col) via JSContext
   → filter to current player's pieces
   → set selectedPiece + legalMoves

2. User taps legal destination
   → makeMove(move)
   → newBoard = applyMove(board, move) via JSContext
   → nextPlayer = opposite of current
   → status = getGameStatus(newBoard, nextPlayer) via JSContext

3. Draw detection (same as web)
   → halfMoves: reset on capture/promotion, else increment
   → positionKey = encodeBoard(newBoard) + ":" + nextPlayer
   → if positionKey appears 3+ times → draw (threefold repetition)
   → if halfMoves >= 100 → draw (50-move rule)

4. Update all @Published state

5. If bot mode and bot's turn
   → DispatchQueue.main.asyncAfter(deadline: .now() + 0.3)
   → requestBotMove()
   → yield 50ms for UI
   → findBestMove(board, player, difficulty) via JSContext
   → makeMove(result)
```

---

## 3. OnlineGameStore (Multiplayer)

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

    // Actions
    func loadGame(_ id: String) async { ... }
    func selectPiece(at pos: Position) { ... }
    func submitMove(_ move: Move) async { ... }
    func clearSelection() { ... }
    func resign() async { ... }
    func subscribeRealtime(gameId: String) { ... }
    func unsubscribe() { ... }
    func reset() { ... }

    // Realtime handlers
    func handleGameUpdate(_ game: OnlineGameDetail) { ... }
    func handleNewMove(_ move: GameMove) { ... }
}
```

### Online Move Flow

```
1. User selects piece → same as offline
   → selectPiece filters to myColor's pieces only
   → blocked if currentPlayer != myColor

2. User taps legal destination
   → submitMove(move)
   → POST /games/:id/move with JWT auth
   → Server validates move against engine
   → Server applies move, checks game status
   → Server updates games row + inserts moves row
   → If game over: calculates ELO, updates profiles

3. Supabase Realtime publishes:
   → UPDATE on games table → handleGameUpdate()
   → INSERT on moves table → handleNewMove()

4. handleNewMove():
   → decodeBoard(move.board_after)
   → build lastMove from move record
   → compute nextPlayer
   → check for draw (threefold/50-move)
   → update @Published state
   → trigger slide animation

5. Polling fallback (3s interval):
   → GET /games/:id
   → compare board_state and status
   → update if changed
```

---

## 4. AuthStore

```swift
@MainActor
final class AuthStore: ObservableObject {
    @Published var user: User?        = nil
    @Published var profile: Profile?  = nil
    @Published var initialized: Bool  = false
    @Published var loading: Bool      = false

    func initialize() async { ... }
    func signUp(email: String, password: String, username: String) async throws { ... }
    func signIn(email: String, password: String) async throws { ... }
    func signInWithGoogle() async throws { ... }
    func signOut() async throws { ... }
    func fetchProfile() async { ... }
    func updateProfile(data: ...) async throws { ... }
}
```

### Auth Initialization Flow

```
App launch
  → AuthStore.initialize()
  → supabase.auth.session → check for existing session
  → if session exists → set user, fetchProfile()
  → listen for auth state changes
  → set initialized = true
```

---

## 5. MatchmakingStore

```swift
@MainActor
final class MatchmakingStore: ObservableObject {
    @Published var status: String   = "idle"      // idle | queued | matched
    @Published var loading: Bool    = false
    @Published var waitSeconds: Int = 0
    @Published var queueCount: Int  = 0
    @Published var matchedGameId: String? = nil
    @Published var error: String?   = nil
    private var idleRetries: Int    = 0

    func joinQueue() async { ... }     // POST /matchmaking/queue
    func leaveQueue() async { ... }    // DELETE /matchmaking/queue
    func pollStatus() async { ... }    // GET /matchmaking/status (every 2s)
    func reset() { ... }
}
```

### Matchmaking Flow

```
1. User taps "Quick Match"
   → joinQueue()
   → POST /matchmaking/queue
   → status = "queued"

2. Start polling timer (every 2 seconds)
   → pollStatus()
   → GET /matchmaking/status

3. Server-side worker (every 3s):
   → Selects all queued players
   → Expands ELO range over time (±100 → ±200 → ±400 → any)
   → Creates game when match found
   → Deletes both from queue

4. Poll returns { status: "matched", gameId: "..." }
   → Navigate to OnlineGameView

5. Cancel: leaveQueue() → DELETE /matchmaking/queue

6. Edge case: 3 consecutive "idle" responses → actually idle, stop polling
```

---

## 6. UIStore

```swift
@MainActor
final class UIStore: ObservableObject {
    @Published var theme: String        = "classic"
    @Published var boardFlipped: Bool   = true      // white at bottom
    @Published var replayMode: Bool     = false
    @Published var replayStep: Int      = 0

    func setTheme(_ theme: String) { ... }
    func flipBoard() { boardFlipped.toggle() }
    func enterReplay(step: Int) { replayMode = true; replayStep = step }
    func exitReplay() { replayMode = false; replayStep = 0 }
    func setReplayStep(_ s: Int) { replayStep = s }
}
```

---

## 7. Data Flow Diagrams

### Bot Game

```
User taps square
       │
       ▼
GameStore.selectPiece()
  → RaichuEngine.generateMovesForPiece(board, row, col)
  → highlights legal destinations
       │
User taps destination
       │
       ▼
GameStore.makeMove(move)
  → RaichuEngine.applyMove(board, move)
  → nextPlayer = opposite
  → RaichuEngine.getGameStatus(newBoard, nextPlayer)
  → draw detection
  → update all @Published state
       │
       ▼  (if bot's turn and still playing)
DispatchQueue.main.asyncAfter(0.3)
       │
       ▼
GameStore.requestBotMove()
  → Task.sleep(50ms)  // yield for UI
  → RaichuEngine.findBestMove(board, player, difficulty)
  → makeMove(result.move)
```

### Online Multiplayer

```
Player A makes move
       │
       ▼
OnlineGameStore.submitMove(move)
  → POST /api/v1/games/:id/move (with JWT)
       │
       ▼
Express API
  → isValidMove(board, player, move)
  → applyMove(board, move)
  → getGameStatus(newBoard, nextPlayer)
  → UPDATE games row
  → INSERT moves row
  → if game over: calculateElo, updateProfiles
       │
       ▼
Supabase Realtime
  → publishes UPDATE on games
  → publishes INSERT on moves
       │
       ▼  Player B's iOS app
subscribeRealtime(gameId)
  → onMoveInsert → handleNewMove()
  → onGameUpdate → handleGameUpdate()
  → applyMove locally, SwiftUI re-renders
```

### Realtime Subscription Setup

```swift
// In OnlineGameView
.onAppear {
    Task { await onlineGameStore.loadGame(gameId) }
    onlineGameStore.subscribeRealtime(gameId: gameId)
}
.onDisappear {
    onlineGameStore.unsubscribe()
}
```

---

## 8. Swift Type Definitions (mirroring TypeScript)

```swift
// From shared-types/src/pieces.ts
enum Player: String, Codable { case white, black }
enum PieceType: String, Codable { case pichu, pikachu, raichu }

// From shared-types/src/game.ts
enum GameStatus: String, Codable { case playing, white_wins, black_wins, draw }
enum GameMode: String, Codable { case pvp, bot, online }
enum Difficulty: String, Codable { case easy, medium, hard }

// From shared-types/src/multiplayer.ts
enum GameType: String, Codable { case friendly, ranked, bot }
enum OnlineGameStatus: String, Codable { case waiting, playing, white_wins, black_wins, abandoned }

struct Profile: Codable, Identifiable {
    let id: String
    let username: String
    let display_name: String?
    let avatar_url: String?
    let elo_rating: Int
    let games_played: Int
    let games_won: Int
    let created_at: String
    let updated_at: String
}

struct OnlineGame: Codable, Identifiable {
    let id: String
    let white_player_id: String?
    let black_player_id: String?
    let status: String
    let board_state: String
    let current_player: String
    let game_type: String
    let difficulty: String?
    let invite_code: String?
    let move_count: Int
    let winner_id: String?
    let winner_elo_delta: Int?
    let loser_elo_delta: Int?
    let created_at: String
    let updated_at: String
    let finished_at: String?
}

struct OnlineGameDetail: Codable, Identifiable {
    // Same as OnlineGame plus:
    let white_player: Profile?
    let black_player: Profile?
}

struct GameMove: Codable, Identifiable {
    let id: String
    let game_id: String
    let move_number: Int
    let player: String
    let from_row: Int
    let from_col: Int
    let to_row: Int
    let to_col: Int
    let piece: String
    let captured_piece: String?
    let captured_row: Int?
    let captured_col: Int?
    let promotion: String?
    let board_after: String
    let created_at: String
}
```

---

## 9. Environment Object Injection

```swift
@main
struct RaichuApp: App {
    @StateObject private var gameStore = GameStore()
    @StateObject private var onlineGameStore = OnlineGameStore()
    @StateObject private var authStore = AuthStore()
    @StateObject private var matchmakingStore = MatchmakingStore()
    @StateObject private var uiStore = UIStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(gameStore)
                .environmentObject(onlineGameStore)
                .environmentObject(authStore)
                .environmentObject(matchmakingStore)
                .environmentObject(uiStore)
                .task { await authStore.initialize() }
        }
    }
}
```
