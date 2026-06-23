import type {
  AddShortlistInput,
  ApplicantDecisionInput,
  ApplicantImportResult,
  ApplicantReviewQueueItem,
  DemoEvent,
  DemoEventInput,
  RecordInterviewScoreInput,
  RunApplicantImportInput,
  ScheduleInterviewInput,
  SheetHeaderPreview,
  StaffPoolFilter,
  StaffPoolItem,
  UpdateInterviewPipelineInput,
  UpdateScreeningInput,
  WhatsAppInboundMessage
} from "@zellforce/contracts";
import { getPublicEnv } from "../../../config/public-env";

export async function listApplicantReviewQueue(): Promise<ApplicantReviewQueueItem[]> {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/applicants/review-queue`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Unable to load applicant review queue");
  }
  return response.json() as Promise<ApplicantReviewQueueItem[]>;
}

export async function runApplicantImport(input: RunApplicantImportInput): Promise<ApplicantImportResult> {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/applicants/import-runs`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw new Error("Unable to run applicant import");
  }
  return response.json() as Promise<ApplicantImportResult>;
}

export async function previewApplicantSheetHeaders(input: {
  sourceId: string;
  sourceRange: string;
}): Promise<SheetHeaderPreview> {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/applicants/header-preview`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw new Error("Unable to preview applicant sheet headers");
  }
  return response.json() as Promise<SheetHeaderPreview>;
}

export async function decideApplicant(rowId: string, input: ApplicantDecisionInput) {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/applicants/review-queue/${rowId}/decision`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw new Error("Unable to save applicant decision");
  }
  return response.json() as Promise<{ personId: string | null; status: string }>;
}

export async function updateApplicantScreening(rowId: string, input: UpdateScreeningInput) {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/applicants/review-queue/${rowId}/screening`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw new Error("Unable to update applicant screening");
  }
  return response.json() as Promise<ApplicantReviewQueueItem>;
}

export async function updateApplicantInterviewPipeline(rowId: string, input: UpdateInterviewPipelineInput) {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/applicants/review-queue/${rowId}/interview-pipeline`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw new Error("Unable to update interview pipeline");
  }
  return response.json() as Promise<ApplicantReviewQueueItem>;
}

export async function saveApplicantToStaff(rowId: string, mode: "staff" | "future") {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/applicants/review-queue/${rowId}/save-to-staff`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode })
  });
  if (!response.ok) {
    throw new Error("Unable to save applicant to staff pool");
  }
  return response.json() as Promise<{ personId: string | null; row: ApplicantReviewQueueItem }>;
}

export async function listStaffPool(filter: StaffPoolFilter = {}): Promise<StaffPoolItem[]> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/staff-pool${query ? `?${query}` : ""}`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Unable to load staff pool");
  }
  return response.json() as Promise<StaffPoolItem[]>;
}

export async function listDemoEvents(): Promise<DemoEvent[]> {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/demo-events`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Unable to load demo events");
  }
  return response.json() as Promise<DemoEvent[]>;
}

export async function createDemoEvent(input: DemoEventInput): Promise<DemoEvent> {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/demo-events`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw new Error("Unable to create demo event");
  }
  return response.json() as Promise<DemoEvent>;
}

export async function addCandidateToDemoEvent(eventId: string, input: AddShortlistInput): Promise<DemoEvent> {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/demo-events/${eventId}/shortlist`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw new Error("Unable to update demo event shortlist");
  }
  return response.json() as Promise<DemoEvent>;
}

export async function listWhatsAppInbox(): Promise<WhatsAppInboundMessage[]> {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/whatsapp/inbox`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Unable to load WhatsApp inbox");
  }
  return response.json() as Promise<WhatsAppInboundMessage[]>;
}

export async function scheduleApplicantInterview(input: ScheduleInterviewInput) {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/interviews`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw new Error("Unable to schedule interview");
  }
  return response.json() as Promise<{ interviewId: string }>;
}

export async function recordApplicantInterviewScore(input: RecordInterviewScoreInput) {
  const response = await fetch(`${getPublicEnv().NEXT_PUBLIC_API_URL}/api/interviews/${input.interviewId}/scores`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw new Error("Unable to record interview score");
  }
  return response.json() as Promise<{
    interviewId: string;
    overallScore: number;
    belowMinimum: boolean;
  }>;
}
