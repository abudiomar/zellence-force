import type { Express, RequestHandler } from "express";
import { z } from "zod";
import {
  addCandidateToDemoEvent,
  createDemoEvent,
  decideApplicantImportRow,
  createInternalUser,
  getTenantSettings,
  importApplicantRows,
  listApplicantSheetTabs,
  linkUserToPerson,
  listApplicantReviewQueue,
  listDemoEvents,
  listInternalUsers,
  listStaffPool,
  listWhatsAppInbox,
  handleWhatsAppInbound,
  previewApplicantSheetHeaders,
  recordInterviewScore,
  saveApplicantToStaffPool,
  scheduleInterview,
  setInternalUserActive,
  updateApplicantInterviewPipeline,
  updateApplicantScreening,
  updateTenantSettings,
  type ApplicantImportRepository,
  type ApplicantSheetReader,
  type IdentityAdmin,
  type SessionRevoker,
  type SettingsRepository,
  type UserRepository,
  type WhatsAppBotResponse
} from "@zellforce/application";
import {
  CREATE_INTERNAL_USER_INPUT_SCHEMA,
  LINK_USER_PERSON_INPUT_SCHEMA,
  UPDATE_TENANT_SETTINGS_INPUT_SCHEMA,
  UPDATE_USER_STATUS_INPUT_SCHEMA,
  APPLICANT_DECISION_INPUT_SCHEMA,
  ADD_SHORTLIST_INPUT_SCHEMA,
  DEMO_EVENT_INPUT_SCHEMA,
  RECORD_INTERVIEW_SCORE_INPUT_SCHEMA,
  RUN_APPLICANT_IMPORT_INPUT_SCHEMA,
  SCHEDULE_INTERVIEW_INPUT_SCHEMA,
  STAFF_POOL_FILTER_SCHEMA,
  UPDATE_INTERVIEW_PIPELINE_INPUT_SCHEMA,
  UPDATE_SCREENING_INPUT_SCHEMA
} from "@zellforce/contracts";
import type { ActorRequest } from "./app";

type PhaseTwoDependencies = {
  users: UserRepository;
  settings: SettingsRepository;
  identity: IdentityAdmin;
  sessions: SessionRevoker;
};

type PhaseFourDependencies = {
  applicants: ApplicantImportRepository;
  sheet: ApplicantSheetReader;
};

