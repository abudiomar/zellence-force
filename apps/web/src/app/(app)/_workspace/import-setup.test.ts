import { describe, expect, test } from "vitest";
import {
  autoMapGoogleSheetColumns,
  buildGoogleSheetRange,
  chooseDefaultSheetTab,
  chooseInitialSheetTab,
  getImportReadiness,
  parseGoogleSheetGid,
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

  test("extracts the selected tab id from a Google Sheet URL", () => {
    expect(
      parseGoogleSheetGid(
        "https://docs.google.com/spreadsheets/d/sheet-123/edit?gid=987#gid=987"
      )
    ).toBe("987");
    expect(
      parseGoogleSheetGid(
        "https://docs.google.com/spreadsheets/d/sheet-123/edit#gid=456"
      )
    ).toBe("456");
    expect(parseGoogleSheetGid("sheet-123")).toBe("");
  });

  test("builds an API range from a business-facing tab name", () => {
    expect(buildGoogleSheetRange("Sheet1")).toBe("Sheet1!A:Z");
    expect(buildGoogleSheetRange("Form Responses 1")).toBe("'Form Responses 1'!A:Z");
    expect(buildGoogleSheetRange("")).toBe("A:Z");
  });

  test("defaults to the first discovered Sheet tab", () => {
    expect(
      chooseDefaultSheetTab([
        { id: "123", title: "Interview", index: 1 },
        { id: "0", title: "Form Responses 1", index: 0 }
      ])
    ).toBe("Form Responses 1");
    expect(chooseDefaultSheetTab([])).toBe("");
  });

  test("chooses the tab opened by the pasted Sheet URL before falling back to first tab", () => {
    const tabs = [
      { id: "0", title: "Form Responses 1", index: 0 },
      { id: "987", title: "Applicants - June", index: 1 }
    ];

    expect(chooseInitialSheetTab(tabs, "987")).toBe("Applicants - June");
    expect(chooseInitialSheetTab(tabs, "missing")).toBe("Form Responses 1");
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
