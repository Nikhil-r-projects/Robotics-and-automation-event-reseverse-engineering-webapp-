const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

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

async function runMigration() {
  const env = loadEnv();
  const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error("❌ Error: DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  console.log("🔌 Connecting to Supabase PostgreSQL database via connection string...");
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Successfully connected to Supabase PostgreSQL database!");

    const sqlPath = path.join(__dirname, "..", "supabase_schema.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    console.log("🚀 Executing supabase_schema.sql...");
    await client.query(sql);

    console.log("🎉 Migration completed successfully! All tables, definitions, and seed teams created.");
  } catch (err) {
    console.error("❌ Migration error:", err.message);
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error);
