# Codex Prompts — Build the Raichu iOS App

> Ready-to-use prompts for Codex (or any AI coding agent) to build each component of the iOS app. Each prompt is self-contained with full context. Use them in order.

---

## How to Use These Prompts

### Which tool to use

These prompts are designed for **Claude Code** (the CLI). They also work in Cursor, Windsurf, or any AI editor that has access to the full repository.

**Claude Code (recommended):**
```bash
# From the monorepo root
cd /path/to/raichu.py
claude
```
Then paste the prompt text directly into the chat. Claude Code reads the whole repo so it has context on every file referenced in the prompt.

**Cursor / Windsurf:**
Open the monorepo root as the project. Use the Agent/Composer panel. Paste the prompt — the agent will read referenced docs automatically if they are in the workspace.

**OpenAI Codex CLI (codex):**
```bash
codex "paste prompt here"
```
Or open an interactive session: `codex` then paste.

---

### Step-by-step workflow

**1. Clone the repo and install dependencies**
```bash
git clone https://github.com/sanketmuchhala/Raichu
cd Raichu
pnpm install
```

**2. Open the Xcode project alongside your AI tool**
```bash
open apps/Ios-app/Raichu/Raichu.xcodeproj
```

**3. Feed prompts one phase at a time**

Copy the full text inside a prompt's ` ``` ` block (including all bullet points). Paste it into Claude Code or your editor's agent panel. Let the agent complete before moving to the next phase.

**4. After each phase: build in Xcode**

Press `Cmd+B`. Fix any compile errors before continuing. The prompts are designed to produce compilable code, but agent output sometimes needs minor fixes.

**5. After Phase 0.2: build the JS engine bundle**
```bash
pnpm build:ios
```
This must exist before Phase 1 tests pass and before running the app.

**6. After Phase 3: add Supabase Swift package in Xcode**

File → Add Package Dependencies → `https://github.com/supabase/supabase-swift` (from 2.0.0).
The agent cannot do this for you — it requires Xcode UI.

**7. After Phase 7: run all tests**

`Cmd+U` in Xcode. All tests must pass before considering the phase done.

---

### Prompt format tips

- Each prompt is **self-contained** — you do not need to explain what Raichu is or paste prior context.
- The prompts reference docs like `04_GAME_ENGINE_AND_AI.md`. Claude Code reads those automatically. In other tools, you may need to paste the relevant doc section if the agent misses detail.
- If the agent stops early or asks a question, just reply: *"Continue. Follow the spec in the referenced doc exactly."*
- If a file already exists from a previous phase, the agent will edit it rather than overwrite — that's correct.

---

### Phase status (as of last update)

| Phase | Status |
|-------|--------|
| Phase 0 — Scaffolding + JS bundle | ✅ Done |
| Phase 1 — Engine bridge + types | ✅ Done |
| Phase 2 — Stores | ✅ Done |
| Phase 3 — Supabase + API client | ✅ Done |
| Phase 4 — Board UI | ✅ Done |
| Phase 5 — All screens | ✅ Done |
| Phase 6 — Themes, animations, haptics, offline, push | ✅ Done |
| Phase 7 — Tests | ✅ Done |

If starting fresh, run phases in order. If picking up mid-way, check which Swift files already exist (`find Raichu/Raichu -name "*.swift"`) and skip completed phases.

---

## Phase 0: Project Scaffolding

### Prompt 0.1 — Create Xcode Project

```
Create a new SwiftUI iOS app project in `apps/ios-app/` for "Raichu" — a chess-inspired board game.

Requirements:
- Xcode project with bundle ID `com.raichugame.ios`
- Minimum deployment: iOS 17.0
- SwiftUI lifecycle (@main App)
- Add supabase-swift dependency: .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0")
- Create this folder structure:
  ```
  apps/ios-app/
  ├── Raichu.xcodeproj
  ├── Sources/
  │   ├── App/
  │   │   ├── RaichuApp.swift
  │   │   └── ContentView.swift
  │   ├── Engine/
  │   │   ├── RaichuEngine.swift
  │   │   ├── EngineTypes.swift
  │   │   └── raichu-engine.js (placeholder)
  │   ├── Stores/
  │   │   ├── GameStore.swift
  │   │   ├── AuthStore.swift
  │   │   ├── OnlineGameStore.swift
  │   │   ├── MatchmakingStore.swift
  │   │   └── UIStore.swift
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
  │   │   └── SupabaseClient.swift
  │   ├── Networking/
  │   │   └── APIClient.swift
  │   └── Assets.xcassets
  └── Tests/
  ```
- RaichuApp.swift should inject all stores as @StateObject + .environmentObject
- ContentView should have a TabView with 4 tabs: Play, Online, History, Profile

See `06_STATE_ARCHITECTURE.md` section 9 for the exact environment injection pattern.
```

### Prompt 0.2 — Build JS Engine Bundle

