module.exports = {
  extends: ["@joshunrau/eslint-config/node", "prettier"],
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["*.js"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false,
      },
    ],
    "import/order": [
      "warn",
      {
        alphabetize: {
          caseInsensitive: true,
          order: "asc",
        },
        "newlines-between": "always",
        pathGroups: [
          {
            group: "external",
            pattern: "express",
            position: "before",
          },
        ],
        pathGroupsExcludedImportTypes: ["express"],
      },
    ],
  },
};
