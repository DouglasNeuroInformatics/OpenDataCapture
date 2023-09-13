const path = require('node:path');

/** @type {import('eslint').Linter.Config} */
module.exports = {
  ignorePatterns: ['*.js', '*.cjs', '*.mjs'],
  extends: ['@douglasneuroinformatics', 'plugin:astro/recommended', 'plugin:astro/jsx-a11y-strict'],
  env: {
    es2022: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    extraFileExtensions: ['.astro'],
    project: path.resolve(__dirname, 'tsconfig.json')
  },
  overrides: [
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  ]
};
