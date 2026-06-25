import { describe, expect, test, vi } from "vitest";
import {
  createGoogleSheetsApplicantAdapter,
  effectiveCellValue,
  gridRowsToApplicantRows
} from "./google-sheets";

function gridResponse(rows: Array<Array<{ formattedValue?: string; hyperlink?: string }>>) {
  return new Response(
    JSON.stringify({ sheets: [{ data: [{ rowData: rows.map((values) => ({ values })) }] }] }),
    { status: 200 }
  );
}

describe("Google Sheets Applicant Adapter", () => {
  test("reads grid rows, recovering cell hyperlinks, and classifies failures", async () => {
    const fetchImpl = vi.fn(async () =>
      gridResponse([
        [{ formattedValue: "Full Name" }, { formattedValue: "CV" }, { formattedValue: "photo" }],
        [
          { formattedValue: "Sara Ahmed" },
          { formattedValue: "sara_cv.pdf", hyperlink: "https://drive.google.com/file/d/CVID/view" },
          { formattedValue: "https://drive.google.com/open?id=PHOTOID" }
        ]
      ])
    );
    const adapter = createGoogleSheetsApplicantAdapter({ accessToken: "token", fetchImpl });

    await expect(
      adapter.readRows({ sourceId: "sheet-123", sourceRange: "Form Responses 1!A:Z" })
    ).resolves.toEqual([
      {
        rowId: "2",
        values: {
          "Full Name": "Sara Ahmed",
          CV: "https://drive.google.com/file/d/CVID/view",
          photo: "https://drive.google.com/open?id=PHOTOID"
        }
      }
    ]);
    // Uses the grid endpoint (spreadsheets.get + includeGridData), not /values/.
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining("/v4/spreadsheets/sheet-123?"),
      expect.objectContaining({ headers: { Authorization: "Bearer token" } })
    );
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining("includeGridData=true"),
      expect.anything()
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

describe("google-sheets hyperlink extraction", () => {
  test("prefers a whole-cell hyperlink over the display text", () => {
    expect(
      effectiveCellValue({
        formattedValue: "abdullah_omar_CV (2).pdf",
        hyperlink: "https://drive.google.com/file/d/FILE_ID/view"
      })
    ).toBe("https://drive.google.com/file/d/FILE_ID/view");
  });

  test("falls back to a rich-text run link when there is no whole-cell hyperlink", () => {
    expect(
      effectiveCellValue({
        formattedValue: "my resume",
        textFormatRuns: [{ format: { link: { uri: "https://drive.google.com/open?id=ABC" } } }]
      })
    ).toBe("https://drive.google.com/open?id=ABC");
  });

  test("uses the formatted value when the cell has no link", () => {
    expect(effectiveCellValue({ formattedValue: "abdullah omar" })).toBe("abdullah omar");
    expect(
      effectiveCellValue({ formattedValue: "https://drive.google.com/open?id=PHOTO" })
    ).toBe("https://drive.google.com/open?id=PHOTO");
  });

  test("returns empty string for blank or missing cells", () => {
    expect(effectiveCellValue(undefined)).toBe("");
    expect(effectiveCellValue({})).toBe("");
  });

  test("returns an empty list when the grid has no rows", () => {
    expect(gridRowsToApplicantRows({})).toEqual([]);
    expect(gridRowsToApplicantRows({ sheets: [{ data: [{ rowData: [] }] }] })).toEqual([]);
  });
});
