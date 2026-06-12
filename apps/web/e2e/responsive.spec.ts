import { expect, test } from "@playwright/test";
import { expectNoPageOverflow, mockAuthenticatedApi } from "./helpers";

for (const viewport of [
  { width: 360, height: 800 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 }
]) {
  test(`protected shell has no page overflow at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await mockAuthenticatedApi(page);
    await page.goto("/");
    await expect(page.locator(".app-topbar strong", { hasText: /^Owner$/ })).toBeVisible();
    expect(await expectNoPageOverflow(page)).toBe(false);
  });
}
