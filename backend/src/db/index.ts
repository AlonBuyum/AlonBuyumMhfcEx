import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (pool) return pool;
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }
  pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: config.isProd ? { rejectUnauthorized: false } : undefined,
    max: 10,
  });
  pool.on("error", (err) => {
    console.error("[db] unexpected pool error:", err);
  });
  return pool;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await getPool().query<T>(sql, params);
  return result.rows;
}

export async function queryOne<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
