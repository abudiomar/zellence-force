import { describe, expect, test } from "vitest";
import type { ApplicantReviewQueueItem } from "@zellforce/contracts";
import { matchesScreeningFilters, type ScreeningFilters } from "./candidates-filter";

const baseRow: ApplicantReviewQueueItem = {
  id: "row-1",
  sourceRowId: "2",
  status: "pending_review",
  fullName: "Sara Ahmed",
  phone: "+966500000000",
  email: null,
  city: "Riyadh",
  errorMessages: [],
  matchedPersonId: null,
  screeningStatus: "needs_review",
  interviewStatus: "not_scheduled",
  contractSent: false,
  contractStatus: "not_sent",
  createdAt: "2026-06-12T00:00:00.000Z"
};

const emptyFilters: ScreeningFilters = {
  search: "",
  gender: "",
  canTravel: false,
  minAge: "",
  maxAge: "",
  cities: [],
  nationalities: [],
  languages: [],
  experiences: []
};

describe("candidate screening filters", () => {
  test("matches comma-separated candidate languages by selected option", () => {
    expect(
      matchesScreeningFilters(
        { ...baseRow, languages: "Arabic, English" },
        { ...emptyFilters, languages: ["english"] }
      )
    ).toBe(true);

    expect(
      matchesScreeningFilters(
        { ...baseRow, languages: "Arabic, English" },
        { ...emptyFilters, languages: ["french"] }
      )
    ).toBe(false);
  });
});
