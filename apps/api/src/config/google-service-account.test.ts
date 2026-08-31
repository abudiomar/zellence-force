import { describe, expect, test, vi } from "vitest";
import { loadGoogleSheetsAuth } from "./google-service-account";

describe("Google service account config", () => {
  test("loads Google Sheets service account credentials from a mounted JSON file", () => {
    const readText = vi.fn(() =>
      JSON.stringify({
        client_email: "sheet-editor-bot@zellence.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----\\n"
      })
    );

    expect(
      loadGoogleSheetsAuth(
        { GOOGLE_SERVICE_ACCOUNT_JSON_PATH: "/run/secrets/google-sheets-service-account.json" },
        readText
      )
    ).toEqual({
      serviceAccount: {
        clientEmail: "sheet-editor-bot@zellence.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----\\n"
      }
    });
    expect(readText).toHaveBeenCalledWith("/run/secrets/google-sheets-service-account.json");
  });
});
