import { describe, expect, test } from "vitest";
import { parseSeedLocalArgs } from "./seed-local";

describe("local seed CLI", () => {
  test("uses stable local tenant and owner defaults", () => {
    expect(parseSeedLocalArgs([])).toEqual({
      tenantSlug: "mag-events",
      tenantName: "MAG Events",
      ownerFullName: "Owner User",
      ownerEmail: "owner@example.com",
      ownerPassword: "Password123!"
    });
  });

  test("allows explicit tenant and owner values", () => {
    expect(
      parseSeedLocalArgs([
        "--tenant-slug=demo",
        "--tenant-name=Demo Agency",
        "--owner-full-name=Demo Owner",
        "--owner-email=demo@example.com",
        "--owner-password=Secret123!"
      ])
    ).toEqual({
      tenantSlug: "demo",
      tenantName: "Demo Agency",
      ownerFullName: "Demo Owner",
      ownerEmail: "demo@example.com",
      ownerPassword: "Secret123!"
    });
  });
});
