import type {
  ApplicantDecisionInput,
  ApplicantImportResult,
  ApplicantReviewQueueItem,
  RecordInterviewScoreInput,
  RunApplicantImportInput,
  ScheduleInterviewInput
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
