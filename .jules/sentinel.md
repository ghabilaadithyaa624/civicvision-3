## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-11-11 - Path Traversal in File Resolution
**Vulnerability:** The `resolveImagePath` method allowed absolute paths directly or directory traversal (via `..`) when resolving image uploads, enabling local file inclusion (LFI).
**Learning:** Checking if a path `startsWith` a directory name is insufficient; absolute paths bypass relative resolution, and without a directory separator, path traversal is possible.
**Prevention:** Explicitly resolve paths, verify the base directory using `startsWith` with a trailing `path.sep` (or `path.relative`), and never trust absolute paths.
