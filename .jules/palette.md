## 2026-10-21 - ARIA attributes order matters
**Learning:** When using ARIA attributes like `aria-describedby` or `aria-invalid` on shared React components that also use `{...rest}`, explicitly destructure them from props, merge them with internal states (e.g., `[ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined`), and place `{...rest}` BEFORE the final bound explicit attributes to prevent parent prop overrides.
**Action:** Always place explicit ARIA bindings after `{...rest}` spreads in shared components.
