/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    browser: true
  },
  extends: ['./index', 'next', 'turbo', 'prettier'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react'],
  rules: {
    'import/order': [
      'warn',
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
      'warn',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function'
      }
    ],
    'react/button-has-type': 'warn',
    'react/jsx-sort-props': [
      'warn',
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
