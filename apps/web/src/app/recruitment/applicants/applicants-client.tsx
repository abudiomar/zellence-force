"use client";

import React from "react";
import type {
  ApplicantReviewQueueItem,
  DemoContractStatus,
  DemoEvent,
  GoogleSheetMapping,
  InterviewStatus,
  ScreeningStatus,
  StaffPoolFilter,
  StaffPoolItem,
  WhatsAppInboundMessage
} from "@zellforce/contracts";
import type { StatusTone } from "@zellforce/ui/components/badge";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Filter,
  ImageIcon,
  MessageCircle,
  RefreshCw,
  Save,
  Search,
  Sheet,
  Star,
  UserCheck,
  Users
} from "lucide-react";
import { AlertBanner } from "@zellforce/ui/components/alert";
import { StatusBadge } from "@zellforce/ui/components/badge";
import { Button } from "@zellforce/ui/components/button";
import { Checkbox } from "@zellforce/ui/components/checkbox";
import { TextInput } from "@zellforce/ui/components/input";
import { Field } from "@zellforce/ui/components/label";
import { Select } from "@zellforce/ui/components/select";
import { Skeleton } from "@zellforce/ui/components/skeleton";
import { Tabs } from "@zellforce/ui/components/tabs";
import { TextArea } from "@zellforce/ui/components/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@zellforce/ui/components/table";
import {
  addCandidateToDemoEvent,
  createDemoEvent,
  listApplicantReviewQueue,
  listDemoEvents,
  listStaffPool,
  listWhatsAppInbox,
  previewApplicantSheetHeaders,
  runApplicantImport,
  saveApplicantToStaff,
  updateApplicantInterviewPipeline,
  updateApplicantScreening
} from "./applicants-api";
import { ApplicantsTable } from "./applicants-table";

type LoadState = "loading" | "ready" | "error";
type WorkspaceTab = "dashboard" | "intake" | "screening" | "interviews" | "staff" | "events" | "whatsapp";

const workspaceTabs: Array<{ id: WorkspaceTab; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "intake", label: "Applicant Intake" },
  { id: "screening", label: "Screening" },
  { id: "interviews", label: "Interviews" },
  { id: "staff", label: "Staff Pool" },
  { id: "events", label: "Demo Shortlist" },
  { id: "whatsapp", label: "WhatsApp Inbox" }
];

const defaultMapping: GoogleSheetMapping = {
  fullName: "Full Name",
  phone: "Mobile",
  email: "Email",
  city: "City",
  gender: "Gender",
  age: "Age",
  photoUrl: "Photo",
  cvUrl: "CV",
  experience: "Experience",
  notes: "Notes"
};

const screeningStatuses: ScreeningStatus[] = [
  "needs_review",
  "shortlist_for_interview",
  "save_to_staff_pool",
  "save_for_future",
  "underqualified",
  "overqualified",
  "rejected"
];

const interviewStatuses: InterviewStatus[] = [
  "not_scheduled",
  "scheduled",
  "interviewed",
  "no_show",
  "passed",
  "failed"
];

const contractStatuses: DemoContractStatus[] = [
  "not_sent",
  "sent",
  "pending",
  "signed",
  "refused"
];

const savedFilterViews: Array<{ id: string; label: string; filter: StaffPoolFilter }> = [
  { id: "ready-interview", label: "Ready for interview", filter: { screeningStatus: "shortlist_for_interview", interviewStatus: "not_scheduled" } },
  { id: "high-score", label: "High score", filter: { minFinalScore: 4 } },
  { id: "cv-photo", label: "Has CV + photo", filter: { hasCv: true, hasPhoto: true } },
  { id: "future", label: "Saved for future", filter: { screeningStatus: "save_for_future" } },
  { id: "event-ready", label: "Ready for event shortlist", filter: { interviewStatus: "passed", minFinalScore: 3.5 } }
];

const initialDemoEvent = {
  name: "Riyadh Launch Demo",
  city: "Riyadh",
  eventDate: "",
  roleName: "Host",
  neededHeadcount: "6"
};

