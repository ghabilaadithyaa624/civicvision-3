## 2024-05-24 - Safely Merging aria-describedby in Reusable Components
**Learning:** When adding `aria-describedby` to link internal component elements (like linking an input to its dynamically generated error message ID), failing to merge it with `aria-describedby` from incoming props will cause parent components to inadvertently override the component's internal accessibility bindings.
**Action:** Always explicitly merge `aria-describedby` in shared React components: `[rest['aria-describedby'], internalId].filter(Boolean).join(' ') || undefined`
