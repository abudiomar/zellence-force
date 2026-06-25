"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { TenantSettings } from "@zellforce/contracts";
import { AlertBanner } from "@zellforce/ui/components/alert";
import { Button } from "@zellforce/ui/components/button";
import { Checkbox } from "@zellforce/ui/components/checkbox";
import { Field } from "@zellforce/ui/components/label";
import { Select } from "@zellforce/ui/components/select";
import { TextInput } from "@zellforce/ui/components/input";
import { Skeleton } from "@zellforce/ui/components/skeleton";
import { getTenantSettings, updateTenantSettings } from "../settings-api";

type LoadState = "loading" | "ready" | "error";

export function GeneralSettingsForm() {
  const t = useTranslations("app");
  const [state, setState] = React.useState<LoadState>("loading");
  const [settings, setSettings] = React.useState<TenantSettings | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setState("loading");
    getTenantSettings()
      .then((value) => {
        setSettings(value);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  React.useEffect(() => load(), [load]);

  if (state === "loading") {
    return <Skeleton className="h-72" />;
  }

  if (state === "error" || !settings) {
    return (
      <section className="screen-state">
        <h2>{t("error")}</h2>
        <Button type="button" onClick={load}>{t("workspace.retry")}</Button>
      </section>
    );
  }

  const update = <K extends keyof TenantSettings>(key: K, value: TenantSettings[K]) => {
    setSaved(false);
    setSettings((current) => (current ? { ...current, [key]: value } : current));
  };

  const onSave = () => {
    if (!settings) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    updateTenantSettings({
      defaultLanguage: settings.defaultLanguage,
      supportedLanguages: settings.supportedLanguages,
      timezone: settings.timezone,
      currency: settings.currency,
      hijriEnabled: settings.hijriEnabled
    })
      .then((value) => {
        setSettings(value);
        setSaved(true);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : t("error")))
      .finally(() => setBusy(false));
  };

  return (
    <form className="settings-form" onSubmit={(event) => event.preventDefault()}>
      <section className="section-panel">
        <h2>{t("settings")}</h2>
        {saved ? <AlertBanner tone="success" title={t("success")} /> : null}
        {error ? <AlertBanner tone="danger" title={error} /> : null}
        <Field label={t("defaultLanguage")}>
          <Select
            value={settings.defaultLanguage}
            onChange={(event) => update("defaultLanguage", event.currentTarget.value as TenantSettings["defaultLanguage"])}
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </Select>
        </Field>
        <Field label={t("currency")}>
          <TextInput
            dir="ltr"
            value={settings.currency}
            onChange={(event) => update("currency", event.currentTarget.value.toUpperCase())}
          />
        </Field>
        <Field label={t("timezone")}>
          <TextInput
            dir="ltr"
            value={settings.timezone}
            onChange={(event) => update("timezone", event.currentTarget.value)}
          />
        </Field>
        <label className="zf-field">
          <span>{t("hijri")}</span>
          <Checkbox
            checked={settings.hijriEnabled}
            onChange={(event) => update("hijriEnabled", event.currentTarget.checked)}
          />
        </label>
        <Button type="button" loading={busy} onClick={onSave}>{t("save")}</Button>
      </section>
    </form>
  );
}
