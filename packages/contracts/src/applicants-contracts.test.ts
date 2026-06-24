import { describe, expect, test } from "vitest";
import {
  APPLICANT_DECISION_INPUT_SCHEMA,
  APPLICANT_IMPORT_ROW_SCHEMA,
  APPLICANT_REVIEW_QUEUE_ITEM_SCHEMA,
  GOOGLE_SHEET_MAPPING_SCHEMA,
  LIST_SHEET_TABS_INPUT_SCHEMA,
  RUN_APPLICANT_IMPORT_INPUT_SCHEMA,
  SCHEDULE_INTERVIEW_INPUT_SCHEMA,
  SHEET_TABS_SCHEMA,
  RECORD_INTERVIEW_SCORE_INPUT_SCHEMA
} from "./index";

describe("Phase 4 applicant contracts", () => {
  test("validates sheet mapping and import request DTOs", () => {
    expect(() =>
      GOOGLE_SHEET_MAPPING_SCHEMA.parse({
        fullName: "Full Name",
        phone: "Mobile",
        email: "Email",
        city: "City"
      })
    ).not.toThrow();

    expect(() =>
      RUN_APPLICANT_IMPORT_INPUT_SCHEMA.parse({
        sourceId: "sheet-123",
        sourceRange: "Form Responses 1!A:Z",
        mapping: { fullName: "Full Name", phone: "Mobile" }
      })
    ).not.toThrow();
  });

  test("validates applicant Sheet tab discovery DTOs", () => {
    expect(() =>
      LIST_SHEET_TABS_INPUT_SCHEMA.parse({
        sourceId: "sheet-123"
      })
    ).not.toThrow();

    expect(
      SHEET_TABS_SCHEMA.parse({
        tabs: [
          { id: "0", title: "Form Responses 1", index: 0 },
          { id: "123", title: "Interview", index: 1 }
        ]
      })
    ).toEqual({
      tabs: [
        { id: "0", title: "Form Responses 1", index: 0 },
        { id: "123", title: "Interview", index: 1 }
      ]
    });
  });

  test("rejects applicant import rows without required mapped fields", () => {
    expect(() =>
      APPLICANT_IMPORT_ROW_SCHEMA.parse({
        sourceRowId: "2",
        rawData: { "Full Name": "Sara" },
        mappedData: { fullName: "Sara", phone: "" }
      })
    ).toThrow();
  });

  test("validates review queue, decision, and interview DTOs", () => {
    expect(() =>
      APPLICANT_REVIEW_QUEUE_ITEM_SCHEMA.parse({
        id: "row-1",
        sourceRowId: "2",
        status: "pending_review",
        fullName: "Sara Ahmed",
        phone: "+966500000000",
        email: "sara@example.com",
        city: "Riyadh",
        errorMessages: [],
        matchedPersonId: null,
        createdAt: "2026-06-12T00:00:00.000Z"
      })
    ).not.toThrow();

    expect(() =>
      APPLICANT_DECISION_INPUT_SCHEMA.parse({
        decision: "accept",
        notes: "Good candidate"
      })
    ).not.toThrow();

    expect(() =>
      SCHEDULE_INTERVIEW_INPUT_SCHEMA.parse({
        personId: "person-1",
        scheduledAt: "2026-06-13T10:00:00.000Z"
      })
    ).not.toThrow();

    expect(() =>
      RECORD_INTERVIEW_SCORE_INPUT_SCHEMA.parse({
        interviewId: "interview-1",
        scores: [
          { criterion: "communication", score: 4 },
          { criterion: "presentation", score: 5 }
        ],
        notes: "Strong"
      })
    ).not.toThrow();
  });
});
