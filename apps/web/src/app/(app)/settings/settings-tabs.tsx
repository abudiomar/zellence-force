"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { SETTINGS_TABS } from "./settings-nav";

export function SettingsTabs() {
  const pathname = usePathname();
  const t = useTranslations("app");

  return (
    <nav className="settings-tabs" aria-label={t("settings")}>
      {SETTINGS_TABS.map((tab) => (
        <Link key={tab.id} href={tab.href} aria-current={pathname === tab.href ? "page" : undefined}>
          {t(tab.labelKey.replace("app.", ""))}
        </Link>
      ))}
    </nav>
  );
}
