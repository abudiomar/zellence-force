"use client";

import React from "react";
import { CalendarDays, ClipboardList, RefreshCw, Save } from "lucide-react";
import { Button } from "@zellforce/ui/components/button";
import { TextInput } from "@zellforce/ui/components/input";
import { Field } from "@zellforce/ui/components/label";
import { Skeleton } from "@zellforce/ui/components/skeleton";
import { createDemoEvent } from "../_workspace/api";
import {
  EmptyLine,
  PanelHeader,
  ProgressValue,
  WorkspaceFeedback,
  WorkspaceHeader
} from "../_workspace/components";
import { initialDemoEvent } from "../_workspace/helpers";
import { useWorkspaceData } from "../_workspace/use-workspace-data";

export function EventsClient() {
  const { data, state, busy, status, error, reload, runBusy } = useWorkspaceData({ events: true });
  const [form, setForm] = React.useState(initialDemoEvent);

  const events = data.events;

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
        <h2>Unable to load events</h2>
        <Button type="button" onClick={reload}>Retry</Button>
      </section>
    );
  }

  return (
    <div className="candidate-workspace">
      <WorkspaceHeader
        eyebrow="Events"
        title="Create events and track shortlist progress"
        actions={
          <Button type="button" variant="secondary" onClick={reload}>
            <RefreshCw aria-hidden />Refresh
          </Button>
        }
      />

      <WorkspaceFeedback status={status} error={error} />

      <section className="candidate-grid">
        <div className="candidate-panel">
          <PanelHeader icon={<CalendarDays />} title="Create Event" />
          <div className="candidate-form-grid">
            <Field label="Event name">
              <TextInput value={form.name} onChange={(event) => setForm({ ...form, name: event.currentTarget.value })} />
            </Field>
            <Field label="City">
              <TextInput value={form.city} onChange={(event) => setForm({ ...form, city: event.currentTarget.value })} />
            </Field>
            <Field label="Date">
              <TextInput type="date" value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.currentTarget.value })} />
            </Field>
            <Field label="Role name">
              <TextInput value={form.roleName} onChange={(event) => setForm({ ...form, roleName: event.currentTarget.value })} />
            </Field>
            <Field label="Needed headcount">
              <TextInput inputMode="numeric" value={form.neededHeadcount} onChange={(event) => setForm({ ...form, neededHeadcount: event.currentTarget.value })} />
            </Field>
          </div>
          <Button type="button" loading={busy} onClick={() => void runBusy(async () => {
            await createDemoEvent({
              name: form.name,
              city: form.city || undefined,
              eventDate: form.eventDate || undefined,
              roleName: form.roleName,
              neededHeadcount: Number(form.neededHeadcount)
            });
            return "Event created";
          })}>
            <Save aria-hidden />Create event
          </Button>
        </div>

        <div className="candidate-panel candidate-panel--wide">
          <PanelHeader icon={<ClipboardList />} title="Shortlist Progress" />
          <div className="event-grid">
            {events.map((event) => (
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
            {events.length === 0 ? <EmptyLine label="No events created yet" /> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
