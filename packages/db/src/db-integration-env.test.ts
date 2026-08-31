import { describe, expect, test } from "vitest";

describe("DB integration environment", () => {
  test.skipIf(process.env.RUN_DB_INTEGRATION !== "1" || Boolean(process.env.TEST_DATABASE_URL))(
    "requires TEST_DATABASE_URL when DB integration suite is explicitly enabled",
    () => {
      expect(process.env.TEST_DATABASE_URL, "Set TEST_DATABASE_URL before running DB integration tests").toBeTruthy();
    }
  );
});
