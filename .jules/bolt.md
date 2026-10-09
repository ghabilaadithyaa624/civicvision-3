- Event loop blocking from synchronous `fs` methods (like `fs.existsSync` or `fs.writeFileSync`) in Node.js backend services can be optimized by replacing them with their asynchronous equivalents (`fs.promises.access`, `fs.promises.writeFile`). In high-concurrency environments, using a shared promise (`initPromise`) is an effective pattern to prevent race conditions during asynchronous initialization without duplicating operations.

## 2023-10-25 - Prevent 60fps array iteration CPU spikes
**Learning:** React components using `requestAnimationFrame` (like `useAnimatedNumber`) trigger re-renders at 60fps. Any unmemoized array iterations (e.g., `.filter()`) placed directly in the component body will execute on every frame, causing significant CPU spikes and lag.
**Action:** Always wrap heavy computations and array iterations in `useMemo` in such components, and consolidate multiple `.filter` passes into a single-pass loop.
