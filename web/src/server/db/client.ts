import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;

export function getDb() {
  const connectionString =
    process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL || "";

  if (!connectionString) {
    throw new Error("DATABASE_URL belum dikonfigurasi di .env.local");
  }
  if (!pool) {
    pool = new Pool({ connectionString });
    pool.on("error", (err: Error) => {
      console.error("[Neon Pool Idle Error]:", err.message);
    });
  }
  return drizzle(pool, { schema });
}
