import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

/**
 * Validates `{ body, query, params }` against the given Zod schema.
 * On failure, forwards the ZodError to `next()` — the global error
 * handler already knows how to turn a ZodError into a 422 response,
 * so no duplicate error-shaping logic is needed here.
 *
 * On success, `req.body` is reassigned to the parsed output so that
 * any Zod defaults/coercions are reflected in what the controller
 * receives.
 *
 * Usage:
 *   router.post("/register", validate(registerSchema), register);
 */
export function validate(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      next(result.error);
      return;
    }

    if (result.data.body !== undefined) {
      req.body = result.data.body;
    }

    next();
  };
}
