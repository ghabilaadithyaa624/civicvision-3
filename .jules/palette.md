## 2023-10-25 - Merging internal accessibility bindings with parent rest props

**Learning:** When spreading `{...rest}` onto a React UI component, explicitly defining props such as `aria-describedby` or `aria-invalid` *after* `{...rest}` can accidentally overwrite the component's internal accessibility logic.

**Action:** Ensure that any internal properties that append or modify values passed via rest props (like ID references in `aria-describedby`) correctly extract, format, and combine with the rest properties, rather than replacing them. Move the `{...rest}` spread to occur before those final explicit attributes are set in the element.
