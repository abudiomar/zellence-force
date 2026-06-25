import type { ApplicantSheetReader, ApplicantSheetRow } from "@zellforce/application";
import { createSign } from "node:crypto";

export class GoogleSheetsAdapterError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "GoogleSheetsAdapterError";
  }
}

export function createGoogleSheetsApplicantAdapter(input: {
  accessToken?: string;
  serviceAccount?: {
    clientEmail?: string;
    privateKey?: string;
  };
  fetchImpl?: typeof fetch;
}): ApplicantSheetReader {
  const fetchImpl = input.fetchImpl ?? fetch;
  const tokenProvider = createGoogleSheetsTokenProvider(input, fetchImpl);
  return {
    async listTabs(args) {
      if (args.sourceId === "local-demo") {
        return [{ id: "0", title: "Form Responses 1", index: 0 }];
      }

      const accessToken = await tokenProvider();
      const url = new URL(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(args.sourceId)}`
      );
      url.searchParams.set("fields", "sheets.properties(sheetId,title,index)");
      const response = await fetchImpl(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        throw new GoogleSheetsAdapterError(
          "GOOGLE_SHEETS_TABS_FAILED",
          "Unable to list Google Sheet tabs",
          response.status
        );
      }

      const payload = await response.json() as {
        sheets?: Array<{
          properties?: {
            sheetId?: number;
            title?: string;
            index?: number;
          };
        }>;
      };
      return (payload.sheets ?? [])
        .map((sheet) => sheet.properties)
        .filter((properties): properties is { sheetId: number; title: string; index: number } =>
          typeof properties?.sheetId === "number" &&
          typeof properties.title === "string" &&
          typeof properties.index === "number"
        )
        .map((properties) => ({
          id: String(properties.sheetId),
          title: properties.title,
          index: properties.index
        }))
        .sort((left, right) => left.index - right.index);
    },
    async readRows(args) {
      if (args.sourceId === "local-demo") {
        return [
          {
            rowId: "2",
            values: {
              "Full Name": "Sara Ahmed",
              Mobile: "+966500000000",
              Email: "sara@example.com",
              City: "Riyadh",
              Gender: "female",
              Age: "25",
              Photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
              CV: "https://example.com/demo/sara-ahmed-cv.pdf",
              Experience: "Luxury retail event hostess"
            }
          },
          {
            rowId: "3",
            values: {
              "Full Name": "Omar Khalid",
              Mobile: "+966511111111",
              Email: "omar@example.com",
              City: "Riyadh",
              Gender: "male",
              Age: "27",
              Photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
              CV: "https://example.com/demo/omar-khalid-cv.pdf",
              Experience: "Usher and crowd flow lead"
            }
          },
          {
            rowId: "4",
            values: {
              "Full Name": "Missing Phone",
              Mobile: "",
              Email: "missing-phone@example.com",
              City: "Jeddah",
              Gender: "female",
              Age: "23"
            }
          }
        ];
      }

      const accessToken = await tokenProvider();

      // Read the grid (not the flat `values` endpoint) so we can recover cell
      // hyperlinks. Google Form file-upload answers and "Insert > Link" cells
      // show display text (e.g. a CV filename) while the real Drive URL lives in
      // the cell's hyperlink metadata — which the `values` endpoint strips.
      const url = new URL(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(args.sourceId)}`
      );
      url.searchParams.set("ranges", args.sourceRange);
      url.searchParams.set("includeGridData", "true");
      url.searchParams.set(
        "fields",
        "sheets.data.rowData.values(formattedValue,hyperlink,textFormatRuns.format.link.uri)"
      );
      const response = await fetchImpl(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        throw new GoogleSheetsAdapterError(
          "GOOGLE_SHEETS_READ_FAILED",
          "Unable to read Google Sheet rows",
          response.status
        );
      }

      const payload = await response.json() as GridDataPayload;
      return gridRowsToApplicantRows(payload);
    }
  };
}