```
Create a build script that compiles the Raichu TypeScript game engine and AI engine into a single JavaScript bundle for JavaScriptCore on iOS.

The engines are at:
- packages/game-engine/src/index.ts
- packages/ai-engine/src/index.ts

Requirements:
1. Use esbuild to bundle both into a single IIFE with global name `RaichuEngine`
2. Output to apps/ios-app/Sources/Engine/raichu-engine.js
3. Create a shell script `scripts/build-ios-engine.sh` that runs:
   ```bash
   cd packages/game-engine && pnpm build
   cd ../ai-engine && pnpm build
   cd ../..
   npx esbuild packages/game-engine/src/index.ts packages/ai-engine/src/index.ts \
     --bundle --format=iife --global-name=RaichuEngine \
     --outfile=apps/ios-app/Sources/Engine/raichu-engine.js
   ```
4. The bundle should expose these functions on the RaichuEngine global:
   - createInitialBoard()
   - generateMovesForPiece(board, row, col)
   - generateAllMoves(board, player)
   - applyMove(board, move)
   - getGameStatus(board, nextPlayer)
   - encodeBoard(board)
   - decodeBoard(str)
   - findBestMove(board, player, difficulty)
```

---

## Phase 1: Engine Bridge + Core Types

> **STATUS: COMPLETE ✓**
>
> Both files verified against full checklist. Xcode build clean. JS bundle builds clean (17.5kb).
> All 16 EngineTypes items present. All 8 RaichuEngine bridge methods present with correct JSON marshaling.
> No fixes were required — Phase 0 scaffold was complete.
> **Do not re-run Phase 1. Proceed to Phase 2.**

### Prompt 1.1 — Verify Swift Type Definitions

```
VERIFY (do not recreate) `Raichu/Raichu/Engine/EngineTypes.swift`.

Read the file first. Confirm it contains all of the following, exactly:

1. Position struct (row, col) — Codable, Hashable
2. CapturedInfo struct (position: Position, piece: String) — Codable
3. Move struct — Codable, Identifiable
   id = "\(from.row)\(from.col)\(to.row)\(to.col)\(piece)"
   fields: from, to, piece, captured: CapturedInfo?, promotion: String?
4. Player enum (white, black) — String, Codable, with .opposite computed var
5. GameStatus enum (playing, white_wins, black_wins, draw) — String, Codable
6. GameMode enum (pvp, bot, online) — String, Codable
7. Difficulty enum (easy, medium, hard) — String, Codable, CaseIterable
8. GameType enum (friendly, ranked, bot) — String, Codable, CaseIterable
9. OnlineGameStatus enum (waiting, playing, white_wins, black_wins, abandoned)
10. PieceType enum (pichu, pikachu, raichu) — String, Codable
11. Profile struct — all fields matching Supabase profiles table
12. OnlineGame struct — all fields matching Supabase games table
13. OnlineGameDetail struct — OnlineGame fields + white_player/black_player Profile?
14. GameMove struct — all fields matching Supabase moves table, with asMove: Move computed var
15. CreateGameRequest, SubmitMoveRequest, ResignResponse, MatchmakingStatusResponse — Codable
16. String extension: isWhitePiece, isBlackPiece, isPiece, pieceColor: Player?

Fix any missing items. Do NOT rewrite or reformat things that are already correct.
```

### Prompt 1.2 — Verify JavaScriptCore Bridge

```
VERIFY (do not recreate) `Raichu/Raichu/Engine/RaichuEngine.swift`.

Read the file first. Confirm it has:

1. `final class RaichuEngine` with `static let shared = RaichuEngine()`
2. Private `JSContext` loaded in `init()` with exception handler
3. Loads `raichu-engine.js` from `Bundle.main` via `path(forResource:ofType:)`
4. Falls back to `injectStubEngine()` when bundle is missing
5. All 8 public methods with correct JSON marshaling:
   - createInitialBoard() -> [[String]]
   - generateMovesForPiece(board:row:col:) -> [Move]
   - generateAllMoves(board:player:) -> [Move]
   - applyMove(board:move:) -> [[String]]
   - getGameStatus(board:nextPlayer:) -> String  (returns raw string, not enum)
   - findBestMove(board:player:difficulty:) -> Move?
   - encodeBoard(_ board:) -> String
   - decodeBoard(_ encoded:) -> [[String]]
6. Private JSON helpers: boardToJSON, moveToJSON, parseBoardJSON, parseMoves, parseSingleMove
7. defaultBoard() returns correct starting position (not all empty)
8. injectStubEngine() injects a minimal JS IIFE with all 8 stubs

JS call pattern for moves: `JSON.stringify(RaichuEngine.generateMovesForPiece(boardJSON, row, col))`
JS call pattern for status: `RaichuEngine.getGameStatus(boardJSON, 'white')` (no JSON.stringify)
JS call pattern for findBestMove: accesses `.move` property of result object

After verifying, run `pnpm build:ios` from the repo root to confirm the real JS
bundle is present, then do a Xcode build to confirm no compile errors.
```

---

## Phase 2: Stores

