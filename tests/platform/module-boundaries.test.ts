import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const workspaceRoot = process.cwd();

function read(path: string): string {
  return readFileSync(join(workspaceRoot, path), "utf8");
}

describe("monorepo dependency boundaries", () => {
  test("web package cannot depend on server-only packages", () => {
    const webPackage = read("apps/web/package.json");

    expect(webPackage).not.toContain("@zellforce/db");
    expect(webPackage).not.toContain("@zellforce/application");
  });

  test("shared packages cannot depend on runtime apps", () => {
    for (const path of [
      "packages/application/package.json",
      "packages/config/package.json",
      "packages/contracts/package.json",
      "packages/db/package.json",
      "packages/domain/package.json",
      "packages/ui/package.json"
    ]) {
      const packageJson = read(path);
      expect(packageJson).not.toContain("@zellforce/web");
      expect(packageJson).not.toContain("@zellforce/api");
      expect(packageJson).not.toContain("@zellforce/worker");
    }
  });
});
