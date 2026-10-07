## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2023-10-07 - LFI / Path Traversal via Arbitrary Absolute Paths
**Vulnerability:** Path traversal allowing an attacker to read any system file on the host OS by passing absolute paths (e.g., `/etc/passwd`) to an image resolver endpoint.
**Learning:** `path.isAbsolute(userInput)` is dangerous if used to approve or read a path unmodified, because it allows absolute paths directly. `path.resolve(baseDir, userInput)` is safe IF boundary-checked, but note that it treats paths starting with `/` as absolute from the system root, overwriting `baseDir`.
**Prevention:** To safely evaluate user input intended to be within a specific directory: compute the `baseDir`, modify user input to prepend `.` if it starts with a `/` to avoid absolute path expansion by `path.resolve`, generate `resolvedPath = path.resolve(baseDir, safePath)`, and finally assert `if (!resolvedPath.startsWith(baseDir + path.sep)) { throw Error; }`. Never allow arbitrary absolute path lookups from untrusted input.
