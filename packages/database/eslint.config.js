const { createConfig } = require("@clip-flow/eslint-config")

module.exports = [
  // Seed script is infra tooling, not application source under src/ — same
  // reasoning as excluding migrations from lint scope.
  { ignores: ["prisma/**"] },
  ...createConfig({ tsconfigRootDir: __dirname }),
]
