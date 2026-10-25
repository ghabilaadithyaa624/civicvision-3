- Event loop blocking from synchronous `fs` methods (like `fs.existsSync` or `fs.writeFileSync`) in Node.js backend services can be optimized by replacing them with their asynchronous equivalents (`fs.promises.access`, `fs.promises.writeFile`). In high-concurrency environments, using a shared promise (`initPromise`) is an effective pattern to prevent race conditions during asynchronous initialization without duplicating operations.

## 2026-10-25 - Prevent CPU spikes during 60fps animations
**Learning:** Components using `requestAnimationFrame` hooks (like `useAnimatedNumber`) re-render at 60fps. Any heavy top-level computations or multiple array iterations (like multiple `.filter()` passes) cause massive CPU spikes.
**Action:** Ensure all array iterations and heavy computations are wrapped in `useMemo` and consolidated into a single pass when present in components with rapid re-render cycles.
