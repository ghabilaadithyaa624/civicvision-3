## 2026-10-28 - Component ARIA Attributes Merging
**Learning:** When implementing internal `aria-describedby` logic (like for error messages) on shared React components that spread `{...rest}` props, parent components can accidentally overwrite the internal accessibility attributes if they also pass `aria-describedby`.
**Action:** Always destructure `aria-describedby` from props, combine it with the component's internal `aria-describedby` values (e.g., error IDs), and place `{...rest}` BEFORE explicit attribute bindings in the JSX.
