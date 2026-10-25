## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-10-25 - Path Traversal in Image Resolution
**Vulnerability:** The `resolveImagePath` method in `issue.service.ts` allowed path traversal. An attacker could pass a URL like `/uploads/../../etc/passwd`, which `path.join` would resolve outside the `public/uploads` directory, allowing arbitrary files to be read and sent to the AI service.
**Learning:** `path.join` alone is not sufficient to prevent path traversal when dealing with user-controlled input that might contain `../`.
**Prevention:** Always normalize the resolved path and explicitly verify that it starts with the intended base directory to ensure it remains confined to the expected location.