> **STATUS: COMPLETE ✓**
>
> All 5 stores verified. Two fixes applied in Phase 2.1 (GameStore). Phases 2.2/2.3 all pass with no changes needed.
>
> - `GameStore` — fixed: `@Published` on gameMode/difficulty/playerColor; random fallback in requestBotMove()
> - `OnlineGameStore` — all logic correct; loadGame/polling/handleGameUpdate/handleNewMove all verified
> - `MatchmakingStore` — 2s polling, idleRetries guard, reset all verified
> - `UIStore` — UserDefaults persistence, currentTheme, replay mode all verified
> - `AuthStore` — structure correct; Supabase stubs intentional until Phase 3
>
> **Do not re-run Phase 2. Proceed to Phase 3 (Supabase setup).**
>
> Remaining known gaps (Phase 3 work):
> - `AuthStore.swift` — Supabase SDK calls stubbed; needs supabase-swift package added
> - `OnlineGameStore.swift` — Realtime subscription stubbed; token/userId return nil until AuthStore wired

### Prompt 2.1 — Verify GameStore (Offline) ✓ COMPLETE

```
VERIFY (do not recreate) `Raichu/Raichu/Stores/GameStore.swift`.

Read the file. Confirm against `apps/web/src/store/game-store.ts` and `06_STATE_ARCHITECTURE.md` section 2:

1. @MainActor final class, ObservableObject, import Combine
2. All @Published properties present with correct types:
   - board: [[String]], currentPlayer: String, status: String
   - moveHistory: [Move], boardHistory: [[[String]]], lastMove: Move?
   - positionCounts: [String: Int], halfMovesSinceProgress: Int, drawReason: String?
   - gameMode: String, difficulty: String, playerColor: String
   - selectedPiece: Position?, legalMoves: [Move], isThinking: Bool
   - capturedByWhite: [String], capturedByBlack: [String]
3. selectPiece(at:) — filters moves to pieces owned by currentPlayer only
4. makeMove(_:):
   - Calls RaichuEngine.shared.applyMove, getGameStatus
   - Position key = "\(RaichuEngine.shared.encodeBoard(newBoard)):\(nextPlayer)"
   - Threefold: positionCount >= 3 → drawReason = "Threefold repetition"
   - 50-move: halfMoves >= 100 → drawReason = "50-move rule"
   - Resets halfMovesSinceProgress on capture OR promotion
   - Bot trigger: gameMode == "bot" && status == "playing" && currentPlayer != playerColor
5. requestBotMove() async — 50ms yield, findBestMove, fallback to random legal move on nil
6. newGame(mode:difficulty:playerColor:) — resets all state, 500ms delay if bot goes first
7. restart() — calls newGame with current config

Fix any discrepancies. Do NOT reformat correct code.
```

### Prompt 2.2 — Verify OnlineGameStore (Multiplayer) ✓ COMPLETE

```
VERIFY (do not recreate) `Raichu/Raichu/Stores/OnlineGameStore.swift`.

Read the file. Confirm:

1. All @Published properties: game, board, currentPlayer, status, moves, lastMove,
   myColor, loading, error, selectedPiece, legalMoves, isThinking
2. Private draw detection state: positionCounts, halfMovesSinceProgress
3. loadGame(_ id: String) async:
   - Calls gamesAPI.get(id:) then gamesAPI.getMoves(id:)
   - Calls applyGameDetail() to decode board_state and set myColor
4. selectPiece(at:) — guards: currentPlayer == myColor required
5. submitMove(_:) async — calls gamesAPI.move(id:move:)
6. resign() async — calls gamesAPI.resign(id:)
7. subscribeRealtime(gameId:) — stubbed with TODO (acceptable until Phase 3)
8. Polling fallback — Task-based 3s loop, stops when status not "playing"/"waiting"
9. handleGameUpdate(_:) — decodes board_state, updates board/currentPlayer/status
10. handleNewMove(_:) — builds lastMove from GameMove, runs draw detection, appends to moves
11. currentAccessToken() / currentUserId() — return nil (acceptable until AuthStore wired)

Note known gaps for Phase 3: Realtime subscription, token injection.
Fix any logic errors found. Do NOT implement the Realtime stub yet.
```

### Prompt 2.3 — Verify AuthStore, MatchmakingStore, UIStore ✓ COMPLETE

