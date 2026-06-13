"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertBanner } from "@zellforce/ui/components/alert";
import { Button } from "@zellforce/ui/components/button";
import { Field } from "@zellforce/ui/components/label";
import { TextInput } from "@zellforce/ui/components/input";
import { authClient } from "../auth/auth-client";
import { loginWithEmail } from "../auth/auth-flow";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8)
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("app");
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  async function submit(input: LoginInput) {
    setServerError(null);
    const result = await loginWithEmail(authClient, input);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  const errors = Object.values(form.formState.errors)
    .map((error) => error.message)
    .filter((message): message is string => Boolean(message));

  return (
    <form className="auth-form" onSubmit={form.handleSubmit(submit)} noValidate>
      {errors.length ? (
        <AlertBanner tone="danger" title={t("error")}>
          <ul className="form-error-list">
            {errors.map((message) => <li key={message}>{message}</li>)}
          </ul>
        </AlertBanner>
      ) : null}
      <Field label={t("email")} error={form.formState.errors.email?.message}>
        <TextInput dir="ltr" type="email" autoComplete="email" {...form.register("email")} />
      </Field>
      <Field label={t("password")} error={form.formState.errors.password?.message}>
        <TextInput dir="ltr" type="password" autoComplete="current-password" {...form.register("password")} />
      </Field>
      {serverError ? <AlertBanner tone="danger" title={serverError} /> : null}
      <Button type="submit" loading={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? t("signingIn") : t("signIn")}
      </Button>
    </form>
  );
}
