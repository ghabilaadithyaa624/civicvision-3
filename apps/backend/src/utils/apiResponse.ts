import type { Response } from "express";
import type { ApiSuccessResponse } from "@civicvision/shared-types";

interface SuccessResponseOptions<T> {
  message: string;
  data?: T;
  statusCode?: number;
  meta?: Record<string, unknown>;
}

/**
 * Sends a consistently-shaped success response:
 * { success: true, message, data?, meta? }
 *
 * Typed against the shared ApiSuccessResponse<T> contract — the same
 * type the frontend's Axios calls expect — so a change to the response
 * shape on one side surfaces as a type error on the other, rather than
 * a silent runtime mismatch.
 */
export function sendSuccess<T>(res: Response, options: SuccessResponseOptions<T>): Response {
  const { message, data, statusCode = 200, meta } = options;

  const body: ApiSuccessResponse<T> = {
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
    ...(meta !== undefined ? { meta } : {}),
  };

  return res.status(statusCode).json(body);
}
