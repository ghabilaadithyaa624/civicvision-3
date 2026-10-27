## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.
## 2026-10-27 - Fix Path Traversal and TOCTOU in Image Path Resolution
**Vulnerability:** The `resolveImagePath` method in `IssueService` allowed arbitrary absolute paths or relative paths with `..` to access files outside the `public/uploads` directory. Additionally, `fs.existsSync` was used synchronously before `fs.promises.readFile`, creating a TOCTOU race condition and blocking the event loop.
**Learning:** String matching like `.startsWith("/uploads/")` is insufficient for path validation if paths aren't resolved first. Synchronous `fs` methods block the main thread and should be avoided.
**Prevention:** Use `path.resolve` to get absolute paths and ensure the resolved path strictly starts with the expected base directory. Use `try/catch` with `fs.promises.readFile` and handle `ENOENT` instead of using `fs.existsSync`.
