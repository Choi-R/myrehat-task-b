import { defineConfig } from "drizzle-kit";
import "varlock/auto-load";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    url:
      process.env.DATABASE_URL && process.env.DATABASE_URL !== "placeholder"
        ? process.env.DATABASE_URL
        : "postgresql://postgres:postgres@localhost:5432/myrehat_task_b",
  },
});
