# Multiplayer Setup for Vercel

## Problem
The multiplayer feature requires shared storage across serverless function invocations. `/tmp` storage doesn't work because each Vercel function instance has its own isolated `/tmp` directory.

## Solution: Vercel KV (Redis)

### Setup Steps:

1. **Go to Vercel Dashboard**
   - Open https://vercel.com/dashboard
   - Select your Raichu project

2. **Create KV Database**
   - Click on the "Storage" tab
   - Click "Create Database"
   - Select "KV (Durable Redis)"
   - Choose a name (e.g., "raichu-storage")
   - Click "Create"

3. **Connect to Project**
   - After creation, click "Connect to Project"
   - Select your Raichu project
   - Click "Connect"

4. **Environment Variables (Auto-Added)**
   Vercel automatically adds these variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
   - `KV_URL`

5. **Redeploy**
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger deployment

### How It Works

The multiplayer API endpoints now use Vercel KV REST API:
- `load_rooms()` - Fetches rooms from Redis
- `save_rooms()` - Saves rooms to Redis
- Automatic cleanup of rooms older than 2 hours

### Testing

After setup:
1. Open app on Device A → Create Room
2. Open app on Device B → Browse Rooms
3. You should see the room from Device A!

### Free Tier

Vercel KV Free Tier includes:
- 30,000 commands/month
- 256 MB storage
- Perfect for this game!

### Alternative: Upstash Redis (No Vercel KV needed)

If you don't want to use Vercel KV:

1. Go to https://upstash.com
2. Create free account
3. Create Redis database
4. Get REST API URL and token
5. Add to Vercel environment variables:
   - `KV_REST_API_URL` = Your Upstash REST URL
   - `KV_REST_API_TOKEN` = Your Upstash token

## Troubleshooting

**Error: "Storage not configured"**
- Make sure KV is connected to your project
- Check environment variables are set
- Redeploy after adding KV

**Rooms not showing across devices**
- Verify KV is set up
- Check Vercel logs for errors
- Make sure you redeployed after adding KV

**Performance issues**
- KV has very low latency (<1ms)
- Polling happens every 1.5 seconds
- Should feel instant!
