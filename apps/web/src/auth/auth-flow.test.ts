import { describe, expect, test, vi } from "vitest";
import { getProtectedViewState, loginWithEmail } from "./auth-flow";

describe("web auth flow", () => {
  test("maps successful and failed Better Auth login results", async () => {
    const successClient = {
      signIn: {
        email: vi.fn(async () => ({ data: { user: { id: "auth-user" } }, error: null }))
      }
    };
    const failureClient = {
      signIn: {
        email: vi.fn(async () => ({
          data: null,
          error: { message: "Invalid email or password" }
        }))
      }
    };

    await expect(
      loginWithEmail(successClient, {
        email: "owner@example.com",
        password: "password123"
      })
    ).resolves.toEqual({ ok: true });
    await expect(
      loginWithEmail(failureClient, {
        email: "owner@example.com",
        password: "wrong-password"
      })
    ).resolves.toEqual({
      ok: false,
      message: "Invalid email or password"
    });
  });

  test("distinguishes loading, authenticated, and redirect states", () => {
    expect(getProtectedViewState(true, null)).toBe("loading");
    expect(getProtectedViewState(false, { user: { id: "auth-user" } })).toBe(
      "authenticated"
    );
    expect(getProtectedViewState(false, null)).toBe("redirect");
  });
});
