## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-18 - Path Traversal & LFI in Node.js File Resolvers
**Vulnerability:** The `resolveImagePath` method in `IssueService` blindly accepted absolute paths via `path.isAbsolute()` and used `path.join()` for user-provided paths, allowing attackers to read any file on the system (e.g., `/etc/passwd`).
**Learning:** Using `path.join()` with user input or blindly trusting `path.isAbsolute()` opens the application to severe Local File Inclusion (LFI).
**Prevention:** Explicitly resolve user-provided paths against an intended base directory using `path.resolve(baseDir, "." + userInput)`. Always enforce strict boundary checks via `resolvedPath.startsWith(baseDir + path.sep)`. Never blindly accept absolute paths from untrusted user input.
