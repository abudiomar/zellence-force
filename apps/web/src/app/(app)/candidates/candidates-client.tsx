"use client";

import React from "react";
import type { ApplicantReviewQueueItem, ScreeningStatus } from "@zellforce/contracts";
import { ClipboardList, RefreshCw, Save, UserCheck } from "lucide-react";
import { StatusBadge } from "@zellforce/ui/components/badge";
import { Button } from "@zellforce/ui/components/button";
import { Field } from "@zellforce/ui/components/label";
import { Skeleton } from "@zellforce/ui/components/skeleton";
import { TextArea } from "@zellforce/ui/components/textarea";
import { saveApplicantToStaff, updateApplicantScreening } from "../_workspace/api";
import { ApplicantsTable } from "../_workspace/applicants-table";
import {
  CandidateIdentity,
  CandidateMedia,
  EmptyLine,
  PanelHeader,
  RawDataBlock,
  WorkspaceFeedback,
  WorkspaceHeader,
  contractTone,
  interviewTone,
  screeningTone
} from "../_workspace/components";
import { labelize, screeningStatuses } from "../_workspace/helpers";
import { calculateMetrics, useWorkspaceData } from "../_workspace/use-workspace-data";

export function CandidatesClient() {
  const { data, state, busy, status, error, reload, runBusy } = useWorkspaceData({ queue: true });
  const [selected, setSelected] = React.useState<ApplicantReviewQueueItem | null>(null);
  const [notes, setNotes] = React.useState("");

  const rows = data.rows;

  React.useEffect(() => {
    setSelected((current) => {
      if (!current) return rows[0] ?? null;
      return rows.find((item) => item.id === current.id) ?? rows[0] ?? null;
    });
  }, [rows]);

  React.useEffect(() => {
    setNotes(selected?.screeningNotes ?? "");
  }, [selected]);

  if (state === "loading") {
    return (
      <section className="applicants-skeleton">
        <Skeleton className="h-20" />
        <Skeleton className="h-96" />
      </section>
    );
  }

  if (state === "error") {
    return (
      <section className="screen-state">
        <h2>Unable to load candidate workspace</h2>
        <Button type="button" onClick={reload}>Retry</Button>
      </section>
    );
  }

  const metrics = calculateMetrics(rows, [], []);

  return (
    <div className="candidate-workspace">
      <WorkspaceHeader
        eyebrow="Candidate review"
        title="Screen applicants and move them through the pipeline"
        stats={
          <>
            <StatusBadge tone="review" label={`${metrics.needsReview} needs review`} />
            <StatusBadge tone="info" label={`${metrics.interviewQueue} interview queue`} />
            <StatusBadge tone="neutral" label={`${metrics.total} imported`} />
          </>
        }
        actions={
          <Button type="button" variant="secondary" onClick={reload}>
            <RefreshCw aria-hidden />Refresh
          </Button>
        }
      />

      <WorkspaceFeedback status={status} error={error} />

      <section className="candidate-two-column">
        <div className="candidate-panel candidate-panel--table">
          <PanelHeader icon={<ClipboardList />} title="Screening Workspace" />
          <ApplicantsTable rows={rows} selectedId={selected?.id} onRowActivate={setSelected} />
        </div>

        {selected ? (
          <aside className="candidate-panel candidate-detail-panel">
            <CandidateMedia row={selected} />
            <CandidateIdentity row={selected} />
            <div className="candidate-badge-row">
              <StatusBadge tone={screeningTone(selected.screeningStatus)} label={labelize(selected.screeningStatus)} />
              <StatusBadge tone={interviewTone(selected.interviewStatus)} label={labelize(selected.interviewStatus)} />
              <StatusBadge tone={contractTone(selected.contractStatus)} label={labelize(selected.contractStatus)} />
            </div>
            <div className="candidate-contact-grid">
              <span dir="ltr">{selected.phone ?? "-"}</span>
              <span>{selected.city ?? "-"}</span>
              <span>{selected.age ? `${selected.age} years` : "Age unknown"}</span>
              <span>{selected.gender ?? "Gender unknown"}</span>
            </div>
            <Field label="Screening notes">
              <TextArea value={notes} onChange={(event) => setNotes(event.currentTarget.value)} />
            </Field>
            <div className="decision-grid">
              {screeningStatuses.map((screeningStatus) => (
                <Button
                  key={screeningStatus}
                  type="button"
                  variant={screeningStatus === "rejected" ? "danger" : "secondary"}
                  size="sm"
                  loading={busy}
                  onClick={() => void runBusy(async () => {
                    await updateApplicantScreening(selected.id, {
                      screeningStatus,
                      ...(notes.trim() ? { notes: notes.trim() } : {})
                    } satisfies { screeningStatus: ScreeningStatus; notes?: string });
                    return `Screening updated: ${labelize(screeningStatus)}`;
                  })}
                >
                  {labelize(screeningStatus)}
                </Button>
              ))}
            </div>
            <div className="candidate-actions">
              <Button type="button" loading={busy} onClick={() => void runBusy(async () => {
                await saveApplicantToStaff(selected.id, "staff");
                return "Candidate saved to staff pool";
              })}>
                <UserCheck aria-hidden />Save to staff pool
              </Button>
              <Button type="button" variant="secondary" loading={busy} onClick={() => void runBusy(async () => {
                await saveApplicantToStaff(selected.id, "future");
                return "Candidate saved for future";
              })}>
                <Save aria-hidden />Save for future
              </Button>
            </div>
            <RawDataBlock data={selected.rawData ?? {}} />
          </aside>
        ) : (
          <aside className="candidate-panel candidate-detail-panel">
            <EmptyLine label="No candidate selected" />
          </aside>
        )}
      </section>
    </div>
  );
}
