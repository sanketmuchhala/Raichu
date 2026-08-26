# Xcode Setup Guide — Raichu iOS App

> Step-by-step guide to get the app building and running from a fresh clone.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Xcode | 15.0+ | App Store or developer.apple.com |
| pnpm | 8+ | `npm install -g pnpm` |
| Node.js | 18+ | nodejs.org |
| esbuild | via pnpm | installed automatically |

---

## Step 1 — Clone & Install Monorepo Dependencies

```bash
git clone https://github.com/sanketmuchhala/Raichu
cd Raichu
pnpm install
```

---

## Step 2 — Build the JS Engine Bundle

The iOS app uses JavaScriptCore to run the TypeScript game engine on-device. You must build the bundle before running the app.

```bash
pnpm build:ios
```

This runs `scripts/build-ios-engine.sh` and produces:

```
apps/Ios-app/Raichu/Raichu/Engine/raichu-engine.js   (~18 KB)
```

Verify it exists:
```bash
ls -lh apps/Ios-app/Raichu/Raichu/Engine/raichu-engine.js
```

> **Important:** `raichu-engine.js` is gitignored (it's a build artifact). You must run `pnpm build:ios` after every fresh clone and after any change to `packages/game-engine` or `packages/ai-engine`.

### Make it a Build Phase in Xcode (Optional)

To have Xcode auto-rebuild the JS bundle on every build:

1. In Xcode, select the **Raichu** target → **Build Phases**
2. Click **+** → **New Run Script Phase**
3. Drag it to before **Copy Bundle Resources**
4. Set the shell script:
   ```bash
   if [ "${CONFIGURATION}" = "Debug" ]; then
     cd "${SRCROOT}/../../.." && pnpm build:ios
   fi
   ```
5. Set **Input Files**: `$(SRCROOT)/../../../packages/game-engine/src/index.ts`
6. Set **Output Files**: `$(SRCROOT)/Raichu/Engine/raichu-engine.js`

---

## Step 3 — Add Supabase Swift Package

The app requires `supabase-swift` for auth, database queries, and Realtime. This is the only third-party dependency.

1. Open `apps/Ios-app/Raichu/Raichu.xcodeproj` in Xcode
2. **File → Add Package Dependencies...**
3. Enter this URL in the search box:
   ```
   https://github.com/supabase/supabase-swift
   ```
4. Select version rule: **Up to Next Major Version** from `2.0.0`
5. Click **Add Package**
6. In the "Choose Package Products" sheet, check **Supabase** and add to target **Raichu**
7. Click **Add Package**

Verify: `import Supabase` should resolve without error in `SupabaseClient.swift`.

---

## Step 4 — Configure Supabase Keys

The anon key is intentionally excluded from source control. Set it in one of two ways:

### Option A — Xcode Scheme Environment Variable (Development)

1. **Product → Scheme → Edit Scheme...**
2. Select **Run** → **Arguments** tab
3. Under **Environment Variables**, add:
   ```
   SUPABASE_ANON_KEY = eyJ...your-actual-anon-key
   ```
4. In `SupabaseClient.swift`, read it:
   ```swift
   let supabaseKey = ProcessInfo.processInfo.environment["SUPABASE_ANON_KEY"] ?? ""
   ```

### Option B — Configuration File (Recommended)

1. Create `apps/Ios-app/Raichu/Raichu/Config.xcconfig` (gitignored):
   ```
   SUPABASE_ANON_KEY = eyJ...your-actual-anon-key
   ```
2. Add `Config.xcconfig` to the project's build configuration

### Where to Get the Key

Supabase Dashboard → **Settings** → **API** → copy the `anon public` key.
- Project URL: `https://jfqofulsmcjqudwnxekb.supabase.co`
- Dashboard: `https://app.supabase.com/project/jfqofulsmcjqudwnxekb`

> **Never commit the real key.** The placeholder in `SupabaseClient.swift` is `"YOUR_ANON_KEY"`.

---

## Step 5 — Add Piece Images to Assets

The board renders chess.com Neo piece images. Download them and add to `Assets.xcassets`.

### Required Images

| Filename | Piece | Color |
|----------|-------|-------|
| `wp.png` | Pichu | White |
| `bp.png` | Pichu | Black |
| `wr.png` | Pikachu | White |
| `br.png` | Pikachu | Black |
| `wq.png` | Raichu | White |
| `bq.png` | Raichu | Black |

### Download

```bash
BASE="https://images.chesscomfiles.com/chess-themes/pieces/neo/150"
for p in wp bp wr br wq bq; do
  curl -o "apps/Ios-app/Raichu/Raichu/Assets.xcassets/${p}.imageset/${p}.png" \
    "${BASE}/${p}.png"
done
```

### Add to Xcode

For each image:
1. In Xcode Navigator, open `Assets.xcassets`
2. **Editor → Add Assets → New Image Set**
3. Name it exactly `wp`, `bp`, etc.
4. Drag the `.png` into the **1x** slot (they are already 150×150 px)

> The app falls back gracefully if images are missing (shows piece character as text). Offline play works without images.

---

## Step 6 — Verify File Membership in Xcode

All Swift source files should already be in the project (committed as part of Phases 1–6). If any file shows a red icon in the Navigator:

1. Select the file
2. In the File Inspector (right panel) → **Target Membership** → check **Raichu**

The `raichu-engine.js` file specifically must be added to **Copy Bundle Resources**:
1. Select the **Raichu** target → **Build Phases**
2. Open **Copy Bundle Resources**
3. Click **+** and add `Raichu/Engine/raichu-engine.js`

---

## Step 7 — Select Simulator & Run

1. In the Xcode toolbar, select **iPhone 16** (or any iOS 17+ simulator)
2. Press **Cmd+R** to build and run
3. The app should launch to **HomeView** with the board game landing screen

### First Launch Checklist

```
[ ] HomeView loads (logo + "Raichu" title visible)
[ ] "Play vs AI" navigates to PlayView
[ ] Board renders with pieces (not blank or red icons)
[ ] Tapping a piece highlights it and shows legal move dots
[ ] New Game sheet opens from controls panel
[ ] Profile tab shows AuthView (sign in / sign up)
```

---

## Step 8 — Run Tests

```bash
# In Xcode
Cmd+U

# Or from terminal
xcodebuild test \
  -scheme Raichu \
  -destination 'platform=iOS Simulator,name=iPhone 16'
```

All tests should pass. See `08_TESTING.md` for the full test plan.

---

## Troubleshooting

### "No such module 'Supabase'"
→ Supabase package not added. Repeat Step 3.

### Board shows empty squares / stub positions
→ `raichu-engine.js` missing or not in Copy Bundle Resources. Repeat Steps 2 and 6.

### "YOUR_ANON_KEY" error / auth fails
→ Supabase key not configured. Repeat Step 4. Offline features (vs AI, local PvP) work without a key.

### Piece images show initials fallback
→ Images not in `Assets.xcassets`. Repeat Step 5. This does not prevent the app from running.

### Build error: "Cannot find type 'RealtimeChannel'"
→ Supabase package version mismatch. Ensure version 2.0.0+.

### "raichu-engine.js" changed but moves are stale
→ Run `pnpm build:ios` again and re-run the app. Xcode may cache the old bundle; clean with **Product → Clean Build Folder** (Cmd+Shift+K) then rebuild.

---

## Environment Summary

| Variable | Value | Where set |
|----------|-------|-----------|
| `SUPABASE_URL` | `https://jfqofulsmcjqudwnxekb.supabase.co` | Hardcoded in `SupabaseClient.swift` |
| `SUPABASE_ANON_KEY` | `eyJ...` | Xcode scheme env var or xcconfig (NOT in source) |
| `API_BASE_URL` (dev) | `http://localhost:3001/api/v1` | `APIClient.swift` |
| `API_BASE_URL` (prod) | `https://raichu.live/api/v1` | `APIClient.swift` |

Switch between dev/prod API by changing `APIClient.baseURL`. A `Configuration.swift` file with `#if DEBUG` is the cleanest approach for a permanent solution.
