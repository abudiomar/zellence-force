import { AlertCircle, CheckCircle2, Clock3, PauseCircle, UserCheck, XCircle, type LucideIcon } from "lucide-react";
import type { ApplicantReviewQueueItem } from "@zellforce/contracts";
import type { StatusTone } from "@zellforce/ui/components/badge";

type ApplicantStatus = ApplicantReviewQueueItem["status"];

export type ApplicantStatusVisual = {
  label: string;
  tone: StatusTone;
  icon: LucideIcon;
};

export function getApplicantStatusVisual(status: ApplicantStatus): ApplicantStatusVisual {
  switch (status) {
    case "pending_review":
      return { label: "Pending review", tone: "review", icon: Clock3 };
    case "error":
      return { label: "Needs fix", tone: "danger", icon: AlertCircle };
    case "accepted":
      return { label: "Accepted", tone: "success", icon: UserCheck };
    case "rejected":
      return { label: "Rejected", tone: "danger", icon: XCircle };
    case "merged":
      return { label: "Merged", tone: "info", icon: CheckCircle2 };
    case "deferred":
      return { label: "Deferred", tone: "warning", icon: PauseCircle };
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}
