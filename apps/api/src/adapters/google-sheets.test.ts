import { describe, expect, test, vi } from "vitest";
import { createGoogleSheetsApplicantAdapter } from "./google-sheets";

describe("Google Sheets Applicant Adapter", () => {
  test("maps Sheets values to row records and classifies provider failures", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          values: [
            ["Full Name", "Mobile", "City"],
            ["Sara Ahmed", "+966500000000", "Riyadh"],
            ["No Phone", "", "Jeddah"]
          ]
        }),
        { status: 200 }
      )
    );
    const adapter = createGoogleSheetsApplicantAdapter({
      accessToken: "token",
      fetchImpl
    });

    await expect(
      adapter.readRows({
        sourceId: "sheet-123",
        sourceRange: "Form Responses 1!A:Z"
      })
    ).resolves.toEqual([
      {
        rowId: "2",
        values: {
          "Full Name": "Sara Ahmed",
          Mobile: "+966500000000",
          City: "Riyadh"
        }
      },
      {
        rowId: "3",
        values: {
          "Full Name": "No Phone",
          Mobile: "",
          City: "Jeddah"
        }
      }
    ]);
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining("/v4/spreadsheets/sheet-123/values/"),
      expect.objectContaining({
        headers: { Authorization: "Bearer token" }
      })
    );

    const failingAdapter = createGoogleSheetsApplicantAdapter({
      accessToken: "token",
      fetchImpl: vi.fn(async () => new Response("bad", { status: 403 }))
    });
    await expect(
      failingAdapter.readRows({ sourceId: "sheet-123", sourceRange: "A:Z" })
    ).rejects.toMatchObject({ code: "GOOGLE_SHEETS_READ_FAILED" });
  });

  test("lists spreadsheet tabs from Google Sheets metadata", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          sheets: [
            { properties: { sheetId: 0, title: "Form Responses 1", index: 0 } },
            { properties: { sheetId: 987, title: "Interview", index: 1 } }
          ]
        }),
        { status: 200 }
      )
    );
    const adapter = createGoogleSheetsApplicantAdapter({
      accessToken: "token",
      fetchImpl
    });

    await expect(adapter.listTabs({ sourceId: "sheet-123" })).resolves.toEqual([
      { id: "0", title: "Form Responses 1", index: 0 },
      { id: "987", title: "Interview", index: 1 }
    ]);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://sheets.googleapis.com/v4/spreadsheets/sheet-123?fields=sheets.properties%28sheetId%2Ctitle%2Cindex%29",
      expect.objectContaining({
        headers: { Authorization: "Bearer token" }
      })
    );

    const failingAdapter = createGoogleSheetsApplicantAdapter({
      accessToken: "token",
      fetchImpl: vi.fn(async () => new Response("bad", { status: 404 }))
    });
    await expect(
      failingAdapter.listTabs({ sourceId: "missing-sheet" })
    ).rejects.toMatchObject({ code: "GOOGLE_SHEETS_TABS_FAILED" });
  });
});
