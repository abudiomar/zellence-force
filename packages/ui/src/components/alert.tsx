import * as React from "react";
import { cn } from "../lib/utils";
import type { StatusTone } from "./badge";

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-[hsl(var(--border))] bg-[hsl(var(--card))]",
  info: "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-100",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100",
  warning: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100",
  danger: "border-red-200 bg-red-50 text-red-950 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100",
  review: "border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-100",
  locked: "border-stone-200 bg-stone-100 text-stone-900 dark:border-stone-700/60 dark:bg-stone-800/50 dark:text-stone-100"
};

export function Alert({ className, tone = "neutral", ...props }: React.HTMLAttributes<HTMLDivElement> & { tone?: StatusTone }) {
  return <div className={cn("rounded-md border p-3 text-sm shadow-sm", toneClasses[tone], className)} {...props} />;
}

export function AlertBanner({ tone, title, children }: { tone: StatusTone; title: string; children?: React.ReactNode }) {
  return (
    <Alert tone={tone} role={tone === "danger" ? "alert" : "status"}>
      <div className="font-semibold">{title}</div>
      {children ? <div className="mt-1 text-sm opacity-85">{children}</div> : null}
    </Alert>
  );
}

export function ScreenState({
  state,
  title,
  children
}: {
  state?: "empty" | "loading" | "error" | "success";
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="grid place-items-center gap-2 rounded-md border border-dashed border-[hsl(var(--border))] p-6 text-center">
      <div className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">{state ?? "empty"}</div>
      <h2 className="m-0 text-lg font-bold">{title}</h2>
      {children ? <div className="text-sm text-[hsl(var(--muted-foreground))]">{children}</div> : null}
    </section>
  );
}