export function ApplicantsClient() {
  const [rows, setRows] = React.useState<ApplicantReviewQueueItem[]>([]);
  const [staff, setStaff] = React.useState<StaffPoolItem[]>([]);
  const [events, setEvents] = React.useState<DemoEvent[]>([]);
  const [inbox, setInbox] = React.useState<WhatsAppInboundMessage[]>([]);
  const [state, setState] = React.useState<LoadState>("loading");
  const [tab, setTab] = React.useState<WorkspaceTab>("dashboard");
  const [selected, setSelected] = React.useState<ApplicantReviewQueueItem | null>(null);
  const [selectedStaffId, setSelectedStaffId] = React.useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = React.useState<string>("");
  const [sourceId, setSourceId] = React.useState("local-demo");
  const [sourceRange, setSourceRange] = React.useState("Form Responses 1!A:Z");
  const [mapping, setMapping] = React.useState<GoogleSheetMapping>(defaultMapping);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [sampleRows, setSampleRows] = React.useState<Array<Record<string, unknown>>>([]);
  const [staffFilter, setStaffFilter] = React.useState<StaffPoolFilter>({});
  const [screeningNotes, setScreeningNotes] = React.useState("");
  const [interviewStatus, setInterviewStatus] = React.useState<InterviewStatus>("not_scheduled");
  const [contractSent, setContractSent] = React.useState(false);
  const [contractStatus, setContractStatus] = React.useState<DemoContractStatus>("not_sent");
  const [presentationScore, setPresentationScore] = React.useState("");
  const [communicationScore, setCommunicationScore] = React.useState("");
  const [englishScore, setEnglishScore] = React.useState("");
  const [demoEvent, setDemoEvent] = React.useState(initialDemoEvent);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setError(null);
    const [queueItems, staffItems, demoEvents, messages] = await Promise.all([
      listApplicantReviewQueue(),
      listStaffPool(staffFilter),
      listDemoEvents(),
      listWhatsAppInbox()
    ]);
    setRows(queueItems);
    setStaff(staffItems);
    setEvents(demoEvents);
    setInbox(messages);
    setSelected((current) => {
      if (!current) return queueItems[0] ?? null;
      return queueItems.find((item) => item.id === current.id) ?? queueItems[0] ?? null;
    });
    setSelectedStaffId((current) => current ?? staffItems[0]?.id ?? null);
    setSelectedEventId((current) => current || demoEvents[0]?.id || "");
  }, [staffFilter]);

  React.useEffect(() => {
    setState("loading");
    refresh()
      .then(() => setState("ready"))
      .catch(() => setState("error"));
  }, [refresh]);

  React.useEffect(() => {
    setScreeningNotes(selected?.screeningNotes ?? "");
    setInterviewStatus(selected?.interviewStatus ?? "not_scheduled");
    setContractSent(selected?.contractSent ?? false);
    setContractStatus(selected?.contractStatus ?? "not_sent");
    setPresentationScore(formatScoreInput(selected?.presentationScore));
    setCommunicationScore(formatScoreInput(selected?.communicationScore));
    setEnglishScore(formatScoreInput(selected?.englishFluencyScore));
  }, [selected]);

  async function runBusy(action: () => Promise<string>) {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const message = await action();
      setStatus(message);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  const metrics = calculateMetrics(rows, staff, inbox);
  const selectedStaff = staff.find((item) => item.id === selectedStaffId) ?? staff[0] ?? null;

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
        <Button type="button" onClick={() => {
          setState("loading");
          void refresh().then(() => setState("ready")).catch(() => setState("error"));
        }}>
          Retry
        </Button>
      </section>
    );
  }

  return (
    <div className="candidate-workspace">
      <section className="candidate-command">
        <div className="candidate-command__copy">
          <p>Candidate management</p>
          <h2>Screen applicants, score interviews, and shortlist staff</h2>
        </div>
        <div className="candidate-command__stats" aria-label="Candidate workspace summary">
          <StatusBadge tone="review" label={`${metrics.needsReview} needs review`} />
          <StatusBadge tone="info" label={`${metrics.interviewQueue} interview queue`} />
          <StatusBadge tone="success" label={`${metrics.staffPool} staff pool`} />
          <StatusBadge tone={metrics.emergencies ? "danger" : "neutral"} label={`${metrics.emergencies} urgent`} />
        </div>
        <div className="candidate-command__actions">
          <Button type="button" variant="secondary" onClick={() => void refresh()}>
            <RefreshCw aria-hidden />Refresh
          </Button>
          <Button
            type="button"
            loading={busy}
            onClick={() => {
              setTab("intake");
              void runBusy(async () => {
                const result = await runApplicantImport({ sourceId, sourceRange, mapping });
                return `Import ${result.status}: ${result.rowsImported} imported, ${result.rowsFailed} failed`;
              });
            }}
          >
            <Sheet aria-hidden />Sync Sheet
          </Button>
        </div>
      </section>

      {status ? <AlertBanner tone="success" title={status} /> : null}
      {error ? <AlertBanner tone="danger" title={error} /> : null}

      <Tabs
        tabs={workspaceTabs}
        active={tab}
        onChange={(next) => setTab(next as WorkspaceTab)}
        className="candidate-tabs"
      />

      {tab === "dashboard" ? (
        <DashboardView metrics={metrics} rows={rows} inbox={inbox} setTab={setTab} />
      ) : null}

      {tab === "intake" ? (
        <IntakeView
          sourceId={sourceId}
          setSourceId={setSourceId}
          sourceRange={sourceRange}
          setSourceRange={setSourceRange}
          mapping={mapping}
          setMapping={setMapping}
          headers={headers}
          sampleRows={sampleRows}
          busy={busy}
          onPreview={() => void runBusy(async () => {
            const preview = await previewApplicantSheetHeaders({ sourceId, sourceRange });
            setHeaders(preview.headers);
            setSampleRows(preview.sampleRows);
            return `${preview.headers.length} headers detected`;
          })}
          onSync={() => void runBusy(async () => {
            const result = await runApplicantImport({ sourceId, sourceRange, mapping });
            return `Import ${result.status}: ${result.rowsImported} imported, ${result.rowsFailed} failed`;
          })}
        />
      ) : null}

      {tab === "screening" ? (
        <ScreeningView
          rows={rows}
          selected={selected}
          setSelected={setSelected}
          notes={screeningNotes}
          setNotes={setScreeningNotes}
          busy={busy}
          onScreening={(screeningStatus) => void runBusy(async () => {
            if (!selected) return "No candidate selected";
            await updateApplicantScreening(selected.id, {
              screeningStatus,
              ...(screeningNotes.trim() ? { notes: screeningNotes.trim() } : {})
            });
            return `Screening updated: ${labelize(screeningStatus)}`;
          })}
          onSave={(mode) => void runBusy(async () => {
            if (!selected) return "No candidate selected";
            await saveApplicantToStaff(selected.id, mode);
            return mode === "staff" ? "Candidate saved to staff pool" : "Candidate saved for future";
          })}
        />
      ) : null}

      {tab === "interviews" ? (
        <InterviewsView
          rows={rows}
          selected={selected}
          setSelected={setSelected}
          interviewStatus={interviewStatus}
          setInterviewStatus={setInterviewStatus}
          contractSent={contractSent}
          setContractSent={setContractSent}
          contractStatus={contractStatus}
          setContractStatus={setContractStatus}
          presentationScore={presentationScore}
          setPresentationScore={setPresentationScore}
          communicationScore={communicationScore}
          setCommunicationScore={setCommunicationScore}
          englishScore={englishScore}
          setEnglishScore={setEnglishScore}
          busy={busy}
          onSave={() => void runBusy(async () => {
            if (!selected) return "No candidate selected";
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
          })}
        />
      ) : null}

      {tab === "staff" ? (
        <StaffPoolView
          staff={staff}
          filter={staffFilter}
          setFilter={setStaffFilter}
          selectedStaffId={selectedStaffId}
          setSelectedStaffId={setSelectedStaffId}
          events={events}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
          busy={busy}
          onAddToEvent={() => void runBusy(async () => {
            if (!selectedStaff || !selectedEventId) return "Select staff and event";
            await addCandidateToDemoEvent(selectedEventId, {
              applicantRowId: selectedStaff.id,
              ...(selectedStaff.personId ? { personId: selectedStaff.personId } : {})
            });
            return "Candidate added to demo shortlist";
          })}
        />
      ) : null}

      {tab === "events" ? (
        <DemoEventsView
          events={events}
          form={demoEvent}
          setForm={setDemoEvent}
          busy={busy}
          onCreate={() => void runBusy(async () => {
            const created = await createDemoEvent({
              name: demoEvent.name,
              city: demoEvent.city || undefined,
              eventDate: demoEvent.eventDate || undefined,
              roleName: demoEvent.roleName,
              neededHeadcount: Number(demoEvent.neededHeadcount)
            });
            setSelectedEventId(created.id);
            return "Demo event created";
          })}
        />
      ) : null}

      {tab === "whatsapp" ? <WhatsAppView inbox={inbox} /> : null}
    </div>
  );
}

