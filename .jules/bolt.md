- Event loop blocking from synchronous `fs` methods (like `fs.existsSync` or `fs.writeFileSync`) in Node.js backend services can be optimized by replacing them with their asynchronous equivalents (`fs.promises.access`, `fs.promises.writeFile`). In high-concurrency environments, using a shared promise (`initPromise`) is an effective pattern to prevent race conditions during asynchronous initialization without duplicating operations.

## 2026-10-14 - Animation Hooks and Array Iteration
**Learning:** React components using `requestAnimationFrame` (like `useAnimatedNumber`) trigger re-renders at 60fps. When expensive operations or multiple array iterations (like several `.filter` calls) exist at the component's top level, they execute on every frame, causing massive CPU spikes and jank.
**Action:** Always wrap heavy computations and array iterations in `useMemo` and consolidate them into a single-pass loop when they are present in a component that utilizes rapid re-rendering hooks.
