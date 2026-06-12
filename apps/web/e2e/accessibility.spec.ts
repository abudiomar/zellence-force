import { expect, test } from "@playwright/test";
import { mockAuthenticatedApi } from "./helpers";

test("main routes expose landmarks and accessible names", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByLabel(/Email|البريد/)).toBeVisible();

  await mockAuthenticatedApi(page);
  for (const route of ["/", "/settings/users", "/settings/general"]) {
    await page.goto(route);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  }
});
