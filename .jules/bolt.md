- Event loop blocking from synchronous `fs` methods (like `fs.existsSync` or `fs.writeFileSync`) in Node.js backend services can be optimized by replacing them with their asynchronous equivalents (`fs.promises.access`, `fs.promises.writeFile`). In high-concurrency environments, using a shared promise (`initPromise`) is an effective pattern to prevent race conditions during asynchronous initialization without duplicating operations.

## 2026-10-26 - Optimize synchronous file system operations
**Learning:** Found an instance where fs.existsSync was used before fs.promises.readFile which can block the event loop and potentially lead to race conditions (TOCTOU) in asynchronous workflows.
**Action:** Replaced synchronous fs.existsSync checks with a direct fs.promises.readFile wrapped in a try/catch, checking for ENOENT. This prevents event loop blocking and race conditions.
