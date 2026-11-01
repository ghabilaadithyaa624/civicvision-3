## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-11-01 - Prevent Path Traversal using strict directory checks
**Vulnerability:** Path traversal in `resolveImagePath` was possible by checking `.startsWith('/uploads/')` on input, but allowing `..` in the rest of the path, leading to out-of-bounds file reads. Absolute paths were also allowed.
**Learning:** `path.join` resolves `..` segments, so simply prepending a safe directory to an attacker-controlled string is insufficient if they can provide `../`. Relying on `path.isAbsolute` check without context is dangerous.
**Prevention:** Ensure the fully resolved path string always strictly starts with the base directory path followed by `path.sep` (e.g. `resolved.startsWith(baseDir + path.sep)`).