```
VERIFY (do not recreate) the three remaining stores in `Raichu/Raichu/Stores/`.

**AuthStore.swift** — read and confirm:
- UserSession struct (userId, email, accessToken)
- @Published: session, profile, initialized, loading, error
- Computed: isAuthenticated, userId, accessToken
- All 7 action stubs present: initialize, signIn, signUp, signInWithGoogle, signOut, fetchProfile, updateProfile
- All are async, all Supabase calls are TODO stubs — acceptable until Phase 3
- signOut() correctly clears session and profile (no Supabase needed for this)

**MatchmakingStore.swift** — read and confirm:
- @Published: status (idle/queued/matched), loading, waitSeconds, queueCount, matchedGameId, error
- joinQueue() starts 2s polling loop via Task
- pollStatus() handles "idle"/"queued"/"matched" — idleRetries guard (3 consecutive idle → stop)
- leaveQueue() cancels pollTask
- reset() clears all state

**UIStore.swift** — read and confirm:
- @Published: themeName, boardFlipped, replayMode, replayStep, soundEnabled, hapticsEnabled
- init() loads from UserDefaults with fallbacks
- themeName persists to UserDefaults in didSet
- currentTheme: ThemeConfig computed var works correctly
- enterReplay, exitReplay, setReplayStep, flipBoard all present

Fix any missing items. Supabase stubs in AuthStore are intentional — do NOT try to implement them here.

Create three more store files in `apps/ios-app/Sources/Stores/`:

1. **AuthStore.swift** — port from auth-store.ts
   - Properties: user, profile, initialized, loading
   - Actions: initialize(), signUp(), signIn(), signInWithGoogle(), signOut(), fetchProfile(), updateProfile()
   - Use supabase-swift SDK for auth operations
   - Listen for auth state changes in initialize()
   - JWT stored in Keychain automatically by supabase-swift

2. **MatchmakingStore.swift** — port from matchmaking-store.ts
   - Properties: status (idle/queued/matched), loading, waitSeconds, queueCount, matchedGameId, error
   - Actions: joinQueue(), leaveQueue(), pollStatus(), reset()
   - Poll every 2 seconds when queued
   - Handle 3 consecutive idle responses before stopping (race condition guard)

3. **UIStore.swift** — port from ui-store.ts
   - Properties: theme ("classic"/"slate"/"walnut"), boardFlipped (true), replayMode, replayStep
   - Actions: setTheme(), flipBoard(), enterReplay(), exitReplay(), setReplayStep()
   - Persist theme preference in UserDefaults

Full specifications in `06_STATE_ARCHITECTURE.md` sections 4-6.
```

---

## Phase 3: Supabase & Networking

> **STATUS: 3.1 + 3.2 COMPLETE ✓**
>
> - `supabase-swift` package added to Xcode and linked to Raichu target
> - `SupabaseClient.swift` — `import Supabase` + `supabase` module-level singleton
> - `AuthStore.swift` — all stubs replaced with real SDK calls: session restore from Keychain,
>   authStateChanges listener, signIn/signUp/signOut/fetchProfile/updateProfile
> - `OnlineGameStore.swift` — token/userId read live from `supabase.auth.session`;
>   Realtime wired via `supabase.realtimeV2.channel()` with `onPostgresChange` for
>   games UPDATE and moves INSERT; polling fallback retained
> - `MatchmakingStore.swift` — token read from `supabase.auth.session`; callers no longer pass token
> - `OnlineGameView.swift` / `LobbyView.swift` — updated call sites to match new signatures
> - Xcode build clean. Proceed to Phase 4 (BoardView UI).

### Prompt 3.1 — Supabase Client + API Client ✓ COMPLETE

```
Create two files:

1. **SupabaseClient.swift** (`apps/ios-app/Sources/Supabase/`)
   ```swift
   import Supabase
   let supabase = SupabaseClient(
       supabaseURL: URL(string: "https://jfqofulsmcjqudwnxekb.supabase.co")!,
       supabaseKey: "YOUR_ANON_KEY"
   )
   ```
   Use Configuration.swift for environment switching (dev vs prod).

2. **APIClient.swift** (`apps/ios-app/Sources/Networking/`)
   - Generic apiFetch<T: Decodable>(path:method:body:) async throws -> T
   - Automatically attaches JWT from supabase.auth.session
   - Base URL: configurable (localhost:3001 for dev, raichu.live for prod)
   - Error handling: parse { "error": "message" } from server

   Game-specific methods:
   - gamesApi.create(gameType:difficulty:playAs:)
   - gamesApi.get(id:)
   - gamesApi.getMoves(id:)
   - gamesApi.myGames()
   - gamesApi.move(id:move:)
   - gamesApi.resign(id:)
   - gamesApi.joinByCode(code:)
   - matchmakingApi.joinQueue()
   - matchmakingApi.leaveQueue()
   - matchmakingApi.status()

See `03_API_REFERENCE.md` for all endpoint details and response schemas.
```

---

## Phase 4: Board UI

### Prompt 4.1 — BoardView ✓ COMPLETE

```
Create `BoardView.swift` in `apps/ios-app/Sources/Views/Shared/` — the core game board component used everywhere.

Full specification in `05_UI_AND_DESIGN_SYSTEM.md` section 4.3.

Requirements:
1. Parameters: board, selectedPiece, legalMoves, lastMove, flipped, canInteract, onTap, onDrop
2. GeometryReader-based layout: board fills width, 8×8 grid
3. Square coloring by theme (Classic defaults): light #F0D9B5, dark #B58863
4. Coordinate labels: 20pt margins, row/col labels based on flipped state
5. Selection highlight: yellow overlay (0.4 opacity)
6. Legal move indicators: small circles (0.2 opacity) for empty squares, red ring stroke for captures
7. Last move highlight: yellow overlay (0.2 opacity) on from+to squares

Piece rendering:
- Load bundled piece images (wp.png, bp.png, wr.png, br.png, wq.png, bq.png)
- Map: w→wp, b→bp, W→wr, B→br, @→wq, $→bq

Move animation:
- Duration: 260ms
- Easing: timingCurve(0.25, 0.46, 0.45, 0.94)
- Piece slides from source to destination
- Captured piece fades out (180ms, easeOut)

Drag and drop:
- Long-press initiates drag with .impact(.medium) haptic
- Dragged piece at 85% opacity, zIndex 100
- Valid drop: execute move
- Invalid drop: spring snap-back animation (0.35s, dampingFraction 0.7)

Tap interaction:
- Tap piece → select and show legal moves
- Tap legal square → execute move
- Tap empty/opponent → clear selection

Accept the current theme via @EnvironmentObject UIStore.
```

