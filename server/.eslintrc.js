const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: path.resolve(projectRoot, '.eslintrc.json'),
  ignorePatterns: ['dist'],
  env: {
    node: true
  },
  parserOptions: {
    project: path.resolve(__dirname, 'tsconfig.json')
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'error',
    'import/order': [
      'error',
      {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc'
        },
        'newlines-between': 'always',
        pathGroups: [
          {
            group: 'external',
            pattern: '@nestjs/**',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: ['@nestjs']
      }
    ]
  }
};
