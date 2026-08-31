import { describe, expect, test } from "vitest";
import { findTenantBySlug, insertTenant, withTransaction } from "./index";

class FakeTransactionClient {
  readonly queries: string[] = [];
  tenants = new Map<string, { id: string; name: string; slug: string }>();

  async query(sql: string, params?: unknown[]) {
    this.queries.push(sql);

    if (sql.startsWith("insert into tenants")) {
      const row = {
        id: "tenant-1",
        name: String(params?.[0]),
        slug: String(params?.[1])
      };
      this.tenants.set(row.slug, row);
      return { rows: [row], rowCount: 1 };
    }

    if (sql.startsWith("select id, name, slug from tenants")) {
      const row = this.tenants.get(String(params?.[0]));
      return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
    }

    return { rows: [], rowCount: 0 };
  }

  release() {}
}

class FakePool {
  readonly client = new FakeTransactionClient();

  async connect() {
    return this.client;
  }
}

describe("transaction helper", () => {
  test("commits when callback succeeds", async () => {
    const pool = new FakePool();

    const tenant = await withTransaction(pool, async (client) => {
      return insertTenant(client, { name: "MAG Events", slug: "mag" });
    });

    expect(tenant.slug).toBe("mag");
    expect(pool.client.queries).toContain("begin");
    expect(pool.client.queries).toContain("commit");
  });

  test("rolls back and rethrows when callback fails", async () => {
    const pool = new FakePool();

    await expect(
      withTransaction(pool, async () => {
        throw new Error("boom");
      })
    ).rejects.toThrow("boom");

    expect(pool.client.queries).toContain("begin");
    expect(pool.client.queries).toContain("rollback");
  });

  test("tenant helper requires tenant slug", async () => {
    const pool = new FakePool();

    await expect(findTenantBySlug(pool.client, "")).rejects.toThrow("Tenant slug is required");
  });
});
