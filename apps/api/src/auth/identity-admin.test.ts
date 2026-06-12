import { describe, expect, test, vi } from "vitest";
import { createIdentityAdmin } from "./identity-admin";

describe("Better Auth identity Adapter", () => {
  test("creates identity through private provisioner and compensates by deleting identity", async () => {
    const signUpEmail = vi.fn(async () => ({ user: { id: "auth-user" } }));
    const query = vi.fn(async () => ({ rows: [], rowCount: 1 }));
    const identity = createIdentityAdmin(
      { api: { signUpEmail } },
      { query }
    );

    await expect(
      identity.createIdentity({
        name: "Owner",
        email: "owner@example.com",
        password: "password123"
      })
    ).resolves.toEqual({ authUserId: "auth-user" });
    await identity.deleteIdentity("auth-user");

    expect(signUpEmail).toHaveBeenCalledWith({
      body: {
        name: "Owner",
        email: "owner@example.com",
        password: "password123"
      }
    });
    expect(query).toHaveBeenCalledWith('delete from "user" where id = $1', [
      "auth-user"
    ]);
  });
});
