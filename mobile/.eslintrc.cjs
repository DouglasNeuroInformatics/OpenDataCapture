const path = require('path');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@douglasneuroinformatics/eslint-config/lib/base.cjs', 'plugin:react/recommended'],
  env: {
    node: true
  },
  parserOptions: {
    project: path.resolve(__dirname, 'tsconfig.json'),
  },
  plugins: ['import', 'react', 'react-native', '@typescript-eslint'],
  rules: {
    'import/exports-last': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
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
            pattern: '{react,react-native}',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: ['react', 'react-native']
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
    'react/prop-types': 'off',
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true
      }
    ]
  }
};
