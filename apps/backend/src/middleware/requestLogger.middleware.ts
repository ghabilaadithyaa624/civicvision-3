import morgan from "morgan";
import type { StreamOptions } from "morgan";
import type { Request } from "express";
import { logger } from "@config/logger";
import { isTest } from "@config/env";

// Include the per-request correlation id in the Morgan output so HTTP
// access logs can be cross-referenced with application logs for the
// same request. Morgan's own typings use the bare Node `IncomingMessage`,
// so we cast to our augmented Express `Request` to access `req.id`.
morgan.token("id", (req) => (req as Request).id ?? "-");

const stream: StreamOptions = {
  write: (message: string) => logger.info(message.trim()),
};

const format =
  ':id :method :url :status :res[content-length]B - :response-time ms';

/**
 * HTTP request logger middleware. Skipped in test environment to keep
 * test output clean.
 */
export const requestLogger = morgan(format, {
  stream,
  skip: () => isTest,
});
