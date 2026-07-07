import { config as loadDotenv } from "dotenv";
import { z } from "zod";
import path from "path";

// Load .env from the backend package root (works in both `tsx` dev and compiled `dist` runs)
loadDotenv({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(5000),
    HOST: z.string().default("0.0.0.0"),
    API_VERSION: z.string().default("v1"),
    APP_NAME: z.string().default("CivicVision AI"),
    APP_VERSION: z.string().default("1.0.0"),
    LOG_LEVEL: z
      .string()
      .transform((value) => value.trim().toLowerCase())
      .pipe(
        z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
      )
      .default("info"),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),

    // Reserved for Module 3 (database layer) — validated now so misconfiguration
    // fails fast at boot once the database module comes online.
    DATABASE_URL: z.string().optional(),
    REDIS_URL: z.string().optional(),
    AI_SERVICE_URL: z.string().default("http://localhost:8000"),

    // Image Upload & Caching
    MAX_UPLOAD_SIZE_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
    IMAGE_CACHE_CONTROL_HEADER: z.string().default("public, max-age=31536000, immutable"),

    // Auth (JWT + bcrypt)
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters").optional(),
    JWT_EXPIRES_IN: z.string().default("1d"),
    JWT_REFRESH_SECRET: z
      .string()
      .min(16, "JWT_REFRESH_SECRET must be at least 16 characters")
      .optional(),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "production") {
      if (!data.JWT_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["JWT_SECRET"],
          message: "JWT_SECRET is required in production",
        });
      }
      if (!data.JWT_REFRESH_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["JWT_REFRESH_SECRET"],
          message: "JWT_REFRESH_SECRET is required in production",
        });
      }
    }
  });

type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment configuration:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = parseEnv();

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
