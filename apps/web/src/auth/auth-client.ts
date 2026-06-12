"use client";

import { createAuthClient } from "better-auth/react";
import { getPublicEnv } from "../config/public-env";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: getPublicEnv().NEXT_PUBLIC_API_URL,
  fetchOptions: {
    credentials: "include"
  }
});
