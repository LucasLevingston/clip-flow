const nextJest = require("next/jest")

const createJestConfig = nextJest({ dir: "./" })

const baseConfig = createJestConfig({
  testEnvironment: "jsdom",
  testEnvironmentOptions: { customExportConditions: [""] },
  setupFiles: ["<rootDir>/jest.polyfills.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coveragePathIgnorePatterns: ["/node_modules/", "/.next/", "layout\\.tsx$"],
  // e2e/ holds Playwright specs (run via `playwright test`, not Jest) — same
  // *.spec.ts naming convention, so it must be excluded explicitly or Jest
  // tries to run them too and fails on the Playwright-only `test` import.
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/e2e/"],
})

// next/jest hard-codes its own transformIgnorePatterns and ignores the one passed above, so
// msw's ESM-only transitive deps (e.g. rettime) never get transformed. Patch the resolved
// config directly — msw ships CJS-incompatible packages that jsdom's Jest run needs transformed.
module.exports = async () => {
  const config = await baseConfig()
  config.transformIgnorePatterns = []
  // MSW's undici-based interceptors leave a keep-alive handle open past teardown (known
  // issue with this combo); without this the process hangs instead of exiting after tests pass.
  config.forceExit = true
  return config
}
