## 2024-09-26 - Accessible InputField Error Messages

**Learning:** When spreading props (`{...rest}`) onto a React component alongside explicit internally computed attributes (like `aria-describedby` or `aria-invalid`), parents can inadvertently override the component's internal accessibility bindings if `{...rest}` is spread last. Furthermore, `aria-describedby` must be explicitly merged with any incoming `aria-describedby` props to prevent loss of information.
**Action:** Always spread `{...rest}` *before* explicit internal accessibility attributes to protect them. Merge attributes like `aria-describedby` arrays and filter out falsy values before joining them into a string.
