import * as React from "react";
import { cn } from "../lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
