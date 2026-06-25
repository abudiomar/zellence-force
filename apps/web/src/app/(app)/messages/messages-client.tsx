"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, MessageCircle, RefreshCw } from "lucide-react";
import { StatusBadge } from "@zellforce/ui/components/badge";
import { Button } from "@zellforce/ui/components/button";
import { Skeleton } from "@zellforce/ui/components/skeleton";
import {
  EmptyLine,
  EmptyState,
  MessageCard,
  PanelHeader,
  WorkspaceFeedback,
  WorkspaceHeader
} from "../_workspace/components";
import { useWorkspaceData } from "../_workspace/use-workspace-data";

export function MessagesClient() {
  const { data, state, status, error, reload } = useWorkspaceData({ inbox: true });
  const t = useTranslations("app.workspace");
  const tg = useTranslations("app.workspace.guided");
  const inbox = data.inbox;
  const emergencies = inbox.filter((message) => message.isEmergency);

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
        <h2>Unable to load WhatsApp inbox</h2>
        <Button type="button" onClick={reload}>{t("retry")}</Button>
      </section>
    );
  }

  return (
    <div className="candidate-workspace">
      <WorkspaceHeader
        eyebrow={t("messagesEyebrow")}
        title={t("messagesTitle")}
        stats={
          <StatusBadge
            tone={emergencies.length ? "danger" : "neutral"}
            label={`${emergencies.length} urgent`}
          />
        }
        actions={
          <Button type="button" variant="secondary" onClick={reload}>
            <RefreshCw aria-hidden />{t("refresh")}
          </Button>
        }
      />

      <WorkspaceFeedback status={status} error={error} />

      <section className="candidate-grid">
        <div className="candidate-panel candidate-panel--wide">
          <PanelHeader icon={<AlertTriangle />} title={`Emergency Alerts (${emergencies.length})`} />
          <div className="message-grid">
            {emergencies.map((message) => <MessageCard key={message.id} message={message} />)}
            {emergencies.length === 0 ? <EmptyLine label={t("emptyEmergencyAlerts")} /> : null}
          </div>
        </div>
        <div className="candidate-panel candidate-panel--wide">
          <PanelHeader icon={<MessageCircle />} title="WhatsApp Inbox" />
          <div className="message-grid">
            {inbox.map((message) => <MessageCard key={message.id} message={message} />)}
            {inbox.length === 0 ? (
              <EmptyState
                icon={<MessageCircle />}
                title={tg("messagesTitle")}
                description={tg("messagesBody")}
              />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
