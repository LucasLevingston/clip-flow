const tseslint = require("typescript-eslint");
const boundaries = require("eslint-plugin-boundaries");
const prettier = require("eslint-config-prettier");
const globals = require("globals");

/**
 * Shared ESLint flat config for Clip Flow.
 * Enforces: SRP-sized files (max-lines), one exported function/class per
 * file (see scripts/check-one-export-per-file.mjs, run outside ESLint),
 * complexity ceilings as SOLID proxies, and Clean Architecture / DDD layer
 * boundaries (interface -> application -> domain, infrastructure implements
 * domain interfaces only).
 *
 * @param {{ tsconfigRootDir: string }} options
 */
function createConfig({ tsconfigRootDir }) {
  return tseslint.config(
    {
      ignores: [
        "**/dist/**",
        "**/.next/**",
        "**/coverage/**",
        "**/.turbo/**",
        "**/node_modules/**",
        "**/*.config.js",
        "**/*.config.mjs",
        "**/*.config.ts",
        "**/generated/**",
      ],
    },
    ...tseslint.configs.recommendedTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
        globals: { ...globals.node },
      },
      plugins: { boundaries },
      settings: {
        "boundaries/include": ["**/src/**/*.ts", "**/src/**/*.tsx"],
        "boundaries/elements": [
          { type: "interface", pattern: "src/interface/**" },
          { type: "application", pattern: "src/application/**" },
          { type: "domain", pattern: "src/domain/**" },
          { type: "infrastructure", pattern: "src/infrastructure/**" },
        ],
      },
      rules: {
        "max-lines": [
          "error",
          { max: 100, skipBlankLines: true, skipComments: true },
        ],
        complexity: ["error", 10],
        "max-params": ["error", 4],
        "max-depth": ["error", 3],
        "max-classes-per-file": ["error", 1],
        "no-param-reassign": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_" },
        ],
        "boundaries/dependencies": [
          "error",
          {
            default: "disallow",
            policies: [
              // Every layer may import from itself (e.g. an Entity importing a
              // Value Object, both under domain/).
              {
                from: { element: { type: "domain" } },
                allow: { to: { element: { type: "domain" } } },
              },
              {
                from: { element: { type: "application" } },
                allow: {
                  to: {
                    element: { types: { anyOf: ["domain", "application"] } },
                  },
                },
              },
              {
                from: { element: { type: "interface" } },
                allow: {
                  to: {
                    element: {
                      types: { anyOf: ["application", "domain", "interface"] },
                    },
                  },
                },
              },
              {
                from: { element: { type: "infrastructure" } },
                allow: {
                  to: {
                    element: {
                      types: {
                        anyOf: ["domain", "application", "infrastructure"],
                      },
                    },
                  },
                },
              },
            ],
          },
        ],
      },
    },
    {
      // Jest mocking (jest.mock, jest.fn, expect.any) is inherently untyped;
      // full type-safety here fights the tool rather than catching bugs.
      files: ["**/*.test.ts", "**/*.test.tsx"],
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "max-lines": [
          "error",
          { max: 200, skipBlankLines: true, skipComments: true },
        ],
        "max-classes-per-file": "off",
      },
    },
    prettier,
  );
}

module.exports = { createConfig };
