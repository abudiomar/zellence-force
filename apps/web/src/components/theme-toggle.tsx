"use client";

import React from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Check, Moon, Sun } from "lucide-react";
import { IconButton } from "@zellforce/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@zellforce/ui/components/dropdown-menu";

type ThemeOption = "light" | "dark" | "system";

export function ThemeToggle() {
  const t = useTranslations("app");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // next-themes resolves on the client; defer icon state to avoid a hydration mismatch.
  React.useEffect(() => setMounted(true), []);

  const options: Array<{ value: ThemeOption; label: string }> = [
    { value: "light", label: t("themeLight") },
    { value: "dark", label: t("themeDark") },
    { value: "system", label: t("themeSystem") }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton variant="quiet" label={t("theme")}>
          <span className="relative inline-flex size-4 items-center justify-center">
            <Sun
              size={18}
              aria-hidden
              className="rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0"
            />
            <Moon
              size={18}
              aria-hidden
              className="absolute rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100"
            />
          </span>
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => setTheme(option.value)}>
            <span className="flex-1">{option.label}</span>
            {mounted && theme === option.value ? <Check size={16} aria-hidden /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
