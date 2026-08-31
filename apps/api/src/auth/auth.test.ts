import { describe, expect, test } from "vitest";
import { buildAuthOptions } from "./auth";

describe("Better Auth configuration", () => {
  test("disables public signup and uses configured session/password policy", () => {
    const options = buildAuthOptions({
      pool: {} as never,
      env: {
        APP_ENV: "test",
        APP_URL: "http://localhost:3000",
        BETTER_AUTH_SECRET: "12345678901234567890123456789012",
        BETTER_AUTH_URL: "http://localhost:4000",
        CORS_ORIGIN: "http://localhost:3000",
        AUTH_SESSION_EXPIRES_IN: 604800,
        AUTH_SESSION_UPDATE_AGE: 86400,
        AUTH_PASSWORD_MIN_LENGTH: 8,
        AUTH_PASSWORD_MAX_LENGTH: 128
      }
    });

    expect(options.emailAndPassword).toMatchObject({
      enabled: true,
      disableSignUp: true,
      autoSignIn: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true
    });
    expect(options.session).toMatchObject({
      expiresIn: 604800,
      updateAge: 86400
    });
    expect("cookieCache" in options.session).toBe(false);
  });
});
