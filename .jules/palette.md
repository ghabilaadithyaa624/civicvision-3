## 2024-10-11 - Accessible Form Inputs and Rest Props
**Learning:** When spreading `{...rest}` props onto an input that dynamically computes accessibility attributes (like `aria-describedby` or `aria-invalid`), the internal attributes must be placed *after* the spread to prevent parent overrides. Furthermore, `aria-describedby` must explicitly merge with potential values passed via `rest` props.
**Action:** Always place `{...rest}` before internally controlled accessibility bindings, and explicitly merge list-like aria attributes (e.g., `aria-describedby`, `aria-labelledby`).
