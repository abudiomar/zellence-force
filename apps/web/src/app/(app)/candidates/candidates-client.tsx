"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { ApplicantReviewQueueItem, ScreeningStatus } from "@zellforce/contracts";
import { Check, CheckCircle2, ChevronDown, ClipboardList, Maximize2, RefreshCw, Search, UserCheck, XCircle } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@zellforce/ui/components/dropdown-menu";
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

type StaffSaveReason = Extract<ScreeningStatus, "needs_review" | "underqualified" | "overqualified">;
type StaffSaveDialogState = {
  rowIds: string[];
};

// Minimalist screening filters: just enough to weed out obviously unsuitable
// applicants before reviewing them one by one. All client-side over the already
// loaded queue, so toggling is instant and needs no API round-trip.
type GenderFilter = "" | "male" | "female";
type ScreeningFilters = {
  search: string;
  gender: GenderFilter;
  canTravel: boolean;
  minAge: string;
  maxAge: string;
  cities: string[];
  nationalities: string[];
  experiences: string[];
};

const EMPTY_FILTERS: ScreeningFilters = {
  search: "",
  gender: "",
  canTravel: false,
  minAge: "",
  maxAge: "",
  cities: [],
  nationalities: [],
  experiences: []
};

type FilterOption = { key: string; label: string };

const MALE_TOKENS = new Set(["male", "m", "man", "ذكر", "رجل"]);
const FEMALE_TOKENS = new Set(["female", "f", "woman", "أنثى", "انثى", "امرأة"]);

function matchesGender(value: string | null | undefined, target: GenderFilter): boolean {
  if (!target) return true;
  const normalized = (value ?? "").trim().toLowerCase();
  return target === "male" ? MALE_TOKENS.has(normalized) : FEMALE_TOKENS.has(normalized);
}

// Capitalize each word for a consistent display label, regardless of how the
// applicant typed it ("ethiopian"/"ETHIOPIAN" -> "Ethiopian"). Arabic is
// unaffected by case so it passes through unchanged.
function titleCase(value: string): string {
  return value.toLowerCase().replace(/(^|\s)(\p{L})/gu, (_match, lead: string, char: string) => lead + char.toUpperCase());
}

// Multi-value form answers (experience, languages) come back comma-separated,
// like the predefined checkbox options in the Google Form. Split on the common
// separators so each option is filterable on its own.
function splitListValue(value: string): string[] {
  return value
    .split(/[,،/;]|\s+(?:and|و)\s+/gi)
    .map((part) => part.trim())
    .filter(Boolean);
}

