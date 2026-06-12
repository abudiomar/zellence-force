import React from "react";
import { ProtectedShell } from "../../../components/protected-shell";

export default function GeneralSettingsPage() {
  return (
    <ProtectedShell>
      <section className="content-band">
        <h1>Tenant settings</h1>
        <p>Language, timezone, currency, and calendar settings.</p>
      </section>
    </ProtectedShell>
  );
}
