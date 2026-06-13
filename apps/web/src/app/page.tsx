import React from "react";
import { StatusBadge } from "@zellforce/ui/components/badge";
import { ProtectedShell } from "../components/protected-shell";

const operationalQueues = [
  ["Applicant review", "Pending review", "0 pending"],
  ["Events staffing", "Active", "0 active"],
  ["Payment review", "In review", "0 batches"]
] as const;

export default async function Page() {
  return (
    <ProtectedShell>
      <section className="content-band">
        <div className="dashboard-grid">
          {operationalQueues.map(([label, status, value]) => (
            <section className="metric-panel" key={label}>
              <strong>{label}</strong>
              <p>{value}</p>
              <StatusBadge tone={status === "Active" ? "success" : "review"} label={status} />
            </section>
          ))}
        </div>
      </section>
    </ProtectedShell>
  );
}
