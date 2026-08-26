# iOS redesign — master prompt

**Status:** Re-runnable working prompt for the Raichu iOS UI.

Paste the block below into Claude Code (or any agent with shell + file access) to
continue the iOS redesign. It encodes the design contract, the build commands that
actually work on this machine, and the verification loop that catches the failures
a green build does not.

Everything below the rule is the prompt.

---

You are continuing the Raichu iOS redesign. The goal is **visual and interaction
parity with the web app, built with idiomatic SwiftUI** — the two clients should
read as siblings, not as a port.

## Read these first

The Apple skills library is cloned at
`~/.claude/plugins/marketplaces/indie-apple-stack/skills/`. Read the relevant
`SKILL.md` files directly as files — do not assume the plugin is enabled.

| Task | Skill |
|---|---|
| Run the app and screenshot it | `ios/run-simulator/` |
| HIG, Dynamic Type, VoiceOver | `ios/ui-review/`, `ios/accessibility-audit/` |
| Haptics, celebration, feedback audit | `design/game-feel/` |
| Animation APIs and transitions | `design/animation-patterns/` |
| Type scale, SF Symbols | `design/typography/`, `design/sf-symbols/` |
| Layout, state flow | `swiftui/layout/`, `swiftui/data-flow/` |
| Swift idioms, concurrency | `ios/coding-best-practices/`, `swift/concurrency-patterns/` |

Then read `CLAUDE.md`, `docs/platforms/ios.md`, and `docs/platforms/web.md`.

## The design contract

**The web is canonical.** When iOS and web disagree on a token, value, or
behaviour, the web wins — except where the web is demonstrably wrong (see
"Known web divergence" below).

- **Colour** lives in `Views/Shared/ThemeConfig.swift`, mirroring
  `apps/web/src/lib/themes.ts`. Three themes: Classic (accent `#769656`),
  Slate (`#3b82f6`), Walnut (`#e07040`). Board `#F0D9B5` / `#B58863`.
- **Everything else** lives in `Views/Shared/DesignSystem.swift`: `Spacing`,
  `Radius`, `Elevation`, `Motion`, `Alpha`, `Typography`.
- **Motion uses exactly two curves and no springs**, matching
  `apps/web/src/app/globals.css`:
  - `Motion.arrive` = `cubic-bezier(0.16, 1, 0.3, 1)` — arrivals, dialogs, piece
    slides, drag settles.
  - `Motion.press` = `cubic-bezier(0.2, 0.8, 0.2, 1)` — presses, legal-move dots.
  A SwiftUI spring reads visibly bouncier than the web and breaks the family
  resemblance. Do not introduce one.
- **Never re-declare padding, corner radius, or a background inline in a screen.**
  Use `.panelCard(theme:)`, `.raichuButton(_:theme:)`, `Badge`, `Avatar`,
  `TurnDot`, `RaichuSegmentedControl` from `Views/Shared/Components.swift`.
- **Type is SF Pro**, not the web's Figtree — Dynamic Type and VoiceOver sizing
  come free and SF tracks Figtree closely at UI sizes. Use `Typography`.
- Piece art is the Chess.com Neo/150 set, bundled. `w→wp b→bp W→wr B→br @→wq $→bq`.
  Never substitute unicode chess glyphs.
