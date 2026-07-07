import type { Server } from "http";
import { createApp } from "./app";
import { env } from "@config/env";
import { logger } from "@config/logger";
import { disconnectPrisma } from "@database/index";

const app = createApp();

const server: Server = app.listen(env.PORT, env.HOST, () => {
  logger.info(
    `🚀 ${env.APP_NAME} backend listening on http://${env.HOST}:${env.PORT} [${env.NODE_ENV}]`,
  );
  logger.info(`   Health check: http://${env.HOST}:${env.PORT}/api/${env.API_VERSION}/health`);
});

/**
 * Graceful shutdown: stop accepting new connections, let in-flight
 * requests finish, then clean up external resources before exiting.
 */
const cleanupHooks: Array<() => Promise<void>> = [
  async () => disconnectPrisma(),
  // Reserved for a future Redis module: e.g. `async () => redisClient.quit()`
];

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received. Starting graceful shutdown...`);

  const forceExitTimer = setTimeout(() => {
    logger.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10_000);

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    logger.info("HTTP server closed — no longer accepting connections.");

    for (const cleanup of cleanupHooks) {
      await cleanup();
    }

    clearTimeout(forceExitTimer);
    logger.info("Graceful shutdown complete. Goodbye.");
    process.exit(0);
  } catch (err) {
    clearTimeout(forceExitTimer);
    logger.error({ err }, "Error during graceful shutdown.");
    process.exit(1);
  }
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled Promise Rejection");
  void shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught Exception");
  void shutdown("uncaughtException");
});

export { server };
