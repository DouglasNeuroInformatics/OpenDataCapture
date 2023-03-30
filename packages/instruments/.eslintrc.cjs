const path = require('path');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@ddcp'],
  parserOptions: {
    project: path.resolve(__dirname, 'tsconfig.json')
  }
};
