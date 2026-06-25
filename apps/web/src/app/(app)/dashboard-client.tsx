"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertTriangle, ClipboardList, MessageCircle, RefreshCw, UserCheck, Users } from "lucide-react";
import { Button } from "@zellforce/ui/components/button";
import { Skeleton } from "@zellforce/ui/components/skeleton";
import {
  CandidateLine,
  EmptyLine,
  MetricPanel,
  WorkspaceHeader
} from "./_workspace/components";
import { calculateMetrics, useWorkspaceData } from "./_workspace/use-workspace-data";

export function DashboardClient() {
  const t = useTranslations("app.workspace");
  const { data, state, reload } = useWorkspaceData({ queue: true, staff: true, inbox: true });

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
        <h2>Unable to load dashboard</h2>
        <Button type="button" onClick={reload}>{t("retry")}</Button>
      </section>
    );
  }

  const { rows, staff, inbox } = data;
  const metrics = calculateMetrics(rows, staff, inbox);
  const latestRows = rows.slice(0, 5);
  const emergencies = inbox.filter((message) => message.isEmergency).slice(0, 4);

  return (
    <div className="candidate-workspace">
      <WorkspaceHeader
        eyebrow={t("dashboardEyebrow")}
        title={t("dashboardTitle")}
        actions={
          <Button type="button" variant="secondary" onClick={reload}>
            <RefreshCw aria-hidden />{t("refresh")}
          </Button>
        }
      />

      <section className="candidate-dashboard">
        <MetricPanel icon={<ClipboardList />} label="Imported candidates" value={metrics.total} />
        <MetricPanel icon={<UserCheck />} label="Ready for interview" value={metrics.interviewQueue} />
        <MetricPanel icon={<Users />} label="Saved staff" value={metrics.staffPool} />
        <MetricPanel
          icon={<AlertTriangle />}
          label="Emergency alerts"
          value={metrics.emergencies}
          tone={metrics.emergencies ? "danger" : "neutral"}
        />

        <section className="candidate-panel candidate-panel--wide">
          <header className="panel-header">
            <span aria-hidden><ClipboardList /></span>
            <h3>Screening Queue</h3>
            <Link className="panel-header__link" href="/candidates">Open</Link>
          </header>
          <div className="compact-list">
            {latestRows.map((row) => (
              <CandidateLine key={row.id} row={row} />
            ))}
            {latestRows.length === 0 ? <EmptyLine label={t("emptyCandidates")} /> : null}
          </div>
        </section>

        <section className="candidate-panel">
          <header className="panel-header">
            <span aria-hidden><MessageCircle /></span>
            <h3>Urgent WhatsApp</h3>
            <Link className="panel-header__link" href="/messages">Open</Link>
          </header>
          <div className="compact-list">
            {emergencies.map((message) => (
              <div className="message-line" key={message.id}>
                <strong>{message.matchedName ?? message.fromPhone}</strong>
                <span>{message.body}</span>
              </div>
            ))}
            {emergencies.length === 0 ? <EmptyLine label={t("emptyUrgent")} /> : null}
          </div>
        </section>
      </section>
    </div>
  );
}
