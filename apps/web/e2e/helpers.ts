import type { Page } from "@playwright/test";

export async function mockAuthenticatedApi(page: Page, role = "owner") {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "http://127.0.0.1:3000",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  };
  const authPayload = {
    session: { id: "session", userId: "auth-owner" },
    user: { id: "auth-owner", email: "owner@example.com", name: "Owner" }
  };

  await page.route("http://localhost:4000/api/auth/**", async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }
    await route.fulfill({
      contentType: "application/json",
      headers: corsHeaders,
      body: JSON.stringify({
        ...authPayload,
        data: authPayload,
        error: null
      })
    });
  });
  await page.route("http://localhost:4000/api/me", async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }
    await route.fulfill({
      contentType: "application/json",
      headers: corsHeaders,
      body: JSON.stringify({
        id: "owner",
        authUserId: "auth-owner",
        tenantId: "tenant",
        personId: null,
        email: "owner@example.com",
        fullName: "Owner",
        role,
        isActive: true
      })
    });
  });
}

export async function expectNoPageOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  return overflow;
}