### Prompt 4.2 — CapturedPiecesRow + PieceImage

```
Create supporting board components:

1. **PieceImage.swift** — reusable piece image view
   - Input: piece character (w/W/@/b/B/$), size
   - Maps piece char to bundled image name
   - Returns Image view with specified size

2. **CapturedPiecesRow.swift** — shows captured pieces
   - Input: array of captured piece chars
   - Sort: Pichu first (0), Pikachu (1), Raichu (2)
   - Display: HStack, 22pt pieces, 78% opacity, 1pt spacing
   - Min height: 26pt, horizontal padding 4pt

See `05_UI_AND_DESIGN_SYSTEM.md` section 7 for specs.
```

---

## Phase 5: Screens

### Prompt 5.1 — PlayView (Offline Game)

```
Create `PlayView.swift` — the offline game screen (vs AI or local PvP).

Layout (from `05_UI_AND_DESIGN_SYSTEM.md` section 4.2):
```
VStack {
  NavBar (back + "Raichu" title + settings gear)
  CapturedPiecesRow(pieces: topCaptured)    // opponent's captured
  BoardView(flipped: uiStore.boardFlipped)
  CapturedPiecesRow(pieces: bottomCaptured) // player's captured
  HStack {
    GameInfoPanel (color dot + turn text + mode + move count)
    Spacer
    ReplayControls (⏮ ◀ ▶ ⏭) when moves exist
  }
  MoveHistoryPanel (collapsible, paired rows)
  ControlsPanel (New Game | Restart | Flip | Theme picker)
}
```

Requirements:
- Wire up to GameStore via @EnvironmentObject
- Piece selection: gameStore.selectPiece(at:)
- Move execution: gameStore.makeMove(move)
- Bot thinking overlay: spinner + 40% black overlay when isThinking
- Game over display: "White Wins!" / "Black Wins!" / "Draw" with reason
- NewGameSheet: modal bottom sheet with mode/difficulty/color pickers
- Replay mode: show historical board state from boardHistory[replayStep]

Include all haptics from `05_UI_AND_DESIGN_SYSTEM.md` section 6.
```

### Prompt 5.2 — OnlineGameView

```
Create `OnlineGameView.swift` — the live multiplayer game screen.

Layout (from `05_UI_AND_DESIGN_SYSTEM.md` section 4.4):
```
VStack {
  NavBar ("← Lobby" back button)
  PlayerBar(player: topPlayer, isCurrentTurn, capturedPieces)
  BoardView(flipped: myColor == "black")
  PlayerBar(player: bottomPlayer, isCurrentTurn, capturedPieces)
  Resign button (for mobile)
}
```

Requirements:
- Wire up to OnlineGameStore via @EnvironmentObject
- On appear: loadGame(gameId), subscribeRealtime(gameId)
- On disappear: unsubscribe()
- PlayerBar: username + ELO + captured pieces + pulsing turn glow
- Turn glow: accent border, pulsing opacity 1.0↔0.4, easeInOut 1s, repeats
- WaitingRoom: shown when status == "waiting" — invite code + copy + cancel
- GameOverOverlay: semi-transparent overlay, "You Won!"/"You Lost"/"Resigned", replay + back buttons
- Board flipped automatically: white at bottom if myColor == "white"

Set myColor based on comparing auth user ID with white_player_id/black_player_id.
```

### Prompt 5.3 — HomeView

```
Create `HomeView.swift` — the landing/marketing screen shown on first launch.

Layout (from `05_UI_AND_DESIGN_SYSTEM.md` section 4.1):

ScrollView, vertical:
1. Logo image (from Assets) + "Raichu" title (large, bold, accent color)
2. Tagline: "Chess-inspired. No luck. 5–15 minutes."
3. Two CTAs: "Play vs AI" (primary, accent green) | "Play Online" (secondary)
4. Stats strip: 4 rounded cards — "5-15 min", "0 luck", "3 pieces", "Free"
5. Piece guide: 3 cards (Pichu/Pikachu/Raichu) with image + name + capture description
6. Capture Hierarchy: visual table showing what each piece can capture
7. How to Play: 3 numbered steps with icons
8. "Start Playing" CTA button

Animations:
- Staggered fade-up: each section appears 0.15s after the previous, from opacity 0 + offset-y 20pt
- Stats cards: count-up animation (AnimatableModifier or Timer, 0→value over 0.8s)
- Piece cards: scale from 0.9→1.0 on appear

Dark background (#1a1a1a), themed accent colors.
Navigation: "Play vs AI" → PlayView, "Play Online" → LobbyView
```

