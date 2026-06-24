"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const TABS = [
  { href: "/candidates", labelKey: "reviewQueue" },
  { href: "/candidates/interviews", labelKey: "interviews" },
  { href: "/candidates/import", labelKey: "import" }
] as const;

export function CandidatesTabs() {
  const pathname = usePathname();
  const t = useTranslations("app.nav");

  return (
    <nav className="settings-tabs" aria-label={t("candidates")}>
      {TABS.map((tab) => (
        <Link key={tab.href} href={tab.href} aria-current={pathname === tab.href ? "page" : undefined}>
          {t(tab.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
