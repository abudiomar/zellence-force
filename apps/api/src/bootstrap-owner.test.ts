import { describe, expect, test } from "vitest";
import { parseBootstrapOwnerArgs } from "./bootstrap-owner";

describe("owner bootstrap CLI", () => {
  test("requires tenant slug, full name, email, and password", () => {
    expect(
      parseBootstrapOwnerArgs([
        "--tenant-slug=mag-events",
        "--tenant-name=MAG Events",
        "--full-name=Primary Owner",
        "--email=owner@example.com",
        "--password=password123"
      ])
    ).toEqual({
      tenantSlug: "mag-events",
      tenantName: "MAG Events",
      fullName: "Primary Owner",
      email: "owner@example.com",
      password: "password123"
    });

    expect(() => parseBootstrapOwnerArgs(["--tenant-slug=mag-events"])).toThrow(
      "Missing bootstrap arguments"
    );
  });
});
