import { getPrismaClient } from "./prisma.client";
import { logger } from "@config/logger";

export interface DatabaseConnectionStatus {
  connected: boolean;
  error?: string;
}

/**
 * Pings the database with a trivial query to verify connectivity.
 * Used by GET /api/v1/health/ready — deliberately never throws;
 * failures are reported in the returned status so the readiness
 * handler can respond with a clean 503 instead of a 500.
 */
export async function checkDatabaseConnection(): Promise<DatabaseConnectionStatus> {
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (err) {
    logger.error({ err }, "Database connectivity check failed");
    return {
      connected: false,
      error: err instanceof Error ? err.message : "Unknown database error",
    };
  }
}
