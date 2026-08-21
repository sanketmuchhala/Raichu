# Raichu iOS App

This directory now contains a concrete, phased plan and initial implementation scaffolding for the Raichu iOS app.

## Decision: Native Swift + JavaScriptCore Bridge (v1)
We’ll build a fully native SwiftUI app and bridge to the shared TypeScript engine via JavaScriptCore. This keeps UI truly native and performant while reusing the deterministic, DOM-free game logic from `@raichu/game-engine`.

Rationale:
- Native SwiftUI gives us the best iOS fidelity, haptics, accessibility, and performance.
- We keep a single source of truth for rules/validation in TypeScript.
- Lower risk than a full Swift rewrite; less overhead than React Native for a single-platform iOS target.

If we later need cross‑platform native parity, we can still transition to a full Swift port, guided by the bridge API established here.

## Phased Implementation Plan
The plan below is summarized. A deeper, task-by-task version with acceptance criteria lives at `docs/ios/IMPLEMENTATION_PLAN.md`.

### Phase 0 — Scaffolding (DONE in this commit)
- Create a Swift Package `RaichuKit` that contains:
  - SwiftUI board UI components
  - Game models (board, pieces, moves)
  - Engine bridge scaffolding (JavaScriptCore hooks) and a temporary in-Swift fallback
  - Resource placeholder for the JS engine bundle (`engine.bundle.js`)
- Add previews to iterate on UI without a full app target yet.

### Phase 1 — UI Foundation (Board & Interaction Shell)
- Render a dynamic N×N board with checkered tiles and responsive sizing.
- Display pieces from engine state with selection/highlight states.
- Tap-to-select, tap-to-move shell logic (with visual feedback and basic animations).
- Accessibility labels/traits for board squares and pieces.

### Phase 2 — Engine Bridging (JavaScriptCore)
- Build the TypeScript engine to a JS bundle (`engine.bundle.js`).
- Define a small, stable JS API surface (newGame, getBoard, legalMoves, applyMove).
- Marshal data between Swift and JS (coordinates, piece kinds/owners, moves).
- Replace in-Swift fallback with real engine calls.

### Phase 3 — Rules & UX Polish
- Enforce full move legality and turn progression from the engine.
- Add move highlighting, capture flows, invalid move haptics/sounds.
- Undo/redo stack (local), move list, and per-turn timers (optional).

### Phase 4 — Game Modes
- Local vs Local (pass-and-play).
- Local vs AI (if engine supports it) or simple heuristic bot.
- Persistence of saved games using SwiftData.
### Phase 5 — Production Readiness
- Theming, icons, app metadata.
- Comprehensive accessibility (VoiceOver, Dynamic Type, color contrast).
- Test matrix on devices; performance profiling; crash resiliency.

### Phase 6 — Distribution
- App Store assets; TestFlight; release checklist.

## What’s in this folder now
- `ios/Package.swift` — Swift package manifest for `RaichuKit` (iOS 17+)
- `ios/Sources/RaichuKit/` — Swift sources:
  - `Game/Models.swift` — Core types (board, piece, move)
  - `Engine/RaichuEngine.swift` — Observable engine wrapper, JS bridge hooks, temporary Swift fallback
  - `UI/BoardView.swift` — SwiftUI board rendering & interaction surface
  - `UI/ContentView.swift` — Example composition for previews
- `ios/Resources/engine.bundle.js` — Placeholder JS bundle (to be replaced by the compiled TS engine)
- `ios/Tests/RaichuKitTests.swift` — Initial test using Swift Testing
- `docs/ios/IMPLEMENTATION_PLAN.md` — Detailed phase plan with acceptance criteria

## Running the UI Previews
You can open the Swift package in Xcode and use SwiftUI previews:
1. Open `ios/Package.swift` in Xcode.
2. Navigate to `BoardView.swift` or `ContentView.swift` and start the preview.

An app target will be added once the UI and bridge stabilize (end of Phase 2). The app will depend on `RaichuKit`.

## Engine Integration Notes
- The shared engine must compile to a self-contained JS bundle with a stable global object (e.g., `RaichuEngine`).
- The bridge expects functions: `newGame()`, `getBoard()`, `getTurn()`, `getState()`, `legalMoves(from)`, `applyMove(move)` — details in the docs.
- For now, the Swift fallback provides a basic playable shell so we can iterate on UI/UX while the bundle is wired up.

## TODO (Updated)
- [x] Choose integration approach (Native Swift + JS Bridge)
- [x] Set up project scaffolding (Swift Package `RaichuKit`)
- [x] Implement board UI (initial)
- [x] Add touch-based interaction (selection shell)
- [ ] Integrate shared engine via JS bundle (Phase 2)
- [ ] Replace fallback logic with engine-driven rules
- [ ] Add accessibility, haptics, and polish
- [ ] Add app target and wire to `RaichuKit`
- [ ] Test on physical devices and prepare for TestFlight

