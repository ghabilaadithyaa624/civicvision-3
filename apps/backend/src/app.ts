import express, { type Application } from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { env } from "@config/env";
import { requestId } from "@middleware/requestId.middleware";
import { requestLogger } from "@middleware/requestLogger.middleware";
import { metricsMiddleware } from "@middleware/metrics.middleware";
import { notFoundHandler } from "@middleware/notFound.middleware";
import { globalErrorHandler } from "@middleware/errorHandler.middleware";
import { apiRouter } from "@routes/index";

export function createApp(): Application {
  const app = express();

  // Trust the first proxy hop (nginx/load balancer) so req.ip and
  // secure cookies behave correctly behind a reverse proxy.
  app.set("trust proxy", 1);

  // ---------- Security ----------
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  // ---------- Performance ----------
  app.use(compression());

  // ---------- Body parsing ----------
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ---------- Observability ----------
  app.use(metricsMiddleware);
  app.use(requestId);
  app.use(requestLogger);

  // ---------- Static files ----------
  app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

  // ---------- Routes (API versioning under /api) ----------
  app.use("/api", apiRouter);

  // ---------- 404 + global error handler (must be last) ----------
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
