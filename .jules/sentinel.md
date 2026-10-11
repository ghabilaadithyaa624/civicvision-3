## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-10-11 - Prevent LFI and Path Traversal in Image Resolution
**Vulnerability:** The `resolveImagePath` method in `IssueService` blindly trusted absolute paths via `path.isAbsolute(imageUrl)` and concatenated relative paths without boundary checking, allowing arbitrary file reading (Local File Inclusion).
**Learning:** Using `path.isAbsolute()` is dangerous when resolving user-supplied file paths, as it overrides the base directory when passed to `path.resolve()`, and `path.join()` doesn't prevent directory traversal attacks (e.g., `../../`).
**Prevention:** Always explicitly anchor user-provided paths to a strict base directory by prepending a dot (e.g., `path.resolve(baseDir, '.' + input)`) and enforce boundary checks using `startsWith(baseDir + path.sep)`. Never trust absolute user paths.
