# iOS redesign — status and resume point

**Status:** Working state. Paused 2026-08-26, mid-accessibility-pass.

This file is the resume point for the iOS redesign. Read it together with the
[master prompt](ios-redesign-master-prompt.md) (the design contract and build
commands) and [the canonical platform guide](ios.md).

---

## Where this stands

The redesign itself is **feature-complete and builds warning-clean**. What was
still open when this session started was the *verification* step the master prompt
defines — step 4, "run the UI-review and accessibility skills over anything you
changed" — which had never been run. Most of this session went into that.

| Check | State |
|---|---|
| `pnpm build` / `pnpm test` / `pnpm build:ios` | Passing |
| `pnpm docs:check` (CI) | Passing — was **failing** before this session |
| Xcode build | Succeeds, no warnings |
| `BoardInteractionUITests` | Passing (~24s) |
| `RedesignScreenshotUITests` | Passing (~94s) |
| `AccessibilityAuditUITests` | 4 of 6 verified passing individually; **full-suite run never completed** — see Pending |

---

## Done in this session

### 1. CI was broken — fixed

`pnpm docs:check`, which the last commit (`5c1b1a3`) wired into CI, failed with 3
errors: the docs reorg moved `Raichu/ios app/*.md` into `docs/ios-workbook/` but
`apps/Ios-app/Raichu/README.md` still linked to the old paths. Fixed, plus the
stale "stored with the Xcode project" prose in `docs/ios.md`.

### 2. Canonical docs never learned about the redesign — fixed

`docs/platforms/ios.md` is named by both `CLAUDE.md` and the master prompt as the
first thing to read, and its "UI system" section still described the *pre-redesign*
app. It had zero mentions of `DesignSystem`, `BoardGeometry`, `Components`,
`GameCoach`, `MoveHistoryPanel`, `NewGameSheet`, `PlayerBar`, `GameResultModal`,
`MoveNotation` or `Constants`. An agent following instructions would have
re-declared inline padding and re-derived board maths — exactly what the design
contract forbids. That section is now written: layer diagram, token/component/
board/screen tables, the rationale behind per-square tap targets and the flight
overlay, and the verified web-divergence note.

### 3. Version drift — fixed

Real `IPHONEOS_DEPLOYMENT_TARGET` is **26.2**. `CLAUDE.md`'s iOS section said so,
but its own repo-structure block, `docs/platforms/ios.md`,
`docs/architecture/system-design.md` and the iOS README all still said "iOS 17+".
Aligned. The historical workbook and the decision log were left alone on purpose.

### 4. A documentation trap — corrected

`CLAUDE.md` and the master prompt said motion uses "**exactly** two curves and no
springs", but `BoardView` uses `.easeOut`/`.easeIn` in two places. Checked
`globals.css` before assuming a bug: the web's own keyframes are
`last-move-in 180ms ease-out` and `turn-glow 2s ease-in-out`. **The code is right
and the rule as written was wrong** — following it literally would have broken the
parity it claims to protect. Both files now say: no springs, and no curve the web
does not also use for that animation.

### 5. Real bug — board orientation never persisted

`UIStore.boardFlipped` is presented in Settings next to Theme and Haptics, both of
which persist, and both `CLAUDE.md` and the canonical doc claimed it persisted. It
had no `didSet` and was never read in `init`, so the preference reset on every
launch. Fixed with the same `object(forKey:) as? Bool ?? true` pattern the haptics
setting uses (`bool(forKey:)` would invert the default on an unset key).

### 6. Accessibility pass — the actual missing work

Added `RaichuUITests/AccessibilityAuditUITests.swift`: one
`performAccessibilityAudit` per screen/state, `continueAfterFailure = true`,
accepted findings filtered individually with reasons. The first run failed on
**every** screen. Fixed from that evidence:

