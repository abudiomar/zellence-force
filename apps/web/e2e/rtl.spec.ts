import { expect, test } from "@playwright/test";

test("Arabic is default RTL and English cookie switches to LTR", async ({ page, context }) => {
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  await context.addCookies([{ name: "zf_locale", value: "en", domain: "127.0.0.1", path: "/" }]);
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});
