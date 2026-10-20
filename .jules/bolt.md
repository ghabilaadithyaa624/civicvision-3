- Event loop blocking from synchronous `fs` methods (like `fs.existsSync` or `fs.writeFileSync`) in Node.js backend services can be optimized by replacing them with their asynchronous equivalents (`fs.promises.access`, `fs.promises.writeFile`). In high-concurrency environments, using a shared promise (`initPromise`) is an effective pattern to prevent race conditions during asynchronous initialization without duplicating operations.

## 2025-05-19 - Optimizing Array Processing in Animation Loops
**Learning:** Chaining array methods like `.map().filter()` inside a 60fps `requestAnimationFrame` loop creates numerous intermediate objects and arrays, causing significant Garbage Collection (GC) pressure.
**Action:** Replace chained array methods with a single-pass `for` loop that avoids unnecessary object allocations to maintain a smoother frame rate during rendering.
