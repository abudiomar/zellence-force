import { Home, Settings, UserSearch, type LucideIcon } from "lucide-react";
import {
  PERMISSIONS,
  canRole,
  type Permission,
  type UserRole
} from "@zellforce/domain";

export type AppNavItem = {
  id: string;
  href: string;
  labelKey: string;
  icon: LucideIcon;
  requiredPermission?: Permission;
  enabled: boolean;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    id: "operations",
    href: "/",
    labelKey: "app.main",
    icon: Home,
    enabled: true
  },
  {
    id: "applicants",
    href: "/recruitment/applicants",
    labelKey: "app.applicants",
    icon: UserSearch,
    requiredPermission: PERMISSIONS.MANAGE_APPLICANT_IMPORT,
    enabled: true
  },
  {
    id: "settings",
    href: "/settings/general",
    labelKey: "app.settings",
    icon: Settings,
    requiredPermission: PERMISSIONS.MANAGE_SETTINGS,
    enabled: true
  },
  {
    id: "settings-users",
    href: "/settings/users",
    labelKey: "app.users",
    icon: Settings,
    requiredPermission: PERMISSIONS.MANAGE_USERS,
    enabled: true
  },
  {
    id: "future-events",
    href: "/events",
    labelKey: "app.events",
    icon: Home,
    requiredPermission: PERMISSIONS.MANAGE_EVENTS,
    enabled: false
  }
];

export function visibleAppNavItems(role: UserRole): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) => {
    if (!item.enabled) return false;
    return item.requiredPermission ? canRole(role, item.requiredPermission) : true;
  });
}
