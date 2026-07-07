/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  setupFiles: ["<rootDir>/jest.setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@database/(.*)$": "<rootDir>/src/database/$1",
    "^@middleware/(.*)$": "<rootDir>/src/middleware/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    "^@repositories/(.*)$": "<rootDir>/src/repositories/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@validators/(.*)$": "<rootDir>/src/validators/$1",
    "^@app-types/(.*)$": "<rootDir>/src/types/$1",
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/server.ts"],
  coverageDirectory: "coverage",
  clearMocks: true,
};
