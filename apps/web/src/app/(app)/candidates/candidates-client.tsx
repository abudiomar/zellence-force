"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { ApplicantReviewQueueItem, ScreeningStatus } from "@zellforce/contracts";
import { CheckCircle2, ClipboardList, Maximize2, RefreshCw, UserCheck, XCircle } from "lucide-react";
import { AlertDialog } from "@zellforce/ui/components/alert-dialog";
import { StatusBadge } from "@zellforce/ui/components/badge";
import { Button } from "@zellforce/ui/components/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle
} from "@zellforce/ui/components/dialog";
import {
  FilterBar,
  FilterChip,
  FilterSearch,
  GenderSegment,
  MultiSelectFilter,
  RangePill,
  distinctMultiOptions,
  distinctOptions,
  type FilterOption
} from "../_workspace/filters";
import { Field } from "@zellforce/ui/components/label";
import { Select } from "@zellforce/ui/components/select";
import { Skeleton } from "@zellforce/ui/components/skeleton";
import { TextArea } from "@zellforce/ui/components/textarea";
import { saveApplicantToStaff, updateApplicantScreening } from "../_workspace/api";
import { ApplicantsTable } from "../_workspace/applicants-table";
import { CandidateDetailDialog } from "../_workspace/candidate-detail";
import {
  CandidateIdentity,
  CandidateMedia,
  EmptyLine,
  EmptyState,
  PanelHeader,
  RawDataBlock,
  WorkspaceFeedback,
  WorkspaceHeader,
  contractTone,
  interviewTone,
  screeningTone
} from "../_workspace/components";
import { useStatusLabels } from "../_workspace/status-labels";
import { calculateMetrics, useWorkspaceData } from "../_workspace/use-workspace-data";
import {
  EMPTY_FILTERS,
  matchesScreeningFilters,
  screeningFiltersActive,
  type ScreeningFilters
} from "./candidates-filter";

type StaffSaveReason = Extract<ScreeningStatus, "needs_review" | "underqualified" | "overqualified">;
type StaffSaveDialogState = {
  rowIds: string[];
};

function ScreeningFilterBar({
  filters,
  setFilters,
  shown,
  total,
  cityOptions,
  nationalityOptions,
  languageOptions,
  experienceOptions
}: {
  filters: ScreeningFilters;
  setFilters: React.Dispatch<React.SetStateAction<ScreeningFilters>>;
  shown: number;
  total: number;
  cityOptions: FilterOption[];
  nationalityOptions: FilterOption[];
  languageOptions: FilterOption[];
  experienceOptions: FilterOption[];
}) {
  const t = useTranslations("app.workspace.screen");
  const update = (patch: Partial<ScreeningFilters>) => setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <FilterBar
      shown={shown}
      total={total}
      active={screeningFiltersActive(filters)}
      onClear={() => setFilters(EMPTY_FILTERS)}
      search={
        <FilterSearch
          value={filters.search}
          onChange={(search) => update({ search })}
          placeholder={t("searchPlaceholder")}
        />
      }
    >
      <RangePill
        label={t("age")}
        minValue={filters.minAge}
        maxValue={filters.maxAge}
        onMinChange={(minAge) => update({ minAge })}
        onMaxChange={(maxAge) => update({ maxAge })}
        minPlaceholder={t("ageMin")}
        maxPlaceholder={t("ageMax")}
      />
      <MultiSelectFilter
        label={t("experience")}
        options={experienceOptions}
        selected={filters.experiences}
        onChange={(experiences) => update({ experiences })}
        emptyLabel={t("noOptions")}
      />
      <MultiSelectFilter
        label={t("language")}
        options={languageOptions}
        selected={filters.languages}
        onChange={(languages) => update({ languages })}
        emptyLabel={t("noOptions")}
      />
      <MultiSelectFilter
        label={t("city")}
        options={cityOptions}
        selected={filters.cities}
        onChange={(cities) => update({ cities })}
        emptyLabel={t("noOptions")}
      />
      <MultiSelectFilter
        label={t("nationality")}
        options={nationalityOptions}
        selected={filters.nationalities}
        onChange={(nationalities) => update({ nationalities })}
        emptyLabel={t("noOptions")}
      />
      <FilterChip active={filters.canTravel} onClick={() => update({ canTravel: !filters.canTravel })}>
        {t("canTravel")}
      </FilterChip>
      <GenderSegment value={filters.gender} onChange={(gender) => update({ gender })} />
    </FilterBar>
  );
}

