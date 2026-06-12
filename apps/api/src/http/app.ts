import express, {
  type Express,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response
} from "express";
import cors from "cors";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import {
  ApplicationError,
  resolveRequestActor,
  type IdentityAdmin,
  type RequestActor,
  type SessionRevoker,
  type SettingsRepository,
  type UserRepository
} from "@zellforce/application";
import { registerRoutes } from "./routes";

type BetterAuthHandlerInput = Parameters<typeof toNodeHandler>[0];

type SessionReader = {
  api: {
    getSession(args: { headers: Headers }): Promise<unknown>;
  };
};

type BetterAuthInstance = BetterAuthHandlerInput & SessionReader;

export type CreateExpressAppOptions = {
  auth?: BetterAuthInstance;
  authRouteHandler?: RequestHandler;
  sessionReader?: SessionReader;
  corsOrigin?: string | string[];
  phaseTwo?: {
    users: UserRepository;
    settings: SettingsRepository;
    identity: IdentityAdmin;
    sessions: SessionRevoker;
  };
};

export function createExpressApp(options: CreateExpressAppOptions = {}): Express {
  const app = express();

  app.use(
    cors({
      origin: options.corsOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    })
  );

  const authRouteHandler =
    options.authRouteHandler ??
    (options.auth ? (toNodeHandler(options.auth) as unknown as RequestHandler) : notConfiguredAuth);

  app.all("/api/auth/*", authRouteHandler);

  app.use(express.json());

  const sessionReader = options.sessionReader ?? options.auth;
  const routeOptions = {
    requireActor: createRequireActor(sessionReader, options.phaseTwo?.users),
    ...(options.phaseTwo ? { phaseTwo: options.phaseTwo } : {})
  };
  registerRoutes(app, routeOptions);

  app.use((
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (error instanceof ApplicationError) {
      res.status(error.status).json({ error: error.message, code: error.code });
      return;
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "issues" in error
    ) {
      res.status(400).json({ error: "Invalid request", code: "VALIDATION_ERROR" });
      return;
    }
    res.status(500).json({ error: "Internal server error", code: "INTERNAL_ERROR" });
  });

  return app;
}

export type ActorRequest = express.Request & { actor: RequestActor };

function createRequireActor(
  sessionReader: SessionReader | undefined,
  users: UserRepository | undefined
): RequestHandler {
  return async (req, res, next) => {
    try {
      if (!sessionReader || !users) {
        throw new ApplicationError("UNAUTHORIZED", "Unauthorized", 401);
      }
      const session = await sessionReader.api.getSession({
        headers: fromNodeHeaders(req.headers)
      });
      const authUserId = readAuthUserId(session);
      if (!authUserId) {
        throw new ApplicationError("UNAUTHORIZED", "Unauthorized", 401);
      }
      (req as ActorRequest).actor = await resolveRequestActor({ authUserId, users });
      next();
    } catch (error) {
      next(error);
    }
  };
}

function readAuthUserId(session: unknown): string | null {
  if (
    typeof session === "object" &&
    session !== null &&
    "user" in session &&
    typeof session.user === "object" &&
    session.user !== null &&
    "id" in session.user &&
    typeof session.user.id === "string"
  ) {
    return session.user.id;
  }
  return null;
}

const notConfiguredAuth: RequestHandler = (_req, res) => {
  res.status(503).json({ error: "Auth not configured" });
};