### Prompt 5.4 — LobbyView, HistoryView, LeaderboardView

```
Create three online feature screens:

1. **LobbyView.swift** (requires auth)
   - Quick Match button → MatchmakingStore.joinQueue() → poll → navigate on match
   - "Finding opponent..." with animated dots, cancel button
   - Create Game panel: game type picker (Ranked/Friendly) → POST /games → navigate
   - Join by Code: text field for 6-char code → POST /games/join/:code → navigate
   - Active Games list: show user's waiting/playing games

2. **HistoryView.swift** (requires auth)
   - Segment filter: All | Ranked | Friendly
   - List of completed games from GET /games/my
   - Each row: colored left border (green=won, red=lost, gray=abandoned)
   - Row content: game type + color + move count + date + ELO delta
   - Tap → OnlineGameView in replay mode

3. **LeaderboardView.swift**
   - Fetch profiles ordered by elo_rating DESC (top 50)
   - Top 3: gold/silver/bronze rank icons
   - Current user row: accent highlight
   - Pull-to-refresh

See `05_UI_AND_DESIGN_SYSTEM.md` sections 4.5-4.7.
Dark theme backgrounds, themed accent colors throughout.
```

### Prompt 5.5 — AuthView + ProfileView

```
Create auth and profile screens:

1. **AuthView.swift**
   - Two-tab layout: Sign In | Sign Up
   - Sign In: email + password + "Sign In" button + error label + "Continue as Guest"
   - Sign Up: email + password + username (3-20 chars, alphanumeric+underscores) + "Create Account"
   - Input styling: rounded rect border (#333 idle, accent on focus), secure field with show/hide
   - Sign In with Google: OAuth button
   - Wire to AuthStore

2. **ProfileView.swift** (requires auth)
   - Avatar circle (initials, themed background)
   - Username + ELO rating (large)
   - Stats grid: Wins / Losses / Win rate / Games played
   - ELO chart: line chart using Swift Charts, last 20 games
   - Recent games: last 5 (same format as HistoryView rows)
   - Settings button → SettingsView
   - Sign out button → AuthStore.signOut()

3. **SettingsView.swift** (iOS-only)
   - Theme picker: segmented (Classic | Slate | Walnut)
   - Board orientation: "White at bottom" toggle
   - Sound effects: toggle
   - Haptics: toggle
   - Push notifications: permission prompt button
   - App version in footer

See `05_UI_AND_DESIGN_SYSTEM.md` sections 4.8-4.10.
```

---

## Phase 6: Polish & Production

### Prompt 6.1 — Theme System

```
Create `ThemeConfig.swift` with the complete theme system.

Requirements:
1. ThemeConfig struct with all color properties (board colors, UI colors, accent, text, etc.)
2. Three static instances: .classic, .slate, .walnut
3. All hex values from `05_UI_AND_DESIGN_SYSTEM.md` section 3
4. Color(hex:) extension for initializing from hex strings
5. Make ThemeConfig available via SwiftUI Environment
6. UIStore.theme should drive which ThemeConfig is active

Apply theme colors throughout all views using @EnvironmentObject UIStore.
```

### Prompt 6.2 — Animations & Haptics

```
Implement all animations and haptics specified in `05_UI_AND_DESIGN_SYSTEM.md` sections 5-6.

Animations checklist:
- Piece slide: 260ms, timingCurve(0.25, 0.46, 0.45, 0.94)
- Captured fade: 180ms, easeOut
- Drag lift: 80ms scale 1→1.08
- Snap-back: spring(0.35, 0.7)
- Selection highlight: 100ms easeOut
- Legal move dots: 150ms opacity fade
- Turn glow pulse: 1s easeInOut repeating
- Game over overlay: 300ms opacity fade
- Board flip: 400ms spring + 3D rotation
- Stagger reveal: 150ms per element
- Stats count-up: 800ms easeOut

Haptics:
- Piece pickup: .impact(.medium)
- Valid move: .impact(.light)
- Invalid drop: .notification(.warning)
- Capture: .impact(.heavy)
- Win: .notification(.success)
- Loss: .notification(.error)
- Button: .selection
- Copy: .impact(.light)

Create a HapticManager utility class for centralized haptic triggering.
```

### Prompt 6.3 — Offline Support & Error Handling

```
Implement offline support and error handling:

1. **NetworkMonitor** — NWPathMonitor wrapper, @Published isConnected
   - Show banner "You're offline — online features disabled" when disconnected
   - Disable online tabs/buttons when offline

2. **Offline-capable features** (work without internet):
   - Play vs AI (any difficulty) — engine runs locally
   - Local PvP (pass-and-play)
   - View game rules
   - Browse cached game history (last 20 games in UserDefaults)

3. **Error handling patterns**:
   - API errors → user-facing alerts with retry
   - Realtime disconnection → automatic reconnect + polling fallback
   - Engine errors → catch JS exceptions, fallback to random legal move

4. **Cache strategy**:
   - Cache last 20 game history results in UserDefaults
   - Cache user profile locally for offline display
   - Invalidate caches on successful API fetch
```

