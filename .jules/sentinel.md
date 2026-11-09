## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-11-09 - Path Traversal in Image Resolution
**Vulnerability:** The `resolveImagePath` method allowed path traversal (e.g. `/uploads/../../../etc/passwd`) by blindly using `path.join` and directly accepting arbitrary absolute paths, leading to Local File Inclusion (LFI).
**Learning:** Using `path.join` on user-controlled input without bounds checking, or allowing unverified absolute paths, enables attackers to escape the intended base directory.
**Prevention:** Always strictly enforce directory boundaries by verifying that the resolved path does not start with `..` or an absolute root using `path.relative` against the base directory. Never blindly accept absolute paths from user input.
