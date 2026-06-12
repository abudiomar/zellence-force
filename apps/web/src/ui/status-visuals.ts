import type { StatusTone } from "@zellforce/ui";

export type StatusVisual = {
  tone: StatusTone;
  icon: "dot" | "check" | "warn" | "lock" | "review";
  labelKey: string;
};

const success = new Set(["active", "accepted", "confirmed", "signed", "present", "approved", "exported", "merged"]);
const warning = new Set(["draft", "maybe_roster", "late", "standby", "deferred", "in_review", "reviewed", "offered"]);
const danger = new Set(["inactive", "blacklisted", "cancelled", "declined", "rejected", "absent", "error", "expired"]);
const locked = new Set(["completed"]);
const review = new Set(["recruiting", "screening", "interview", "pending_review", "candidate"]);

export function getStatusVisual(status: string): StatusVisual {
  if (success.has(status)) return { tone: "success", icon: "check", labelKey: `status.${status}` };
  if (warning.has(status)) return { tone: "warning", icon: "warn", labelKey: `status.${status}` };
  if (danger.has(status)) return { tone: "danger", icon: "warn", labelKey: `status.${status}` };
  if (locked.has(status)) return { tone: "locked", icon: "lock", labelKey: `status.${status}` };
  if (review.has(status)) return { tone: "review", icon: "review", labelKey: `status.${status}` };
  return { tone: "neutral", icon: "dot", labelKey: `status.${status}` };
}
