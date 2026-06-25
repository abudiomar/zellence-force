import React from "react";
import { SettingsTabs } from "../settings-tabs";
import { GeneralSettingsForm } from "./general-form";

export default function GeneralSettingsPage() {
  return (
    <section className="content-band">
      <SettingsTabs />
      <GeneralSettingsForm />
    </section>
  );
}
