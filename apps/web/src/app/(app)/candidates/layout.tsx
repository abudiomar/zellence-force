import type { ReactNode } from "react";
import { CandidatesTabs } from "./candidates-tabs";

export default function CandidatesLayout({ children }: { children: ReactNode }) {
  return (
    <section className="content-band">
      <CandidatesTabs />
      {children}
    </section>
  );
}
