## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-11-03 - Fix Path Traversal and Local File Inclusion (LFI) in Image Resolver
**Vulnerability:** The `resolveImagePath` method in the backend service allowed both path traversal within the `/uploads/` directory using `..` sequences and arbitrary file reads by explicitly permitting absolute paths.
**Learning:** Combining `path.join` with untrusted input or explicitly allowing `path.isAbsolute` without enforcing a strict base directory boundary can result in LFI or SSRF, allowing attackers to access sensitive system files (e.g. `/etc/passwd`).
**Prevention:** Always resolve user-provided file paths against a strict base directory and enforce the boundary using `path.relative`. Ensure the relative path does not start with `..` and is not absolute before performing any file operations. Do not blindly trust or permit absolute paths from user input.