| Finding | Fix |
|---|---|
| Dynamic Type unsupported — result title, score | `Typography.displayTitle` (defined but **completely unused**) and a `.title`-relative rounded score |
| Dynamic Type unsupported — sheet card details (hard 10pt) | new `Typography.captionSmall` token rather than another hand-rolled size |
| Hit area too small | Coach dismiss 28→44, move transport 32→44, result close 32→44, result secondary 34→44, password reveal and "Continue as Guest" →44 |
| Text clipped | Dock labels, coach tip, sheet title, badges, move-list header — wrap instead of truncate at accessibility sizes |
| **Label not human-readable** | `crown.fill` was being spoken by VoiceOver as "crown dot fill"; it is decorative next to the wordmark |
| Reduce Motion not honoured | 5 ungated `withAnimation` calls in `MoveHistoryPanel` / `NewGameSheet`; the web zeroes *all* animation under `prefers-reduced-motion` (globals.css:1036) |
| `TurnDot` resting scale | Gated on the pulse flag, so Reduce Motion left it permanently 14% undersized |

---

## Pending

1. **Finish the audit suite run.** `testPlayScreenAudit`, `testPlayScreenAfterMoveAudit`,
   `testAuthAudit` and `testNewGameSheetAudit` were each verified passing, but a
   clean end-to-end run of all six was interrupted and never completed.
   `testGuideAudit` and `testLobbyAudit` have not been seen green since the fixes.
   Run them on a **freshly reset simulator** and confirm.

2. **Simulator wedges on long audit runs.** Consecutive audit tests degrade the
   simulator until XCUITest fails with `kAXErrorIPCTimeout` /
   `Timed out waiting for AX loaded notification`. Symptoms are misleading: a test
   that passes in 24s alone can take 325s and fail. Reset between runs:
   ```bash
   xcrun simctl shutdown all
   killall -9 com.apple.CoreSimulator.CoreSimulatorService
   ```
   Consider a dedicated nightly test plan rather than folding audits into CI.

3. **Accent contrast — product decision, not an iOS fix.** `theme.accent`
   (`#769656`) against its own tint, and white on the accent, measure ≈3.4:1:
   clears 3:1 for large text, fails 4.5:1 for body text. The accent is mirrored
   from `apps/web/src/lib/themes.ts` and is canonical, so this spans both clients.
   Filtered in `isAccepted` with a `TODO(contrast)`.

4. **Transient layout glitch after the bot's reply.** A screenshot caught the board
   overlapping the bottom player bar with its coordinate labels bleeding through,
   at the instant the coach unmounts and the move list mounts. Element frames at
   t+1.5s/t+3s/t+8s were identical to settled, so it is **transient, not a
   persistent defect** — left alone rather than restructuring a working layout.
   Worth another look if it ever shows up in a settled frame.

5. **`import Combine` in 7 store/networking files**, which `CLAUDE.md` forbids.
   Pre-existing, not introduced by the redesign; SwiftUI re-exports what they
   actually use. Left alone as out of scope.

6. **Lobby dead end.** The unauthenticated Online tab says "Sign in to play online"
   with no sign-in button. Out of scope per the master prompt's "no layout
   redesign" rule for Lobby, but it is a real dead end.

7. **`testLaunchPerformanceMeasure`** (pre-existing) runs 5 launch iterations and
   dominates the suite — a full `RaichuUITests` run exceeded 25 minutes.

---

## Resume checklist

```bash
# monorepo
pnpm build && pnpm test && pnpm build:ios && pnpm docs:check

# iOS
cd apps/Ios-app/Raichu
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
xcodebuild build -project Raichu.xcodeproj -scheme Raichu \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro'

# reset the simulator first, then the audits
xcrun simctl shutdown all; killall -9 com.apple.CoreSimulator.CoreSimulatorService
xcodebuild test -project Raichu.xcodeproj -scheme Raichu \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  -only-testing:RaichuUITests/AccessibilityAuditUITests
```

Findings land as test attachments — extract with
`xcrun xcresulttool export attachments --path <...>.xcresult --output-path ./att`.

The Apple skills library the master prompt refers to is at
`~/.claude/plugins/marketplaces/indie-apple-stack/skills/`; `ios/ui-review/`,
`ios/accessibility-audit/` and `design/game-feel/` are the relevant ones here.
