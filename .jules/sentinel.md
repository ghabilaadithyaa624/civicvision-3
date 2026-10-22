## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-10-22 - Path Traversal in Path Resolution
**Vulnerability:** Path traversal existed because `path.join` was used with unsanitized user input, and the code also allowed absolute paths directly, which bypasses intended directory restrictions.
**Learning:** Using `path.join` allows `../` directory traversal payloads to resolve outside the intended root directory, and simply checking a URL prefix is insufficient. Absolute paths should also not be trusted.
**Prevention:** Always decode URL-encoded inputs, resolve paths absolutely with `path.resolve`, and explicitly verify that the final path `.startsWith` the intended base directory.
