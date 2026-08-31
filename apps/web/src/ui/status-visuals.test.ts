import { describe, expect, test } from "vitest";
import {
  APPLICANT_IMPORT_ROW_STATUSES,
  ASSIGNMENT_STAGES,
  ATTENDANCE_STATUSES,
  BACKUP_OUTCOMES,
  CONTRACT_STATUSES,
  EVENT_STATUSES,
  PAYMENT_BATCH_STATUSES,
  PERSON_STATUSES
} from "@zellforce/domain";
import { getStatusVisual } from "./status-visuals";

describe("status visuals", () => {
  test("maps every domain status to a non-color-only visual intent", () => {
    const statuses = [
      ...EVENT_STATUSES,
      ...PERSON_STATUSES,
      ...ASSIGNMENT_STAGES,
      ...CONTRACT_STATUSES,
      ...ATTENDANCE_STATUSES,
      ...BACKUP_OUTCOMES,
      ...APPLICANT_IMPORT_ROW_STATUSES,
      ...PAYMENT_BATCH_STATUSES
    ];

    for (const status of statuses) {
      const visual = getStatusVisual(status);
      expect(visual.tone).toBeTruthy();
      expect(visual.icon).toBeTruthy();
      expect(visual.labelKey).toContain(status);
    }
  });
});
