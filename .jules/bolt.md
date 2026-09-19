- Event loop blocking from synchronous `fs` methods (like `fs.existsSync` or `fs.writeFileSync`) in Node.js backend services can be optimized by replacing them with their asynchronous equivalents (`fs.promises.access`, `fs.promises.writeFile`). In high-concurrency environments, using a shared promise (`initPromise`) is an effective pattern to prevent race conditions during asynchronous initialization without duplicating operations.

## $(date +%Y-%m-%d) - Optimize multiple filter calls in React components
**Learning:** React components that calculate multiple derived stats (like pending, in-progress, resolved counts) from a single list using chained or separate `.filter()` operations incur O(N) cost per filter on *every* re-render.
**Action:** Replace multiple unmemoized `.filter()` passes with a single `for` loop that computes all stats at once, wrapped inside a `useMemo` hook, to change the complexity from O(K*N) to O(N) and prevent recalculation unless the dependencies change.
