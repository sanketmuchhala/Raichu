# Environment Variables & Configuration

> Every environment variable, API key, and configuration value needed to run the Raichu iOS app.

---

## 1. Supabase Project

**Project Reference:** `jfqofulsmcjqudwnxekb`
**Dashboard:** `https://app.supabase.com/project/jfqofulsmcjqudwnxekb`

### iOS App Configuration

```swift
// SupabaseClient.swift
import Supabase

let supabase = SupabaseClient(
    supabaseURL: URL(string: "https://jfqofulsmcjqudwnxekb.supabase.co")!,
    supabaseKey: "YOUR_ANON_KEY"  // Use the anon key, NOT the service role key
)
```

### Required Keys

| Key | Where to find | Used for |
|-----|--------------|----------|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API | All Supabase SDK calls |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → `anon public` | iOS client (RLS-enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` | **API server only** — never embed in iOS app |

### Environment Variable Templates

**iOS App (stored in Xcode scheme or Info.plist — NOT in source code):**
```
SUPABASE_URL=https://jfqofulsmcjqudwnxekb.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key
API_BASE_URL=https://raichu.live/api/v1
```

**Existing Web Frontend (`apps/web/.env.local`):**
```
NEXT_PUBLIC_SUPABASE_URL=https://jfqofulsmcjqudwnxekb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=https://raichu.live
```

**Existing API Server (`apps/api/.env`):**
```
SUPABASE_URL=https://jfqofulsmcjqudwnxekb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...service-role-key
PORT=3001
NODE_ENV=development
```

---

## 2. API Server Configuration

| Setting | Value |
|---------|-------|
| Base URL (production) | `https://raichu.live/api/v1` |
| Base URL (development) | `http://localhost:3001/api/v1` |
| Port | `3001` |
| Auth header | `Authorization: Bearer <supabase_access_token>` |

The Next.js `rewrites` config proxies `/api/*` to the Express API URL, so the browser only sees a single origin. For iOS, make direct API calls to the Express server URL.

---

## 3. Supabase SDK Dependency

**Package.swift dependency:**
```swift
.package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0")
```

This is the **only** third-party iOS dependency needed. SwiftUI handles everything else natively.

---

## 4. JavaScript Engine Bundle

The TypeScript game engine must be compiled to a single JS file for JavaScriptCore:

```bash
# Build command (run during CI/CD or as Xcode build phase)
cd packages/game-engine && pnpm build
cd packages/ai-engine  && pnpm build

# Bundle both into a single IIFE
esbuild packages/game-engine/src/index.ts packages/ai-engine/src/index.ts \
  --bundle --format=iife --global-name=RaichuEngine \
  --outfile=apps/ios/Sources/Engine/raichu-engine.js
```

The output `raichu-engine.js` goes into the Xcode project as a bundled resource.

---

## 5. Piece Image Assets

**Web uses chess.com CDN:**
```
https://images.chesscomfiles.com/chess-themes/pieces/neo/150/
```

**iOS must bundle locally for offline support:**

| Piece | White file | Black file |
|-------|-----------|-----------|
| Pichu (pawn) | `wp.png` | `bp.png` |
| Pikachu (rook) | `wr.png` | `br.png` |
| Raichu (queen) | `wq.png` | `bq.png` |

Download these from the chess.com CDN and add to `Assets.xcassets`.

---

## 6. App Store Configuration

| Field | Value |
|-------|-------|
| Bundle ID | `com.raichugame.ios` |
| Category | Games → Board |
| Age Rating | 4+ |
| Minimum iOS | 17.0+ |
| Privacy | No tracking. Auth data stored in Supabase. No third-party analytics. |
| Keywords | chess, strategy game, abstract, board game, two player, no luck |

---

## 7. Push Notifications (APNs)

For push notifications (YOUR_TURN, MATCH_FOUND, GAME_ENDED):
1. Register APNs token on first sign-in
2. Send token to API: `POST /api/v1/notifications/register` with `{ token, platform: "ios" }`
3. Deep links: `YOUR_TURN` → `/game/:id`, `MATCH_FOUND` → `/game/:id`, `GAME_ENDED` → history

---

## 8. Security Rules

| Rule | Enforcement |
|------|------------|
| **Never embed service role key in iOS** | Service role bypasses RLS — API-only |
| **Use anon key + RLS** | iOS uses anon key; Row-Level Security protects data |
| **Store JWT in Keychain** | Use Supabase-swift SDK's built-in Keychain storage |
| **Token refresh** | Supabase-swift handles automatic JWT refresh |

---

## 9. Development vs Production URLs

| Context | Development | Production |
|---------|------------|------------|
| Supabase | Same project for both | Same project |
| API | `http://localhost:3001/api/v1` | `https://raichu.live/api/v1` |
| Web | `http://localhost:3000` | `https://raichu.live` |

Use Xcode scheme environment variables or a `Configuration.swift` file to toggle between environments.
