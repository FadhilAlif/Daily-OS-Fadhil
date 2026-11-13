import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const connectionString = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERROR: DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function main() {
  const client = await pool.connect();
  try {
    const schemaPath = path.resolve(__dirname, "../../Database/schema.sql");
    const viewPath = path.resolve(__dirname, "../../Database/sp_get_daily_logs.sql");

    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    const viewSql = fs.readFileSync(viewPath, "utf8");

    console.log("Applying Database/schema.sql...");
    await client.query(schemaSql);

    console.log("Applying Database/sp_get_daily_logs.sql...");
    await client.query(viewSql);

    const res = await client.query(
      "SELECT athlete_id, intervals_id, full_name, baseline_weight_kg, target_weight_kg, critical_power_w FROM athlete_master LIMIT 5"
    );
    console.log("Migration complete. Active athlete records:", res.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
