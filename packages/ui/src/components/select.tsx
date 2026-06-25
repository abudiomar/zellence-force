import * as React from "react";
import { cn } from "../lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        // No vertical padding: a native <select> vertically centers its value
        // text inside the content box on its own, and adding py-* pushes the
        // text down off-center. Height + leading control the rhythm instead.
        "flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm leading-normal text-[hsl(var(--foreground))] shadow-sm transition-colors focus-visible:border-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring)/0.35)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
