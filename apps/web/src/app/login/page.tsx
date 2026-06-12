import React from "react";
import { LoginForm } from "../../components/login-form";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <p className="eyebrow">MAG Events</p>
        <h1 id="login-title">Zell-force</h1>
        <p>Internal operations access</p>
        <LoginForm />
      </section>
    </main>
  );
}
