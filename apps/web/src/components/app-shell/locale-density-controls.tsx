"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, Select } from "@zellforce/ui";
import type { AppLocale } from "../../i18n/config";
import { DENSITY_COOKIE, LOCALE_COOKIE } from "../../i18n/config";

export function LocaleDensityControls({
  locale,
  density
}: {
  locale: AppLocale;
  density: "comfortable" | "compact";
}) {
  const router = useRouter();

  function writeCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/; max-age=31536000; sameSite=lax`;
    document.documentElement.dataset.density = name === DENSITY_COOKIE ? value : document.documentElement.dataset.density;
    router.refresh();
  }

  return (
    <div className="shell-controls">
      <label>
        <span>Language</span>
        <Select
          aria-label="Language"
          value={locale}
          onChange={(event) => writeCookie(LOCALE_COOKIE, event.currentTarget.value)}
        >
          <option value="ar">العربية</option>
          <option value="en">English</option>
        </Select>
      </label>
      <div role="group" aria-label="Density">
        <Button
          type="button"
          variant={density === "comfortable" ? "primary" : "secondary"}
          onClick={() => writeCookie(DENSITY_COOKIE, "comfortable")}
        >
          Comfortable
        </Button>
        <Button
          type="button"
          variant={density === "compact" ? "primary" : "secondary"}
          onClick={() => writeCookie(DENSITY_COOKIE, "compact")}
        >
          Compact
        </Button>
      </div>
    </div>
  );
}
