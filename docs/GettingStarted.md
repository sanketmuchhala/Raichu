# Getting Started

**Purpose:** Guide for setting up the local dev environment.  
**Audience:** New Engineers  
**Last Verified Commit:** `16274f9`

## Requirements
-   **Python 3.8+** (for local backend server)
-   **Modern Browser** (Chrome/Firefox/Safari/Edge)
-   **Git**

## Setup
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sanketmuchhala/Raichu.git
    cd Raichu
    ```

2.  **Environment Variables (Optional for Local Text, Required for Multiplayer):**
    Copy `.env.example` to `.env` (if it exists) or set them in your environment.
    *   `SUPABASE_URL`: Your project URL (e.g., `https://xyz.supabase.co`)
    *   `SUPABASE_KEY`: Your generic `anon` API key.

    *Note: The local server `python3 -m http.server` does NOT natively read `.env` files for the CGI scripts in `api/`. You may need to export them in your shell before running python.*

## Running Locally
We use Python's built-in HTTP server which handles static files and CGI scripts (simulating Vercel serverless functions).

1.  **Start the Server:**
    ```bash
    # Run in the root directory
    python3 -m http.server 8080 --cgi
    ```
    *Note: If `--cgi` is not supported by your python version or the scripts aren't executable, you may need a different runner or just test the frontend static parts.*
    
    *Correction:* The current repo structure is designed for **Vercel**. Local Python execution of `api/` scripts mimics this but requires specific handling of environment variables. 
    
    **Simpler Local Logic:**
    To just run the **Frontend** (Game logic, AI, UI):
    ```bash
    python3 -m http.server 8080
    ```
    Open `http://localhost:8080`.
    *Multiplayer will likely fail locally unless you configure a local proxy for the API functions.*

## Building
This is a static HTML/JS site + Python Backend. There is no "Build" step (no Webpack/Babel).
-   **Frontend**: Edit `script.js` -> Reload Browser.
-   **Backend**: Edit `api/*.py` -> Deploy to Vercel.

## Common Issues
-   **Blank Screen:** Ensure `initGame()` is called correctly (fixed in `16274f9`).
-   **Bot Not Moving:** Check console for API errors if bot is server-side (Note: currently bot seems to be client-side JS fallback or server-side depending on implementation).
