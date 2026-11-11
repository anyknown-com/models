import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      main: "./test/worker/entry.ts",
      miniflare: {
        compatibilityDate: "2026-08-01",
      },
    }),
  ],
  test: {
    name: "models-worker",
    include: ["test/wire/**/*.test.ts"],
  },
});
