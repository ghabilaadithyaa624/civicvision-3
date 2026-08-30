import fs from "fs";
import path from "path";
import { AuditService } from "./apps/backend/src/services/audit.service";

async function run() {
  const LOGS_DIR = path.join(__dirname, "apps/backend/logs");
  if (fs.existsSync(LOGS_DIR)) {
    fs.rmSync(LOGS_DIR, { recursive: true, force: true });
  }

  const start = process.hrtime.bigint();

  // start an interval to detect event loop blocking
  let blockTime = 0n;
  let lastTick = process.hrtime.bigint();
  const interval = setInterval(() => {
    const now = process.hrtime.bigint();
    const diff = now - lastTick;
    if (diff > 5000000n) { // more than 5ms
      blockTime += diff;
    }
    lastTick = now;
  }, 1);

  await Promise.all(
    Array.from({ length: 100 }).map((_, i) => AuditService.log("API", `Test ${i}`))
  );

  clearInterval(interval);

  const end = process.hrtime.bigint();
  console.log(`Total time: ${(end - start) / 1000000n}ms`);
  console.log(`Blocked time: ${blockTime / 1000000n}ms`);
}

run().catch(console.error);
