import { PrismaClient } from "@prisma/client";
import { isProduction } from "@config/env";
import { logger } from "@config/logger";

/**
 * Minimal shapes for Prisma's `$on` event payloads, matching the
 * fields Prisma documents for "event"-emitted log levels. Declared
 * locally (rather than relying on `Prisma.QueryEvent` / `Prisma.LogEvent`)
 * so this file type-checks correctly even before `prisma generate` has
 * produced the full generated client types.
 */
interface PrismaQueryEvent {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
}

interface PrismaLogEvent {
  timestamp: Date;
  message: string;
  target: string;
}

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: [
      { level: "error", emit: "event" },
      { level: "warn", emit: "event" },
      { level: "query", emit: "event" },
    ],
  });

  client.$on("error", (e: PrismaLogEvent) => logger.error({ prisma: e }, "Prisma client error"));
  client.$on("warn", (e: PrismaLogEvent) =>
    logger.warn({ prisma: e }, "Prisma client warning"),
  );

  if (!isProduction) {
    client.$on("query", (e: PrismaQueryEvent) =>
      logger.debug(
        { query: e.query, params: e.params, duration: e.duration },
        "Prisma query",
      ),
    );
  }

  return client;
};

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  __prisma?: PrismaClientSingleton;
};

/**
 * Returns the memoized Prisma client, creating it lazily on first use.
 *
 * Deferring construction — rather than instantiating at module load,
 * as Prisma's own docs example does — means a missing `prisma generate`
 * step (a common onboarding mistake) doesn't crash the entire process
 * at boot. It only surfaces when something actually touches the
 * database, which `GET /api/v1/health/ready` reports as "not ready"
 * instead of taking the whole service down.
 *
 * The `globalThis` cache prevents creating a new client — and
 * exhausting the database connection pool — on every hot-reload in
 * development.
 */
export function getPrismaClient(): PrismaClientSingleton {
  if (!globalForPrisma.__prisma) {
    globalForPrisma.__prisma = createPrismaClient();
  }
  return globalForPrisma.__prisma;
}

/**
 * Disconnects the Prisma client if it was ever instantiated. Safe to
 * call even if the client was never used (e.g. a request-less process
 * shutting down) — it's a no-op in that case. Wired into the graceful
 * shutdown sequence in server.ts.
 */
export async function disconnectPrisma(): Promise<void> {
  if (globalForPrisma.__prisma) {
    await globalForPrisma.__prisma.$disconnect();
  }
}
