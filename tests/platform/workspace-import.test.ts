import { describe, expect, test } from "vitest";
import { USER_ROLES } from "@zellforce/domain";
import { ENV_VAR_NAMES } from "@zellforce/config";
import { CONTRACTS_PACKAGE_STATUS } from "@zellforce/contracts";
import { APPLICATION_PACKAGE_STATUS } from "@zellforce/application";

describe("workspace imports", () => {
  test("imports shared packages through public Interfaces", () => {
    expect(USER_ROLES).toContain("owner");
    expect(ENV_VAR_NAMES).toContain("NODE_ENV");
    expect(CONTRACTS_PACKAGE_STATUS).toBe("ready");
    expect(APPLICATION_PACKAGE_STATUS).toBe("ready");
  });
});
