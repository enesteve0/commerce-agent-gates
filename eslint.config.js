import js from "@eslint/js";

/**
 * The gates dogfood themselves on every push (see the ci workflow), so ESLint
 * here covers ordinary code health: correctness foot-guns, unused bindings,
 * accidental globals. Fixtures are excluded deliberately — they exist to
 * contain violations, and linting them would defeat their purpose.
 */
export default [
  {
    ignores: ["fixtures/**", "node_modules/**", "coverage/**"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        URL: "readonly",
        Response: "readonly",
        Request: "readonly",
        fetch: "readonly",
        structuredClone: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrors: "all" }],
      "prefer-const": "error",
      eqeqeq: ["error", "smart"],
    },
  },
];
