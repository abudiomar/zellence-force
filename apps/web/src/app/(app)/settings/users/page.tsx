import React from "react";
import { getTranslations } from "next-intl/server";
import { Button } from "@zellforce/ui/components/button";
import { StatusBadge } from "@zellforce/ui/components/badge";
import { SettingsTabs } from "../settings-tabs";
import { UsersTable } from "./users-table";

export default async function UsersSettingsPage() {
  const t = await getTranslations("app");

  return (
    <section className="content-band">
      <SettingsTabs />
      <div className="toolbar">
        <span>{t("status")}</span>
        <StatusBadge tone="success" label="active" />
        <Button type="button" variant="secondary" disabled>{t("save")}</Button>
      </div>
      <UsersTable />
    </section>
  );
}
