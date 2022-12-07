/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['dnp/react'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname
  },
  settings: {
    next: {
      rootDir: __dirname
    }
  }
};