function DashboardView({
  metrics,
  rows,
  inbox,
  setTab
}: {
  metrics: ReturnType<typeof calculateMetrics>;
  rows: ApplicantReviewQueueItem[];
  inbox: WhatsAppInboundMessage[];
  setTab: (tab: WorkspaceTab) => void;
}) {
  const latestRows = rows.slice(0, 5);
  const emergencies = inbox.filter((message) => message.isEmergency).slice(0, 4);
  return (
    <section className="candidate-dashboard">
      <MetricPanel icon={<ClipboardList />} label="Imported candidates" value={metrics.total} />
      <MetricPanel icon={<UserCheck />} label="Ready for interview" value={metrics.interviewQueue} />
      <MetricPanel icon={<Users />} label="Saved staff" value={metrics.staffPool} />
      <MetricPanel icon={<AlertTriangle />} label="Emergency alerts" value={metrics.emergencies} tone={metrics.emergencies ? "danger" : "neutral"} />

      <section className="candidate-panel candidate-panel--wide">
        <PanelHeader icon={<ClipboardList />} title="Screening Queue" actionLabel="Open" onAction={() => setTab("screening")} />
        <div className="compact-list">
          {latestRows.map((row) => (
            <CandidateLine key={row.id} row={row} />
          ))}
          {latestRows.length === 0 ? <EmptyLine label="No imported candidates" /> : null}
        </div>
      </section>

      <section className="candidate-panel">
        <PanelHeader icon={<MessageCircle />} title="Urgent WhatsApp" actionLabel="Open" onAction={() => setTab("whatsapp")} />
        <div className="compact-list">
          {emergencies.map((message) => (
            <div className="message-line" key={message.id}>
              <strong>{message.matchedName ?? message.fromPhone}</strong>
              <span>{message.body}</span>
            </div>
          ))}
          {emergencies.length === 0 ? <EmptyLine label="No urgent messages" /> : null}
        </div>
      </section>
    </section>
  );
}

