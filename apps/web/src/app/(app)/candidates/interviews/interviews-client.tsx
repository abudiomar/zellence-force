"use client";

import React from "react";
import type {
  ApplicantReviewQueueItem,
  DemoContractStatus,
  InterviewStatus
} from "@zellforce/contracts";
import { RefreshCw, Save, Star } from "lucide-react";
import { Button } from "@zellforce/ui/components/button";
import { Checkbox } from "@zellforce/ui/components/checkbox";
import { TextInput } from "@zellforce/ui/components/input";
import { Field } from "@zellforce/ui/components/label";
import { Select } from "@zellforce/ui/components/select";
import { Skeleton } from "@zellforce/ui/components/skeleton";
import { updateApplicantInterviewPipeline } from "../../_workspace/api";
import { ApplicantsTable } from "../../_workspace/applicants-table";
import {
  CandidateIdentity,
  EmptyLine,
  PanelHeader,
  WorkspaceFeedback,
  WorkspaceHeader
} from "../../_workspace/components";
import {
  averagePreview,
  contractStatuses,
  formatScoreInput,
  interviewStatuses,
  labelize,
  parseScore
} from "../../_workspace/helpers";
import { useWorkspaceData } from "../../_workspace/use-workspace-data";

export function InterviewsClient() {
  const { data, state, busy, status, error, reload, runBusy } = useWorkspaceData({ queue: true });
  const [selected, setSelected] = React.useState<ApplicantReviewQueueItem | null>(null);
  const [interviewStatus, setInterviewStatus] = React.useState<InterviewStatus>("not_scheduled");
  const [contractSent, setContractSent] = React.useState(false);
  const [contractStatus, setContractStatus] = React.useState<DemoContractStatus>("not_sent");
  const [presentationScore, setPresentationScore] = React.useState("");
  const [communicationScore, setCommunicationScore] = React.useState("");
  const [englishScore, setEnglishScore] = React.useState("");

  const interviewRows = React.useMemo(
    () =>
      data.rows.filter(
        (row) =>
          row.screeningStatus === "shortlist_for_interview" ||
          row.interviewStatus !== "not_scheduled" ||
          row.finalScore
      ),
    [data.rows]
  );

  React.useEffect(() => {
    setSelected((current) => {
      if (!current) return interviewRows[0] ?? null;
      return interviewRows.find((item) => item.id === current.id) ?? interviewRows[0] ?? null;
    });
  }, [interviewRows]);

  React.useEffect(() => {
    setInterviewStatus(selected?.interviewStatus ?? "not_scheduled");
    setContractSent(selected?.contractSent ?? false);
    setContractStatus(selected?.contractStatus ?? "not_sent");
    setPresentationScore(formatScoreInput(selected?.presentationScore));
    setCommunicationScore(formatScoreInput(selected?.communicationScore));
    setEnglishScore(formatScoreInput(selected?.englishFluencyScore));
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
        <h2>Unable to load interview pipeline</h2>
        <Button type="button" onClick={reload}>Retry</Button>
      </section>
    );
  }

  return (
    <div className="candidate-workspace">
      <WorkspaceHeader
        eyebrow="Interviews"
        title="Score interviews and track contract progress"
        actions={
          <Button type="button" variant="secondary" onClick={reload}>
            <RefreshCw aria-hidden />Refresh
          </Button>
        }
      />

      <WorkspaceFeedback status={status} error={error} />

      <section className="candidate-two-column">
        <div className="candidate-panel candidate-panel--table">
          <PanelHeader icon={<Star />} title="Interview Pipeline" />
          <ApplicantsTable
            rows={interviewRows}
            selectedId={selected?.id}
            onRowActivate={setSelected}
            emptyLabel="No candidates in the interview pipeline yet"
          />
        </div>
        <aside className="candidate-panel candidate-detail-panel">
          <PanelHeader icon={<Star />} title="Score Entry" />
          {selected ? (
            <>
              <CandidateIdentity row={selected} />
              <div className="candidate-form-grid">
                <Field label="Interview status">
                  <Select value={interviewStatus} onChange={(event) => setInterviewStatus(event.currentTarget.value as InterviewStatus)}>
                    {interviewStatuses.map((value) => <option key={value} value={value}>{labelize(value)}</option>)}
                  </Select>
                </Field>
                <Field label="Contract status">
                  <Select value={contractStatus} onChange={(event) => setContractStatus(event.currentTarget.value as DemoContractStatus)}>
                    {contractStatuses.map((value) => <option key={value} value={value}>{labelize(value)}</option>)}
                  </Select>
                </Field>
              </div>
              <label className="checkbox-line">
                <Checkbox checked={contractSent} onChange={(event) => setContractSent(event.currentTarget.checked)} />
                <span>Contract sent</span>
              </label>
              <div className="score-grid">
                <Field label="Presentation">
                  <TextInput inputMode="decimal" value={presentationScore} onChange={(event) => setPresentationScore(event.currentTarget.value)} />
                </Field>
                <Field label="Communication">
                  <TextInput inputMode="decimal" value={communicationScore} onChange={(event) => setCommunicationScore(event.currentTarget.value)} />
                </Field>
                <Field label="English fluency">
                  <TextInput inputMode="decimal" value={englishScore} onChange={(event) => setEnglishScore(event.currentTarget.value)} />
                </Field>
              </div>
              <div className="score-preview">
                <span>Final score</span>
                <strong>{averagePreview([presentationScore, communicationScore, englishScore])}</strong>
              </div>
              <Button type="button" loading={busy} onClick={() => void runBusy(async () => {
                await updateApplicantInterviewPipeline(selected.id, {
                  interviewStatus,
                  contractSent,
                  contractStatus,
                  scores: {
                    presentation: parseScore(presentationScore),
                    communication: parseScore(communicationScore),
                    englishFluency: parseScore(englishScore)
                  }
                });
                return "Interview pipeline updated";
              })}>
                <Save aria-hidden />Save interview
              </Button>
            </>
          ) : (
            <EmptyLine label="No candidate selected" />
          )}
        </aside>
      </section>
    </div>
  );
}
