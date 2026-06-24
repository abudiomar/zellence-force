import {
  CalendarDays,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Star,
  Users,
  UserSearch,
  type LucideIcon
} from "lucide-react";
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

// The pipeline spine a staffing manager works through: see the day at a glance,
// move candidates through review -> interviews, draw from the staff pool to fill
// events, and watch WhatsApp for urgent staff messages. Each stage is its own
// route so it can be bookmarked, deep-linked, and reached via the back button.
export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    id: "dashboard",
    href: "/",
    labelKey: "app.nav.dashboard",
    icon: LayoutDashboard,
    enabled: true
  },
  {
    id: "candidates",
    href: "/candidates",
    labelKey: "app.nav.candidates",
    icon: UserSearch,
    requiredPermission: PERMISSIONS.MANAGE_APPLICANT_IMPORT,
    enabled: true
  },
  {
    id: "staff",
    href: "/staff",
    labelKey: "app.nav.staff",
    icon: Star,
    requiredPermission: PERMISSIONS.MANAGE_APPLICANT_IMPORT,
    enabled: true
  },
  {
    id: "events",
    href: "/events",
    labelKey: "app.nav.events",
    icon: CalendarDays,
    requiredPermission: PERMISSIONS.MANAGE_APPLICANT_IMPORT,
    enabled: true
  },
  {
    id: "messages",
    href: "/messages",
    labelKey: "app.nav.messages",
    icon: MessageCircle,
    requiredPermission: PERMISSIONS.MANAGE_APPLICANT_IMPORT,
    enabled: true
  },
  {
    id: "settings",
    href: "/settings/general",
    labelKey: "app.nav.settings",
    icon: Settings,
    requiredPermission: PERMISSIONS.MANAGE_SETTINGS,
    enabled: true
  }
];

export function visibleAppNavItems(role: UserRole): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) => {
    if (!item.enabled) return false;
    return item.requiredPermission ? canRole(role, item.requiredPermission) : true;
  });
}
