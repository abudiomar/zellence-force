import React from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader, StatusBadge, Toolbar, Button } from "@zellforce/ui";
import { ProtectedShell } from "../../../components/protected-shell";
import { UsersTable } from "./users-table";

export default async function UsersSettingsPage() {
  const t = await getTranslations("app");

  return (
    <ProtectedShell>
      <section className="content-band" aria-labelledby="users-title">
        <PageHeader
          title={t("internalUsers")}
          actions={<Button type="button" variant="secondary" disabled>{t("save")}</Button>}
        />
        <Toolbar>
          <span>{t("status")}</span>
          <StatusBadge tone="success" label="active" />
        </Toolbar>
        <UsersTable />
      </section>
    </ProtectedShell>
  );
}
