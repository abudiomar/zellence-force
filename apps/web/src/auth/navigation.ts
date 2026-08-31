import { PERMISSIONS, canRole, type UserRole } from "@zellforce/domain";

export function visibleSettingsLinks(role: UserRole): Array<"users" | "general"> {
  return canRole(role, PERMISSIONS.MANAGE_SETTINGS)
    ? ["users", "general"]
    : [];
}
