import { query } from "./index.js";
import { config } from "../config.js";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));
`;

export async function migrate(): Promise<void> {
  if (!config.databaseUrl) {
    console.warn("[db] DATABASE_URL not set — skipping migrations (auth endpoints will 500 until configured)");
    return;
  }
  try {
    await query(SCHEMA);
    console.log("[db] migrations applied");
  } catch (err) {
    console.error("[db] migration failed:", err);
    throw err;
  }
}
