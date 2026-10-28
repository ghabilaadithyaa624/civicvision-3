## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.
## 2026-10-28 - Prevent Path Traversal in Image Resolution
**Vulnerability:** Path traversal vulnerability when resolving image URLs relative to the public directory using user-provided paths.
**Learning:** `path.join` alone does not prevent directory traversal (e.g., `../../`) when joining user input. An attacker could resolve arbitrary server files if they can supply the path.
**Prevention:** Always use `path.resolve` to find the absolute path of the target directory, and verify that the user's resolved absolute path starts with this target directory prefix before accessing the file system.
