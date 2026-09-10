## 2024-05-24 - Async Loading States Accessibility
**Learning:** When displaying dynamic async loading states (like checking an API status), simply rendering text changes is often missed by screen readers because they don't announce text node updates by default.
**Action:** Always add `aria-live="polite"` to containers that update with async text (like "Checking status..."), and wrap the entire logical container in `aria-busy={isLoading}` to signal to assistive technologies that the section is updating.
