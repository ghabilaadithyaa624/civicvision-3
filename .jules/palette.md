## 2024-05-24 - Missing ARIA Labels in Secondary Layouts
**Learning:** Icon-only buttons in secondary layouts (like `AdminLayout.tsx`) are frequently missing accessible labels compared to primary layouts (like `DashboardLayout.tsx`), indicating a potential need for a centralized `IconButton` component to enforce `aria-label` inclusion system-wide.
**Action:** Audit secondary layouts and consider proposing a shared `IconButton` component in the future to enforce accessibility by default.