export function registerRoutes(
  app: Express,
  options: {
    phaseTwo?: PhaseTwoDependencies;
    phaseFour?: PhaseFourDependencies;
    whatsappSender?: {
      send(input: { to: string; response: WhatsAppBotResponse }): Promise<void>;
    };
    whatsappWebhookVerifyToken?: string;
    whatsappWebhookTenantId?: string;
    requireActor: RequestHandler;
  }
): void {
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  if (!options.phaseTwo) {
    app.get("/api/me", options.requireActor, (_req, res) => {
      res.status(503).json({ error: "Phase 2 not configured" });
    });
    return;
  }

  const deps = options.phaseTwo;
  const applicantsDeps = options.phaseFour;
  app.get("/api/me", options.requireActor, (req, res) => {
    res.status(200).json((req as ActorRequest).actor);
  });

  app.get("/api/users", options.requireActor, async (req, res, next) => {
    try {
      res.json(await listInternalUsers(deps, (req as ActorRequest).actor));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/users", options.requireActor, async (req, res, next) => {
    try {
      const input = CREATE_INTERNAL_USER_INPUT_SCHEMA.parse(req.body);
      res.status(201).json(
        await createInternalUser(deps, (req as ActorRequest).actor, input)
      );
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/users/:id/status", options.requireActor, async (req, res, next) => {
    try {
      const input = UPDATE_USER_STATUS_INPUT_SCHEMA.parse(req.body);
      res.json(
        await setInternalUserActive(
          deps,
          (req as ActorRequest).actor,
          requiredParam(req.params.id),
          input.isActive
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/users/:id/person", options.requireActor, async (req, res, next) => {
    try {
      const input = LINK_USER_PERSON_INPUT_SCHEMA.parse(req.body);
      res.json(
        await linkUserToPerson(
          deps,
          (req as ActorRequest).actor,
          requiredParam(req.params.id),
          input.personId
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/settings", options.requireActor, async (req, res, next) => {
    try {
      res.json(await getTenantSettings(deps, (req as ActorRequest).actor));
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/settings", options.requireActor, async (req, res, next) => {
    try {
      const input = UPDATE_TENANT_SETTINGS_INPUT_SCHEMA.parse(req.body);
      res.json(
        await updateTenantSettings(deps, (req as ActorRequest).actor, input)
      );
    } catch (error) {
      next(error);
    }
  });

  if (!applicantsDeps) {
    return;
  }

  app.post("/api/applicants/import-runs", options.requireActor, async (req, res, next) => {
    try {
      const input = RUN_APPLICANT_IMPORT_INPUT_SCHEMA.parse(req.body);
      res.status(201).json(
        await importApplicantRows(applicantsDeps, (req as ActorRequest).actor, input)
      );
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/applicants/header-preview", options.requireActor, async (req, res, next) => {
    try {
      res.json(
        await previewApplicantSheetHeaders(
          { sheet: applicantsDeps.sheet },
          (req as ActorRequest).actor,
          req.body
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/applicants/sheet-tabs", options.requireActor, async (req, res, next) => {
    try {
      res.json(
        await listApplicantSheetTabs(
          { sheet: applicantsDeps.sheet },
          (req as ActorRequest).actor,
          req.body
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/applicants/review-queue", options.requireActor, async (req, res, next) => {
    try {
      res.json(
        await listApplicantReviewQueue(
          { applicants: applicantsDeps.applicants },
          (req as ActorRequest).actor,
          typeof req.query.status === "string" ? { status: req.query.status } : {}
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/applicants/review-queue/:id/decision", options.requireActor, async (req, res, next) => {
    try {
      const input = APPLICANT_DECISION_INPUT_SCHEMA.parse(req.body);
      res.json(
        await decideApplicantImportRow(
          { applicants: applicantsDeps.applicants },
          (req as ActorRequest).actor,
          requiredParam(req.params.id),
          input
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/applicants/review-queue/:id/screening", options.requireActor, async (req, res, next) => {
    try {
      const input = UPDATE_SCREENING_INPUT_SCHEMA.parse(req.body);
      res.json(
        await updateApplicantScreening(
          { applicants: applicantsDeps.applicants },
          (req as ActorRequest).actor,
          requiredParam(req.params.id),
          input
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/applicants/review-queue/:id/interview-pipeline", options.requireActor, async (req, res, next) => {
    try {
      const input = UPDATE_INTERVIEW_PIPELINE_INPUT_SCHEMA.parse(req.body);
      res.json(
        await updateApplicantInterviewPipeline(
          { applicants: applicantsDeps.applicants },
          (req as ActorRequest).actor,
          requiredParam(req.params.id),
          input
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/applicants/review-queue/:id/save-to-staff", options.requireActor, async (req, res, next) => {
    try {
      const input = z.object({ mode: z.enum(["staff", "future"]) }).parse(req.body);
      res.json(
        await saveApplicantToStaffPool(
          { applicants: applicantsDeps.applicants },
          (req as ActorRequest).actor,
          requiredParam(req.params.id),
          input.mode
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/staff-pool", options.requireActor, async (req, res, next) => {
    try {
      const filter = STAFF_POOL_FILTER_SCHEMA.parse(req.query);
      res.json(
        await listStaffPool(
          { applicants: applicantsDeps.applicants },
          (req as ActorRequest).actor,
          filter
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/demo-events", options.requireActor, async (req, res, next) => {
    try {
      res.json(
        await listDemoEvents(
          { applicants: applicantsDeps.applicants },
          (req as ActorRequest).actor
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/demo-events", options.requireActor, async (req, res, next) => {
    try {
      const input = DEMO_EVENT_INPUT_SCHEMA.parse(req.body);
      res.status(201).json(
        await createDemoEvent(
          { applicants: applicantsDeps.applicants },
          (req as ActorRequest).actor,
          input
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/demo-events/:id/shortlist", options.requireActor, async (req, res, next) => {
    try {
      const input = ADD_SHORTLIST_INPUT_SCHEMA.parse(req.body);
      res.json(
        await addCandidateToDemoEvent(
          { applicants: applicantsDeps.applicants },
          (req as ActorRequest).actor,
          requiredParam(req.params.id),
          input
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/whatsapp/inbox", options.requireActor, async (req, res, next) => {
    try {
      res.json(
        await listWhatsAppInbox(
          { applicants: applicantsDeps.applicants },
          (req as ActorRequest).actor
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/whatsapp/webhook", (req, res) => {
    const mode = readQueryString(req.query["hub.mode"]);
    const token = readQueryString(req.query["hub.verify_token"]);
    const challenge = readQueryString(req.query["hub.challenge"]);
    if (
      mode === "subscribe" &&
      token &&
      token === options.whatsappWebhookVerifyToken &&
      challenge
    ) {
      res.status(200).send(challenge);
      return;
    }
    res.status(403).json({ error: "Webhook verification failed" });
  });

  app.post("/api/whatsapp/webhook", async (req, res, next) => {
    try {
      const tenantId =
        options.whatsappWebhookTenantId ??
        (await applicantsDeps.applicants.findDefaultTenantId?.());
      if (!tenantId) {
        res.status(503).json({ error: "WhatsApp webhook tenant is not configured" });
        return;
      }

      const messages = extractWhatsAppMessages(req.body);
      for (const message of messages) {
        const fromPhone = normalizeWebhookPhone(message.fromPhone);
        const result = await handleWhatsAppInbound(
          { applicants: applicantsDeps.applicants },
          {
            tenantId,
            waMessageId: message.id,
            fromPhone,
            body: message.body,
            payload: req.body,
            actionId: message.actionId
          }
        );
        await options.whatsappSender?.send({
          to: fromPhone,
          response: result.response
        });
      }
      res.json({ received: messages.length });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/interviews", options.requireActor, async (req, res, next) => {
    try {
      const input = SCHEDULE_INTERVIEW_INPUT_SCHEMA.parse(req.body);
      res.status(201).json(
        await scheduleInterview(
          { applicants: applicantsDeps.applicants },
          (req as ActorRequest).actor,
          input
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/interviews/:id/scores", options.requireActor, async (req, res, next) => {
    try {
      const input = RECORD_INTERVIEW_SCORE_INPUT_SCHEMA.parse({
        ...req.body,
        interviewId: requiredParam(req.params.id)
      });
      res.json(
        await recordInterviewScore(
          { applicants: applicantsDeps.applicants },
          (req as ActorRequest).actor,
          input
        )
      );
    } catch (error) {
      next(error);
    }
  });
}

type WhatsAppWebhookMessage = {
  id: string;
  fromPhone: string;
  body: string;
  actionId: string | null;
};

function extractWhatsAppMessages(payload: unknown): WhatsAppWebhookMessage[] {
  const entries = readArray(readObject(payload)?.entry);
  const messages: WhatsAppWebhookMessage[] = [];

  for (const entry of entries) {
    const changes = readArray(readObject(entry)?.changes);
    for (const change of changes) {
      const value = readObject(readObject(change)?.value);
      for (const message of readArray(value?.messages)) {
        const object = readObject(message);
        const id = readString(object?.id);
        const fromPhone = readString(object?.from);
        const interactive = readObject(object?.interactive);
        const buttonReply = readObject(interactive?.button_reply);
        const listReply = readObject(interactive?.list_reply);
        const legacyButton = readObject(object?.button);
        const actionId =
          readString(buttonReply?.id) ??
          readString(listReply?.id) ??
          readString(legacyButton?.payload);
        const body =
          readString(readObject(object?.text)?.body) ??
          readString(legacyButton?.text) ??
          readString(buttonReply?.title) ??
          readString(listReply?.title) ??
          actionId;
        if (id && fromPhone && body) {
          messages.push({ id, fromPhone, body, actionId });
        }
      }
    }
  }

  return messages;
}

function normalizeWebhookPhone(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  return value.trim().startsWith("+") ? value.trim() : `+${digits}`;
}

function readQueryString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
}

function readObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? value as Record<string, unknown>
    : null;
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function requiredParam(value: string | undefined): string {
  if (!value) {
    throw new Error("Required route parameter missing");
  }
  return value;
}
