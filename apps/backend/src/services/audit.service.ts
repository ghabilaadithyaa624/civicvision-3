import fs from "fs";
import path from "path";
import { logger } from "@config/logger";

export interface AuditEntry {
  id: string;
  timestamp: string;
  category: "API" | "DATABASE" | "YOLO" | "AUTH";
  message: string;
  latency?: string;
  user: string;
}

// From the compiled output at dist/services/audit.service.js, two levels
// up reaches apps/backend (where logs/ already exists) — not three
// levels, which lands one directory too high at apps/logs instead.
const LOGS_DIR = path.join(__dirname, "../../logs");
const AUDIT_FILE = path.join(LOGS_DIR, "audit.json");

/**
 * Audit trail persisted to a flat JSON file.
 *
 * Known limitations worth knowing about before relying on this in
 * production:
 * - Concurrent requests calling `log()` at the same time can race on
 *   the read-modify-write cycle below and lose entries — there's no
 *   file locking.
 * - In a horizontally-scaled deployment (multiple backend containers),
 *   each instance has its own local file — logs won't be centralized.
 *
 * Since this project already has PostgreSQL via Prisma for everything
 * else, a proper audit_log table would be the more correct long-term
 * home for this — flagging rather than migrating unprompted, since
 * that's a schema change worth a deliberate decision.
 */
export class AuditService {
  private static initialized = false;
  private static initPromise: Promise<void> | null = null;

  private static async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          try {
            await fs.promises.access(LOGS_DIR);
          } catch {
            await fs.promises.mkdir(LOGS_DIR, { recursive: true });
          }

          try {
            await fs.promises.access(AUDIT_FILE);
          } catch {
            await fs.promises.writeFile(AUDIT_FILE, JSON.stringify([]), "utf-8");
          }

          this.initialized = true;
        } catch (err) {
          logger.error({ err }, "Failed to initialize audit logs directory");
        }
      })();
    }

    return this.initPromise;
  }

  public static async log(
    category: "API" | "DATABASE" | "YOLO" | "AUTH",
    message: string,
    user: string = "system",
    latency?: string
  ): Promise<void> {
    await this.ensureInitialized();
    try {
      const entry: AuditEntry = {
        id: "audit-" + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        category,
        message,
        latency,
        user,
      };

      const raw = await fs.promises.readFile(AUDIT_FILE, "utf-8");
      const list: AuditEntry[] = JSON.parse(raw);
      list.unshift(entry);

      // Bound logs file length to last 200 entries to prevent infinite memory usage
      const bounded = list.slice(0, 200);

      await fs.promises.writeFile(AUDIT_FILE, JSON.stringify(bounded, null, 2), "utf-8");
    } catch (err) {
      logger.error({ err }, "Failed to write audit log entry");
    }
  }

  public static async getRecentLogs(): Promise<AuditEntry[]> {
    await this.ensureInitialized();
    try {
      const raw = await fs.promises.readFile(AUDIT_FILE, "utf-8");
      return JSON.parse(raw);
    } catch (err) {
      logger.error({ err }, "Failed to read audit logs");
      return [];
    }
  }
}