function IntakeView(props: {
  sourceId: string;
  setSourceId: (value: string) => void;
  sourceRange: string;
  setSourceRange: (value: string) => void;
  mapping: GoogleSheetMapping;
  setMapping: (value: GoogleSheetMapping) => void;
  headers: string[];
  sampleRows: Array<Record<string, unknown>>;
  busy: boolean;
  onPreview: () => void;
  onSync: () => void;
}) {
  const mappingFields: Array<{ key: keyof GoogleSheetMapping; label: string; required?: boolean }> = [
    { key: "fullName", label: "Full name", required: true },
    { key: "phone", label: "Phone", required: true },
    { key: "email", label: "Email" },
    { key: "city", label: "City/location" },
    { key: "gender", label: "Gender" },
    { key: "age", label: "Age" },
    { key: "dateOfBirth", label: "Date of birth" },
    { key: "photoUrl", label: "Photo URL" },
    { key: "cvUrl", label: "CV URL" },
    { key: "experience", label: "Experience" },
    { key: "notes", label: "Notes" }
  ];

  return (
    <section className="candidate-grid">
      <div className="candidate-panel candidate-panel--wide">
        <PanelHeader icon={<Sheet />} title="Google Sheet Intake" />
        <div className="candidate-form-grid">
          <Field label="Sheet ID">
            <TextInput value={props.sourceId} onChange={(event) => props.setSourceId(event.currentTarget.value)} />
          </Field>
          <Field label="Range">
            <TextInput value={props.sourceRange} onChange={(event) => props.setSourceRange(event.currentTarget.value)} />
          </Field>
        </div>
        <div className="candidate-actions">
          <Button type="button" variant="secondary" loading={props.busy} onClick={props.onPreview}>
            <Search aria-hidden />Preview headers
          </Button>
          <Button type="button" loading={props.busy} onClick={props.onSync}>
            <RefreshCw aria-hidden />Sync Google Sheet
          </Button>
        </div>
        <div className="header-chip-list" aria-label="Detected headers">
          {props.headers.map((header) => <span key={header}>{header}</span>)}
          {props.headers.length === 0 ? <span>No headers previewed</span> : null}
        </div>
      </div>

      <div className="candidate-panel">
        <PanelHeader icon={<Filter />} title="Field Mapping" />
        <div className="mapping-grid">
          {mappingFields.map((field) => (
            <Field key={field.key} label={`${field.label}${field.required ? " *" : ""}`}>
              <TextInput
                value={props.mapping[field.key] ?? ""}
                onChange={(event) => props.setMapping({
                  ...props.mapping,
                  [field.key]: event.currentTarget.value
                })}
              />
            </Field>
          ))}
        </div>
      </div>

      <div className="candidate-panel candidate-panel--wide">
        <PanelHeader icon={<FileText />} title="Sample Rows" />
        <div className="raw-data-grid">
          {props.sampleRows.map((row, index) => (
            <pre key={index}>{JSON.stringify(row, null, 2)}</pre>
          ))}
          {props.sampleRows.length === 0 ? <EmptyLine label="No sample rows loaded" /> : null}
        </div>
      </div>
    </section>
  );
}

function ScreeningView(props: {
  rows: ApplicantReviewQueueItem[];
  selected: ApplicantReviewQueueItem | null;
  setSelected: (row: ApplicantReviewQueueItem) => void;
  notes: string;
  setNotes: (value: string) => void;
  busy: boolean;
  onScreening: (status: ScreeningStatus) => void;
  onSave: (mode: "staff" | "future") => void;
}) {
  return (
    <section className="candidate-two-column">
      <div className="candidate-panel candidate-panel--table">
        <PanelHeader icon={<ClipboardList />} title="Screening Workspace" />
        <ApplicantsTable rows={props.rows} selectedId={props.selected?.id} onRowActivate={props.setSelected} />
      </div>
      <CandidateDetail
        selected={props.selected}
        notes={props.notes}
        setNotes={props.setNotes}
        busy={props.busy}
        onScreening={props.onScreening}
        onSave={props.onSave}
      />
    </section>
  );
}

