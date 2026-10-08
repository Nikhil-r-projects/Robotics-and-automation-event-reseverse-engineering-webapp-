/**
 * RAS Digital Arena — Supabase Initial Sync Script
 * 
 * Usage:
 *   node scripts/sync_to_supabase.js
 * 
 * Reads .env.local and pushes the current competition state (teams, challenges, scores)
 * into Supabase PostgreSQL tables.
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local manually if dotenv is not installed
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...val] = trimmed.split("=");
    if (key && val.length) {
      env[key.trim()] = val.join("=").trim().replace(/^["']|["']$/g, "");
    }
  });
  return env;
}

async function sync() {
  const env = loadEnv();
  const rawUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const url = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "") : "";
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY must be provided in .env.local");
    process.exit(1);
  }

  console.log(`📡 Connecting to Supabase project: ${url}...`);
  const supabase = createClient(url, key);

  // Read local state
  const statePath = path.join(__dirname, "..", ".data", "competition_state.json");
  if (!fs.existsSync(statePath)) {
    console.error("❌ Error: Local state file .data/competition_state.json not found.");
    process.exit(1);
  }

  const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));

  // 1. Sync Teams
  console.log("🔄 Upserting Teams into Supabase...");
  const teamsToSync = Object.values(state.teams).map((t) => ({
    team_number: t.team_number,
    team_name: t.team_name,
    access_code_hash: t.access_code,
    status: t.status,
    total_score: t.total_score,
  }));

  const { data: syncedTeams, error: teamErr } = await supabase
    .from("teams")
    .upsert(teamsToSync, { onConflict: "team_number" })
    .select();

  if (teamErr) {
    console.error("❌ Failed to upsert teams:", teamErr.message);
  } else {
    console.log(`✅ Synced ${syncedTeams.length} teams successfully:`);
    syncedTeams.forEach((t) => console.log(`   - Team ${t.team_number}: "${t.team_name}" (${t.access_code_hash})`));
  }

  // 2. Sync Challenge Definitions
  console.log("\n🔄 Upserting Challenge Definitions...");
  const challengeDefs = [
    { id: "z1", name: "SIGNAL BREAKER", max_points: 50, duration_seconds: 600, unlock_requirement: "INITIAL" },
    { id: "z2", name: "DEAD SIGNAL", max_points: 50, duration_seconds: 600, unlock_requirement: "INITIAL" },
    { id: "z3", name: "LOGIC LOCK", max_points: 100, duration_seconds: 600, unlock_requirement: "INITIAL" },
    { id: "z4", name: "BINARY VAULT", max_points: 200, duration_seconds: 900, unlock_requirement: "ANY_TWO_Z1_Z3" },
    { id: "z5", name: "BLACK BOX", max_points: 200, duration_seconds: 900, unlock_requirement: "ANY_TWO_Z1_Z3" },
  ];

  const { error: defErr } = await supabase
    .from("challenge_definitions")
    .upsert(challengeDefs, { onConflict: "id" });

  if (defErr) {
    console.error("❌ Failed to upsert challenge definitions:", defErr.message);
  } else {
    console.log("✅ Synced all 5 Challenge Definitions (Z1-Z5).");
  }

  console.log("\n🎉 Supabase initial sync complete!");
}

sync().catch(console.error);
