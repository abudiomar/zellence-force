import { PERMISSIONS, type Permission } from "@zellforce/domain";

export type SettingsTabItem = {
  id: "general" | "users";
  href: string;
  labelKey: string;
  requiredPermission: Permission;
};

export const SETTINGS_TABS: SettingsTabItem[] = [
  {
    id: "general",
    href: "/settings/general",
    labelKey: "app.tenantSettings",
    requiredPermission: PERMISSIONS.MANAGE_SETTINGS
  },
  {
    id: "users",
    href: "/settings/users",
    labelKey: "app.internalUsers",
    requiredPermission: PERMISSIONS.MANAGE_USERS
  }
];
