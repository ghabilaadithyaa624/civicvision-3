- Event loop blocking from synchronous `fs` methods (like `fs.existsSync` or `fs.writeFileSync`) in Node.js backend services can be optimized by replacing them with their asynchronous equivalents (`fs.promises.access`, `fs.promises.writeFile`). In high-concurrency environments, using a shared promise (`initPromise`) is an effective pattern to prevent race conditions during asynchronous initialization without duplicating operations.

## 2026-10-10 - Consolidate expensive array operations in high-frequency rendering components
**Learning:** React components using `requestAnimationFrame` for animations re-render at 60fps. Unmemoized array iterations at the component's top level will cause massive CPU spikes during the animation lifecycle.
**Action:** Ensure any heavy computations or array iterations (like `.filter`) at the component's top level are wrapped in `useMemo` and consolidated into a single-pass loop to prevent performance issues.
