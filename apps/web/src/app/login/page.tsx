import React from "react";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "../../components/login-form";

export default async function LoginPage() {
  const t = await getTranslations("app");

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <p className="eyebrow">{t("loginEyebrow")}</p>
        <h1 id="login-title">{t("brand")}</h1>
        <p>{t("loginHelp")}</p>
        <LoginForm />
      </section>
    </main>
  );
}
