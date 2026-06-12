import React from "react";
import { ProtectedShell } from "../components/protected-shell";

const operationalQueues = [
  ["Applicant review", "0 pending"],
  ["Events staffing", "0 active"],
  ["Payment review", "0 batches"]
] as const;

export default function Page() {
  return (
    <ProtectedShell>
      <section className="content-band" aria-labelledby="dashboard-title">
        <p className="eyebrow">Zell-force / MAG Events</p>
        <h1 id="dashboard-title">Event staffing operations</h1>
        <div className="queue-list">
          {operationalQueues.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>
    </ProtectedShell>
  );
}
