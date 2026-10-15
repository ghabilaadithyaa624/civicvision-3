## 2023-10-24 - InputField Accessibility
**Learning:** When adding internal error IDs for `aria-describedby`, we must extract any passed `aria-describedby` from rest props and merge them, placing the explicitly set `aria-describedby` after `{...rest}` so parent components can't accidentally override the internal accessibility linking.
**Action:** Always merge internal and external ARIA references and spread `{...rest}` before explicit attributes.
