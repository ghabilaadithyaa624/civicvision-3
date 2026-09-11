
## 2024-09-11 - Input Field Error Accessibility
**Learning:** Adding `aria-describedby` to inputs that link to their corresponding error messages is critical for screen reader users to understand why their input is invalid. Without this, the error message text might not be read out contextually.
**Action:** Always ensure that form inputs with dynamic error messages use `aria-describedby` to explicitly link the input to the element containing the error text.
