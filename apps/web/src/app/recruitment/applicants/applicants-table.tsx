"use client";

import React from "react";
import type { ApplicantReviewQueueItem } from "@zellforce/contracts";
import { AlertCircle, Copy, FileCheck2, ImageIcon, UserCheck } from "lucide-react";
import { StatusBadge } from "@zellforce/ui/components/badge";
import { Checkbox } from "@zellforce/ui/components/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@zellforce/ui/components/table";
import { getApplicantStatusVisual } from "../../../ui/applicant-status-visuals";

export function ApplicantsTable({
  rows,
  selectedId,
  onRowActivate
}: {
  rows: ApplicantReviewQueueItem[];
  selectedId?: string | null | undefined;
  onRowActivate?: (row: ApplicantReviewQueueItem) => void;
}) {
  return (
    <div className="table-shell applicant-table-shell">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"><Checkbox aria-label="Select all rows" /></TableHead>
            <TableHead>Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>CV</TableHead>
            <TableHead>Screening</TableHead>
            <TableHead>Interview</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Contract</TableHead>
            <TableHead>Flags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-28 text-center text-muted">No applicants need review</TableCell>
            </TableRow>
          ) : rows.map((row) => {
            const visual = getApplicantStatusVisual(row.status);
            return (
              <TableRow
                key={row.id}
                tabIndex={0}
                data-state={selectedId === row.id ? "selected" : undefined}
                className="applicant-table-row"
                onClick={() => onRowActivate?.(row)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onRowActivate?.(row);
                }}
              >
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <Checkbox aria-label={`Select ${row.fullName ?? row.sourceRowId}`} />
                </TableCell>
                <TableCell>
                  {row.photoUrl ? (
                    <img className="candidate-thumb" src={row.photoUrl} alt="" />
                  ) : (
                    <span className="candidate-thumb candidate-thumb--empty"><ImageIcon aria-hidden /></span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="cell-stack">
                    <strong>{row.fullName ?? "Invalid applicant row"}</strong>
                    <span>Row {row.sourceRowId}{row.age ? ` · ${row.age}` : ""}</span>
                  </div>
                </TableCell>
                <TableCell><span dir="ltr">{row.phone ?? "-"}</span></TableCell>
                <TableCell>{row.city ?? "-"}</TableCell>
                <TableCell>
                  {row.cvUrl ? <StatusBadge tone="success" label="CV" icon={<FileCheck2 size={12} />} /> : <StatusBadge tone="neutral" label="No CV" />}
                </TableCell>
                <TableCell><StatusBadge tone={screeningTone(row.screeningStatus)} label={labelize(row.screeningStatus)} /></TableCell>
                <TableCell><StatusBadge tone={interviewTone(row.interviewStatus)} label={labelize(row.interviewStatus)} /></TableCell>
                <TableCell>{row.finalScore ? row.finalScore.toFixed(2) : "-"}</TableCell>
                <TableCell><StatusBadge tone={contractTone(row.contractStatus)} label={labelize(row.contractStatus)} /></TableCell>
                <TableCell>
                  <div className="flag-list">
                    {row.errorMessages.length ? <StatusBadge tone="danger" label={`${row.errorMessages.length} error`} icon={<AlertCircle size={12} />} /> : null}
                    {row.matchedPersonId ? <StatusBadge tone="warning" label="duplicate" icon={<Copy size={12} />} /> : null}
                    {row.status === "accepted" ? <StatusBadge tone="success" label="person" icon={<UserCheck size={12} />} /> : null}
                    {row.status !== "pending_review" && row.status !== "accepted" ? <StatusBadge tone={visual.tone} label={visual.label} /> : null}
                    {!row.errorMessages.length && !row.matchedPersonId && row.status !== "accepted" ? <span className="text-muted">-</span> : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function labelize(value: string): string {
  return value.replaceAll("_", " ");
}

function screeningTone(status: ApplicantReviewQueueItem["screeningStatus"]) {
  if (status === "save_to_staff_pool") return "success";
  if (status === "shortlist_for_interview" || status === "save_for_future") return "info";
  if (status === "underqualified" || status === "overqualified") return "warning";
  if (status === "rejected") return "danger";
  return "review";
}

function interviewTone(status: ApplicantReviewQueueItem["interviewStatus"]) {
  if (status === "passed") return "success";
  if (status === "failed" || status === "no_show") return "danger";
  if (status === "scheduled" || status === "interviewed") return "info";
  return "neutral";
}

function contractTone(status: ApplicantReviewQueueItem["contractStatus"]) {
  if (status === "signed") return "success";
  if (status === "refused") return "danger";
  if (status === "sent" || status === "pending") return "warning";
  return "neutral";
}