// Build a normalized, de-duplicated, sorted option list from a single-value
// field across the loaded candidates. Keyed by lowercase (so different casings
// collapse), labelled in title case.
function distinctOptions(
  rows: ApplicantReviewQueueItem[],
  getValue: (row: ApplicantReviewQueueItem) => string | null | undefined
): FilterOption[] {
  const byKey = new Map<string, string>();
  for (const row of rows) {
    const trimmed = (getValue(row) ?? "").trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!byKey.has(key)) byKey.set(key, titleCase(trimmed));
  }
  return [...byKey.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// Same, but for a comma-separated multi-value field (experience).
function distinctMultiOptions(
  rows: ApplicantReviewQueueItem[],
  getValue: (row: ApplicantReviewQueueItem) => string | null | undefined
): FilterOption[] {
  const byKey = new Map<string, string>();
  for (const row of rows) {
    for (const part of splitListValue(getValue(row) ?? "")) {
      const key = part.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, titleCase(part));
    }
  }
  return [...byKey.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function matchesScreeningFilters(row: ApplicantReviewQueueItem, filters: ScreeningFilters): boolean {
  if (filters.search) {
    const query = filters.search.trim().toLowerCase();
    if (query && !`${row.fullName ?? ""} ${row.phone ?? ""}`.toLowerCase().includes(query)) {
      return false;
    }
  }
  if (filters.canTravel && row.canTravel !== true) return false;
  if (!matchesGender(row.gender, filters.gender)) return false;

  const min = filters.minAge.trim() ? Number(filters.minAge) : null;
  const max = filters.maxAge.trim() ? Number(filters.maxAge) : null;
  if (min !== null && Number.isFinite(min) && (row.age == null || row.age < min)) return false;
  if (max !== null && Number.isFinite(max) && (row.age == null || row.age > max)) return false;

  if (filters.cities.length > 0 && !filters.cities.includes((row.city ?? "").trim().toLowerCase())) {
    return false;
  }
  if (
    filters.nationalities.length > 0 &&
    !filters.nationalities.includes((row.nationality ?? "").trim().toLowerCase())
  ) {
    return false;
  }
  if (filters.experiences.length > 0) {
    const experiences = splitListValue(row.experience ?? "").map((value) => value.toLowerCase());
    if (!filters.experiences.some((selected) => experiences.includes(selected))) return false;
  }
  return true;
}

function screeningFiltersActive(filters: ScreeningFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.gender !== "" ||
    filters.canTravel ||
    filters.minAge.trim() !== "" ||
    filters.maxAge.trim() !== "" ||
    filters.cities.length > 0 ||
    filters.nationalities.length > 0 ||
    filters.experiences.length > 0
  );
}

function FilterChip({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="filter-chip"
      data-active={active || undefined}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Dynamic multi-select: a compact trigger that opens a checklist of the options
// discovered in the candidate set. Stays open while ticking several values.
function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  emptyLabel
}: {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  emptyLabel: string;
}) {
  const toggle = (key: string) =>
    onChange(selected.includes(key) ? selected.filter((value) => value !== key) : [...selected, key]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="filter-chip filter-select" data-active={selected.length > 0 || undefined}>
          <span>{label}</span>
          {selected.length > 0 ? <span className="filter-select__count">{selected.length}</span> : null}
          <ChevronDown size={14} aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="filter-select__menu">
        {options.length === 0 ? (
          <div className="filter-select__empty">{emptyLabel}</div>
        ) : (
          options.map((option) => (
            <DropdownMenuItem
              key={option.key}
              onSelect={(event) => {
                event.preventDefault();
                toggle(option.key);
              }}
            >
              <span className="filter-select__check">
                {selected.includes(option.key) ? <Check size={14} aria-hidden /> : null}
              </span>
              <span>{option.label}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ScreeningFilterBar({
  filters,
  setFilters,
  shown,
  total,
  cityOptions,
  nationalityOptions,
  experienceOptions
}: {
  filters: ScreeningFilters;
  setFilters: React.Dispatch<React.SetStateAction<ScreeningFilters>>;
  shown: number;
  total: number;
  cityOptions: FilterOption[];
  nationalityOptions: FilterOption[];
  experienceOptions: FilterOption[];
}) {
  const t = useTranslations("app.workspace.screen");
  const update = (patch: Partial<ScreeningFilters>) => setFilters((prev) => ({ ...prev, ...patch }));
  const genders: GenderFilter[] = ["", "male", "female"];

  return (
    <div className="screening-filters">
      <div className="screening-filters__search">
        <Search size={16} aria-hidden />
        <input
          type="search"
          value={filters.search}
          onChange={(event) => update({ search: event.currentTarget.value })}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
        />
      </div>
      <div className="screening-filters__chips">
        <div className="screening-filters__age" role="group" aria-label={t("age")}>
          <span>{t("age")}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={filters.minAge}
            onChange={(event) => update({ minAge: event.currentTarget.value })}
            placeholder={t("ageMin")}
            aria-label={t("ageMin")}
          />
          <span aria-hidden>–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={filters.maxAge}
            onChange={(event) => update({ maxAge: event.currentTarget.value })}
            placeholder={t("ageMax")}
            aria-label={t("ageMax")}
          />
        </div>
        <MultiSelectFilter
          label={t("experience")}
          options={experienceOptions}
          selected={filters.experiences}
          onChange={(experiences) => update({ experiences })}
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
        <div className="screening-filters__segmented" role="group" aria-label={t("gender")}>
          {genders.map((gender) => (
            <button
              key={gender || "all"}
              type="button"
              data-active={filters.gender === gender || undefined}
              aria-pressed={filters.gender === gender}
              onClick={() => update({ gender })}
            >
              {gender === "" ? t("genderAll") : gender === "male" ? t("male") : t("female")}
            </button>
          ))}
        </div>
      </div>
      <div className="screening-filters__meta">
        <span className="screening-filters__count">{t("showing", { shown, total })}</span>
        {screeningFiltersActive(filters) ? (
          <button type="button" className="screening-filters__clear" onClick={() => setFilters(EMPTY_FILTERS)}>
            {t("clear")}
          </button>
        ) : null}
      </div>
    </div>
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
