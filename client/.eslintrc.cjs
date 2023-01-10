const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: path.resolve(projectRoot, '.eslintrc.json'),
  env: {
    browser: true
  },
  parserOptions: {
    project: path.resolve(__dirname, 'tsconfig.json')
  },
  plugins: ['react'],
  rules: {
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false
      }
    ],
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
            pattern: 'react',
            position: 'before'
          },
          {
            group: 'external',
            pattern: '{next,next/**}',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: ['react']
      }
    ],
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function'
      }
    ],
    'react/jsx-sort-props': [
      'error',
      {
        callbacksLast: true,
        shorthandFirst: true
      }
    ]
  },
  settings: {
    'import/extensions': ['.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    react: {
      version: 'detect'
    }
  }
};
