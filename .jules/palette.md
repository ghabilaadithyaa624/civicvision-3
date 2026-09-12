## 2026-09-12 - Form Accessibility: Dynamic Error Messages
**Learning:** For form accessibility, dynamic error messages must explicitly be linked to their corresponding input fields. Screen readers will not automatically read out error messages that appear below an input.
**Action:** Always use the `aria-describedby` attribute on the input field to point to the `id` of the error text element. This guarantees screen readers announce the validation context correctly.
