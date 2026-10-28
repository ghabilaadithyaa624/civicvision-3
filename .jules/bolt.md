- Event loop blocking from synchronous `fs` methods (like `fs.existsSync` or `fs.writeFileSync`) in Node.js backend services can be optimized by replacing them with their asynchronous equivalents (`fs.promises.access`, `fs.promises.writeFile`). In high-concurrency environments, using a shared promise (`initPromise`) is an effective pattern to prevent race conditions during asynchronous initialization without duplicating operations.

## 2026-10-28 - Consolidate Multiple Array Iterations
**Learning:** Performing multiple `.filter()` or `.map()` passes over the same large array during a React render is a common anti-pattern that multiplies time complexity (e.g., O(4N)).
**Action:** Combine multiple filtering passes into a single `.reduce()` wrapped in a `useMemo` to evaluate all conditions in one pass (O(N)), preventing CPU spikes during rendering.
