// @ts-check

/** @type {import("prettier").Options} */
module.exports = {
  plugins: [require.resolve("prettier-plugin-astro")],
  htmlWhitespaceSensitivity: "ignore",
  printWidth: 120,
  singleQuote: true,
  trailingComma: "none",
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro"
      }
    }
  ]
};
