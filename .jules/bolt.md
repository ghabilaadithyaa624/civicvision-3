## 2024-05-20 - React Array Iteration Bottleneck
**Learning:** Found a pattern in `DashboardPage.tsx` where an array of `issues` was iterated 3 separate times via `.filter()` to calculate counts (`PENDING`, `IN_PROGRESS`, `RESOLVED`) on every render. This O(3N) operation causes unnecessary performance overhead, particularly on high-frequency render passes or with large datasets.
**Action:** Always replace multiple `.filter` or `.reduce` calls on the same array during React renders with a single-pass `for...of` loop inside a `useMemo` hook (O(N)).
