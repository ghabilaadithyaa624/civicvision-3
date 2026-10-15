- Event loop blocking from synchronous `fs` methods (like `fs.existsSync` or `fs.writeFileSync`) in Node.js backend services can be optimized by replacing them with their asynchronous equivalents (`fs.promises.access`, `fs.promises.writeFile`). In high-concurrency environments, using a shared promise (`initPromise`) is an effective pattern to prevent race conditions during asynchronous initialization without duplicating operations.

## 2026-10-15 - Prevent CPU spikes during animations
**Learning:** React components using `requestAnimationFrame` for animations (e.g., `useAnimatedNumber`) re-render at 60fps. Unnecessary array iterations (like multiple `.filter` calls) at the component's top level can cause massive CPU spikes during the animation lifecycle.
**Action:** Always wrap heavy computations or array iterations in `useMemo` and consolidate them into a single-pass loop when the component includes high-frequency re-render triggers.
