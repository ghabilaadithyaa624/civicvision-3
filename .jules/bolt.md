- Event loop blocking from synchronous `fs` methods (like `fs.existsSync` or `fs.writeFileSync`) in Node.js backend services can be optimized by replacing them with their asynchronous equivalents (`fs.promises.access`, `fs.promises.writeFile`). In high-concurrency environments, using a shared promise (`initPromise`) is an effective pattern to prevent race conditions during asynchronous initialization without duplicating operations.

## 2024-10-25 - Avoid O(N) array traversals for derived state
**Learning:** Performing multiple independent `.filter()` iterations on the same array to calculate distinct derived metrics causes O(K*N) operations.
**Action:** Combine these iterations into a single-pass loop wrapped in `useMemo` to evaluate multiple derived metrics simultaneously in O(N) time.
