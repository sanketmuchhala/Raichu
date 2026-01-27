# Troubleshooting

**Purpose:** Fix common problems during dev and gameplay.  
**Audience:** Support, Developers  
**Last Verified Commit:** `16274f9`

## Multiplayer Issues

### 1. "Failed to join room"
-   **Symptom**: Popup says "Failed to join room" or "Server Refused Join".
-   **Cause**:
    *   **RLS (Row Level Security)**: Database is blocking writes. Backend sees "Success 200" but 0 rows are updated.
    *   **Full Room**: Room already has a Black player.
-   **Fix**:
    *   Run `ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;` in Supabase.
    *   Check Vercel logs for `CRITICAL: Supabase reported success (200) but returned 0 rows`.

### 2. "Pieces Disappear / Board Flashes Empty"
-   **Symptom**: Board resets to empty or pieces vanish randomly.
-   **Cause**: Backend returning data in a format (JSON Object) that the frontend expected to be a String, or vice-versa.
-   **Fix**: Ensure you are on commit `16274f9` or later, which has strict type checking in `multiplayer-state.py` and `script.js`.

### 3. "Coming Soon" Button / Can't Click Online
-   **Cause**: Multiplayer buttons were commented out in `index.html`.
-   **Fix**: Uncomment the buttons (Fixed in recent commits).

### 4. "White Screen" on Code Load
-   **Cause**: `initGame()` running before DOM is ready.
-   **Fix**: Use `document.addEventListener('DOMContentLoaded', ...)` or check `readyState`.

## Deployment Issues

### 1. Changes Not Showing?
-   **Cause**: Git `push` failed or Vercel build failed.
-   **Fix**:
    *   Run `git status` locally.
    *   Force push if necessary.
    *   Check Vercel Deployment Logs -> Building.

## Debugging Tools
-   **Browser Console**: Logs detailed "Join Result" and "Poll Update".
-   **Vercel Logs**: Shows server-side errors and Supabase response codes.
