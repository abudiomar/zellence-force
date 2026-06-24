"use client";

import React from "react";
import type {
  ApplicantReviewQueueItem,
  StaffPoolItem,
  WhatsAppInboundMessage
} from "@zellforce/contracts";
import type { StatusTone } from "@zellforce/ui/components/badge";
import { ImageIcon } from "lucide-react";
import { AlertBanner } from "@zellforce/ui/components/alert";
import { StatusBadge } from "@zellforce/ui/components/badge";
import { Button } from "@zellforce/ui/components/button";
import {
  contractTone,
  initials,
  interviewTone,
  labelize,
  screeningTone,
  whatsAppTone
} from "./helpers";

export function MetricPanel({
  icon,
  label,
  value,
  tone = "neutral"
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: StatusTone;
}) {
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

export function PanelHeader({
  icon,
  title,
  actionLabel,
  onAction
}: {
  icon: React.ReactNode;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <header className="panel-header">
      <span aria-hidden>{icon}</span>
      <h3>{title}</h3>
      {actionLabel && onAction ? (
        <Button type="button" variant="quiet" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </header>
  );
}

export function CandidateIdentity({
  row,
  compact = false
}: {
  row: Pick<ApplicantReviewQueueItem, "fullName" | "phone" | "sourceRowId" | "photoUrl">;
  compact?: boolean;
}) {
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

export function CandidateMedia({ row }: { row: ApplicantReviewQueueItem }) {
  return (
    <div className="candidate-media">
      {row.photoUrl ? (
        <img src={row.photoUrl} alt="" />
      ) : (
        <div className="candidate-media__empty">
          <ImageIcon aria-hidden />
        </div>
      )}
      <div className="candidate-media__links">
        {row.cvUrl ? <a href={row.cvUrl} target="_blank" rel="noreferrer">Open CV</a> : <span>No CV link</span>}
        {row.photoUrl ? <a href={row.photoUrl} target="_blank" rel="noreferrer">Open photo</a> : <span>No photo link</span>}
      </div>
    </div>
  );
}

export function RawDataBlock({ data }: { data: Record<string, unknown> }) {
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

export function CandidateLine({ row }: { row: ApplicantReviewQueueItem }) {
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

export function MessageCard({ message }: { message: WhatsAppInboundMessage }) {
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

export function ProgressValue({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function EmptyLine({ label }: { label: string }) {
  return <div className="empty-line">{label}</div>;
}

export function WorkspaceHeader({
  eyebrow,
  title,
  stats,
  actions
}: {
  eyebrow: string;
  title: string;
  stats?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="candidate-command">
      <div className="candidate-command__copy">
        <p>{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {stats ? <div className="candidate-command__stats">{stats}</div> : null}
      {actions ? <div className="candidate-command__actions">{actions}</div> : null}
    </section>
  );
}

export function WorkspaceFeedback({ status, error }: { status: string | null; error: string | null }) {
  return (
    <>
      {status ? <AlertBanner tone="success" title={status} /> : null}
      {error ? <AlertBanner tone="danger" title={error} /> : null}
    </>
  );
}

export { contractTone, screeningTone, interviewTone };
export type { StaffPoolItem };
