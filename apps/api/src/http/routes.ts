import type { Express, RequestHandler } from "express";
import {
  createInternalUser,
  getTenantSettings,
  linkUserToPerson,
  listInternalUsers,
  setInternalUserActive,
  updateTenantSettings,
  type IdentityAdmin,
  type SessionRevoker,
  type SettingsRepository,
  type UserRepository
} from "@zellforce/application";
import {
  CREATE_INTERNAL_USER_INPUT_SCHEMA,
  LINK_USER_PERSON_INPUT_SCHEMA,
  UPDATE_TENANT_SETTINGS_INPUT_SCHEMA,
  UPDATE_USER_STATUS_INPUT_SCHEMA
} from "@zellforce/contracts";
import type { ActorRequest } from "./app";

type PhaseTwoDependencies = {
  users: UserRepository;
  settings: SettingsRepository;
  identity: IdentityAdmin;
  sessions: SessionRevoker;
};

export function registerRoutes(
  app: Express,
  options: {
    phaseTwo?: PhaseTwoDependencies;
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
}

function requiredParam(value: string | undefined): string {
  if (!value) {
    throw new Error("Required route parameter missing");
  }
  return value;
}
