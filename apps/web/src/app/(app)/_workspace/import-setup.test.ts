import { describe, expect, test } from "vitest";
import {
  autoMapGoogleSheetColumns,
  buildGoogleSheetRange,
  getImportReadiness,
  parseGoogleSheetReference
} from "./import-setup";

describe("applicant import setup helpers", () => {
  test("extracts a Google Sheet id from either a full link or an existing id", () => {
    expect(
      parseGoogleSheetReference(
        "https://docs.google.com/spreadsheets/d/1rYmSF0XAnsICNHGqLpIP6KAOySAYDuJwavdqwv0Q61Q/edit#gid=0"
      )
    ).toBe("1rYmSF0XAnsICNHGqLpIP6KAOySAYDuJwavdqwv0Q61Q");

    expect(parseGoogleSheetReference("1rYmSF0XAnsICNHGqLpIP6KAOySAYDuJwavdqwv0Q61Q")).toBe(
      "1rYmSF0XAnsICNHGqLpIP6KAOySAYDuJwavdqwv0Q61Q"
    );
  });

  test("builds an API range from a business-facing tab name", () => {
    expect(buildGoogleSheetRange("Sheet1")).toBe("Sheet1!A:Z");
    expect(buildGoogleSheetRange("Form Responses 1")).toBe("'Form Responses 1'!A:Z");
    expect(buildGoogleSheetRange("")).toBe("A:Z");
  });

  test("auto-matches common applicant form headers", () => {
    expect(autoMapGoogleSheetColumns(["full name", "mobile", "image", "city"])).toMatchObject({
      fullName: "full name",
      phone: "mobile",
      photoUrl: "image",
      city: "city"
    });
  });

  test("reports when required applicant fields are ready", () => {
    expect(getImportReadiness({ fullName: "full name", phone: "mobile" })).toEqual({
      ready: true,
      missing: []
    });
    expect(getImportReadiness({ fullName: "full name", phone: "" })).toEqual({
      ready: false,
      missing: ["WhatsApp number"]
    });
  });
});
