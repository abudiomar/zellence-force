"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export function Tabs({ tabs, active, onChange, className }: {
  tabs: Array<{ id: string; label: string }>;
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-md bg-[hsl(var(--muted))] p-1", className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === active}
          type="button"
          className="rounded-sm px-3 py-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] aria-selected:bg-[hsl(var(--card))] aria-selected:text-[hsl(var(--foreground))] aria-selected:shadow-sm"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
