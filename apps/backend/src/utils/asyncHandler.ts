import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Wraps an async Express handler so thrown errors / rejected promises
 * are automatically forwarded to `next()` and handled by the global
 * error handler, instead of crashing the process or requiring
 * boilerplate try/catch in every controller.
 *
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler =
  (handler: AsyncRouteHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
