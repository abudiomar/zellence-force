"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { ApplicantReviewQueueItem } from "@zellforce/contracts";
import { AlertCircle, Copy, FileCheck2, ImageIcon, UserCheck } from "lucide-react";
import { StatusBadge } from "@zellforce/ui/components/badge";
import { Checkbox } from "@zellforce/ui/components/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@zellforce/ui/components/table";
import { getApplicantStatusVisual } from "../../../ui/applicant-status-visuals";
import { contractTone, interviewTone, screeningTone } from "./helpers";
import { useStatusLabels } from "./status-labels";
import { CandidatePhoto } from "./candidate-photo";

export function ApplicantsTable({
  rows,
  selectedId,
  selectedRowIds,
  onRowActivate,
  onRowSelectionChange,
  emptyLabel = "No applicants need review"
}: {
  rows: ApplicantReviewQueueItem[];
  selectedId?: string | null | undefined;
  selectedRowIds?: Set<string> | undefined;
  onRowActivate?: (row: ApplicantReviewQueueItem) => void;
  onRowSelectionChange?: (rowId: string, selected: boolean) => void;
  emptyLabel?: string;
}) {
  const labels = useStatusLabels();
  const t = useTranslations("app");
  const selectedIds = selectedRowIds ?? new Set<string>();
  const allRowsSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));
  return (
    <div className="table-shell applicant-table-shell">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                aria-label="Select all rows"
                checked={allRowsSelected}
                onChange={(event) => {
                  for (const row of rows) {
                    onRowSelectionChange?.(row.id, event.currentTarget.checked);
                  }
                }}
              />
            </TableHead>
            <TableHead>Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>{t("table.nationality")}</TableHead>
            <TableHead>{t("table.travel")}</TableHead>
            <TableHead>CV</TableHead>
            <TableHead>{t("table.english")}</TableHead>
            <TableHead>{t("table.languages")}</TableHead>
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
              <TableCell colSpan={15} className="h-28 text-center text-muted">{emptyLabel}</TableCell>
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
                  <Checkbox
                    aria-label={`Select ${row.fullName ?? row.sourceRowId}`}
                    checked={selectedIds.has(row.id)}
                    onChange={(event) => onRowSelectionChange?.(row.id, event.currentTarget.checked)}
                  />
                </TableCell>
                <TableCell>
                  <CandidatePhoto
                    url={row.photoUrl}
                    className="candidate-thumb"
                    fallback={<span className="candidate-thumb candidate-thumb--empty"><ImageIcon aria-hidden /></span>}
                  />
                </TableCell>
                <TableCell>
                  <div className="cell-stack">
                    <strong>{row.fullName ?? "Invalid applicant row"}</strong>
                    <span>Row {row.sourceRowId}{row.age ? ` · ${row.age}` : ""}</span>
                  </div>
                </TableCell>
                <TableCell><span dir="ltr">{row.phone ?? "-"}</span></TableCell>
                <TableCell>{row.city ?? "-"}</TableCell>
                <TableCell>{row.nationality ?? "-"}</TableCell>
                <TableCell>
                  {row.canTravel === true ? (
                    <StatusBadge tone="success" label={t("yes")} />
                  ) : row.canTravel === false ? (
                    <StatusBadge tone="neutral" label={t("no")} />
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {row.cvUrl ? <StatusBadge tone="success" label="CV" icon={<FileCheck2 size={12} />} /> : <StatusBadge tone="neutral" label="No CV" />}
                </TableCell>
                <TableCell>{row.englishLevel ?? "-"}</TableCell>
                <TableCell>
                  {row.languages ? (
                    <span className="cell-truncate" title={row.languages}>{row.languages}</span>
                  ) : "-"}
                </TableCell>
                <TableCell><StatusBadge tone={screeningTone(row.screeningStatus)} label={labels.screening(row.screeningStatus)} /></TableCell>
                <TableCell><StatusBadge tone={interviewTone(row.interviewStatus)} label={labels.interview(row.interviewStatus)} /></TableCell>
                <TableCell>{row.finalScore ? row.finalScore.toFixed(2) : "-"}</TableCell>
                <TableCell><StatusBadge tone={contractTone(row.contractStatus)} label={labels.contract(row.contractStatus)} /></TableCell>
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
