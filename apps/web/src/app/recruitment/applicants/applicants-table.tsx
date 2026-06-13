"use client";

import React from "react";
import type { ApplicantReviewQueueItem } from "@zellforce/contracts";
import { AlertCircle, Copy, UserCheck } from "lucide-react";
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
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Flags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-28 text-center text-muted">No applicants need review</TableCell>
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
                  <div className="cell-stack">
                    <strong>{row.fullName ?? "Invalid applicant row"}</strong>
                    <span>Row {row.sourceRowId}</span>
                  </div>
                </TableCell>
                <TableCell><span dir="ltr">{row.phone ?? "-"}</span></TableCell>
                <TableCell><span dir="ltr">{row.email ?? "-"}</span></TableCell>
                <TableCell><StatusBadge tone={visual.tone} label={visual.label} /></TableCell>
                <TableCell>
                  <div className="flag-list">
                    {row.errorMessages.length ? <StatusBadge tone="danger" label={`${row.errorMessages.length} error`} icon={<AlertCircle size={12} />} /> : null}
                    {row.matchedPersonId ? <StatusBadge tone="warning" label="duplicate" icon={<Copy size={12} />} /> : null}
                    {row.status === "accepted" ? <StatusBadge tone="success" label="person" icon={<UserCheck size={12} />} /> : null}
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
