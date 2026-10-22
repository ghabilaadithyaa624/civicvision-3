## 2026-10-22 - Linking error messages dynamically with aria-describedby
**Learning:** Explicitly destructuring `aria-describedby` from props and merging it with dynamically generated error IDs, followed by placing `{...rest}` before explicitly bound attributes, prevents parent overrides and securely ties error messages to inputs for screen readers.
**Action:** Always extract accessibility attributes that we compute internally from rest props, merge them correctly with our internal state, and place explicit attributes after `{...rest}` spread to maintain complete a11y context.
