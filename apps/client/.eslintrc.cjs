const path = require('path');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@douglas-data-capture-platform', 'plugin:react/recommended'],
  env: {
    browser: true
  },
  parserOptions: {
    project: path.resolve(__dirname, 'tsconfig.json')
  },
  plugins: ['import', 'react'],
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
    ],
    'react/prop-types': 'off' // to fix bug - this is okay as ts will enforce anyways
  },
  overrides: [
    {
      files: ['**/*/*.stories.tsx'],
      rules: {
        'import/exports-last': 'off',
        'import/no-default-export': 'off'
      }
    }
  ],
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
