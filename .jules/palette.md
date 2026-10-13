## 2024-10-13 - Prevent Override of ARIA Bindings in InputField
**Learning:** Explicit internal bindings like `aria-describedby` can be accidentally overridden by parent components passing in standard DOM attributes via `{...rest}` spreads if not explicitly merged.
**Action:** When implementing ARIA attributes on shared components, explicitly destructure and merge them with internal states (e.g., `[ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined`) and place `{...rest}` before the final bound attributes.
