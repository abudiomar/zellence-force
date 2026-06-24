import React from "react";
import { getTranslations } from "next-intl/server";
import { Button } from "@zellforce/ui/components/button";
import { Checkbox } from "@zellforce/ui/components/checkbox";
import { Field } from "@zellforce/ui/components/label";
import { Select } from "@zellforce/ui/components/select";
import { TextInput } from "@zellforce/ui/components/input";
import { SettingsTabs } from "../settings-tabs";

export default async function GeneralSettingsPage() {
  const t = await getTranslations("app");

  return (
    <section className="content-band">
      <SettingsTabs />
      <form className="settings-form">
        <section className="section-panel">
          <h2>{t("settings")}</h2>
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
        </section>
      </form>
    </section>
  );
}
