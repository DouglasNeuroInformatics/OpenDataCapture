module.exports = {
  extends: ["@joshunrau/eslint-config/react", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["*.js"],
  rules: {},
};
