"use client";

import React from "react";
import type {
  DemoContractStatus,
  InterviewStatus,
  ScreeningStatus,
  StaffPoolFilter
} from "@zellforce/contracts";
import { CalendarDays, Filter, RefreshCw, UserCheck, Users } from "lucide-react";
import { StatusBadge } from "@zellforce/ui/components/badge";
import { Button } from "@zellforce/ui/components/button";
import { Checkbox } from "@zellforce/ui/components/checkbox";
import { TextInput } from "@zellforce/ui/components/input";
import { Field } from "@zellforce/ui/components/label";
import { Select } from "@zellforce/ui/components/select";
import { Skeleton } from "@zellforce/ui/components/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@zellforce/ui/components/table";
import { addCandidateToDemoEvent } from "../_workspace/api";
import {
  CandidateIdentity,
  PanelHeader,
  WorkspaceFeedback,
  WorkspaceHeader,
  interviewTone,
  screeningTone
} from "../_workspace/components";
import {
  contractStatuses,
  emptyToUndefined,
  interviewStatuses,
  labelize,
  numberOrUndefined,
  savedFilterViews,
  screeningStatuses
} from "../_workspace/helpers";
import { useWorkspaceData } from "../_workspace/use-workspace-data";

export function StaffClient() {
  const [filter, setFilter] = React.useState<StaffPoolFilter>({});
  const { data, state, busy, status, error, reload, runBusy } = useWorkspaceData(
    { staff: true, events: true },
    filter
  );
  const [selectedStaffId, setSelectedStaffId] = React.useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = React.useState<string>("");

  const staff = data.staff;
  const events = data.events;

  React.useEffect(() => {
    setSelectedStaffId((current) => current ?? staff[0]?.id ?? null);
  }, [staff]);

  React.useEffect(() => {
    setSelectedEventId((current) => current || events[0]?.id || "");
  }, [events]);

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
        <h2>Unable to load staff pool</h2>
        <Button type="button" onClick={reload}>Retry</Button>
      </section>
    );
  }

  return (
    <div className="candidate-workspace">
      <WorkspaceHeader
        eyebrow="Staff pool"
        title="Filter your roster and shortlist staff for events"
        stats={<StatusBadge tone="success" label={`${staff.length} in pool`} />}
        actions={
          <Button type="button" variant="secondary" onClick={reload}>
            <RefreshCw aria-hidden />Refresh
          </Button>
        }
      />

      <WorkspaceFeedback status={status} error={error} />

      <section className="candidate-grid">
        <div className="candidate-panel candidate-panel--wide">
          <PanelHeader icon={<Filter />} title="Staff Filters" />
          <div className="saved-view-row">
            {savedFilterViews.map((view) => (
              <Button key={view.id} type="button" variant="secondary" size="sm" onClick={() => setFilter(view.filter)}>
                {view.label}
              </Button>
            ))}
          </div>
          <div className="filter-grid">
            <Field label="Name or phone">
              <TextInput value={filter.search ?? ""} onChange={(event) => setFilter({ ...filter, search: emptyToUndefined(event.currentTarget.value) })} />
            </Field>
            <Field label="City/location">
              <TextInput value={filter.city ?? ""} onChange={(event) => setFilter({ ...filter, city: emptyToUndefined(event.currentTarget.value) })} />
            </Field>
            <Field label="Gender">
              <TextInput value={filter.gender ?? ""} onChange={(event) => setFilter({ ...filter, gender: emptyToUndefined(event.currentTarget.value) })} />
            </Field>
            <Field label="Min age">
              <TextInput inputMode="numeric" value={filter.minAge ?? ""} onChange={(event) => setFilter({ ...filter, minAge: numberOrUndefined(event.currentTarget.value) })} />
            </Field>
            <Field label="Max age">
              <TextInput inputMode="numeric" value={filter.maxAge ?? ""} onChange={(event) => setFilter({ ...filter, maxAge: numberOrUndefined(event.currentTarget.value) })} />
            </Field>
            <Field label="Screening">
              <Select value={filter.screeningStatus ?? ""} onChange={(event) => setFilter({ ...filter, screeningStatus: emptyToUndefined(event.currentTarget.value) as ScreeningStatus | undefined })}>
                <option value="">Any</option>
                {screeningStatuses.map((value) => <option key={value} value={value}>{labelize(value)}</option>)}
              </Select>
            </Field>
            <Field label="Interview">
              <Select value={filter.interviewStatus ?? ""} onChange={(event) => setFilter({ ...filter, interviewStatus: emptyToUndefined(event.currentTarget.value) as InterviewStatus | undefined })}>
                <option value="">Any</option>
                {interviewStatuses.map((value) => <option key={value} value={value}>{labelize(value)}</option>)}
              </Select>
            </Field>
            <Field label="Contract">
              <Select value={filter.contractStatus ?? ""} onChange={(event) => setFilter({ ...filter, contractStatus: emptyToUndefined(event.currentTarget.value) as DemoContractStatus | undefined })}>
                <option value="">Any</option>
                {contractStatuses.map((value) => <option key={value} value={value}>{labelize(value)}</option>)}
              </Select>
            </Field>
            <Field label="Min final score">
              <TextInput inputMode="decimal" value={filter.minFinalScore ?? ""} onChange={(event) => setFilter({ ...filter, minFinalScore: numberOrUndefined(event.currentTarget.value) })} />
            </Field>
            <Field label="Min presentation">
              <TextInput inputMode="decimal" value={filter.minPresentation ?? ""} onChange={(event) => setFilter({ ...filter, minPresentation: numberOrUndefined(event.currentTarget.value) })} />
            </Field>
            <Field label="Min communication">
              <TextInput inputMode="decimal" value={filter.minCommunication ?? ""} onChange={(event) => setFilter({ ...filter, minCommunication: numberOrUndefined(event.currentTarget.value) })} />
            </Field>
            <Field label="Min English">
              <TextInput inputMode="decimal" value={filter.minEnglishFluency ?? ""} onChange={(event) => setFilter({ ...filter, minEnglishFluency: numberOrUndefined(event.currentTarget.value) })} />
            </Field>
          </div>
          <div className="checkbox-filter-row">
            <label><Checkbox checked={filter.hasPhoto === true} onChange={(event) => setFilter({ ...filter, hasPhoto: event.currentTarget.checked || undefined })} />Has photo</label>
            <label><Checkbox checked={filter.hasCv === true} onChange={(event) => setFilter({ ...filter, hasCv: event.currentTarget.checked || undefined })} />Has CV</label>
            <Button type="button" variant="secondary" size="sm" onClick={() => setFilter({})}>Clear filters</Button>
          </div>
        </div>

        <div className="candidate-panel candidate-panel--wide candidate-panel--table">
          <PanelHeader icon={<Users />} title={`Staff Pool (${staff.length})`} />
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
              {staff.map((item) => (
                <TableRow key={item.id} tabIndex={0} data-state={selectedStaffId === item.id ? "selected" : undefined} onClick={() => setSelectedStaffId(item.id)}>
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
              {staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-muted">No staff match the current filters</TableCell>
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
            <UserCheck aria-hidden />Add selected candidate
          </Button>
        </div>
      </section>
    </div>
  );
}
