## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-24 - Path Traversal in Image Resolution
**Vulnerability:** A Local File Inclusion (LFI) / Path Traversal vulnerability was found in `IssueService.resolveImagePath`. The implementation trusted user input by checking if `path.isAbsolute(imageUrl)` or simply joining user input with the base directory (`path.join(__dirname, "../../../public", imageUrl)`). This could allow malicious users to supply absolute paths like `/etc/passwd` or use relative directory traversal like `/uploads/../../../etc/passwd` to access files outside the intended uploads directory.
**Learning:** `path.join()` inherently allows directory traversal out of the intended directory if the input contains enough `../` segments. Furthermore, `path.isAbsolute()` is a pure string check and doesn't validate whether the path is safe to read. Relying on these without boundary checking opens up LFI risks. Additionally, when using `path.resolve(baseDir, userInput)`, if `userInput` starts with `/`, it is treated as an absolute path overwriting `baseDir`.
**Prevention:**
1. Always resolve paths securely relative to the intended base directory using `path.resolve()`.
2. To prevent absolute path overwrite in `path.resolve()`, ensure user input doesn't start with a slash (e.g., prepend `.` if it does, `path.resolve(baseDir, "." + userInput)`).
3. Always perform a strict boundary check by asserting that the resolved absolute path starts exactly with the intended base directory (e.g., `resolvedPath.startsWith(baseDir + path.sep)`).
4. Never trust or pass arbitrary absolute paths supplied by users directly to filesystem APIs without validation.