type GridCell = {
  formattedValue?: string;
  hyperlink?: string;
  textFormatRuns?: Array<{ format?: { link?: { uri?: string } } }>;
};

type GridDataPayload = {
  sheets?: Array<{
    data?: Array<{
      rowData?: Array<{ values?: GridCell[] }>;
    }>;
  }>;
};

// Resolve a cell to the value we want to import. A hyperlink (whole-cell link or
// a rich-text run link) takes precedence over the display text, so a CV cell
// showing a filename yields its underlying Drive URL. Plain cells (including a
// cell whose text already IS a URL, like a pasted photo link) fall through to
// the formatted value unchanged.
export function effectiveCellValue(cell: GridCell | null | undefined): string {
  if (!cell) return "";
  if (cell.hyperlink) return cell.hyperlink;
  const runLink = cell.textFormatRuns?.find((run) => run.format?.link?.uri)?.format?.link?.uri;
  if (runLink) return runLink;
  return cell.formattedValue ?? "";
}

export function gridRowsToApplicantRows(payload: GridDataPayload): ApplicantSheetRow[] {
  const rowData = payload.sheets?.[0]?.data?.[0]?.rowData ?? [];
  if (rowData.length === 0) return [];
  const headers = (rowData[0]?.values ?? []).map((cell) => cell?.formattedValue ?? "");
  return rowData.slice(1).map((row, index): ApplicantSheetRow => ({
    rowId: String(index + 2),
    values: Object.fromEntries(
      headers.map((header, columnIndex) => [header, effectiveCellValue(row.values?.[columnIndex])])
    )
  }));
}

function createGoogleSheetsTokenProvider(
  input: {
    accessToken?: string;
    serviceAccount?: {
      clientEmail?: string;
      privateKey?: string;
    };
  },
  fetchImpl: typeof fetch
): () => Promise<string> {
  if (input.accessToken) {
    return async () => input.accessToken as string;
  }

  const clientEmail = input.serviceAccount?.clientEmail;
  const privateKey = input.serviceAccount?.privateKey?.replace(/\\n/g, "\n");
  let cachedToken: { token: string; expiresAt: number } | null = null;

  return async () => {
    if (!clientEmail || !privateKey) {
      throw new GoogleSheetsAdapterError(
        "GOOGLE_SHEETS_NOT_CONFIGURED",
        "Google Sheets Adapter is not configured"
      );
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (cachedToken && cachedToken.expiresAt - 60 > nowSeconds) {
      return cachedToken.token;
    }

    const assertion = signServiceAccountJwt({
      clientEmail,
      privateKey,
      issuedAt: nowSeconds,
      expiresAt: nowSeconds + 3600
    });

    const response = await fetchImpl("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion
      })
    });

    if (!response.ok) {
      throw new GoogleSheetsAdapterError(
        "GOOGLE_SHEETS_TOKEN_FAILED",
        "Unable to create Google Sheets access token",
        response.status
      );
    }

    const payload = await response.json() as { access_token?: string; expires_in?: number };
    if (!payload.access_token) {
      throw new GoogleSheetsAdapterError(
        "GOOGLE_SHEETS_TOKEN_FAILED",
        "Google token response did not include access_token"
      );
    }

    cachedToken = {
      token: payload.access_token,
      expiresAt: nowSeconds + (payload.expires_in ?? 3600)
    };
    return cachedToken.token;
  };
}

function signServiceAccountJwt(input: {
  clientEmail: string;
  privateKey: string;
  issuedAt: number;
  expiresAt: number;
}) {
  const header = base64UrlJson({ alg: "RS256", typ: "JWT" });
  const claims = base64UrlJson({
    iss: input.clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: input.expiresAt,
    iat: input.issuedAt
  });
  const signingInput = `${header}.${claims}`;
  const signature = createSign("RSA-SHA256")
    .update(signingInput)
    .end()
    .sign(input.privateKey, "base64url");
  return `${signingInput}.${signature}`;
}

function base64UrlJson(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}
