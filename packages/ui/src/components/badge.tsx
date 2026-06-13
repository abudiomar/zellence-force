import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import type { StatusTone } from "../tokens/tokens";

const badgeVariants = cva(
  "inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none",
  {
    variants: {
      tone: {
        neutral: "border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
        info: "border-blue-200 bg-blue-50 text-blue-700",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning: "border-amber-200 bg-amber-50 text-amber-800",
        danger: "border-red-200 bg-red-50 text-red-700",
        review: "border-violet-200 bg-violet-50 text-violet-700",
        locked: "border-slate-200 bg-slate-100 text-slate-600"
      }
    },
    defaultVariants: { tone: "neutral" }
  }
);

export function Badge({ className, tone, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export type { StatusTone };

export function StatusBadge({ tone, label, icon }: { tone: StatusTone; label: string; icon?: React.ReactNode }) {
  return (
    <Badge tone={tone}>
      {icon ?? <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      <span className="truncate">{label}</span>
    </Badge>
  );
}
