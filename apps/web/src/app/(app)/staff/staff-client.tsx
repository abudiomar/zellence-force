"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { StaffPoolItem } from "@zellforce/contracts";
import { CalendarDays, RefreshCw, Star, Trash2, UserCheck, Users } from "lucide-react";
import { StatusBadge } from "@zellforce/ui/components/badge";
import { Button } from "@zellforce/ui/components/button";
import { Field } from "@zellforce/ui/components/label";
import { Select } from "@zellforce/ui/components/select";
import { Skeleton } from "@zellforce/ui/components/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@zellforce/ui/components/table";
import { addCandidateToDemoEvent, removeStaffPoolCandidate } from "../_workspace/api";
import {
  CandidateIdentity,
  EmptyState,
  PanelHeader,
  WorkspaceFeedback,
  WorkspaceHeader,
  interviewTone,
  screeningTone
} from "../_workspace/components";
import {
  FilterBar,
  FilterChip,
  FilterSearch,
  GenderSegment,
  MultiSelectFilter,
  RangePill,
  distinctMultiOptions,
  distinctOptions,
  matchesGender,
  splitListValue,
  type GenderFilter
} from "../_workspace/filters";
import { useStatusLabels } from "../_workspace/status-labels";
import { useWorkspaceData } from "../_workspace/use-workspace-data";

// The staff pool mirrors the screening filters: client-side over the loaded
// roster, with dynamic multi-selects for the attributes that drive event
// rostering (expertise, city, nationality, language) plus age and score ranges.
type StaffFilters = {
  search: string;
  gender: GenderFilter;
  canTravel: boolean;
  minAge: string;
  maxAge: string;
  minScore: string;
  maxScore: string;
  cities: string[];
  nationalities: string[];
  languages: string[];
  experiences: string[];
};

const EMPTY_FILTERS: StaffFilters = {
  search: "",
  gender: "",
  canTravel: false,
  minAge: "",
  maxAge: "",
  minScore: "",
  maxScore: "",
  cities: [],
  nationalities: [],
  languages: [],
  experiences: []
};

function inRange(value: number | null | undefined, min: string, max: string): boolean {
  const lower = min.trim() ? Number(min) : null;
  const upper = max.trim() ? Number(max) : null;
  if (lower !== null && Number.isFinite(lower) && (value == null || value < lower)) return false;
  if (upper !== null && Number.isFinite(upper) && (value == null || value > upper)) return false;
  return true;
}

function matchesAny(value: string | null | undefined, selected: string[]): boolean {
  if (selected.length === 0) return true;
  const items = splitListValue(value ?? "").map((part) => part.toLowerCase());
  return selected.some((key) => items.includes(key));
}

function matchesStaffFilters(item: StaffPoolItem, filters: StaffFilters): boolean {
  if (filters.search) {
    const query = filters.search.trim().toLowerCase();
    if (query && !`${item.fullName ?? ""} ${item.phone ?? ""}`.toLowerCase().includes(query)) {
      return false;
    }
  }
  if (filters.canTravel && item.canTravel !== true) return false;
  if (!matchesGender(item.gender, filters.gender)) return false;
  if (!inRange(item.age, filters.minAge, filters.maxAge)) return false;
  if (!inRange(item.finalScore, filters.minScore, filters.maxScore)) return false;
  if (filters.cities.length > 0 && !filters.cities.includes((item.city ?? "").trim().toLowerCase())) {
    return false;
  }
  if (
    filters.nationalities.length > 0 &&
    !filters.nationalities.includes((item.nationality ?? "").trim().toLowerCase())
  ) {
    return false;
  }
  if (!matchesAny(item.languages, filters.languages)) return false;
  if (!matchesAny(item.experience, filters.experiences)) return false;
  return true;
}

function staffFiltersActive(filters: StaffFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.gender !== "" ||
    filters.canTravel ||
    filters.minAge.trim() !== "" ||
    filters.maxAge.trim() !== "" ||
    filters.minScore.trim() !== "" ||
    filters.maxScore.trim() !== "" ||
    filters.cities.length > 0 ||
    filters.nationalities.length > 0 ||
    filters.languages.length > 0 ||
    filters.experiences.length > 0
  );
}

