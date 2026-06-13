import * as React from "react";
import { cn } from "../lib/utils";
import type { StatusTone } from "./badge";

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-[hsl(var(--border))] bg-[hsl(var(--card))]",
  info: "border-blue-200 bg-blue-50 text-blue-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  danger: "border-red-200 bg-red-50 text-red-950",
  review: "border-violet-200 bg-violet-50 text-violet-950",
  locked: "border-slate-200 bg-slate-100 text-slate-900"
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
