type LoginClient = {
  signIn: {
    email(input: {
      email: string;
      password: string;
    }): Promise<{
      error?: { message?: string | undefined } | null;
    }>;
  };
};

export async function loginWithEmail(
  client: LoginClient,
  input: { email: string; password: string }
): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await client.signIn.email(input);
  if (result.error) {
    return {
      ok: false,
      message: result.error.message ?? "Unable to sign in"
    };
  }
  return { ok: true };
}

export type ProtectedViewState = "loading" | "authenticated" | "redirect";

export function getProtectedViewState(
  isPending: boolean,
  session: unknown
): ProtectedViewState {
  if (isPending) {
    return "loading";
  }
  return session ? "authenticated" : "redirect";
}
