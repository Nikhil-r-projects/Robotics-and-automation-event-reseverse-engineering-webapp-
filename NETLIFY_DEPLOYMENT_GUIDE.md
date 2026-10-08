# 🚀 RAS DIGITAL ARENA — NETLIFY DEPLOYMENT GUIDE

This guide walks you through deploying the **RAS Digital Arena** to Netlify with live Supabase database synchronization.

---

## 1. Quick Deploy via GitHub (Recommended)

1. Log in to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **"Add new site"** > **"Import an existing project"**.
3. Choose **GitHub** and select your repository:
   👉 `Nikhil-r-projects/Robotics-and-automation-event-reseverse-engineering-webapp-`
4. Netlify will automatically detect:
   * **Base directory**: `/` (leave blank)
   * **Build command**: `npm run build` (configured automatically via `netlify.toml`)
   * **Publish directory**: `.next` (configured automatically via `netlify.toml`)

---

## 2. Environment Variables on Netlify

Before clicking **Deploy**, scroll down to **"Environment variables"** (or go to **Site settings > Environment variables**) and add these 4 variables:

| Key | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ovtrwgopphgkcbckbcct.supabase.co` | Supabase Cloud REST URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92dHJ3Z29wcGhna2NiY2tiY2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0ODI3NzMsImV4cCI6MjEwNzA1ODc3M30.B_NfIhEbcfIlTug5EdAPzX3ElWfWnM8Msimt1L7cdh0` | Supabase Client Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92dHJ3Z29wcGhna2NiY2tiY2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTQ4Mjc3MywiZXhwIjoyMTA3MDU4NzczfQ.hxO4EAE7xgw1ltFRMWqNMZdrblyMGN97bmjTdW-0u0o` | Server-side sync key |
| `DATABASE_URL` | `postgresql://postgres:Suma%401213802@db.ovtrwgopphgkcbckbcct.supabase.co:5432/postgres` | PostgreSQL connection string |

5. Click **"Deploy site"**. Netlify will build and deploy the application in under 2 minutes!

---

## 3. How the Live Synchronization Works During the Event

* **Zero Manual SQL Queries Needed**:
  Because you already ran `supabase_schema.sql` in Supabase, all 5 teams and 5 challenges are permanently initialized in Supabase.
* **Automatic Live Updates**:
  When any team:
  1. **Logs in** (`/auth`)
  2. **Starts a challenge** (Z1 to Z5)
  3. **Solves a stage or submits an answer**
  4. **Receives a score update or hint**
  The serverless backend updates the Supabase database automatically in real time.
* **State Resiliency Across Serverless Functions**:
  Even when Netlify serverless functions restart, the engine hydrates state directly from Supabase.

---

## 4. Admin Telemetry & Results

1. **Admin Login**:
   * URL: `https://<your-netlify-site>.netlify.app/admin/login`
   * Username: `admin`
   * Password: `admin@ras2026`
2. **Live Telemetry & Controls** (`/admin`):
   * View live scores of all 5 teams simultaneously (updated every 5s).
   * Status indicators for each zone (Locked, Active, Completed).
   * Live Violation Log (anti-cheat detection).
   * Score adjustments and continuation code generation for eliminated teams.
3. **Debrief / Results Page** (`/arena/results`):
   * Confetti celebration, full score summary out of 600 points, and zone-by-zone breakdown.