function InterviewsView(props: {
  rows: ApplicantReviewQueueItem[];
  selected: ApplicantReviewQueueItem | null;
  setSelected: (row: ApplicantReviewQueueItem) => void;
  interviewStatus: InterviewStatus;
  setInterviewStatus: (value: InterviewStatus) => void;
  contractSent: boolean;
  setContractSent: (value: boolean) => void;
  contractStatus: DemoContractStatus;
  setContractStatus: (value: DemoContractStatus) => void;
  presentationScore: string;
  setPresentationScore: (value: string) => void;
  communicationScore: string;
  setCommunicationScore: (value: string) => void;
  englishScore: string;
  setEnglishScore: (value: string) => void;
  busy: boolean;
  onSave: () => void;
}) {
  const interviewRows = props.rows.filter((row) =>
    row.screeningStatus === "shortlist_for_interview" ||
    row.interviewStatus !== "not_scheduled" ||
    row.finalScore
  );
  return (
    <section className="candidate-two-column">
      <div className="candidate-panel candidate-panel--table">
        <PanelHeader icon={<Star />} title="Interview Pipeline" />
        <ApplicantsTable rows={interviewRows} selectedId={props.selected?.id} onRowActivate={props.setSelected} />
      </div>
      <aside className="candidate-panel candidate-detail-panel">
        <PanelHeader icon={<Star />} title="Score Entry" />
        {props.selected ? (
          <>
            <CandidateIdentity row={props.selected} />
            <div className="candidate-form-grid">
              <Field label="Interview status">
                <Select value={props.interviewStatus} onChange={(event) => props.setInterviewStatus(event.currentTarget.value as InterviewStatus)}>
                  {interviewStatuses.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
                </Select>
              </Field>
              <Field label="Contract status">
                <Select value={props.contractStatus} onChange={(event) => props.setContractStatus(event.currentTarget.value as DemoContractStatus)}>
                  {contractStatuses.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
                </Select>
              </Field>
            </div>
            <label className="checkbox-line">
              <Checkbox checked={props.contractSent} onChange={(event) => props.setContractSent(event.currentTarget.checked)} />
              <span>Contract sent</span>
            </label>
            <div className="score-grid">
              <Field label="Presentation">
                <TextInput inputMode="decimal" value={props.presentationScore} onChange={(event) => props.setPresentationScore(event.currentTarget.value)} />
              </Field>
              <Field label="Communication">
                <TextInput inputMode="decimal" value={props.communicationScore} onChange={(event) => props.setCommunicationScore(event.currentTarget.value)} />
              </Field>
              <Field label="English fluency">
                <TextInput inputMode="decimal" value={props.englishScore} onChange={(event) => props.setEnglishScore(event.currentTarget.value)} />
              </Field>
            </div>
            <div className="score-preview">
              <span>Final score</span>
              <strong>{averagePreview([props.presentationScore, props.communicationScore, props.englishScore])}</strong>
            </div>
            <Button type="button" loading={props.busy} onClick={props.onSave}>
              <Save aria-hidden />Save interview
            </Button>
          </>
        ) : (
          <EmptyLine label="No candidate selected" />
        )}
      </aside>
    </section>
  );
}

function StaffPoolView(props: {
  staff: StaffPoolItem[];
  filter: StaffPoolFilter;
  setFilter: (filter: StaffPoolFilter) => void;
  selectedStaffId: string | null;
  setSelectedStaffId: (id: string) => void;
  events: DemoEvent[];
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  busy: boolean;
  onAddToEvent: () => void;
}) {
  return (
    <section className="candidate-grid">
      <div className="candidate-panel candidate-panel--wide">
        <PanelHeader icon={<Filter />} title="Staff Filters" />
        <div className="saved-view-row">
          {savedFilterViews.map((view) => (
            <Button key={view.id} type="button" variant="secondary" size="sm" onClick={() => props.setFilter(view.filter)}>
              {view.label}
            </Button>
          ))}
        </div>
        <div className="filter-grid">
          <Field label="Name or phone">
            <TextInput value={props.filter.search ?? ""} onChange={(event) => props.setFilter({ ...props.filter, search: emptyToUndefined(event.currentTarget.value) })} />
          </Field>
          <Field label="City/location">
            <TextInput value={props.filter.city ?? ""} onChange={(event) => props.setFilter({ ...props.filter, city: emptyToUndefined(event.currentTarget.value) })} />
          </Field>
          <Field label="Gender">
            <TextInput value={props.filter.gender ?? ""} onChange={(event) => props.setFilter({ ...props.filter, gender: emptyToUndefined(event.currentTarget.value) })} />
          </Field>
          <Field label="Min age">
            <TextInput inputMode="numeric" value={props.filter.minAge ?? ""} onChange={(event) => props.setFilter({ ...props.filter, minAge: numberOrUndefined(event.currentTarget.value) })} />
          </Field>
          <Field label="Max age">
            <TextInput inputMode="numeric" value={props.filter.maxAge ?? ""} onChange={(event) => props.setFilter({ ...props.filter, maxAge: numberOrUndefined(event.currentTarget.value) })} />
          </Field>
          <Field label="Screening">
            <Select value={props.filter.screeningStatus ?? ""} onChange={(event) => props.setFilter({ ...props.filter, screeningStatus: emptyToUndefined(event.currentTarget.value) as ScreeningStatus | undefined })}>
              <option value="">Any</option>
              {screeningStatuses.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
            </Select>
          </Field>
          <Field label="Interview">
            <Select value={props.filter.interviewStatus ?? ""} onChange={(event) => props.setFilter({ ...props.filter, interviewStatus: emptyToUndefined(event.currentTarget.value) as InterviewStatus | undefined })}>
              <option value="">Any</option>
              {interviewStatuses.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
            </Select>
          </Field>
          <Field label="Contract">
            <Select value={props.filter.contractStatus ?? ""} onChange={(event) => props.setFilter({ ...props.filter, contractStatus: emptyToUndefined(event.currentTarget.value) as DemoContractStatus | undefined })}>
              <option value="">Any</option>
              {contractStatuses.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
            </Select>
          </Field>
          <Field label="Min final score">
            <TextInput inputMode="decimal" value={props.filter.minFinalScore ?? ""} onChange={(event) => props.setFilter({ ...props.filter, minFinalScore: numberOrUndefined(event.currentTarget.value) })} />
          </Field>
          <Field label="Min presentation">
            <TextInput inputMode="decimal" value={props.filter.minPresentation ?? ""} onChange={(event) => props.setFilter({ ...props.filter, minPresentation: numberOrUndefined(event.currentTarget.value) })} />
          </Field>
          <Field label="Min communication">
            <TextInput inputMode="decimal" value={props.filter.minCommunication ?? ""} onChange={(event) => props.setFilter({ ...props.filter, minCommunication: numberOrUndefined(event.currentTarget.value) })} />
          </Field>
          <Field label="Min English">
            <TextInput inputMode="decimal" value={props.filter.minEnglishFluency ?? ""} onChange={(event) => props.setFilter({ ...props.filter, minEnglishFluency: numberOrUndefined(event.currentTarget.value) })} />
          </Field>
        </div>
        <div className="checkbox-filter-row">
          <label><Checkbox checked={props.filter.hasPhoto === true} onChange={(event) => props.setFilter({ ...props.filter, hasPhoto: event.currentTarget.checked || undefined })} />Has photo</label>
          <label><Checkbox checked={props.filter.hasCv === true} onChange={(event) => props.setFilter({ ...props.filter, hasCv: event.currentTarget.checked || undefined })} />Has CV</label>
          <Button type="button" variant="secondary" size="sm" onClick={() => props.setFilter({})}>Clear filters</Button>
        </div>
      </div>

      <div className="candidate-panel candidate-panel--wide candidate-panel--table">
        <PanelHeader icon={<Users />} title={`Staff Pool (${props.staff.length})`} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Screening</TableHead>
              <TableHead>Interview</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Assets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.staff.map((item) => (
              <TableRow key={item.id} tabIndex={0} data-state={props.selectedStaffId === item.id ? "selected" : undefined} onClick={() => props.setSelectedStaffId(item.id)}>
                <TableCell><CandidateIdentity row={item} compact /></TableCell>
                <TableCell>{item.city ?? "-"}</TableCell>
                <TableCell>{item.age ?? "-"}</TableCell>
                <TableCell><StatusBadge tone={screeningTone(item.screeningStatus)} label={labelize(item.screeningStatus)} /></TableCell>
                <TableCell><StatusBadge tone={interviewTone(item.interviewStatus)} label={labelize(item.interviewStatus)} /></TableCell>
                <TableCell>{item.finalScore?.toFixed(2) ?? "-"}</TableCell>
                <TableCell>
                  <div className="flag-list">
                    <StatusBadge tone={item.photoUrl ? "success" : "neutral"} label={item.photoUrl ? "photo" : "no photo"} />
                    <StatusBadge tone={item.cvUrl ? "success" : "neutral"} label={item.cvUrl ? "CV" : "no CV"} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {props.staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-muted">No staff match the current filters</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <div className="candidate-panel">
        <PanelHeader icon={<CalendarDays />} title="Add to Demo Event" />
        <Field label="Event">
          <Select value={props.selectedEventId} onChange={(event) => props.setSelectedEventId(event.currentTarget.value)}>
            <option value="">Select event</option>
            {props.events.map((event) => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </Select>
        </Field>
        <Button type="button" loading={props.busy} disabled={!props.selectedStaffId || !props.selectedEventId} onClick={props.onAddToEvent}>
          <UserCheck aria-hidden />Add selected candidate
        </Button>
      </div>
    </section>
  );
}

function DemoEventsView(props: {
  events: DemoEvent[];
  form: typeof initialDemoEvent;
  setForm: (form: typeof initialDemoEvent) => void;
  busy: boolean;
  onCreate: () => void;
}) {
  return (
    <section className="candidate-grid">
      <div className="candidate-panel">
        <PanelHeader icon={<CalendarDays />} title="Create Demo Event" />
        <div className="candidate-form-grid">
          <Field label="Event name">
            <TextInput value={props.form.name} onChange={(event) => props.setForm({ ...props.form, name: event.currentTarget.value })} />
          </Field>
          <Field label="City">
            <TextInput value={props.form.city} onChange={(event) => props.setForm({ ...props.form, city: event.currentTarget.value })} />
          </Field>
          <Field label="Date">
            <TextInput type="date" value={props.form.eventDate} onChange={(event) => props.setForm({ ...props.form, eventDate: event.currentTarget.value })} />
          </Field>
          <Field label="Role name">
            <TextInput value={props.form.roleName} onChange={(event) => props.setForm({ ...props.form, roleName: event.currentTarget.value })} />
          </Field>
          <Field label="Needed headcount">
            <TextInput inputMode="numeric" value={props.form.neededHeadcount} onChange={(event) => props.setForm({ ...props.form, neededHeadcount: event.currentTarget.value })} />
          </Field>
        </div>
        <Button type="button" loading={props.busy} onClick={props.onCreate}>
          <Save aria-hidden />Create event
        </Button>
      </div>

      <div className="candidate-panel candidate-panel--wide">
        <PanelHeader icon={<ClipboardList />} title="Shortlist Progress" />
        <div className="event-grid">
          {props.events.map((event) => (
            <article className="event-row" key={event.id}>
              <div>
                <strong>{event.name}</strong>
                <span>{event.city ?? "No city"} · {event.roleName}</span>
              </div>
              <div className="event-progress">
                <ProgressValue label="Needed" value={event.neededHeadcount} />
                <ProgressValue label="Shortlisted" value={event.shortlisted} />
                <ProgressValue label="Confirmed" value={event.confirmed} />
              </div>
            </article>
          ))}
          {props.events.length === 0 ? <EmptyLine label="No demo events created" /> : null}
        </div>
      </div>
    </section>
  );
}

function WhatsAppView({ inbox }: { inbox: WhatsAppInboundMessage[] }) {
  const emergencies = inbox.filter((message) => message.isEmergency);
  return (
    <section className="candidate-grid">
      <div className="candidate-panel candidate-panel--wide">
        <PanelHeader icon={<AlertTriangle />} title={`Emergency Alerts (${emergencies.length})`} />
        <div className="message-grid">
          {emergencies.map((message) => <MessageCard key={message.id} message={message} />)}
          {emergencies.length === 0 ? <EmptyLine label="No emergency alerts" /> : null}
        </div>
      </div>
      <div className="candidate-panel candidate-panel--wide">
        <PanelHeader icon={<MessageCircle />} title="WhatsApp Inbox" />
        <div className="message-grid">
          {inbox.map((message) => <MessageCard key={message.id} message={message} />)}
          {inbox.length === 0 ? <EmptyLine label="No inbound WhatsApp messages" /> : null}
        </div>
      </div>
    </section>
  );
}

function CandidateDetail(props: {
  selected: ApplicantReviewQueueItem | null;
  notes: string;
  setNotes: (value: string) => void;
  busy: boolean;
  onScreening: (status: ScreeningStatus) => void;
  onSave: (mode: "staff" | "future") => void;
}) {
  if (!props.selected) {
    return (
      <aside className="candidate-panel candidate-detail-panel">
        <EmptyLine label="No candidate selected" />
      </aside>
    );
  }

  const row = props.selected;
  return (
    <aside className="candidate-panel candidate-detail-panel">
      <CandidateMedia row={row} />
      <CandidateIdentity row={row} />
      <div className="candidate-badge-row">
        <StatusBadge tone={screeningTone(row.screeningStatus)} label={labelize(row.screeningStatus)} />
        <StatusBadge tone={interviewTone(row.interviewStatus)} label={labelize(row.interviewStatus)} />
        <StatusBadge tone={contractTone(row.contractStatus)} label={labelize(row.contractStatus)} />
      </div>
      <div className="candidate-contact-grid">
        <span dir="ltr">{row.phone ?? "-"}</span>
        <span>{row.city ?? "-"}</span>
        <span>{row.age ? `${row.age} years` : "Age unknown"}</span>
        <span>{row.gender ?? "Gender unknown"}</span>
      </div>
      <Field label="Screening notes">
        <TextArea value={props.notes} onChange={(event) => props.setNotes(event.currentTarget.value)} />
      </Field>
      <div className="decision-grid">
        {screeningStatuses.map((status) => (
          <Button key={status} type="button" variant={status === "rejected" ? "danger" : "secondary"} size="sm" loading={props.busy} onClick={() => props.onScreening(status)}>
            {labelize(status)}
          </Button>
        ))}
      </div>
      <div className="candidate-actions">
        <Button type="button" loading={props.busy} onClick={() => props.onSave("staff")}>
          <UserCheck aria-hidden />Save to staff pool
        </Button>
        <Button type="button" variant="secondary" loading={props.busy} onClick={() => props.onSave("future")}>
          <Save aria-hidden />Save for future
        </Button>
      </div>
      <RawDataBlock data={row.rawData ?? {}} />
    </aside>
  );
}

function CandidateMedia({ row }: { row: ApplicantReviewQueueItem }) {
  return (
    <div className="candidate-media">
      {row.photoUrl ? (
        <img src={row.photoUrl} alt="" />
      ) : (
        <div className="candidate-media__empty"><ImageIcon aria-hidden /></div>
      )}
      <div className="candidate-media__links">
        {row.cvUrl ? <a href={row.cvUrl} target="_blank" rel="noreferrer">Open CV</a> : <span>No CV link</span>}
        {row.photoUrl ? <a href={row.photoUrl} target="_blank" rel="noreferrer">Open photo</a> : <span>No photo link</span>}
      </div>
    </div>
  );
}

function CandidateIdentity({ row, compact = false }: { row: Pick<ApplicantReviewQueueItem, "fullName" | "phone" | "sourceRowId" | "photoUrl">; compact?: boolean }) {
  return (
    <div className={compact ? "candidate-identity candidate-identity--compact" : "candidate-identity"}>
      <div className="candidate-avatar" aria-hidden>
        {row.photoUrl ? <img src={row.photoUrl} alt="" /> : initials(row.fullName)}
      </div>
      <div>
        <strong>{row.fullName ?? "Unnamed candidate"}</strong>
        <span>{row.phone ?? `Row ${row.sourceRowId}`}</span>
      </div>
    </div>
  );
}

function RawDataBlock({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  return (
    <div className="raw-data-block">
      <strong>Raw Sheet fields</strong>
      <div>
        {entries.map(([key, value]) => (
          <p key={key}>
            <span>{key}</span>
            <code>{String(value ?? "")}</code>
          </p>
        ))}
        {entries.length === 0 ? <span className="text-muted">No raw data</span> : null}
      </div>
    </div>
  );
}

function MetricPanel({ icon, label, value, tone = "neutral" }: { icon: React.ReactNode; label: string; value: number; tone?: StatusTone }) {
  return (
    <section className={`candidate-metric candidate-metric--${tone}`}>
      <span aria-hidden>{icon}</span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </section>
  );
}

function PanelHeader({ icon, title, actionLabel, onAction }: { icon: React.ReactNode; title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <header className="panel-header">
      <span aria-hidden>{icon}</span>
      <h3>{title}</h3>
      {actionLabel && onAction ? <Button type="button" variant="quiet" size="sm" onClick={onAction}>{actionLabel}</Button> : null}
    </header>
  );
}

function CandidateLine({ row }: { row: ApplicantReviewQueueItem }) {
  return (
    <div className="candidate-line">
      <CandidateIdentity row={row} compact />
      <div className="flag-list">
        <StatusBadge tone={screeningTone(row.screeningStatus)} label={labelize(row.screeningStatus)} />
        <StatusBadge tone={interviewTone(row.interviewStatus)} label={labelize(row.interviewStatus)} />
      </div>
    </div>
  );
}

function MessageCard({ message }: { message: WhatsAppInboundMessage }) {
  return (
    <article className={message.isEmergency ? "message-card message-card--danger" : "message-card"}>
      <div>
        <strong>{message.matchedName ?? message.fromPhone}</strong>
        <StatusBadge tone={whatsAppTone(message.intent, message.isEmergency)} label={labelize(message.intent)} />
      </div>
      <p>{message.body}</p>
      <span>{new Date(message.receivedAt).toLocaleString()}</span>
    </article>
  );
}

function ProgressValue({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function EmptyLine({ label }: { label: string }) {
  return <div className="empty-line">{label}</div>;
}

function calculateMetrics(
  rows: ApplicantReviewQueueItem[],
  staff: StaffPoolItem[],
  inbox: WhatsAppInboundMessage[]
) {
  return {
    total: rows.length,
    needsReview: rows.filter((row) => row.screeningStatus === "needs_review").length,
    interviewQueue: rows.filter((row) => row.screeningStatus === "shortlist_for_interview" || row.interviewStatus === "scheduled").length,
    staffPool: staff.length,
    emergencies: inbox.filter((message) => message.isEmergency).length
  };
}

function screeningTone(status: ScreeningStatus): StatusTone {
  if (status === "save_to_staff_pool") return "success";
  if (status === "shortlist_for_interview" || status === "save_for_future") return "info";
  if (status === "underqualified" || status === "overqualified") return "warning";
  if (status === "rejected") return "danger";
  return "review";
}

function interviewTone(status: InterviewStatus): StatusTone {
  if (status === "passed") return "success";
  if (status === "failed" || status === "no_show") return "danger";
  if (status === "scheduled" || status === "interviewed") return "info";
  return "neutral";
}

function contractTone(status: DemoContractStatus): StatusTone {
  if (status === "signed") return "success";
  if (status === "refused") return "danger";
  if (status === "sent" || status === "pending") return "warning";
  return "neutral";
}

function whatsAppTone(intent: WhatsAppInboundMessage["intent"], emergency: boolean): StatusTone {
  if (emergency) return "danger";
  if (intent === "profile_request" || intent === "current_status") return "info";
  return "neutral";
}

function labelize(value: string): string {
  return value.replaceAll("_", " ");
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

function parseScore(value: string): number | null {
  if (!value.trim()) return null;
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return Math.max(1, Math.min(5, score));
}

function formatScoreInput(value: number | null | undefined): string {
  return value ? String(value) : "";
}

function averagePreview(values: string[]): string {
  const scores = values.map(parseScore).filter((value): value is number => value !== null);
  if (scores.length === 0) return "-";
  return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2);
}

function emptyToUndefined(value: string): string | undefined {
  return value.trim() ? value : undefined;
}

function numberOrUndefined(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
