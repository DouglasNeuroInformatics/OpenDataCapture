const path = require('path');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@douglasneuroinformatics/eslint-config/lib/react.cjs'],
  ignorePatterns: ['dist/**/*'],
  parserOptions: {
    project: path.resolve(__dirname, 'tsconfig.json')
  }
};