export function StaffClient() {
  const { data, state, busy, status, error, reload, runBusy } = useWorkspaceData({ staff: true, events: true });
  const labels = useStatusLabels();
  const t = useTranslations("app.workspace");
  const tg = useTranslations("app.workspace.guided");
  const ts = useTranslations("app.workspace.screen");
  const tc = useTranslations("app");
  const [filters, setFilters] = React.useState<StaffFilters>(EMPTY_FILTERS);
  const [selectedStaffId, setSelectedStaffId] = React.useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = React.useState<string>("");

  const staff = data.staff;
  const events = data.events;
  const filteredStaff = React.useMemo(
    () => staff.filter((item) => matchesStaffFilters(item, filters)),
    [staff, filters]
  );
  // Options come from the whole roster, not the filtered view.
  const cityOptions = React.useMemo(() => distinctOptions(staff, (item) => item.city), [staff]);
  const nationalityOptions = React.useMemo(() => distinctOptions(staff, (item) => item.nationality), [staff]);
  const languageOptions = React.useMemo(() => distinctMultiOptions(staff, (item) => item.languages), [staff]);
  const experienceOptions = React.useMemo(() => distinctMultiOptions(staff, (item) => item.experience), [staff]);

  React.useEffect(() => {
    setSelectedStaffId((current) =>
      current && filteredStaff.some((item) => item.id === current) ? current : filteredStaff[0]?.id ?? null
    );
  }, [filteredStaff]);

  React.useEffect(() => {
    setSelectedEventId((current) => current || events[0]?.id || "");
  }, [events]);

  const selectedStaff = filteredStaff.find((item) => item.id === selectedStaffId) ?? filteredStaff[0] ?? null;
  const active = staffFiltersActive(filters);
  const update = (patch: Partial<StaffFilters>) => setFilters((prev) => ({ ...prev, ...patch }));

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
        <h2>Unable to load staff pool</h2>
        <Button type="button" onClick={reload}>{t("retry")}</Button>
      </section>
    );
  }

  return (
    <div className="candidate-workspace">
      <WorkspaceHeader
        eyebrow={t("staffEyebrow")}
        title={t("staffTitle")}
        stats={<StatusBadge tone="success" label={`${staff.length} in pool`} />}
        actions={
          <Button type="button" variant="secondary" onClick={reload}>
            <RefreshCw aria-hidden />{t("refresh")}
          </Button>
        }
      />

      <WorkspaceFeedback status={status} error={error} />

      {staff.length === 0 && !active ? (
        <div className="candidate-panel">
          <EmptyState
            icon={<Star />}
            title={tg("staffTitle")}
            description={tg("staffBody")}
            actionLabel={tg("staffAction")}
            actionHref="/candidates"
          />
        </div>
      ) : (
        <section className="candidate-grid">
          <div className="candidate-panel candidate-panel--wide candidate-panel--table">
            <PanelHeader icon={<Users />} title={`Staff Pool (${filteredStaff.length})`} />
            <FilterBar
              shown={filteredStaff.length}
              total={staff.length}
              active={active}
              onClear={() => setFilters(EMPTY_FILTERS)}
              search={
                <FilterSearch
                  value={filters.search}
                  onChange={(search) => update({ search })}
                  placeholder={ts("searchPlaceholder")}
                />
              }
            >
              <RangePill
                label={ts("age")}
                minValue={filters.minAge}
                maxValue={filters.maxAge}
                onMinChange={(minAge) => update({ minAge })}
                onMaxChange={(maxAge) => update({ maxAge })}
                minPlaceholder={ts("ageMin")}
                maxPlaceholder={ts("ageMax")}
              />
              <RangePill
                label={ts("score")}
                min={1}
                max={5}
                step={0.5}
                minValue={filters.minScore}
                maxValue={filters.maxScore}
                onMinChange={(minScore) => update({ minScore })}
                onMaxChange={(maxScore) => update({ maxScore })}
                minPlaceholder={ts("ageMin")}
                maxPlaceholder={ts("ageMax")}
              />
              <MultiSelectFilter
                label={ts("experience")}
                options={experienceOptions}
                selected={filters.experiences}
                onChange={(experiences) => update({ experiences })}
                emptyLabel={ts("noOptions")}
              />
              <MultiSelectFilter
                label={ts("city")}
                options={cityOptions}
                selected={filters.cities}
                onChange={(cities) => update({ cities })}
                emptyLabel={ts("noOptions")}
              />
              <MultiSelectFilter
                label={ts("nationality")}
                options={nationalityOptions}
                selected={filters.nationalities}
                onChange={(nationalities) => update({ nationalities })}
                emptyLabel={ts("noOptions")}
              />
              <MultiSelectFilter
                label={ts("language")}
                options={languageOptions}
                selected={filters.languages}
                onChange={(languages) => update({ languages })}
                emptyLabel={ts("noOptions")}
              />
              <FilterChip active={filters.canTravel} onClick={() => update({ canTravel: !filters.canTravel })}>
                {ts("canTravel")}
              </FilterChip>
              <GenderSegment value={filters.gender} onChange={(gender) => update({ gender })} />
            </FilterBar>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>{t("filters.nationality")}</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>{tc("table.travel")}</TableHead>
                  <TableHead>Screening</TableHead>
                  <TableHead>Interview</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Assets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((item) => (
                  <TableRow key={item.id} tabIndex={0} data-state={selectedStaffId === item.id ? "selected" : undefined} onClick={() => setSelectedStaffId(item.id)}>
                    <TableCell><CandidateIdentity row={item} compact /></TableCell>
                    <TableCell>{item.city ?? "-"}</TableCell>
                    <TableCell>{item.nationality ?? "-"}</TableCell>
                    <TableCell>{item.age ?? "-"}</TableCell>
                    <TableCell>
                      {item.canTravel === true ? (
                        <StatusBadge tone="success" label={tc("yes")} />
                      ) : item.canTravel === false ? (
                        <StatusBadge tone="neutral" label={tc("no")} />
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </TableCell>
                    <TableCell><StatusBadge tone={screeningTone(item.screeningStatus)} label={labels.screening(item.screeningStatus)} /></TableCell>
                    <TableCell><StatusBadge tone={interviewTone(item.interviewStatus)} label={labels.interview(item.interviewStatus)} /></TableCell>
                    <TableCell>{item.finalScore?.toFixed(2) ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flag-list">
                        <StatusBadge tone={item.photoUrl ? "success" : "neutral"} label={item.photoUrl ? "photo" : "no photo"} />
                        <StatusBadge tone={item.cvUrl ? "success" : "neutral"} label={item.cvUrl ? "CV" : "no CV"} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-28 text-center text-muted">{ts("noMatches")}</TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <div className="candidate-panel">
            <PanelHeader icon={<CalendarDays />} title="Add to Event" />
            <Field label="Event">
              <Select value={selectedEventId} onChange={(event) => setSelectedEventId(event.currentTarget.value)}>
                <option value="">Select event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </Select>
            </Field>
            <Button
              type="button"
              loading={busy}
              disabled={!selectedStaffId || !selectedEventId}
              onClick={() => void runBusy(async () => {
                if (!selectedStaff || !selectedEventId) return "Select staff and event";
                await addCandidateToDemoEvent(selectedEventId, {
                  applicantRowId: selectedStaff.id,
                  ...(selectedStaff.personId ? { personId: selectedStaff.personId } : {})
                });
                return "Candidate added to event shortlist";
              })}
            >
              <UserCheck aria-hidden />{t("addSelectedCandidate")}
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={busy}
              disabled={!selectedStaff}
              onClick={() => void runBusy(async () => {
                if (!selectedStaff) return "Select staff to delete";
                await removeStaffPoolCandidate(selectedStaff.id);
                setSelectedStaffId(null);
                return "Candidate deleted from staff pool";
              })}
            >
              <Trash2 aria-hidden />Delete from staff pool
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
