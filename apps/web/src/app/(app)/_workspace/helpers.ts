import type {
  DemoContractStatus,
  GoogleSheetMapping,
  InterviewStatus,
  ScreeningStatus,
  StaffPoolFilter,
  WhatsAppInboundMessage
} from "@zellforce/contracts";
import type { StatusTone } from "@zellforce/ui/components/badge";

export const defaultMapping: GoogleSheetMapping = {
  fullName: "Full Name",
  phone: "Mobile",
  email: "Email",
  city: "City",
  gender: "Gender",
  age: "Age",
  photoUrl: "Photo",
  cvUrl: "CV",
  experience: "Experience",
  notes: "Notes"
};

export const screeningStatuses: ScreeningStatus[] = [
  "needs_review",
  "shortlist_for_interview",
  "save_to_staff_pool",
  "save_for_future",
  "underqualified",
  "overqualified",
  "rejected"
];

export const interviewStatuses: InterviewStatus[] = [
  "not_scheduled",
  "scheduled",
  "interviewed",
  "no_show",
  "passed",
  "failed"
];

export const contractStatuses: DemoContractStatus[] = [
  "not_sent",
  "sent",
  "pending",
  "signed",
  "refused"
];

export const savedFilterViews: Array<{ id: string; label: string; filter: StaffPoolFilter }> = [
  { id: "ready-interview", label: "Ready for interview", filter: { screeningStatus: "shortlist_for_interview", interviewStatus: "not_scheduled" } },
  { id: "high-score", label: "High score", filter: { minFinalScore: 4 } },
  { id: "cv-photo", label: "Has CV + photo", filter: { hasCv: true, hasPhoto: true } },
  { id: "future", label: "Saved for future", filter: { screeningStatus: "save_for_future" } },
  { id: "event-ready", label: "Ready for event shortlist", filter: { interviewStatus: "passed", minFinalScore: 3.5 } }
];

export const initialDemoEvent = {
  name: "Riyadh Launch Demo",
  city: "Riyadh",
  eventDate: "",
  roleName: "Host",
  neededHeadcount: "6"
};

export function screeningTone(status: ScreeningStatus): StatusTone {
  if (status === "save_to_staff_pool") return "success";
  if (status === "shortlist_for_interview" || status === "save_for_future") return "info";
  if (status === "underqualified" || status === "overqualified") return "warning";
  if (status === "rejected") return "danger";
  return "review";
}

export function interviewTone(status: InterviewStatus): StatusTone {
  if (status === "passed") return "success";
  if (status === "failed" || status === "no_show") return "danger";
  if (status === "scheduled" || status === "interviewed") return "info";
  return "neutral";
}

export function contractTone(status: DemoContractStatus): StatusTone {
  if (status === "signed") return "success";
  if (status === "refused") return "danger";
  if (status === "sent" || status === "pending") return "warning";
  return "neutral";
}

export function whatsAppTone(intent: WhatsAppInboundMessage["intent"], emergency: boolean): StatusTone {
  if (emergency) return "danger";
  if (intent === "profile_request" || intent === "current_status") return "info";
  return "neutral";
}

export function labelize(value: string): string {
  return value.replaceAll("_", " ");
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

export function parseScore(value: string): number | null {
  if (!value.trim()) return null;
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return Math.max(1, Math.min(5, score));
}

export function formatScoreInput(value: number | null | undefined): string {
  return value ? String(value) : "";
}

export function averagePreview(values: string[]): string {
  const scores = values.map(parseScore).filter((value): value is number => value !== null);
  if (scores.length === 0) return "-";
  return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2);
}

export function emptyToUndefined(value: string): string | undefined {
  return value.trim() ? value : undefined;
}

export function numberOrUndefined(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
