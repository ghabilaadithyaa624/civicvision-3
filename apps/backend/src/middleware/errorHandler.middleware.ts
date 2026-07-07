import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "@utils/AppError";
import { logger } from "@config/logger";
import { isProduction } from "@config/env";

interface ErrorResponseBody {
  success: false;
  message: string;
  errors?: unknown;
  stack?: string;
}

/**
 * Express requires exactly 4 params for an error-handling middleware
 * to be recognized as such — do not remove `_next`.
 */
export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: unknown;
  let isOperational = false;

  if (err instanceof ZodError) {
    statusCode = 422;
    message = "Validation failed";
    errors = err.flatten().fieldErrors;
    isOperational = true;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.details;
    isOperational = err.isOperational;
  } else if (err instanceof Error) {
    message = isProduction ? "Internal Server Error" : err.message;
  }

  const logPayload = {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    isOperational,
    err,
  };

  if (statusCode >= 500) {
    logger.error(logPayload, "Unhandled error");
  } else {
    logger.warn(logPayload, "Request error");
  }

  const body: ErrorResponseBody = {
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
  };

  if (!isProduction && err instanceof Error) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
