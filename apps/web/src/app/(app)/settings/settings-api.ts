import type { TenantSettings, UpdateTenantSettingsInput } from "@zellforce/contracts";
import { getPublicEnv } from "../../../config/public-env";

export async function getTenantSettings(): Promise<TenantSettings> {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/settings`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Unable to load settings");
  }
  return response.json() as Promise<TenantSettings>;
}

export async function updateTenantSettings(input: UpdateTenantSettingsInput): Promise<TenantSettings> {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/settings`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw new Error("Unable to save settings");
  }
  return response.json() as Promise<TenantSettings>;
}
