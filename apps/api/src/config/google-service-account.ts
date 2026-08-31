import { readFileSync } from "node:fs";
import type { RuntimeEnv } from "@zellforce/config";

type GoogleSheetsAuthInput = Pick<
  Partial<RuntimeEnv>,
  "GOOGLE_CLIENT_EMAIL" | "GOOGLE_PRIVATE_KEY" | "GOOGLE_SERVICE_ACCOUNT_JSON_PATH"
>;

type GoogleSheetsAuthConfig = {
  serviceAccount?: {
    clientEmail?: string;
    privateKey?: string;
  };
};

export function loadGoogleSheetsAuth(
  input: GoogleSheetsAuthInput,
  readText: (path: string) => string = (path) => readFileSync(path, "utf8")
): GoogleSheetsAuthConfig {
  if (input.GOOGLE_CLIENT_EMAIL && input.GOOGLE_PRIVATE_KEY) {
    return {
      serviceAccount: {
        clientEmail: input.GOOGLE_CLIENT_EMAIL,
        privateKey: input.GOOGLE_PRIVATE_KEY
      }
    };
  }

  if (!input.GOOGLE_SERVICE_ACCOUNT_JSON_PATH) {
    return {};
  }

  const payload = JSON.parse(readText(input.GOOGLE_SERVICE_ACCOUNT_JSON_PATH)) as {
    client_email?: unknown;
    private_key?: unknown;
  };
  if (typeof payload.client_email !== "string" || typeof payload.private_key !== "string") {
    throw new Error(
      "Google service account JSON must include client_email and private_key"
    );
  }

  return {
    serviceAccount: {
      clientEmail: payload.client_email,
      privateKey: payload.private_key
    }
  };
}
