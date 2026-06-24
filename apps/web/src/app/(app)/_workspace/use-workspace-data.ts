"use client";

import React from "react";
import type {
  ApplicantReviewQueueItem,
  DemoEvent,
  StaffPoolFilter,
  StaffPoolItem,
  WhatsAppInboundMessage
} from "@zellforce/contracts";
import {
  listApplicantReviewQueue,
  listDemoEvents,
  listStaffPool,
  listWhatsAppInbox
} from "./api";

export type LoadState = "loading" | "ready" | "error";

type Resources = {
  queue?: boolean;
  staff?: boolean;
  events?: boolean;
  inbox?: boolean;
};

type WorkspaceData = {
  rows: ApplicantReviewQueueItem[];
  staff: StaffPoolItem[];
  events: DemoEvent[];
  inbox: WhatsAppInboundMessage[];
};

// Per-route data loader. A route declares only the resources it needs, so a
// screening action no longer re-pulls staff, events, and the WhatsApp inbox the
// way the old single mega-page did. `staffFilter` is consulted only when the
// route opts into the staff pool.
export function useWorkspaceData(resources: Resources, staffFilter: StaffPoolFilter = {}) {
  const [data, setData] = React.useState<WorkspaceData>({ rows: [], staff: [], events: [], inbox: [] });
  const [state, setState] = React.useState<LoadState>("loading");
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const { queue, staff, events, inbox } = resources;
  const filterKey = JSON.stringify(staffFilter);

  const refresh = React.useCallback(async () => {
    setError(null);
    const [rows, staffItems, demoEvents, messages] = await Promise.all([
      queue ? listApplicantReviewQueue() : Promise.resolve([]),
      staff ? listStaffPool(JSON.parse(filterKey) as StaffPoolFilter) : Promise.resolve([]),
      events ? listDemoEvents() : Promise.resolve([]),
      inbox ? listWhatsAppInbox() : Promise.resolve([])
    ]);
    setData({ rows, staff: staffItems, events: demoEvents, inbox: messages });
  }, [queue, staff, events, inbox, filterKey]);

  React.useEffect(() => {
    setState("loading");
    refresh()
      .then(() => setState("ready"))
      .catch(() => setState("error"));
  }, [refresh]);

  const runBusy = React.useCallback(
    async (action: () => Promise<string>) => {
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
    },
    [refresh]
  );

  const reload = React.useCallback(() => {
    setState("loading");
    refresh()
      .then(() => setState("ready"))
      .catch(() => setState("error"));
  }, [refresh]);

  return { data, state, busy, status, error, refresh, reload, runBusy, setStatus, setError };
}

export function calculateMetrics(
  rows: ApplicantReviewQueueItem[],
  staff: StaffPoolItem[],
  inbox: WhatsAppInboundMessage[]
) {
  return {
    total: rows.length,
    needsReview: rows.filter((row) => row.screeningStatus === "needs_review").length,
    interviewQueue: rows.filter(
      (row) => row.screeningStatus === "shortlist_for_interview" || row.interviewStatus === "scheduled"
    ).length,
    staffPool: staff.length,
    emergencies: inbox.filter((message) => message.isEmergency).length
  };
}
