import React from "react";
import { ProtectedShell } from "../../../components/protected-shell";
import { ApplicantsClient } from "./applicants-client";

export default async function ApplicantReviewPage() {
  return (
    <ProtectedShell>
      <section className="content-band">
        <ApplicantsClient />
      </section>
    </ProtectedShell>
  );
}
