import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@utils/AppError";
import { TokenService } from "@services/token.service";

let tokenServiceInstance: TokenService | undefined;

function getTokenService(): TokenService {
  if (!tokenServiceInstance) {
    tokenServiceInstance = new TokenService();
  }
  return tokenServiceInstance;
}

const BEARER_PREFIX = "Bearer ";

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches the
 * decoded payload to `req.user`. Mount on any route that requires an
 * authenticated caller.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("authorization");

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    next(new UnauthorizedError("Missing or invalid Authorization header"));
    return;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();

  try {
    req.user = getTokenService().verifyAccessToken(token);
    next();
  } catch (err) {
    next(err);
  }
}