export function CandidatesClient() {
  const { data, state, busy, status, error, reload, runBusy } = useWorkspaceData({ queue: true });
  const labels = useStatusLabels();
  const t = useTranslations("app.workspace");
  const tg = useTranslations("app.workspace.guided");
  const [selected, setSelected] = React.useState<ApplicantReviewQueueItem | null>(null);
  const [selectedRowIds, setSelectedRowIds] = React.useState<Set<string>>(new Set());
  const [notes, setNotes] = React.useState("");
  const [staffSaveDialog, setStaffSaveDialog] = React.useState<StaffSaveDialogState | null>(null);
  const [staffSaveReason, setStaffSaveReason] = React.useState<StaffSaveReason | "">("");
  const [rejectRowIds, setRejectRowIds] = React.useState<string[] | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<ScreeningFilters>(EMPTY_FILTERS);
  const td = useTranslations("app.detail");
  const ts = useTranslations("app.workspace.screen");

  const rows = data.rows;
  const filteredRows = React.useMemo(
    () => rows.filter((row) => matchesScreeningFilters(row, filters)),
    [rows, filters]
  );
  // Filter options are derived from the whole queue (not the filtered view), so
  // ticking one value doesn't make the others disappear.
  const cityOptions = React.useMemo(() => distinctOptions(rows, (row) => row.city), [rows]);
  const nationalityOptions = React.useMemo(() => distinctOptions(rows, (row) => row.nationality), [rows]);
  const languageOptions = React.useMemo(() => distinctMultiOptions(rows, (row) => row.languages), [rows]);
  const experienceOptions = React.useMemo(() => distinctMultiOptions(rows, (row) => row.experience), [rows]);
  const selectedRows = rows.filter((row) => selectedRowIds.has(row.id));
  const selectedCount = selectedRows.length;

  // Keep the detail panel pinned to a visible row: hold the current selection if
  // it still passes the filters, otherwise drop to the first filtered result.
  React.useEffect(() => {
    setSelected((current) => {
      if (current && filteredRows.some((item) => item.id === current.id)) return current;
      return filteredRows[0] ?? null;
    });
  }, [filteredRows]);

  React.useEffect(() => {
    const rowIds = new Set(rows.map((row) => row.id));
    setSelectedRowIds((current) => new Set([...current].filter((id) => rowIds.has(id))));
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
        <Button type="button" onClick={reload}>{t("retry")}</Button>
      </section>
    );
  }

  const metrics = calculateMetrics(rows, [], []);
  const staffReasonOptions: Array<{ value: StaffSaveReason; label: string }> = [
    { value: "needs_review", label: labels.screening("needs_review") },
    { value: "underqualified", label: labels.screening("underqualified") },
    { value: "overqualified", label: labels.screening("overqualified") }
  ];

  function setRowSelection(rowId: string, checked: boolean) {
    setSelectedRowIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(rowId);
      } else {
        next.delete(rowId);
      }
      return next;
    });
  }

  function rowIdsFor(row: ApplicantReviewQueueItem | null): string[] {
    return row ? [row.id] : [];
  }

  async function shortlistRows(rowIds: string[], includeDetailNotes = false) {
    for (const rowId of rowIds) {
      await updateApplicantScreening(rowId, {
        screeningStatus: "shortlist_for_interview",
        ...(includeDetailNotes && notes.trim() ? { notes: notes.trim() } : {})
      });
    }
    setSelectedRowIds(new Set());
    await reload();
    return `${rowIds.length} candidate${rowIds.length === 1 ? "" : "s"} sent to interview`;
  }

  async function rejectRows(rowIds: string[]) {
    for (const rowId of rowIds) {
      await updateApplicantScreening(rowId, {
        screeningStatus: "rejected",
        ...(rowIds.length === 1 && notes.trim() ? { notes: notes.trim() } : {})
      });
    }
    setSelectedRowIds(new Set());
    setRejectRowIds(null);
    await reload();
    return `${rowIds.length} candidate${rowIds.length === 1 ? "" : "s"} rejected`;
  }

  async function saveRowsToStaff(rowIds: string[], reason: StaffSaveReason | "") {
    const reasonLabel = reason ? labels.screening(reason) : "";
    for (const rowId of rowIds) {
      const detailNotes = rowIds.length === 1 ? notes.trim() : "";
      const reasonNote = reasonLabel ? `Staff pool reason: ${reasonLabel}` : "";
      const nextNotes = [detailNotes, reasonNote].filter(Boolean).join("\n");
      if (nextNotes || reason) {
        await updateApplicantScreening(rowId, {
          screeningStatus: reason || "needs_review",
          ...(nextNotes ? { notes: nextNotes } : {})
        });
      }
      await saveApplicantToStaff(rowId, "staff");
    }
    setSelectedRowIds(new Set());
    setStaffSaveDialog(null);
    setStaffSaveReason("");
    await reload();
    return `${rowIds.length} candidate${rowIds.length === 1 ? "" : "s"} saved to staff pool`;
  }

  // Per-candidate screening controls. Shared between the workspace side panel and
  // the expanded detail dialog so the actions stay identical in both places.
  function renderScreeningActions(row: ApplicantReviewQueueItem) {
    return (
      <div className="screening-action-row">
        <Button
          type="button"
          variant="secondary"
          className="screening-action screening-action--shortlist"
          loading={busy}
          onClick={() => void runBusy(() => shortlistRows(rowIdsFor(row), true))}
        >
          <CheckCircle2 aria-hidden />{labels.screening("shortlist_for_interview")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="screening-action screening-action--staff"
          loading={busy}
          onClick={() => {
            setStaffSaveReason("");
            setStaffSaveDialog({ rowIds: rowIdsFor(row) });
          }}
        >
          <UserCheck aria-hidden />{t("saveToStaff")}
        </Button>
        <Button
          type="button"
          variant="danger"
          loading={busy}
          onClick={() => setRejectRowIds(rowIdsFor(row))}
        >
          <XCircle aria-hidden />{labels.screening("rejected")}
        </Button>
      </div>
    );
  }

  return (
    <div className="candidate-workspace">
      <WorkspaceHeader
        eyebrow={t("candidatesEyebrow")}
        title={t("candidatesTitle")}
        stats={
          <>
            <StatusBadge tone="review" label={`${metrics.needsReview} needs review`} />
            <StatusBadge tone="info" label={`${metrics.interviewQueue} interview queue`} />
            <StatusBadge tone="neutral" label={`${metrics.total} imported`} />
          </>
        }
        actions={
          <>
            {selectedCount > 0 ? (
              <div className="bulk-action-bar">
                <span>{selectedCount} selected</span>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="screening-action screening-action--shortlist"
                  loading={busy}
                  onClick={() => void runBusy(() => shortlistRows(selectedRows.map((row) => row.id)))}
                >
                  <CheckCircle2 aria-hidden />Interview
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="screening-action screening-action--staff"
                  loading={busy}
                  onClick={() => {
                    setStaffSaveReason("");
                    setStaffSaveDialog({ rowIds: selectedRows.map((row) => row.id) });
                  }}
                >
                  <UserCheck aria-hidden />Save to staff
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  loading={busy}
                  onClick={() => setRejectRowIds(selectedRows.map((row) => row.id))}
                >
                  <XCircle aria-hidden />Reject
                </Button>
              </div>
            ) : null}
            <Button type="button" variant="secondary" onClick={reload}>
              <RefreshCw aria-hidden />{t("refresh")}
            </Button>
          </>
        }
      />

      <WorkspaceFeedback status={status} error={error} />

      {rows.length === 0 ? (
        <div className="candidate-panel">
          <EmptyState
            icon={<ClipboardList />}
            title={tg("candidatesTitle")}
            description={tg("candidatesBody")}
            actionLabel={tg("candidatesAction")}
            actionHref="/candidates/import"
          />
        </div>
      ) : (
      <section className="candidate-two-column">
        <div className="candidate-panel candidate-panel--table">
          <PanelHeader icon={<ClipboardList />} title="Screening Workspace" />
          <ScreeningFilterBar
            filters={filters}
            setFilters={setFilters}
            shown={filteredRows.length}
            total={rows.length}
            cityOptions={cityOptions}
            nationalityOptions={nationalityOptions}
            languageOptions={languageOptions}
            experienceOptions={experienceOptions}
          />
          <ApplicantsTable
            rows={filteredRows}
            selectedId={selected?.id}
            selectedRowIds={selectedRowIds}
            onRowActivate={setSelected}
            onRowSelectionChange={setRowSelection}
            emptyLabel={ts("noMatches")}
          />
        </div>

        {selected ? (
          <aside className="candidate-panel candidate-detail-panel">
            <CandidateMedia row={selected} />
            <CandidateIdentity row={selected} />
            <div className="candidate-badge-row">
              <StatusBadge tone={screeningTone(selected.screeningStatus)} label={labels.screening(selected.screeningStatus)} />
              <StatusBadge tone={interviewTone(selected.interviewStatus)} label={labels.interview(selected.interviewStatus)} />
              <StatusBadge tone={contractTone(selected.contractStatus)} label={labels.contract(selected.contractStatus)} />
            </div>
            <div className="candidate-contact-grid">
              <span dir="ltr">{selected.phone ?? "-"}</span>
              <span>{selected.city ?? "-"}</span>
              <span>{selected.age ? `${selected.age} years` : "Age unknown"}</span>
              <span>{selected.gender ?? "Gender unknown"}</span>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="candidate-detail-trigger"
              onClick={() => setDetailOpen(true)}
            >
              <Maximize2 aria-hidden />{td("viewFullDetail")}
            </Button>
            <Field label={t("screeningNotes")}>
              <TextArea value={notes} onChange={(event) => setNotes(event.currentTarget.value)} />
            </Field>
            {renderScreeningActions(selected)}
            <RawDataBlock data={selected.rawData ?? {}} />
          </aside>
        ) : (
          <aside className="candidate-panel candidate-detail-panel">
            <EmptyLine label={t("noCandidateSelected")} />
          </aside>
        )}
      </section>
      )}

      <CandidateDetailDialog
        applicant={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        actions={selected ? (
          <>
            <Field label={t("screeningNotes")}>
              <TextArea value={notes} onChange={(event) => setNotes(event.currentTarget.value)} />
            </Field>
            {renderScreeningActions(selected)}
          </>
        ) : null}
      />

      <DialogRoot open={Boolean(staffSaveDialog)} onOpenChange={(open) => {
        if (!open) {
          setStaffSaveDialog(null);
          setStaffSaveReason("");
        }
      }}>
        <DialogContent>
          <DialogTitle className="text-lg font-semibold">Save to staff pool</DialogTitle>
          <DialogDescription className="text-sm text-[hsl(var(--muted-foreground))]">
            Optionally tag why this candidate is being saved. The candidate will still be added to the active staff pool.
          </DialogDescription>
          <Field label="Optional reason">
            <Select
              value={staffSaveReason}
              onChange={(event) => setStaffSaveReason(event.currentTarget.value as StaffSaveReason | "")}
            >
              <option value="">No reason tag</option>
              {staffReasonOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </Field>
          <div className="dialog-actions">
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              variant="secondary"
              loading={busy}
              className="screening-action screening-action--staff"
              onClick={() => {
                const rowIds = staffSaveDialog?.rowIds ?? [];
                void runBusy(() => saveRowsToStaff(rowIds, staffSaveReason));
              }}
            >
              <UserCheck aria-hidden />Save to staff
            </Button>
          </div>
        </DialogContent>
      </DialogRoot>

      <AlertDialog
        open={Boolean(rejectRowIds)}
        title="Reject candidate"
        description={`Reject ${rejectRowIds?.length ?? 0} selected candidate${rejectRowIds?.length === 1 ? "" : "s"}? This keeps their applicant history but removes them from the active screening flow.`}
        actionLabel="Reject"
        cancelLabel="Cancel"
        onOpenChange={(open) => {
          if (!open) setRejectRowIds(null);
        }}
        onAction={() => {
          const rowIds = rejectRowIds ?? [];
          void runBusy(() => rejectRows(rowIds));
        }}
      />
    </div>
  );
}
