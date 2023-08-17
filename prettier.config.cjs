// @ts-check

/** @type {import("prettier").Options} */
module.exports = {
  plugins: [require.resolve('prettier-plugin-astro'), require.resolve('prettier-plugin-tailwindcss')],
  htmlWhitespaceSensitivity: 'ignore',
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'none',
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro'
      }
    }
  ]
};
