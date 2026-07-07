// Extends Express's Request type with fields attached by our middleware.
// This makes `req.id` and `req.user` type-safe everywhere.

import "express";
import type { AccessTokenPayload } from "@app-types/jwt.types";

declare global {
  namespace Express {
    interface Request {
      /** Unique per-request correlation ID, set by requestId middleware. */
      id: string;
      /** Decoded JWT payload, set by the authenticate middleware on protected routes. */
      user?: AccessTokenPayload;
    }
  }
}

export {};
