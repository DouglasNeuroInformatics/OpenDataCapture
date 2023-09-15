const path = require('path');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@douglasneuroinformatics'],
  ignorePatterns: ['dist/**/*'],
  parserOptions: {
    project: path.resolve(__dirname, 'tsconfig.json')
  },
  overrides: [
    {
      files: ['*.tsx'],
      extends: ['@douglasneuroinformatics/eslint-config/lib/react.cjs']
    },
    {
      files: ['main.ts', '*.module.ts', '*.controller.ts', '*.service.ts'],
      extends: ['@douglasneuroinformatics/eslint-config/lib/nest.cjs']
    }
  ]
};
