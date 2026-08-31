import type { AuthenticatedUser } from "@zellforce/contracts";
import { getPublicEnv } from "../config/public-env";

export async function getCurrentActor(): Promise<AuthenticatedUser | null> {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/me`, {
    credentials: "include"
  });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Unable to load current user");
  }
  return response.json() as Promise<AuthenticatedUser>;
}
