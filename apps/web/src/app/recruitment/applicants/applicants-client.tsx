"use client";

import React from "react";
import type { ApplicantReviewQueueItem } from "@zellforce/contracts";
import { CalendarClock, RefreshCw, Settings2, Sheet, UserCheck } from "lucide-react";
import { AlertBanner } from "@zellforce/ui/components/alert";
import { Badge, StatusBadge } from "@zellforce/ui/components/badge";
import { Button } from "@zellforce/ui/components/button";
import { Field } from "@zellforce/ui/components/label";
import { Select } from "@zellforce/ui/components/select";
import { Sheet as SheetRoot, SheetContent, SheetTitle, SheetTrigger } from "@zellforce/ui/components/sheet";
import { Skeleton } from "@zellforce/ui/components/skeleton";
import { Tabs } from "@zellforce/ui/components/tabs";
import { TextArea } from "@zellforce/ui/components/textarea";
import { TextInput } from "@zellforce/ui/components/input";
import { getApplicantStatusVisual } from "../../../ui/applicant-status-visuals";
import {
  decideApplicant,
  listApplicantReviewQueue,
  recordApplicantInterviewScore,
  runApplicantImport,
  scheduleApplicantInterview
} from "./applicants-api";
import { ApplicantsTable } from "./applicants-table";

type LoadState = "loading" | "ready" | "error";
type DetailTab = "review" | "interview" | "raw";

const defaultImportInput = {
  sourceId: "local-demo",
  sourceRange: "Form Responses 1!A:Z",
  mapping: {
    fullName: "Full Name",
    phone: "Mobile",
    email: "Email",
    city: "City"
  }
};

export function ApplicantsClient() {
  const [rows, setRows] = React.useState<ApplicantReviewQueueItem[]>([]);
  const [state, setState] = React.useState<LoadState>("loading");
  const [selected, setSelected] = React.useState<ApplicantReviewQueueItem | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [sourceOpen, setSourceOpen] = React.useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = React.useState(false);
  const [sourceId, setSourceId] = React.useState(defaultImportInput.sourceId);
  const [sourceRange, setSourceRange] = React.useState(defaultImportInput.sourceRange);
  const [decision, setDecision] = React.useState<"accept" | "reject" | "defer" | "merge">("accept");
  const [decisionNotes, setDecisionNotes] = React.useState("");
  const [targetPersonId, setTargetPersonId] = React.useState("");
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [interviewId, setInterviewId] = React.useState("");
  const [score, setScore] = React.useState("3");
  const [tab, setTab] = React.useState<DetailTab>("review");

  const refresh = React.useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const items = await listApplicantReviewQueue();
      setRows(items);
      setSelected((current) => {
        if (!current) return items[0] ?? null;
        return items.find((item) => item.id === current.id) ?? items[0] ?? null;
      });
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  async function runBusy(action: () => Promise<string>) {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      setStatus(await action());
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  function activateRow(row: ApplicantReviewQueueItem) {
    setSelected(row);
    setMobileDetailOpen(true);
  }

  const summary = getSummary(rows);

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
        <h2>Unable to load applicant review queue</h2>
        <Button type="button" onClick={() => void refresh()}>Retry</Button>
      </section>
    );
  }

  return (
    <div className="applicants-workspace">
      <section className="applicants-command">
        <div className="applicants-command__copy">
          <p>Applicant intake</p>
          <h2>Review imported Google Form responses</h2>
        </div>
        <div className="applicants-command__stats" aria-label="Applicant summary">
          <StatusBadge tone="review" label={`${summary.pending} pending`} />
          <StatusBadge tone="danger" label={`${summary.errors} errors`} />
          <StatusBadge tone="warning" label={`${summary.duplicates} duplicates`} />
          <StatusBadge tone="success" label={`${summary.accepted} accepted`} />
        </div>
        <div className="applicants-command__actions">
          <SheetRoot open={sourceOpen} onOpenChange={setSourceOpen}>
            <SheetTrigger asChild>
              <Button type="button" variant="secondary"><Settings2 aria-hidden />Source</Button>
            </SheetTrigger>
            <SheetContent side="end">
              <SheetTitle className="sheet-title">Google Sheet source</SheetTitle>
              <div className="source-form">
                <Field label="Sheet ID">
                  <TextInput value={sourceId} onChange={(event) => setSourceId(event.currentTarget.value)} />
                </Field>
                <Field label="Range">
                  <TextInput value={sourceRange} onChange={(event) => setSourceRange(event.currentTarget.value)} />
                </Field>
              </div>
            </SheetContent>
          </SheetRoot>
          <Button
            type="button"
            loading={busy}
            onClick={() =>
              void runBusy(async () => {
                const result = await runApplicantImport({
                  sourceId,
                  sourceRange,
                  mapping: defaultImportInput.mapping
                });
                return `Import ${result.status}: ${result.rowsImported} imported, ${result.rowsFailed} failed`;
              })
            }
          >
            <Sheet aria-hidden />Sync Google Sheet
          </Button>
          <Button type="button" variant="secondary" onClick={() => void refresh()}>
            <RefreshCw aria-hidden />Refresh
          </Button>
        </div>
      </section>

      {status ? <AlertBanner tone="success" title={status} /> : null}
      {error ? <AlertBanner tone="danger" title={error} /> : null}

      <section className="applicants-review-layout">
        <div className="applicants-table-panel">
          <ApplicantsTable rows={rows} selectedId={selected?.id} onRowActivate={activateRow} />
        </div>

        <aside className="applicant-detail desktop-detail" aria-label="Applicant review details">
          <ApplicantDetail
            selected={selected}
            tab={tab}
            setTab={setTab}
            decision={decision}
            setDecision={setDecision}
            decisionNotes={decisionNotes}
            setDecisionNotes={setDecisionNotes}
            targetPersonId={targetPersonId}
            setTargetPersonId={setTargetPersonId}
            scheduledAt={scheduledAt}
            setScheduledAt={setScheduledAt}
            interviewId={interviewId}
            setInterviewId={setInterviewId}
            score={score}
            setScore={setScore}
            busy={busy}
            runBusy={runBusy}
          />
        </aside>

        <SheetRoot open={mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
          <SheetContent side="end" className="mobile-detail-sheet">
            <SheetTitle className="zf-sr-only">Applicant details</SheetTitle>
            <ApplicantDetail
              selected={selected}
              tab={tab}
              setTab={setTab}
              decision={decision}
              setDecision={setDecision}
              decisionNotes={decisionNotes}
              setDecisionNotes={setDecisionNotes}
              targetPersonId={targetPersonId}
              setTargetPersonId={setTargetPersonId}
              scheduledAt={scheduledAt}
              setScheduledAt={setScheduledAt}
              interviewId={interviewId}
              setInterviewId={setInterviewId}
              score={score}
              setScore={setScore}
              busy={busy}
              runBusy={runBusy}
            />
          </SheetContent>
        </SheetRoot>
      </section>
    </div>
  );
}

