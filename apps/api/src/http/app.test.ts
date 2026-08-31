import { describe, expect, test } from "vitest";
import request from "supertest";
import { createExpressApp } from "./app";
import type {
  IdentityAdmin,
  SessionRevoker,
  SettingsRepository,
  UserRepository
} from "@zellforce/application";
import type { AuthenticatedUser } from "@zellforce/contracts";

async function readRawBody(req: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  return Buffer.concat(chunks).toString("utf8");
}

describe("Express app", () => {
  const owner: AuthenticatedUser = {
    id: "owner",
    authUserId: "auth-owner",
    tenantId: "tenant",
    personId: null,
    email: "owner@example.com",
    fullName: "Owner",
    role: "owner",
    isActive: true
  };

  const users: UserRepository = {
    findByAuthUserId: async () => owner,
    findById: async () => owner,
    listByTenant: async () => [owner],
    create: async () => owner,
    setActive: async () => owner,
    linkPerson: async () => owner,
    personBelongsToTenant: async () => true,
    countActiveOwners: async () => 2,
    writeAudit: async () => undefined
  };
  const settings: SettingsRepository = {
    get: async () => ({
      defaultLanguage: "ar",
      supportedLanguages: ["ar", "en"],
      timezone: "Asia/Riyadh",
      currency: "SAR",
      hijriEnabled: true
    }),
    update: async (_tenantId, value) => value,
    writeAudit: async () => undefined
  };
  const identity: IdentityAdmin = {
    createIdentity: async () => ({ authUserId: "created" }),
    deleteIdentity: async () => undefined
  };
  const sessions: SessionRevoker = {
    revokeAllForIdentity: async () => undefined
  };

  function phaseTwo(overrides: { users?: UserRepository } = {}) {
    return {
      users: overrides.users ?? users,
      settings,
      identity,
      sessions
    };
  }

  test("exposes a health endpoint", async () => {
    const app = createExpressApp();

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  test("mounts Better Auth-compatible handler before json parsing", async () => {
    const app = createExpressApp({
      authRouteHandler: async (req, res) => {
        res.status(200).json({ rawBody: await readRawBody(req) });
      }
    });

    const response = await request(app)
      .post("/api/auth/echo")
      .set("content-type", "application/json")
      .send({ ping: true });

    expect(response.status).toBe(200);
    expect(response.body.rawBody).toBe('{"ping":true}');
  });

  test("resolves Better Auth identity to active application actor for /api/me", async () => {
    const app = createExpressApp({
      sessionReader: {
        api: {
          getSession: async () => ({ user: { id: "auth-owner" } })
        }
      },
      phaseTwo: phaseTwo()
    });

    const response = await request(app).get("/api/me");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(owner);
  });

  test("denies protected routes without a session", async () => {
    const app = createExpressApp({
      sessionReader: { api: { getSession: async () => null } },
      phaseTwo: phaseTwo()
    });

    expect((await request(app).get("/api/me")).status).toBe(401);
    expect((await request(app).get("/api/users")).status).toBe(401);
  });

  test("denies user management to non-admin roles", async () => {
    const finance = { ...owner, role: "finance" as const };
    const app = createExpressApp({
      sessionReader: { api: { getSession: async () => ({ user: { id: "auth-finance" } }) } },
      phaseTwo: phaseTwo({
        users: {
          ...users,
          findByAuthUserId: async () => finance
        }
      })
    });

    const response = await request(app).post("/api/users").send({
      fullName: "Other",
      email: "other@example.com",
      password: "password123",
      role: "viewer"
    });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  test("allows authenticated settings reads", async () => {
    const app = createExpressApp({
      sessionReader: { api: { getSession: async () => ({ user: { id: "auth-owner" } }) } },
      phaseTwo: phaseTwo()
    });

    const response = await request(app).get("/api/settings");

    expect(response.status).toBe(200);
    expect(response.body.currency).toBe("SAR");
  });
});
