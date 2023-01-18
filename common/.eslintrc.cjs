const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: path.resolve(projectRoot, '.eslintrc.json'),
  parserOptions: {
    project: path.resolve(__dirname, 'tsconfig.json')
  }
};
