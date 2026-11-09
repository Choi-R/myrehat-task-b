import { drizzle } from "drizzle-orm/node-postgres";

import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

function getDatabaseUrl(envUrl?: string): string {
  const envVar = process.env.DATABASE_URL;
  if (envVar && envVar !== "placeholder") {
    return envVar;
  }
  if (envUrl && envUrl !== "placeholder") {
    return envUrl;
  }
  return "postgresql://postgres:postgres@localhost:5432/myrehat_task_b";
}

export function createDb(env: DatabaseConfig) {
  const url = getDatabaseUrl(env.DATABASE_URL);
  return drizzle(url, { relations });
}

export type Database = ReturnType<typeof createDb>;
export * from "./schema";
