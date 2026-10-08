## 2024-05-18 - InputField error accessibility

**Learning:** When spreading `{...rest}` props onto a React element alongside internally computed attributes like `aria-describedby` or `aria-invalid`, the `{...rest}` spread must be placed before the explicit attributes to prevent parent props from accidentally overwriting the merged internal bindings. `aria-describedby` must be used to properly link form inputs to their error messages for screen readers.

**Action:** Always place `{...rest}` before explicitly defined ARIA bindings and carefully merge properties like `className` and `aria-describedby` when a parent might also provide them.
