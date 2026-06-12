import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    include: ["tests/**/*.test.ts", "apps/**/*.test.ts", "packages/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"]
    }
  },
  resolve: {
    alias: {
      "@zellforce/config": new URL("./packages/config/src/index.ts", import.meta.url).pathname,
      "@zellforce/application": new URL("./packages/application/src/index.ts", import.meta.url).pathname,
      "@zellforce/contracts": new URL("./packages/contracts/src/index.ts", import.meta.url).pathname,
      "@zellforce/domain": new URL("./packages/domain/src/index.ts", import.meta.url).pathname,
      "@zellforce/db": new URL("./packages/db/src/index.ts", import.meta.url).pathname,
      "@zellforce/ui": new URL("./packages/ui/src/index.ts", import.meta.url).pathname
    }
  }
});
