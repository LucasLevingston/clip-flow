/**
 * Shared Jest config. Coverage gate is fixed at 90% across all four
 * metrics per project policy (docs/testing/coverage-pipeline.md) — a
 * test run that drops below this fails the build, no exceptions.
 * @type {import("jest").Config}
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/generated/",
    "\\.d\\.ts$",
    "index\\.ts$",
    "main\\.ts$",
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
}
