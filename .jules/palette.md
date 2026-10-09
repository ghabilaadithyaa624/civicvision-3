## 2025-02-12 - Explicit Error Associations in InputField
**Learning:** Shared UI input fields without dynamic `aria-describedby` fail to associate error validation text properly. React's `{...rest}` spread order can accidentally overwrite internal ARIA attributes if not explicitly placed before the specific attributes.
**Action:** Always combine optional error IDs with existing `aria-describedby` props and place the `{...rest}` spread *before* custom internal bindings in React component prop assignments.
