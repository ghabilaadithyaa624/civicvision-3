## 2026-10-26 - Input Field Error Accessibility
**Learning:** The `InputField` component lacked a programmatic association between the input element and the error message, making it difficult for screen readers to convey errors contextually.
**Action:** Explicitly set `aria-describedby` to the error element's ID and `aria-invalid` based on the error state. Also explicitly merged these with any external attributes passed in from props to avoid overwriting them.
