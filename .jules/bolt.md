- Event loop blocking from synchronous `fs` methods (like `fs.existsSync` or `fs.writeFileSync`) in Node.js backend services can be optimized by replacing them with their asynchronous equivalents (`fs.promises.access`, `fs.promises.writeFile`). In high-concurrency environments, using a shared promise (`initPromise`) is an effective pattern to prevent race conditions during asynchronous initialization without duplicating operations.

## 2026-11-04 - Array filtering memoization vs multiple passes
**Learning:** Consolidating multiple array filter passes into a single iteration inside a useMemo block significantly reduces CPU overhead during re-renders, especially for larger arrays.
**Action:** Always combine array iteration operations when possible to minimize operations and use useMemo to avoid recalculating unnecessarily.
