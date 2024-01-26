/** @type {import("prettier").Options} */
export default {
  htmlWhitespaceSensitivity: 'ignore',
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro'
      }
    }
  ],
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'none'
};
