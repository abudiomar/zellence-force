import React from "react";
import { ProtectedShell } from "../../../components/protected-shell";

export default function UsersSettingsPage() {
  return (
    <ProtectedShell>
      <section className="content-band">
        <h1>Internal users</h1>
        <p>User management API is protected and ready.</p>
      </section>
    </ProtectedShell>
  );
}
