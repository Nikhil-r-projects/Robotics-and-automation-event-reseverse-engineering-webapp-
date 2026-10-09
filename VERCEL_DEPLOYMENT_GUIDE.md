# 🚀 VERCEL DEPLOYMENT GUIDE — RAS DIGITAL ARENA

This guide shows you how to deploy the **RAS Digital Arena** to Vercel in less than 2 minutes.

---

## ⚡ Option 1: Fast Deploy via Terminal (Vercel CLI)

Vercel CLI is already installed on your system (`50.32.5`). Follow these 2 quick commands:

### 1. Log in to Vercel
Open your terminal in this repository and run:
```bash
vercel login
```
*Select your preferred login method (GitHub, Email, etc.) and authorize in the browser.*

### 2. Deploy to Production with Environment Variables
Once logged in, run:
```bash
vercel --prod
```
*Follow the quick prompts (hit Enter to accept defaults):*
- Set up and deploy? **Y**
- Which scope? *(Select your account)*
- Link to existing project? **N**
- Project name: `ras-arena`
- Directory: `./`
- Modify build settings? **N**

### 3. Add Environment Variables
Add your Supabase keys directly via CLI:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste value: https://ovtrwgopphgkcbckbcct.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste your anon key

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste your service role key

vercel env add DATABASE_URL production
# Paste your database url
```
Then redeploy once so the new environment variables take effect:
```bash
vercel --prod
```

---

## 🌐 Option 2: 1-Click Import via Vercel Dashboard (Fastest & Easiest)

Because all code fixes are **already pushed to your GitHub repository** (`origin/main`), you can deploy directly with 1 click:

1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Choose **Import Git Repository** and select:
   👉 `Nikhil-r-projects/Robotics-and-automation-event-reseverse-engineering-webapp-`
3. In **Project Name**, enter `ras-arena` (or your preferred name).
4. Expand **Environment Variables** and add the 4 keys from your `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://ovtrwgopphgkcbckbcct.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: *(From your `.env` file)*
   - `SUPABASE_SERVICE_ROLE_KEY`: *(From your `.env` file)*
   - `DATABASE_URL`: `postgresql://postgres:Suma%401213802@db.ovtrwgopphgkcbckbcct.supabase.co:5432/postgres`
5. Click **Deploy**.

Vercel will build and launch your live application in under 45 seconds!

---

## 🔍 Bug Fix Details (Netlify & Vercel Session Reset Resolved)

### Why were users kicked back to `/auth` on clicking the first game?
1. In serverless hosting (Netlify and Vercel), each route (`/api/auth/team`, `/api/session/state`, `/api/challenge/details`) executes in isolated, ephemeral serverless lambda containers.
2. The server previously stored active session memory in `/tmp/.data/competition_state.json`. In AWS/Netlify/Vercel serverless containers, `/tmp` is **not shared across containers**.
3. When teams logged in, container A wrote the session to its isolated container. When they clicked on Zone 1 (`/arena/z1-signal-breaker`), container B handled `/api/session/state`. Container B found no session, responded with `401 Unauthorized`, and `useArenaSession` immediately kicked the user back to `/auth`.

### How it is fixed:
- Created the persistent `competition_store` table in Supabase.
- Hydrated and saved all active sessions, challenge progress, and scores directly in Supabase across all serverless invocations.
- Added a 600ms automatic re-verification fallback in `useArenaSession` to guarantee zero dropped sessions on cold starts.
