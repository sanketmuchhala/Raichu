# Build & Deploy

**Purpose:** How to ship this game.  
**Audience:** DevOps  
**Last Verified Commit:** `16274f9`

## Architecture
-   **Frontend**: Static HTML/CSS/JS.
-   **Backend**: Python Scripts (`api/*.py`) designed for Vercel Serverless (CGI-like).

## Vercel Deployment (Recommended)
1.  **Connect Repo**: Link GitHub repo to Vercel.
2.  **Settings**:
    *   **Framework Preset**: Other (or None).
    *   **Root Directory**: `/` (Root).
3.  **Environment Variables**: Add `SUPABASE_URL` and `SUPABASE_KEY`.
4.  **Deploy**: Push to `main`.

## Manual / Other Hosting
You can host this on any static host, BUT the `api/` folder requires a runtime.
-   **Netlify**: Requires rewriting `api/*.py` to Netlify Functions (JS/Go) or using a dedicated backend.
-   **Docker**: You would need a container running Nginx (Frontend) + Gunicorn/Flask (Backend) mapping `/api` routes to the Python scripts.

## Supabase Setup
1.  Create Project.
2.  Run `db_setup.sql` in SQL Editor.
3.  Copy Credentials to Vercel.
