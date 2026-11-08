## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-11-08 - Prevent Path Traversal in Image Resolution
**Vulnerability:** The `resolveImagePath` method blindly returned absolute paths using `path.isAbsolute` and concatenated relative paths with `path.join`, enabling Local File Inclusion (LFI) and Server-Side Request Forgery (SSRF) bypasses.
**Learning:** Using `path.join` or allowing direct absolute paths for user-provided URLs completely bypasses intended directory restrictions. An attacker could use payloads like `/uploads/../../../../etc/passwd` or direct absolute paths to read sensitive files or probe internal networks.
**Prevention:** Always use `path.resolve` to calculate the absolute path of the intended base directory and the user-provided path. Then, strictly verify that the resolved target path `startsWith(baseDir + path.sep)` to enforce the directory boundary. Never trust absolute paths provided by users.
