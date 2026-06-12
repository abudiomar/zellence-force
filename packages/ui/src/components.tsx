"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as ToastPrimitive from "@radix-ui/react-toast";
import type { StatusTone } from "./tokens/tokens";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({ variant = "primary", loading = false, children, ...props }: ButtonProps) {
  return (
    <button className={`zf-button zf-button--${variant}`} disabled={loading || props.disabled} {...props}>
      {loading ? <span aria-hidden className="zf-spinner" /> : null}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({ label, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button className="zf-icon-button" aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="zf-input" {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="zf-input zf-textarea" {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="zf-input" {...props} />;
}

export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="zf-checkbox" type="checkbox" {...props} />;
}

export function Switch({ checked, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="zf-switch" role="switch" type="checkbox" checked={checked} {...props} />;
}

export function Field({ label, error, children }: { label: string; error?: string | null | undefined; children: ReactNode }) {
  return (
    <label className="zf-field">
      <span>{label}</span>
      {children}
      {error ? <span className="zf-field-error" role="alert">{error}</span> : null}
    </label>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="zf-section" aria-labelledby={`${slug(title)}-section`}>
      <h2 id={`${slug(title)}-section`}>{title}</h2>
      {children}
    </section>
  );
}

export function ErrorSummary({ title, errors }: { title: string; errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="zf-alert zf-alert--danger" role="alert">
      <strong>{title}</strong>
      <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
    </div>
  );
}

export function ReadOnlyField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="zf-readonly">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function StatusBadge({ tone, label }: { tone: StatusTone; label: string }) {
  return <span className={`zf-badge zf-tone-${tone}`}><span aria-hidden>●</span>{label}</span>;
}

export function AlertBanner({ tone, title, children }: { tone: StatusTone; title: string; children?: ReactNode }) {
  return (
    <div className={`zf-alert zf-alert--${tone}`} role={tone === "danger" ? "alert" : "status"}>
      <strong>{title}</strong>
      {children ? <div>{children}</div> : null}
    </div>
  );
}

export type ScreenStateName =
  | "initial"
  | "loading"
  | "empty"
  | "no-results"
  | "error"
  | "permission"
  | "offline"
  | "locked"
  | "archived"
  | "success";

export function ScreenState({ state, title, children, action }: {
  state: ScreenStateName;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className={`zf-screen-state zf-screen-state--${state}`} aria-live={state === "loading" ? "polite" : undefined}>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
      {action}
    </section>
  );
}

export function Skeleton({ label = "Loading" }: { label?: string }) {
  return <div className="zf-skeleton" aria-label={label} />;
}

export function ProgressIndicator({ label = "Loading" }: { label?: string }) {
  return <span className="zf-progress" role="status">{label}</span>;
}

export function PageHeader({ title, eyebrow, actions }: { title: string; eyebrow?: string; actions?: ReactNode }) {
  return (
    <header className="zf-page-header">
      <div>
        {eyebrow ? <p>{eyebrow}</p> : null}
        <h1>{title}</h1>
      </div>
      {actions ? <div className="zf-page-actions">{actions}</div> : null}
    </header>
  );
}

export function SectionPanel({ children }: { children: ReactNode }) {
  return <section className="zf-section-panel">{children}</section>;
}

export function Tabs({ tabs, active, onChange }: {
  tabs: Array<{ id: string; label: string }>;
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="zf-tabs" role="tablist">
      {tabs.map((tab) => (
        <button key={tab.id} role="tab" aria-selected={tab.id === active} type="button" onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="zf-toolbar">{children}</div>;
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="zf-filter-bar">{children}</div>;
}

export function Pagination({ page, pageCount, onPageChange }: { page: number; pageCount: number; onPageChange: (page: number) => void }) {
  return (
    <nav className="zf-pagination" aria-label="Pagination">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
      <span>{page} / {pageCount}</span>
      <Button variant="secondary" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>Next</Button>
    </nav>
  );
}

export type UiColumnDef<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  sticky?: boolean;
  state?: "dirty" | "invalid" | "locked" | "selected";
};

export type SortingState = Array<{ id: string; desc: boolean }>;
export type PaginationState = { pageIndex: number; pageSize: number };
export type RowSelectionState = Record<string, boolean>;

export type DataTableProps<T> = {
  rows: T[];
  columns: UiColumnDef<T>[];
  getRowId: (row: T) => string;
  sorting?: SortingState;
  pagination?: PaginationState;
  selection?: RowSelectionState;
  loading?: boolean;
  emptyState?: ReactNode;
  errorState?: ReactNode;
  onSortingChange?: (sorting: SortingState) => void;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSelectionChange?: (selection: RowSelectionState) => void;
  onRowActivate?: (row: T) => void;
};

export function DataTable<T>(props: DataTableProps<T>) {
  const [localSorting, setLocalSorting] = useState<SortingState>(props.sorting ?? []);
  const [localSelection, setLocalSelection] = useState<RowSelectionState>(props.selection ?? {});
  const sorting = props.sorting ?? localSorting;
  const selection = props.selection ?? localSelection;
  const sortedRows = useMemo(() => sortRows(props.rows, props.columns, sorting), [props.rows, props.columns, sorting]);

  function setSorting(next: SortingState) {
    setLocalSorting(next);
    props.onSortingChange?.(next);
  }

  function setSelection(next: RowSelectionState) {
    setLocalSelection(next);
    props.onSelectionChange?.(next);
  }

  if (props.loading) return <ScreenState state="loading" title="Loading" />;
  if (props.errorState) return <>{props.errorState}</>;
  if (props.rows.length === 0) return <>{props.emptyState ?? <ScreenState state="empty" title="No rows" />}</>;

  return (
    <div className="zf-table-wrap">
      <table className="zf-table" aria-label="Data table">
        <thead>
          <tr>
            <th>
              <Checkbox
                aria-label="Select all rows"
                checked={props.rows.every((row) => selection[props.getRowId(row)])}
                onChange={(event) => {
                  const next = Object.fromEntries(props.rows.map((row) => [props.getRowId(row), event.currentTarget.checked]));
                  setSelection(next);
                }}
              />
            </th>
            {props.columns.map((column) => (
              <th key={column.id}>
                {column.sortable ? (
                  <button type="button" onClick={() => setSorting(toggleSort(sorting, column.id))}>
                    {column.header}{sortLabel(sorting, column.id)}
                  </button>
                ) : column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => {
            const rowId = props.getRowId(row);
            return (
              <tr key={rowId} tabIndex={0} onKeyDown={(event) => {
                if (event.key === "Enter") props.onRowActivate?.(row);
              }}>
                <td>
                  <Checkbox
                    aria-label={`Select row ${rowId}`}
                    checked={Boolean(selection[rowId])}
                    onChange={(event) => setSelection({ ...selection, [rowId]: event.currentTarget.checked })}
                  />
                </td>
                {props.columns.map((column) => <td key={column.id}>{column.cell(row)}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function SpreadsheetGrid<T>({ rows, columns, getRowId }: Pick<DataTableProps<T>, "rows" | "columns" | "getRowId">) {
  return (
    <div className="zf-grid-wrap" role="grid" aria-label="Spreadsheet grid">
      <div className="zf-grid-row zf-grid-head" role="row">
        {columns.map((column) => <div role="columnheader" className={column.sticky ? "zf-grid-sticky" : undefined} key={column.id}>{column.header}</div>)}
      </div>
      {rows.map((row) => (
        <div className="zf-grid-row" role="row" key={getRowId(row)}>
          {columns.map((column) => (
            <div role="gridcell" tabIndex={0} className={`zf-cell-${column.state ?? "read"}`} key={column.id}>
              {column.cell(row)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function RosterList({ rows, onAction }: {
  rows: Array<{ id: string; title: string; meta: string; status: string; actionLabel: string }>;
  onAction: (id: string) => void;
}) {
  return (
    <div className="zf-roster-list">
      {rows.map((row) => (
        <article className="zf-roster-row" key={row.id}>
          <div>
            <strong>{row.title}</strong>
            <span>{row.meta}</span>
          </div>
          <span>{row.status}</span>
          <Button variant="secondary" onClick={() => onAction(row.id)}>{row.actionLabel}</Button>
        </article>
      ))}
    </div>
  );
}

export function Dialog({ open, title, children, onOpenChange }: { open: boolean; title: string; children: ReactNode; onOpenChange: (open: boolean) => void }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="zf-overlay" />
        <DialogPrimitive.Content className="zf-dialog">
          <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="zf-sr-only">
            {title}
          </DialogPrimitive.Description>
          {children}
          <DialogPrimitive.Close asChild><IconButton label="Close">x</IconButton></DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function Drawer(props: { open: boolean; title: string; children: ReactNode; onOpenChange: (open: boolean) => void }) {
  return <Dialog {...props} />;
}

export function AlertDialog({ open, title, description, actionLabel, cancelLabel, onAction, onOpenChange }: {
  open: boolean;
  title: string;
  description: string;
  actionLabel: string;
  cancelLabel: string;
  onAction: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="zf-overlay" />
        <AlertDialogPrimitive.Content className="zf-dialog">
          <AlertDialogPrimitive.Title>{title}</AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description>{description}</AlertDialogPrimitive.Description>
          <AlertDialogPrimitive.Cancel asChild><Button variant="secondary">{cancelLabel}</Button></AlertDialogPrimitive.Cancel>
          <AlertDialogPrimitive.Action asChild><Button variant="danger" onClick={onAction}>{actionLabel}</Button></AlertDialogPrimitive.Action>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

type ToastValue = { title: string; tone?: StatusTone };
const ToastContext = createContext<{ push: (toast: ToastValue) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastValue | null>(null);
  return (
    <ToastContext.Provider value={{ push: setToast }}>
      <ToastPrimitive.Provider>
        {children}
        <ToastPrimitive.Root className="zf-toast" open={Boolean(toast)} onOpenChange={(open) => !open && setToast(null)}>
          <ToastPrimitive.Description>{toast?.title}</ToastPrimitive.Description>
        </ToastPrimitive.Root>
        <ToastPrimitive.Viewport className="zf-toast-viewport" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function sortRows<T>(rows: T[], columns: UiColumnDef<T>[], sorting: SortingState) {
  const current = sorting[0];
  if (!current) return rows;
  const column = columns.find((item) => item.id === current.id);
  if (!column) return rows;
  return [...rows].sort((a, b) => String(column.cell(a)).localeCompare(String(column.cell(b))) * (current.desc ? -1 : 1));
}

function toggleSort(sorting: SortingState, id: string): SortingState {
  const current = sorting.find((item) => item.id === id);
  return [{ id, desc: current ? !current.desc : false }];
}

function sortLabel(sorting: SortingState, id: string) {
  const current = sorting.find((item) => item.id === id);
  if (!current) return "";
  return current.desc ? " ↓" : " ↑";
}
