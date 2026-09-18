## 2024-12-05 - Safe ARIA merging for dynamic IDs
**Learning:** When linking dynamic error elements with ARIA attributes like `aria-describedby` in shared React components, directly assigning `aria-describedby={errorId}` will clobber any explicitly passed `aria-describedby` prop from parent components (such as hints or tooltips), breaking their accessibility bindings.
**Action:** Always safely combine generated ARIA IDs with passed props using an array filter approach: `aria-describedby={[rest['aria-describedby'], errorId].filter(Boolean).join(' ') || undefined}`.