### Prompt 6.4 — Push Notifications

```
Implement push notification registration and handling:

1. Request notification permission on first sign-in
2. Register APNs token with: POST /api/v1/notifications/register { token, platform: "ios" }
3. Handle notification types:
   - YOUR_TURN → deep link to /game/:id
   - MATCH_FOUND → deep link to /game/:id
   - GAME_ENDED → deep link to history

4. Deep linking via NavigationStack path-based navigation
5. Badge management: clear badge on app foreground

Note: The backend notification endpoint doesn't exist yet. Create the registration request structure for future implementation.
```

---

## Phase 7: Testing

### Prompt 7.1 — Unit Tests (Engine Bridge + GameStore)

````
Write a complete unit test suite for the Raichu iOS app in `RaichuTests/RaichuTests.swift`.

Framework: Swift Testing (iOS 17+) — use `@Suite`, `@Test`, `#expect(...)`, `#require(...)`.
Import: `import Testing` and `@testable import Raichu`.

Organize into four @Suite groups:

1. **EngineBridgeTests** — tests for `RaichuEngine.shared`
   - `initialBoardIs8x8` — createInitialBoard() returns 8×8 grid
   - `initialBoardHasCorrectPieces` — rows 1/2 white, rows 5/6 black (exact piece chars)
   - `encodeBoardLength` — encodeBoard produces exactly 64 chars
   - `decodeBoardRoundtrip` — encodeBoard then decodeBoard equals original
   - `initialBoardEncoding` — matches "........W.W.W.W..w.w.w.w................b.b.b.b..B.B.B.B........"
   - `noMovesForEmptySquare` — generateMovesForPiece at (0,0) returns []
   - `whitePichuMovesAtStart` — Pichu at (2,1) has exactly 2 moves: (3,0) and (3,2)
   - `blackPichuMovesAtStart` — Pichu at (5,0) has exactly 1 move: (4,1)
   - `pichuCaptureMove` — white Pichu at (2,0) with black Pichu at (3,1) generates capture to (4,2)
   - `pikachuForwardMoves` — Pikachu at (1,0) can reach (2,0) and (3,0)
   - `pikachuCannotCaptureRaichu` — Pikachu adjacent to enemy Raichu has no capture of Raichu
   - `raichuQueenlikeMoves` — Raichu at (3,3) has >10 moves including all 4 cardinal directions
   - `applyMoveUpdatesPiece` — piece is at new position, old position is "."
   - `applyCaptureClearsCapturedSquare` — captured position becomes "."
   - `applyMoveDoesNotMutate` — original board unchanged after applyMove
   - `promotionApplied` — Pichu reaching back rank has "@" or "$" in newBoard
   - `initialBoardIsPlaying` — getGameStatus(initialBoard, "white") == "playing"
   - `whiteWinsWhenBlackHasNoPieces` — encoded board with only white Raichu → "white_wins"
   - `blackWinsWhenWhiteHasNoPieces` — encoded board with only black Raichu → "black_wins"
   - `findBestMoveReturnsValidMove` — findBestMove returns non-nil Move (requires JS bundle)
   - `findBestMoveIsLegal` — returned move's from position is a piece of the current player

2. **GameStoreTests** — `@MainActor` tests for `GameStore`
   - Initialization: board 8×8, white to move, playing status, empty history
   - Selection: selectOwnPiece sets selectedPiece; selectOpponent clears; selectEmpty clears
   - Move execution: changes currentPlayer, appends moveHistory, saves lastMove, appends boardHistory
   - Captured pieces: capturedByWhite/capturedByBlack track correct piece chars
   - Draw detection: quiet move increments halfMovesSinceProgress; capture/promotion resets to 0
   - 50-move rule: setting halfMovesSinceProgress=99 then quiet move → status=="draw", drawReason set
   - Restart: resets all state to initial values
   - newGame: updates gameMode, difficulty, playerColor
  
3. **EngineTypeTests** — `String` extension helpers and `Player` enum
   - isWhitePiece: "w", "W", "@" → true; "b", ".", etc. → false
   - isBlackPiece: "b", "B", "$" → true; "w", ".", etc. → false
   - pieceColor: correct .white/.black/.nil mapping
   - playerOpposite: symmetric
   - gameMoveAsMove: converts from_row/from_col/piece/captured correctly

Board fixtures to define at the top of the file:
```swift
private let INITIAL_BOARD = "........W.W.W.W..w.w.w.w................b.b.b.b..B.B.B.B........"
private let WHITE_WINS_BOARD = "................................@..............................."
private let BLACK_WINS_BOARD = ".....................................$..........................."
private let PRE_PROMOTION_BOARD = "..............................................................w....."
private let PICHU_CAPTURE_BOARD = "................w...............b................................"
private let PIKACHU_QUIET_BOARD = "........W......................................................."
```

For GameStore tests that need a Move, construct synthetic Move objects directly (do not rely on engine output) so tests pass even without JS bundle.

