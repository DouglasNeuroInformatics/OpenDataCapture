const path = require('path');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@douglasneuroinformatics/eslint-config/lib/nest.cjs'],
  ignorePatterns: ['dist/**/*'],
  parserOptions: {
    project: path.resolve(__dirname, 'tsconfig.json')
  },
  overrides: [
    {
      files: ['*.tsx'],
      rules: {
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
            pattern: '{react,react-dom/**}',
            position: 'before'
          },
          {
            group: 'external',
            pattern: '@nestjs/**',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: ['react', 'react-dom/**', '@nestjs']
      }
      }
    }
  ]
};
