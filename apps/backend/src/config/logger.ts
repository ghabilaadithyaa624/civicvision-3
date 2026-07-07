import pino from "pino";
import { env, isProduction } from "./env";

/**
 * Central application logger.
 * - Pretty-printed, colorized output in development.
 * - Structured JSON output in production (consumable by log aggregators
 *   like Loki/ELK/CloudWatch — wired up in the monitoring infra module).
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    app: env.APP_NAME,
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
});

export type Logger = typeof logger;
