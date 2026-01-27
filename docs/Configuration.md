# Configuration

**Purpose:** Reference for all configuration knobs and secrets.  
**Audience:** DevOps, Engineers  
**Last Verified Commit:** `16274f9`

## Environment Variables
These usually live in Vercel Project Settings or a local `.env` file (if using a custom runner).

| Variable | Description | Required? | Example |
| :--- | :--- | :--- | :--- |
| `SUPABASE_URL` | API URL for the Supabase Project | **Yes** (Multiplayer) | `https://<id>.supabase.co` |
| `SUPABASE_KEY` | Public/Anon API Key | **Yes** (Multiplayer) | `eyJhbG...` |
| `JSONBIN_ID` | Bin ID for legacy storage (Fallback) | No | `65a...` |
| `JSONBIN_API_KEY`| API Key for legacy storage | No | `$2a...` |

## Code Constraints
-   **Board Size**: Hardcoded `N=8` in `script.js`.
-   **Colors**: css variables in `style.css` (`--board-light`, `--board-dark`).
-   **Poll Interval**: Hardcoded `setInterval(..., 1500)` in `script.js`.

## Database Config
See `db_setup.sql` in the root of the repo (generated artifact).
-   **Table**: `rooms`
-   **Constraints**: `unique(room_id)`
-   **Security**: RLS Disabled.
