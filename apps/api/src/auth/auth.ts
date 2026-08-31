import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import type { Pool } from "pg";
import type { RuntimeEnv } from "@zellforce/config";

export type CreateAuthOptions = {
  pool: Pool;
  env: Pick<
    RuntimeEnv,
    | "APP_ENV"
    | "APP_URL"
    | "BETTER_AUTH_SECRET"
    | "BETTER_AUTH_URL"
    | "CORS_ORIGIN"
    | "AUTH_SESSION_EXPIRES_IN"
    | "AUTH_SESSION_UPDATE_AGE"
    | "AUTH_PASSWORD_MIN_LENGTH"
    | "AUTH_PASSWORD_MAX_LENGTH"
  >;
};

export function buildAuthOptions({ pool, env }: CreateAuthOptions) {
  const trustedOrigins = [env.APP_URL, env.CORS_ORIGIN].filter(
    (origin): origin is string => Boolean(origin)
  );

  return {
    database: pool,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      autoSignIn: false,
      minPasswordLength: env.AUTH_PASSWORD_MIN_LENGTH,
      maxPasswordLength: env.AUTH_PASSWORD_MAX_LENGTH,
      revokeSessionsOnPasswordReset: true
    },
    session: {
      expiresIn: env.AUTH_SESSION_EXPIRES_IN,
      updateAge: env.AUTH_SESSION_UPDATE_AGE
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session: { userId: string }) => {
            const result = await pool.query(
              "select 1 from users where auth_user_id = $1 and is_active = true",
              [session.userId]
            );
            if (result.rowCount !== 1) {
              throw new APIError("UNAUTHORIZED", {
                message: "Invalid email or password"
              });
            }
            return { data: session };
          }
        }
      }
    },
    advanced: {
      useSecureCookies: env.APP_ENV === "production"
    }
  };
}

export function createAuth(options: CreateAuthOptions) {
  return betterAuth(buildAuthOptions(options));
}

export function createIdentityProvisioner(options: CreateAuthOptions) {
  const authOptions = buildAuthOptions(options);
  return betterAuth({
    ...authOptions,
    emailAndPassword: {
      ...authOptions.emailAndPassword,
      disableSignUp: false
    }
  });
}
