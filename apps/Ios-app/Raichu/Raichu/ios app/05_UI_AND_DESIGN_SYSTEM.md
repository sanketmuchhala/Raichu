# UI & Design System

> Every screen, component, theme, color, animation, and haptic for the iOS app.

---

## 1. App Logo

The Raichu logo is a stylized chess queen crown on a dark background.

- Source file: `ios app/assets/raichu logo.png` (13.5 KB)
- Used in: HomeView title area, app icon, splash screen

---

## 2. Navigation Structure

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
└── SettingsView                 (iOS only)
```

**Tab Bar (bottom, iOS convention):**
- **Play** (gamecontroller icon) → PlayView
- **Online** (network icon) → LobbyView (requires auth)
- **History** (clock icon) → HistoryView (requires auth)
- **Profile** (person icon) → ProfileView / AuthView

---

## 3. Themes

Three themes, identical to web. Dark background everywhere. Accent color varies by theme.

### Classic Theme
```swift
ThemeConfig(
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
    accent:            Color(hex: "769656"),    // chess.com green
    accentHover:       Color(hex: "638048"),
    border:            Color(hex: "333333"),
    shadow:            Color.black.opacity(0.4),
    btnSecondaryBg:    Color(hex: "2e2e2e"),
    btnSecondaryHover: Color(hex: "383838")
)
```

### Slate Theme
```swift
ThemeConfig(
    boardLight:        Color(hex: "DEE3E6"),
    boardDark:         Color(hex: "8CA2AD"),
    selected:          Color(hex: "64B4FF").opacity(0.4),
    legalMove:         Color.black.opacity(0.2),
    captureIndicator:  Color(hex: "EF4444").opacity(0.4),
    lastMove:          Color(hex: "64B4FF").opacity(0.2),
    bgPrimary:         Color(hex: "0f172a"),
    bgSecondary:       Color(hex: "0b1120"),
    bgPanel:           Color(hex: "1e293b"),
    textPrimary:       Color(hex: "f1f5f9"),
    textSecondary:     Color(hex: "94a3b8"),
    accent:            Color(hex: "3b82f6"),    // blue
    accentHover:       Color(hex: "2563eb"),
    border:            Color(hex: "334155"),
    shadow:            Color.black.opacity(0.3),
    btnSecondaryBg:    Color(hex: "334155"),
    btnSecondaryHover: Color(hex: "475569")
)
```

### Walnut Theme
```swift
ThemeConfig(
    boardLight:        Color(hex: "EDE0C8"),
    boardDark:         Color(hex: "A67B5B"),
    selected:          Color(hex: "FFC832").opacity(0.4),
    legalMove:         Color.black.opacity(0.2),
    captureIndicator:  Color(hex: "DC2626").opacity(0.4),
    lastMove:          Color(hex: "FFC832").opacity(0.2),
    bgPrimary:         Color(hex: "1c1410"),
    bgSecondary:       Color(hex: "14100c"),
    bgPanel:           Color(hex: "2a1f18"),
    textPrimary:       Color(hex: "efebe9"),
    textSecondary:     Color(hex: "a1887f"),
    accent:            Color(hex: "e07040"),    // warm orange
    accentHover:       Color(hex: "c05a30"),
    border:            Color(hex: "3e2e23"),
    shadow:            Color.black.opacity(0.3),
    btnSecondaryBg:    Color(hex: "3e2e23"),
    btnSecondaryHover: Color(hex: "5d4037")
)
```

---

## 4. Screen Specifications

### 4.1 HomeView (Landing)

**Layout (ScrollView, vertical):**
1. Logo + title "Raichu" (large, bold)
2. Tagline: "Chess-inspired. No luck. 5–15 minutes."
3. Two CTAs: "Play vs AI" (primary, accent green) | "Play Online" (secondary)
4. Stats strip: 4 cells — "5-15 min", "0 luck", "3 piece types", "Free"
5. Piece guide: 3 cards (Pichu/Pikachu/Raichu) with icon + name + capture rule
6. Capture Hierarchy: visual table with arrows
7. How to Play: 3 numbered steps
8. "Start Playing" CTA button

**Animations:**
- Staggered fade-up (0.15s delay between sections)
- Stats: count-up animation (0 → value over 0.8s)
- Piece cards: scale-in (0.9 → 1.0 on scroll reveal)

### 4.2 PlayView (Offline Game)

```
VStack {
  NavBar (back + title + settings)
  CapturedPiecesRow(pieces: topCaptured)
  BoardView(flipped: boardFlipped)
  CapturedPiecesRow(pieces: bottomCaptured)
  HStack {
    GameInfoPanel
    Spacer
    ReplayControls (when moves exist)
  }
  MoveHistoryPanel (collapsible)
  ControlsPanel (New Game | Restart | Flip)
}
```

**Interactions:**
- Tap piece → highlight + legal move dots (60% opacity circles) + capture rings (red)
- Tap legal target → slide animation
- Long-press → drag with haptic (medium impact)
- Drag to legal → move; drag to illegal → snap-back with spring animation

**Bot thinking:**
- Spinner overlay on board (40% opacity black)
- Board interaction disabled
- "Thinking..." in GameInfoPanel

### 4.3 BoardView (Core Component)

```swift
struct BoardView: View {
    let board: [[String]]
    let selectedPiece: Position?
    let legalMoves: [Move]
    let lastMove: Move?
    let flipped: Bool
    let canInteract: Bool
    var onTap: (Position) -> Void
    var onDrop: (Position, Position) -> Void
}
```

**Geometry:**
- Board fills available width (GeometryReader)
- 8×8 grid, each square = boardWidth / 8
- 20pt coordinate margins (left + bottom)

**Square Colors (Classic):**
- Light: `#F0D9B5`
- Dark: `#B58863`
- Selected: `rgba(255,215,0,0.4)` overlay
- Legal move: `rgba(0,0,0,0.2)` circle
- Capture ring: `rgba(220,50,50,0.45)` stroke
- Last move: `rgba(255,215,0,0.2)` overlay

