## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-10-31 - Fix Path Traversal in Image Resolution
**Vulnerability:** The `resolveImagePath` method in `apps/backend/src/services/issue.service.ts` concatenated user-provided `imageUrl`s without normalization or bounds checking. It also allowed arbitrary absolute paths via `path.isAbsolute`, leading to arbitrary file reads (e.g., `/etc/passwd`) when processing uploads.
**Learning:** Incomplete validation of file paths and allowing absolute paths bypassing directory restrictions can expose local files and lead to severe security incidents.
**Prevention:** Always normalize resolved paths using `path.normalize` and enforce that the finalized path remains strictly within the intended base directory (using `startsWith` with `path.sep`). Never trust or allow arbitrary absolute paths when interacting with the file system based on user input.
