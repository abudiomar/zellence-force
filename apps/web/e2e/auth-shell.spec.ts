import { expect, test } from "@playwright/test";
import { mockAuthenticatedApi } from "./helpers";

test("protected shell renders role-aware nav and density persists", async ({ page }) => {
  await mockAuthenticatedApi(page, "owner");
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Users|المستخدمون/ })).toBeVisible();
  await page.getByRole("button", { name: "Compact" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-density", "compact");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-density", "compact");
});

test("viewer cannot see user management navigation", async ({ page }) => {
  await mockAuthenticatedApi(page, "viewer");
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Users|المستخدمون/ })).toHaveCount(0);
});
