"use client";

import React, { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../auth/auth-client";
import { loginWithEmail } from "../auth/auth-flow";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const result = await loginWithEmail(authClient, {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? "")
    });
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
        />
      </label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