**Piece Images (bundle locally):**
```
w (Pichu)    → wp.png  |  b (Pichu)    → bp.png
W (Pikachu)  → wr.png  |  B (Pikachu)  → br.png
@ (Raichu)   → wq.png  |  $ (Raichu)   → bq.png
```

**Coordinate Labels:**
- `flipped = true` (default): 'a' on left, '1' at bottom (white's perspective)
- Row labels: `flipped ? i + 1 : 8 - i`
- Col labels: `flipped ? COL_LABELS[7 - i] : COL_LABELS[i]`

### 4.4 OnlineGameView

```
VStack {
  NavBar ("← Lobby" back button)
  PlayerBar(player: topPlayer, color: topColor, capturedPieces: topCaptured)
  BoardView(flipped: myColor == "black")
  PlayerBar(player: bottomPlayer, color: bottomColor, capturedPieces: bottomCaptured)
  [mobile: resign button]
}
// iPad: board + sidebar side-by-side
```

**PlayerBar:** Username + ELO + captured pieces + turn glow (pulsing accent border)

**GameOverOverlay:**
- Semi-transparent dark overlay
- "You Won!" (green) or "You Lost" (muted)
- "Resigned" if abandoned
- Replay + "Back to Lobby" buttons

**WaitingRoom (status == "waiting"):**
- "Waiting for opponent..."
- Invite code (monospace, large, copy button)
- Animated dots / spinner
- Cancel button

### 4.5 LobbyView (Requires Auth)

1. **Quick Match** → POST `/matchmaking/queue` → poll → navigate
2. **Create Game** → game type picker → POST `/games` → navigate
3. **Join by Code** → text field → POST `/games/join/:code` → navigate
4. **Active Games** list

### 4.6 HistoryView (Requires Auth)

- Segment filter: All | Ranked | Friendly
- Game rows: colored left border (green=won, red=lost, gray=abandoned)
- Tap → replay mode in OnlineGameView

### 4.7 LeaderboardView

- Top 3: gold/silver/bronze icons
- Current user: accent highlight
- Pull-to-refresh

### 4.8 ProfileView

- Avatar (initials circle) + username + ELO
- Stats: Wins / Losses / Win rate / Games played
- ELO chart (Swift Charts, last 20 games)
- Recent games (last 5)
- Settings + Sign out

### 4.9 AuthView

Two tabs: Sign In | Sign Up

**Sign In:** Email + password + "Sign In" button + error label + "Continue as Guest"
**Sign Up:** Email + password + username (3–20 chars, alphanumeric + underscores) + "Create Account"

### 4.10 SettingsView (iOS-only)

- Theme: Classic | Slate | Walnut (segmented)
- Board orientation: "White at bottom" toggle
- Sound effects: on/off
- Haptics: on/off
- Push notifications permission prompt
- App version in footer

---

## 5. Animations Checklist

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
| Board flip | "Flip" tapped | 400ms | `spring(response: 0.4, dampingFraction: 0.85)` (3D Y-axis) |
| Stagger reveal | Screen appear | 150ms per element | `easeOut` |
| Stats count-up | HomeView appear | 800ms | `easeOut` |
| Replay step | Nav arrow tap | 100ms fade | `easeInOut` |

**Board flip 3D implementation:**
```swift
.rotation3DEffect(
    .degrees(boardFlipped ? 180 : 0),
    axis: (x: 0, y: 1, z: 0),
    perspective: 0.5
)
// Pieces must counter-rotate to stay readable
```

---

## 6. Haptics

| Event | Feedback Type |
|-------|--------------|
| Piece picked up | `.impact(.medium)` |
| Piece placed (valid) | `.impact(.light)` |
| Invalid drop / snap-back | `.notification(.warning)` |
| Capture | `.impact(.heavy)` |
| Game over (win) | `.notification(.success)` |
| Game over (loss) | `.notification(.error)` |
| Button tap | `.selection` |
| Copy invite code | `.impact(.light)` |

---

## 7. Component Reference

### CapturedPiecesRow
```swift
struct CapturedPiecesRow: View {
    let pieces: [String]  // piece chars captured
    // Sort: Pichu first, then Pikachu, then Raichu
    // Images: 22pt, 78% opacity
    // Min height: 26pt
}
```

### MoveHistory Panel
- Paired rows: move number | white | black
- Tap any move → enters/sets replay step
- Navigation: ⏮ ◀ ▶ ⏭
- "Reviewing" badge + "Live" button in replay mode
- Auto-scrolls to latest when not in replay
- Collapsible on iPhone (modal sheet), always visible on iPad

### GameInfoPanel
- Color dot + "White to move" / "Bot thinking..."
- Mode: "vs AI (Medium)" or "PvP"
- Move counter: "Move 12"
- Spinner when `isThinking`

### ControlsPanel
- **New Game** (primary, accent) → NewGameSheet
- **Restart** (secondary)
- **Flip Board** (secondary)
- **Theme** segmented control

### NewGameSheet (modal bottom sheet)
- Segmented: vs AI | vs Friend
- If vs AI: difficulty picker (Easy/Medium/Hard), color picker (White/Black/Random)
- Confirm button

---

## 8. Key Differences From Web

| Feature | Web | iOS |
|---------|-----|-----|
| Piece images | CDN fetch | Bundled locally |
| State management | Zustand stores | `@ObservableObject` + `@Published` |
| Board rendering | SVG element | Custom SwiftUI View + Canvas |
| Animation | Framer Motion | SwiftUI animations + UIKit haptics |
| Realtime | `supabase-js` channel | `supabase-swift` channel |
| Auth | Supabase session cookie | Supabase JWT in Keychain |
| Routing | Next.js App Router | NavigationStack |
| Theming | CSS variables | `ThemeConfig` struct via Environment |
| Board flip default | `boardFlipped: true` | Same |
| Drag & drop | Mouse events | Gesture recognizers with haptics |
| Offline | Limited | Full offline play (AI + local PvP) |

---

## 9. Offline Support

Works without internet:
- Play vs AI (any difficulty)
- Local PvP (pass-and-play)
- View game rules
- Browse cached game history (last 20 games in UserDefaults/CoreData)

Requires connection:
- Matchmaking, live games, leaderboard, profile sync

Banner: "You're offline — online features disabled" when `NetworkMonitor.isConnected == false`