Full specification: `08_TESTING.md` sections 4 and 5.
````

### Prompt 7.2 — UI Tests

```
Write a complete UI test suite in `RaichuUITests/RaichuUITests.swift`.

Framework: XCUITest (XCTest, `final class RaichuUITests: XCTestCase`).

Set up: `continueAfterFailure = false`. Launch app in `setUpWithError`. Nil out app in `tearDownWithError`.

Tests to implement:

1. `testAppLaunchesWithoutCrash` — `app.state == .runningForeground`
2. `testHomeViewTitleIsVisible` — `app.staticTexts["Raichu"].waitForExistence(timeout: 3)`
3. `testHomeViewPlayVsAIButtonExists` — `app.buttons["Play vs AI"]` exists
4. `testNavigateToPlayView` — tap "Play vs AI", verify board or nav element appears within 5s
5. `testPlayViewHasBoardGrid` — navigate to PlayView, verify `app.otherElements["BoardView"]` exists
6. `testPlayViewHasNewGameButton` — "New Game" or settings gear button visible on PlayView
7. `testTappingPieceOnBoardDoesNotCrash` — tap board centre, app still running foreground
8. `testNavigateToProfileTab` — tap Profile tab, verify AuthView or ProfileView visible
9. `testLaunchPerformanceMeasure` — `measure(metrics: [XCTApplicationLaunchMetric()])` cold launch

For cells with accessibility identifiers "cell-R-C" (row R, col C), check their count == 64 when identifiers are set. Fall back gracefully if they're not set yet.

Important:
- All test methods must be `@MainActor`
- Use `waitForExistence(timeout:)` — never hard `sleep()`
- Prefer `XCTAssert(condition, message)` over bare `XCTAssert(condition)` so failures are readable

Full specification: `08_TESTING.md` section 7.
```

### Prompt 7.3 — Xcode Setup Verification

```
After completing all phases and tests, do a final verification pass:

1. Confirm `raichu-engine.js` is present at `Raichu/Engine/raichu-engine.js`
   - If missing: run `pnpm build:ios` from the monorepo root
2. Confirm `raichu-engine.js` is in Xcode's "Copy Bundle Resources" phase
3. Confirm `supabase-swift` package is added and resolves (no red "module not found" errors)
4. Run Cmd+U — all unit tests must pass with the real JS bundle loaded
5. Run UI tests — all 9 tests must pass in simulator
6. Check test report: zero failures, zero skipped, zero crashes

If any engine bridge tests fail with "stub engine":
- The JS bundle is not being loaded — check Copy Bundle Resources and target membership
- Tests that rely on real move generation will fail until bundle is present

See `08_TESTING.md` section 8 for the full pre-commit checklist.
```

---

## Full App Prompt (Single-Shot for Codex)

If you want to give Codex a single comprehensive prompt, use this:

```
Build a native iOS app for "Raichu" — a chess-inspired abstract strategy board game.

TECHNOLOGY:
- SwiftUI, iOS 17+
- JavaScriptCore bridge to TypeScript game engine (bundled as raichu-engine.js)
- supabase-swift SDK for auth, database, and Realtime
- Express REST API at https://raichu.live/api/v1

GAME RULES:
8×8 board, 3 piece types per side:
- Pichu (w/b): moves 1 diag forward, captures Pichu only by jumping 2
- Pikachu (W/B): moves 1-2 forward/left/right, captures Pichu+Pikachu by jumping 2-3
- Raichu (@/$): queen-like movement, captures any by jumping over + landing beyond
- White moves down (row+), Black moves up (row-)
- Promote Pichu/Pikachu to Raichu on back rank
- Win: capture all opponent pieces

ARCHITECTURE:
5 ObservableObject stores (GameStore, OnlineGameStore, AuthStore, MatchmakingStore, UIStore)
JavaScriptCore bridge (RaichuEngine singleton) for all game logic
Supabase for auth (email+password, Google OAuth), database (profiles, games, moves), Realtime
REST API for move submission, matchmaking, game creation

SCREENS:
HomeView (landing), PlayView (offline game), OnlineGameView (multiplayer),
LobbyView, HistoryView, LeaderboardView, ProfileView, AuthView, SettingsView

UI:
3 themes (Classic/Slate/Walnut) with dark backgrounds
Chess.com-style board with piece images, move animations (260ms slide), drag-and-drop
Haptic feedback on all interactions
Turn glow, game over overlay, staggered animations

For complete specifications, reference the documentation in `docs/ios-workbook/`:
- 00_PROJECT_OVERVIEW.md — what Raichu is
- 01_ENVIRONMENT_AND_CONFIG.md — env vars, API keys, Supabase setup
- 02_SUPABASE_COMPLETE.md — database schema, RLS, Realtime, auth
- 03_API_REFERENCE.md — all REST endpoints
- 04_GAME_ENGINE_AND_AI.md — game rules, AI algorithm, JS bridge
- 05_UI_AND_DESIGN_SYSTEM.md — screens, themes, colors, animations, haptics
- 06_STATE_ARCHITECTURE.md — stores, data flow, Swift types
```
