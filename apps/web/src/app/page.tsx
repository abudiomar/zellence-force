import React from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader, SectionPanel, StatusBadge } from "@zellforce/ui";
import { ProtectedShell } from "../components/protected-shell";

const operationalQueues = [
  ["Applicant review", "pending_review", "0 pending"],
  ["Events staffing", "active", "0 active"],
  ["Payment review", "in_review", "0 batches"]
] as const;

export default async function Page() {
  const t = await getTranslations("app");

  return (
    <ProtectedShell>
      <section className="content-band" aria-labelledby="dashboard-title">
        <PageHeader eyebrow="Zell-force / MAG Events" title={t("operations")} />
        <div className="dashboard-grid">
          {operationalQueues.map(([label, status, value]) => (
            <SectionPanel key={label}>
              <strong>{label}</strong>
              <p>{value}</p>
              <StatusBadge tone={status === "active" ? "success" : "review"} label={status} />
            </SectionPanel>
          ))}
        </div>
      </section>
    </ProtectedShell>
  );
}
