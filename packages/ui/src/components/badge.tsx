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
        info: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
        warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
        danger: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
        review: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300",
        locked: "border-stone-200 bg-stone-100 text-stone-600 dark:border-stone-700/60 dark:bg-stone-800/50 dark:text-stone-300"
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
