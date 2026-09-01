## 2024-05-24 - [Avoid synchronous file operations blocking event loop]
**Learning:** Using synchronous filesystem operations like `fs.existsSync` in the backend block the Node.js event loop during high throughput.
**Action:** Always replace them with the asynchronous equivalents like `fs.promises.access` wrapped in try/catch blocks for high-throughput environments. Node.js docs recommend skipping checking if the file exists when reading directly, wrapping the read directly in a try/catch instead.
