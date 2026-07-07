import { Router } from "express";
import { env, isProduction } from "@config/env";
import { formatUptime } from "@utils/formatUptime";
import { checkDatabaseConnection } from "@database/index";
import { generatePrometheusMetrics } from "@middleware/metrics.middleware";
import { AuditService } from "@services/audit.service";

const router = Router();

/**
 * GET /api/v1/health
 *
 * Liveness check. Response shape is intentionally flat (not wrapped in
 * the standard `data` envelope used by feature modules) to match the
 * fixed health-check contract expected by uptime monitors, load
 * balancers, and Kubernetes liveness probes. This endpoint reports
 * "the process is up" — it deliberately does NOT check downstream
 * dependencies (see /health/ready for that), so a slow database never
 * causes an orchestrator to kill a perfectly healthy process.
 */
router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CivicVision Backend Running",
    version: env.APP_VERSION,
    uptime: formatUptime(process.uptime()),
    environment: env.NODE_ENV,
  });
});

/**
 * GET /api/v1/health/ready
 *
 * Readiness probe: reports whether downstream dependencies (currently:
 * the database) are reachable. Kubernetes/load balancers should route
 * traffic based on this endpoint rather than /health, since a process
 * can be "alive" while still unable to serve real requests.
 */
router.get("/ready", async (_req, res) => {
  const db = await checkDatabaseConnection();

  if (!db.connected) {
    res.status(503).json({
      success: false,
      message: "Service not ready",
      checks: {
        database: {
          status: "down",
          ...(isProduction ? {} : { error: db.error }),
        },
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Service ready",
    checks: {
      database: { status: "up" },
    },
  });
});

/**
 * GET /api/v1/health/metrics
 *
 * Exposes system CPU, Memory, and HTTP traffic metrics in Prometheus format.
 */
router.get("/metrics", (_req, res) => {
  res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
  res.status(200).send(generatePrometheusMetrics());
});

/**
 * GET /api/v1/health/audit
 *
 * Exposes secure JSON structured audit logging rows for observability dashboard.
 */
router.get("/audit", async (_req, res) => {
  const logs = await AuditService.getRecentLogs();
  res.status(200).json({
    success: true,
    data: { logs },
  });
});

export { router as healthRouter };
