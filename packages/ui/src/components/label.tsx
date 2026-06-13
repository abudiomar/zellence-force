import * as React from "react";
import { cn } from "../lib/utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium leading-none text-[hsl(var(--foreground))]", className)} {...props} />;
}

export function Field({
  label,
  error,
  children,
  className
}: {
  label: string;
  error?: string | null | undefined;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Label className={cn("grid gap-2", className)}>
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs font-medium text-[hsl(var(--destructive))]" role="alert">{error}</span> : null}
    </Label>
  );
}
