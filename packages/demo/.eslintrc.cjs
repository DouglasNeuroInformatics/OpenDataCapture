const path = require('path');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@douglasneuroinformatics'],
  parserOptions: {
    project: path.resolve(__dirname, 'tsconfig.json')
  }
};
