# Multiplayer Setup (2 Minutes)

The multiplayer feature needs shared storage. Choose **ONE** option below:

---

## ⚡ Option 1: Supabase (RECOMMENDED - Easiest)

### Why Supabase?
- ✅ **Free forever** (500MB database, 50,000 requests/month)
- ✅ **2-minute setup**
- ✅ **No credit card required**
- ✅ **Works immediately**

### Setup Steps:

**1. Create Supabase Account**
- Go to https://supabase.com
- Click "Start your project"
- Sign up with GitHub (instant)

**2. Create New Project**
- Click "New Project"
- Name it: `raichu`
- Create a password (save it somewhere)
- Choose region closest to you
- Click "Create new project" (wait ~2 minutes for setup)

**3. Create Table**
- In Supabase dashboard, click "Table Editor"
- Click "Create a new table"
- Table name: `rooms`
- **IMPORTANT**: Uncheck "Enable Row Level Security (RLS)" (or disable it after creation)
- Add these columns:
  - `id` (int8, primary key, auto-increment) ← Already there
  - `room_id` (text)
  - `data` (jsonb)
  - `created_at` (timestamptz) ← Already there
- Click "Save"

**3a. Disable RLS (CRITICAL)**
- If RLS is enabled, your app won't work
- In Table Editor, click on the `rooms` table
- Click the shield icon or go to "Authentication" → "Policies"
- If you see "Row Level Security enabled for this table", click "Disable RLS"
- **OR** if you want RLS enabled, add this policy:
  - Click "New Policy" → "Create policy from scratch"
  - Policy name: `Allow all`
  - Target roles: `public`
  - Policy command: `ALL`
  - Using expression: `true`
  - With check expression: `true`
  - Click "Review" → "Save policy"

**4. Get API Credentials**
- Click "Settings" (gear icon)
- Click "API"
- Copy these two values:
  - **Project URL** (looks like: `https://xxx.supabase.co`)
  - **anon public** key (long string starting with `eyJ...`)

**5. Add to Vercel**
- Go to https://vercel.com/dashboard
- Open your Raichu project
- Go to "Settings" → "Environment Variables"
- Add these two variables:
  ```
  SUPABASE_URL = https://xxx.supabase.co
  SUPABASE_KEY = eyJhbGciOiJ...your-key...
  ```
- Click "Save"

**6. Redeploy**
- Go to "Deployments" tab
- Click "..." on latest deployment → "Redeploy"
- Wait 30 seconds

**DONE!** Your multiplayer now works across all devices!

---

## Option 2: JSONBin.io (Alternative)

If you don't want Supabase:

**1. Create JSONBin Account**
- Go to https://jsonbin.io
- Sign up (free)

**2. Create Bin**
- Click "Create Bin"
- Paste this: `{"rooms":[]}`
- Click "Create"
- Copy the **Bin ID** (looks like: `65abc123def456789`)
- Copy your **API Key** from dashboard

**3. Add to Vercel**
```
JSONBIN_ID = 65abc123def456789
JSONBIN_API_KEY = $2a$10$your.api.key.here
```

**4. Redeploy**

---

## Testing After Setup

1. Open app on Device A
2. Click "Online" → "Create Room"
3. Copy room code
4. Open app on Device B (different browser/device)
5. Click "Online" → "Browse Rooms"
6. You should see the room from Device A!
7. Click "Join Game" and play!

---

## Troubleshooting

**Error: "Storage not configured"**
- Double-check environment variables are set in Vercel
- Make sure you redeployed after adding variables
- Check variable names match exactly (case-sensitive)

**Rooms not showing on other devices**
- Verify table is created in Supabase
- Check Vercel logs for errors
- Make sure both variables are set

**Supabase table creation failed**
- Make sure column names are exact: `room_id` and `data`
- `data` type must be `jsonb` not `json`
- Enable RLS (Row Level Security) if asked, then click "Add policy" → "Enable access to all"

---

## Which Storage Am I Using?

The app will try in this order:
1. **Supabase** (if SUPABASE_URL and SUPABASE_KEY are set)
2. **JSONBin** (if JSONBIN_ID and JSONBIN_API_KEY are set)
3. **Error** (if none configured)

You only need to set up ONE of them!

---

## Free Tier Limits

### Supabase Free Tier:
- 500MB database
- 50,000 monthly active users
- 2GB bandwidth
- **Perfect for this game!**

### JSONBin Free Tier:
- 50,000 requests/month
- Unlimited bins
- **Also perfect!**

Both are more than enough for a chess game!