function ApplicantDetail(props: {
  selected: ApplicantReviewQueueItem | null;
  tab: DetailTab;
  setTab: (tab: DetailTab) => void;
  decision: "accept" | "reject" | "defer" | "merge";
  setDecision: (decision: "accept" | "reject" | "defer" | "merge") => void;
  decisionNotes: string;
  setDecisionNotes: (value: string) => void;
  targetPersonId: string;
  setTargetPersonId: (value: string) => void;
  scheduledAt: string;
  setScheduledAt: (value: string) => void;
  interviewId: string;
  setInterviewId: (value: string) => void;
  score: string;
  setScore: (value: string) => void;
  busy: boolean;
  runBusy: (action: () => Promise<string>) => Promise<void>;
}) {
  const {
    selected,
    tab,
    setTab,
    decision,
    setDecision,
    decisionNotes,
    setDecisionNotes,
    targetPersonId,
    setTargetPersonId,
    scheduledAt,
    setScheduledAt,
    interviewId,
    setInterviewId,
    score,
    setScore,
    busy,
    runBusy
  } = props;

  if (!selected) {
    return (
      <section className="screen-state applicant-empty">
        <h2>Select an applicant row</h2>
        <p>Applicant details, decisions, and interview controls appear here.</p>
      </section>
    );
  }

  const visual = getApplicantStatusVisual(selected.status);
  const canDecide = ["pending_review", "error"].includes(selected.status);
  const acceptedPersonId = selected.status === "accepted" ? selected.matchedPersonId : null;
  const personId = acceptedPersonId ?? selected.matchedPersonId;

  return (
    <>
      <header className="applicant-detail__header">
        <div className="applicant-avatar" aria-hidden>{initials(selected.fullName)}</div>
        <div className="applicant-detail__identity">
          <h2>{selected.fullName ?? "Invalid applicant row"}</h2>
          <p dir="ltr">{selected.phone ?? selected.sourceRowId}</p>
        </div>
        <StatusBadge tone={visual.tone} label={visual.label} />
      </header>

      <div className="applicant-contact-grid">
        <span dir="ltr">{selected.email ?? "No email"}</span>
        <span>{selected.city ?? "No city"}</span>
      </div>

      {selected.errorMessages.length ? (
        <AlertBanner tone="danger" title={selected.errorMessages.join(", ")} />
      ) : null}
      {selected.matchedPersonId ? (
        <AlertBanner tone="warning" title="Possible duplicate person">
          <span dir="ltr">{selected.matchedPersonId}</span>
        </AlertBanner>
      ) : null}

      <Tabs
        active={tab}
        onChange={(value) => setTab(value as DetailTab)}
        tabs={[
          { id: "review", label: "Review" },
          { id: "interview", label: "Interview" },
          { id: "raw", label: "Raw row" }
        ]}
      />

      {tab === "review" ? (
        <section className="detail-section">
          <Field label="Decision">
            <Select value={decision} onChange={(event) => setDecision(event.currentTarget.value as typeof decision)}>
              <option value="accept">Accept and create Person</option>
              <option value="reject">Reject</option>
              <option value="defer">Defer</option>
              <option value="merge">Merge duplicate</option>
            </Select>
          </Field>
          {decision === "merge" ? (
            <Field label="Target Person ID">
              <TextInput dir="ltr" value={targetPersonId} onChange={(event) => setTargetPersonId(event.currentTarget.value)} />
            </Field>
          ) : null}
          <Field label="Notes">
            <TextArea value={decisionNotes} onChange={(event) => setDecisionNotes(event.currentTarget.value)} />
          </Field>
          <Button
            type="button"
            disabled={!canDecide || busy}
            loading={busy}
            onClick={() =>
              void runBusy(async () => {
                await decideApplicant(
                  selected.id,
                  decision === "merge"
                    ? { decision, targetPersonId, notes: decisionNotes || undefined }
                    : decision === "reject"
                      ? { decision, notes: decisionNotes || "Rejected in review" }
                      : { decision, notes: decisionNotes || undefined }
                );
                return "Applicant decision saved";
              })
            }
          >
            <UserCheck aria-hidden />Save decision
          </Button>
        </section>
      ) : null}

      {tab === "interview" ? (
        <section className="detail-section">
          <Field label="Person ID">
            <TextInput dir="ltr" value={personId ?? ""} readOnly placeholder="Accept or merge applicant first" />
          </Field>
          <Field label="Scheduled at">
            <TextInput type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.currentTarget.value)} />
          </Field>
          <Button
            type="button"
            variant="secondary"
            disabled={busy || !personId || !scheduledAt}
            onClick={() =>
              void runBusy(async () => {
                if (!personId) throw new Error("Accept or merge applicant first");
                const scheduled = await scheduleApplicantInterview({
                  personId,
                  scheduledAt: new Date(scheduledAt).toISOString()
                });
                setInterviewId(scheduled.interviewId);
                return `Interview scheduled: ${scheduled.interviewId}`;
              })
            }
          >
            <CalendarClock aria-hidden />Schedule interview
          </Button>
          <Field label="Interview ID">
            <TextInput dir="ltr" value={interviewId} onChange={(event) => setInterviewId(event.currentTarget.value)} />
          </Field>
          <Field label="Communication score">
            <TextInput type="number" min="0" max="5" step="0.5" value={score} onChange={(event) => setScore(event.currentTarget.value)} />
          </Field>
          <Button
            type="button"
            variant="secondary"
            disabled={busy || !interviewId}
            onClick={() =>
              void runBusy(async () => {
                const result = await recordApplicantInterviewScore({
                  interviewId,
                  scores: [{ criterion: "communication", score: Number(score) }],
                  minimumScore: 3
                });
                return `Interview score saved: ${result.overallScore}${result.belowMinimum ? " below minimum" : ""}`;
              })
            }
          >
            Record score
          </Button>
        </section>
      ) : null}

      {tab === "raw" ? (
        <section className="detail-section raw-row">
          <Badge tone="neutral">Source row</Badge>
          <code dir="ltr">{selected.sourceRowId}</code>
          <Badge tone="neutral">Created</Badge>
          <code dir="ltr">{selected.createdAt}</code>
        </section>
      ) : null}
    </>
  );
}

function getSummary(rows: ApplicantReviewQueueItem[]) {
  return rows.reduce(
    (summary, row) => ({
      pending: summary.pending + (row.status === "pending_review" ? 1 : 0),
      errors: summary.errors + (row.status === "error" || row.errorMessages.length > 0 ? 1 : 0),
      duplicates: summary.duplicates + (row.matchedPersonId ? 1 : 0),
      accepted: summary.accepted + (row.status === "accepted" ? 1 : 0)
    }),
    { pending: 0, errors: 0, duplicates: 0, accepted: 0 }
  );
}

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
