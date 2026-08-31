/**
 * database.js - compatibility CLI for the TypeScript migration runner.
 *
 * Usage:
 *   DATABASE_URL=postgres://user:pass@host:5432/db bun database.js
 */

import { createPgPool, runMigrations } from "./packages/db/src/index.ts";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("[X] DATABASE_URL is required");
  process.exit(1);
}

const pool = createPgPool({ connectionString });

try {
  const result = await runMigrations(pool);
  console.log(`[OK] Migrations applied: ${result.applied.length}; skipped: ${result.skipped.length}`);
} finally {
  await pool.end();
}
