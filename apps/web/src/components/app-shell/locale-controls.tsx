"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Select } from "@zellforce/ui/components/select";
import type { AppLocale } from "../../i18n/config";
import { LOCALE_COOKIE } from "../../i18n/config";

export function LocaleControls({ locale }: { locale: AppLocale }) {
  const router = useRouter();

  function writeLocale(value: string) {
    document.cookie = `${LOCALE_COOKIE}=${value}; path=/; max-age=31536000; sameSite=lax`;
    router.refresh();
  }

  return (
    <label className="shell-locale">
      <span>Language</span>
      <Select
        aria-label="Language"
        value={locale}
        onChange={(event) => writeLocale(event.currentTarget.value)}
      >
        <option value="ar">العربية</option>
        <option value="en">English</option>
      </Select>
    </label>
  );
}
