import React from "react";
import { getTranslations } from "next-intl/server";
import { Button, Checkbox, Field, FormSection, PageHeader, Select, TextInput } from "@zellforce/ui";
import { ProtectedShell } from "../../../components/protected-shell";

export default async function GeneralSettingsPage() {
  const t = await getTranslations("app");

  return (
    <ProtectedShell>
      <section className="content-band" aria-labelledby="settings-title">
        <PageHeader title={t("tenantSettings")} />
        <form className="settings-form">
          <FormSection title={t("settings")}>
            <Field label={t("defaultLanguage")}>
              <Select defaultValue="ar">
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </Select>
            </Field>
            <Field label={t("currency")}>
              <TextInput dir="ltr" defaultValue="SAR" />
            </Field>
            <Field label={t("timezone")}>
              <TextInput dir="ltr" defaultValue="Asia/Riyadh" />
            </Field>
            <label className="zf-field">
              <span>{t("hijri")}</span>
              <Checkbox defaultChecked />
            </label>
            <Button type="button" disabled>{t("save")}</Button>
          </FormSection>
        </form>
      </section>
    </ProtectedShell>
  );
}
