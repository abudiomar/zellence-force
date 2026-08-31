import { describe, expect, test } from "vitest";
import { parseBootstrapOwnerArgs } from "./bootstrap-owner";

describe("owner bootstrap CLI", () => {
  test("requires tenant slug, full name, email, and password", () => {
    expect(
      parseBootstrapOwnerArgs([
        "--tenant-slug=mag-events",
        "--full-name=Primary Owner",
        "--email=owner@example.com",
        "--password=password123"
      ])
    ).toEqual({
      tenantSlug: "mag-events",
      fullName: "Primary Owner",
      email: "owner@example.com",
      password: "password123"
    });

    expect(() => parseBootstrapOwnerArgs(["--tenant-slug=mag-events"])).toThrow(
      "Missing bootstrap arguments"
    );
  });
});
