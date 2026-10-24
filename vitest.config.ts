import path from "node:path";
import { defineConfig } from "vitest/config";

const rootDir = typeof import.meta.dirname !== "undefined" ? import.meta.dirname : process.cwd();

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./apps/web/src"),
      "@myrehat-task-b/api": path.resolve(rootDir, "./packages/api/src"),
      "@myrehat-task-b/auth": path.resolve(rootDir, "./packages/auth/src"),
      "@myrehat-task-b/db": path.resolve(rootDir, "./packages/db/src"),
      "@myrehat-task-b/ui": path.resolve(rootDir, "./packages/ui/src"),
    },
  },
});
