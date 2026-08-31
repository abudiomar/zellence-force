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
});
