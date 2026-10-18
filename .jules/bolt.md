- Event loop blocking from synchronous `fs` methods (like `fs.existsSync` or `fs.writeFileSync`) in Node.js backend services can be optimized by replacing them with their asynchronous equivalents (`fs.promises.access`, `fs.promises.writeFile`). In high-concurrency environments, using a shared promise (`initPromise`) is an effective pattern to prevent race conditions during asynchronous initialization without duplicating operations.

## 2024-10-18 - Avoid Top-Level Array Iteration with requestAnimationFrame
**Learning:** React components using `requestAnimationFrame` for animations (like `useAnimatedNumber`) re-render at 60fps. Any heavy computations or array iterations (like multiple `.filter` passes) at the component's top level cause massive CPU spikes during the animation lifecycle.
**Action:** Always wrap heavy computations and array iterations in `useMemo` and consolidate them into single-pass loops to prevent redundant execution on every frame.