- The bot is named **Jarvis** (`BotIdentity.name`, mirroring the web's `BOT_NAME`).

## Board invariants

`Views/Shared/BoardGeometry.swift` owns the maths. Do not re-derive it inline.

- Proportions match the web SVG: a 512pt board with 20pt gutters left, top and
  bottom — `532 x 552`.
- **`flipped == true` means White's home rank is at the bottom**, and it is the
  default (`UIStore.boardFlipped`). This matches the web's `boardFlipped`. Flipping
  is a 180-degree rotation, so the same involution maps both axes both ways.
- **Notation is `{row: 0, col: 0} == a8`** (`docs/game/rules-and-notation.md`):
  file is `abcdefgh[col]`, rank is `8 - row`. `Notation` in `BoardGeometry.swift`
  is the only place this should be written down.
- Squares are tapped through the per-square targets in `tapTargets(_:)`, not by
  hit-testing a container gesture. This is deliberate — see "Traps" below.
- Piece size is `square * 0.9375` (the web's 60/64).

## Game rules that trip people up

- Pichu moves and captures **diagonally forward**, not straight forward. A test or
  fixture that assumes a straight advance will silently do nothing.
- White moves **down** (+row) from rows 1–2; Black moves **up** (-row) from rows 5–6.
  Rows 0 and 7 start empty and are the promotion ranks.
- There is **no king, no check, no clocks, and no promotion picker.** Do not build
  them; the engine auto-promotes and the win condition is capturing all pieces.
- Capture hierarchy: Pichu takes Pichu; Pikachu takes Pichu and Pikachu; Raichu
  takes anything. Raichu captures by **jumping**, so the captured piece is not
  always on the destination square — always read `move.captured.position`.

## Build and run

`xcode-select` points at CommandLineTools, so pass the developer dir explicitly.
No `sudo` needed.

```bash
cd apps/Ios-app/Raichu
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer

# Build — must stay warning-clean
xcodebuild build -project Raichu.xcodeproj -scheme Raichu \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro'

# Unit tests (fast)
xcodebuild test -project Raichu.xcodeproj -scheme Raichu \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -only-testing:RaichuTests

# UI tests (slow — each test relaunches the app; run in the background)
xcodebuild test -project Raichu.xcodeproj -scheme Raichu \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -only-testing:RaichuUITests
```

The project uses `PBXFileSystemSynchronizedRootGroup`: **new files under `Raichu/`
compile automatically**, and nothing under that folder can be excluded from the
bundle. Never put docs or loose assets there.

Do not touch `scripts/build-ios-engine.sh`, `scripts/ios-engine-entry.ts`, or the
8 engine export names — `RaichuEngine.swift` calls them by string, so a rename
breaks the app with no compile error. Verify the monorepo separately with
`pnpm build && pnpm test && pnpm build:ios`.

## Verification — a green build is not a pass

**You must look at the running app.** Every regression found during this redesign
was invisible to the compiler: a board that rendered nothing, an orientation that
was upside down, taps that stopped working after the first one.

1. Build, install, launch, screenshot, and **read the screenshot back**:
   ```bash
   xcrun simctl boot 'iPhone 17 Pro' 2>/dev/null || true
   xcrun simctl install 'iPhone 17 Pro' <path>/Raichu.app
   xcrun simctl launch 'iPhone 17 Pro' Sanket-Muchhala-s-Org.Raichu
   sleep 4 && xcrun simctl io 'iPhone 17 Pro' screenshot --type=png shot.png
   ```
   Screenshot immediately after install and you will catch a mid-launch white
   frame. Wait, then re-capture. A blank or crashed frame is a failure.
2. **Drive interactions with a UI test**, not by eye. `simctl` cannot tap.
   `RaichuUITests/BoardInteractionUITests.swift` finds the board by its
   `"Game board"` accessibility label, computes square centres from its frame, and
   attaches screenshots. Extract them with:
   ```bash
   xcrun xcresulttool export attachments --path <...>.xcresult --output-path ./att
   ```
   `manifest.json` maps the attachment names to files.
3. Verify orientation against the engine, not against intuition:
   ```bash
   node -e "eval(require('fs').readFileSync('apps/Ios-app/Raichu/Raichu/Engine/raichu-engine.js','utf8'));
            RaichuEngine.createInitialBoard().forEach((r,i)=>console.log(i, r.join('')))"
   ```
4. Run the UI-review and accessibility skills over anything you changed: 44pt
   targets, Dynamic Type, VoiceOver labels, and `accessibilityReduceMotion`
   honoured (the web zeroes all animation under `prefers-reduced-motion`).

## Traps this codebase has already sprung

- **A container `DragGesture(minimumDistance: 0)` doing its own hit-testing loses
  taps** — the first one lands, every one after it is swallowed by the enclosing
  `TabView`. Composing it with a tap via `.exclusively(before:)` does not fix it.
  Per-square tap targets do, and they give VoiceOver something real to select.
- **`withAnimation` issued from `onAppear` during the first layout pass is
  dropped.** Defer it: `.task { await Task.yield(); withAnimation { … } }`. And
  never gate a view's *opacity* on an entrance flag — if the flag never flips, the
  view is invisible rather than slightly small.
- **`[[String]]` boards carry no stable piece identity**, so SwiftUI cannot animate
  a move by diffing them. Piece slides come from the explicit flight overlay in
  `BoardView`, ported from the web's `PieceMoveOverlay.tsx`. Duration is
  distance-aware: `min(0.24, 0.135 + squares * 0.018)`.
- **Suppress the flight for drag moves** — the piece is already under the finger.
- **Xcode 26 synchronised folders bundle everything under `Raichu/`.** Ten markdown
  files and a PNG were shipping inside the app before they were moved to `docs/`.
- **Watch for invisible characters in `Info.plist`.** The OAuth URL scheme
  contained two U+200B zero-width spaces where the dots belonged, so Google
  Sign-In could never return to the app. Check with
  `python3 -c "print([hex(b) for b in open('Raichu/Info.plist','rb').read() if b>127])"`.

## Known web divergence

The web's board **coordinate labels are inverted in its default orientation**
(`boardFlipped: true`): `Board.tsx` draws rank `i + 1` and file `COL_LABELS[7 - i]`
against board row/col `i`, so the labels disagree with the move notation shown in
its own move list. iOS deliberately does **not** copy this — `Notation` renders the
canonical `a8` mapping so coordinates and move history agree. Fixing the web is
tracked separately; do not "restore parity" by re-introducing the bug.

## Out of scope unless asked

Lobby, History, Leaderboard, Profile, Settings and Auth get the shared token and
component layer only — no layout redesign. No new Rules / How-to-Play screens.
Do not modify `apps/web`, `apps/api`, or `packages/`.
