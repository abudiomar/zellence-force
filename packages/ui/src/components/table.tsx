import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { StatusBadge } from "./badge";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full caption-bottom text-sm", className)} {...props} />;
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-[hsl(var(--border))] transition-colors hover:bg-[hsl(var(--muted)/0.65)] data-[state=selected]:bg-[hsl(var(--accent))]", className)} {...props} />;
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("h-11 px-3 text-start align-middle text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]", className)} {...props} />;
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("h-12 px-3 align-middle text-[hsl(var(--foreground))]", className)} {...props} />;
}

export type DataTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
};

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  onRowActivate
}: {
  rows: T[];
  columns: Array<DataTableColumn<T>>;
  getRowId: (row: T) => string;
  onRowActivate?: (row: T) => void;
}) {
  return (
    <Table aria-label="Data table">
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.id}>
              {column.header}
              {column.sortable ? <span className="ms-1 text-[hsl(var(--muted-foreground))]">↕</span> : null}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={getRowId(row)}
            tabIndex={onRowActivate ? 0 : undefined}
            onClick={() => onRowActivate?.(row)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onRowActivate?.(row);
            }}
          >
            {columns.map((column) => (
              <TableCell key={column.id}>{column.cell(row)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export type SpreadsheetGridColumn<T> = {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  sticky?: boolean;
  state?: "dirty" | "error" | "locked";
};

export function SpreadsheetGrid<T>({
  rows,
  columns,
  getRowId
}: {
  rows: T[];
  columns: Array<SpreadsheetGridColumn<T>>;
  getRowId: (row: T) => string;
}) {
  return (
    <div role="grid" aria-label="Spreadsheet grid" className="overflow-auto rounded-md border border-[hsl(var(--border))]">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(column.sticky && "sticky start-0 z-10 bg-[hsl(var(--card))]")}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={getRowId(row)}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  className={cn(
                    column.sticky && "sticky start-0 bg-[hsl(var(--card))]",
                    column.state === "dirty" && "bg-amber-50 dark:bg-amber-950/30",
                    column.state === "error" && "bg-red-50 dark:bg-red-950/30",
                    column.state === "locked" && "bg-stone-100 dark:bg-stone-800/40"
                  )}
                >
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function RosterList({
  rows,
  onAction
}: {
  rows: Array<{
    id: string;
    title: string;
    meta?: string;
    status?: string;
    actionLabel?: string;
  }>;
  onAction?: (id: string) => void;
}) {
  return (
    <div className="grid gap-2" aria-label="Roster list">
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex min-h-12 items-center gap-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{row.title}</div>
            {row.meta ? <div className="truncate text-xs text-[hsl(var(--muted-foreground))]">{row.meta}</div> : null}
          </div>
          {row.status ? <StatusBadge tone="review" label={row.status} /> : null}
          {row.actionLabel ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => onAction?.(row.id)}>
              {row.actionLabel}
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
