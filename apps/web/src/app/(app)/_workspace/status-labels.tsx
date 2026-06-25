"use client";

import { useTranslations } from "next-intl";
import type {
  DemoContractStatus,
  InterviewStatus,
  ScreeningStatus,
  WhatsAppInboundMessage
} from "@zellforce/contracts";

// Maps raw domain enums to i18n message keys under `app.status.*`. Keeping the
// mapping here (rather than `labelize()` string munging) means every status the
// manager sees is a real, translated phrase in both English and Arabic instead
// of "save_to_staff_pool" with the underscores swapped for spaces.
export type WhatsAppIntent = WhatsAppInboundMessage["intent"];

const screeningKeys: Record<ScreeningStatus, string> = {
  needs_review: "screening.needs_review",
  shortlist_for_interview: "screening.shortlist_for_interview",
  save_to_staff_pool: "screening.save_to_staff_pool",
  save_for_future: "screening.save_for_future",
  underqualified: "screening.underqualified",
  overqualified: "screening.overqualified",
  rejected: "screening.rejected"
};

const interviewKeys: Record<InterviewStatus, string> = {
  not_scheduled: "interview.not_scheduled",
  scheduled: "interview.scheduled",
  interviewed: "interview.interviewed",
  no_show: "interview.no_show",
  passed: "interview.passed",
  failed: "interview.failed"
};

const contractKeys: Record<DemoContractStatus, string> = {
  not_sent: "contract.not_sent",
  sent: "contract.sent",
  pending: "contract.pending",
  signed: "contract.signed",
  refused: "contract.refused"
};

const whatsAppKeys: Record<WhatsAppIntent, string> = {
  profile_request: "whatsapp.profile_request",
  current_status: "whatsapp.current_status",
  emergency: "whatsapp.emergency",
  unknown: "whatsapp.unknown"
};

export type StatusLabels = {
  screening: (status: ScreeningStatus) => string;
  interview: (status: InterviewStatus) => string;
  contract: (status: DemoContractStatus) => string;
  whatsapp: (intent: WhatsAppIntent) => string;
};

// Hook returning typed accessors bound to the active locale. Components call
// `const labels = useStatusLabels()` and then `labels.screening(value)`.
export function useStatusLabels(): StatusLabels {
  const t = useTranslations("app.statuses");
  return {
    screening: (status) => t(screeningKeys[status]),
    interview: (status) => t(interviewKeys[status]),
    contract: (status) => t(contractKeys[status]),
    whatsapp: (intent) => t(whatsAppKeys[intent])
  };
}
