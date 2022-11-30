/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['dnp'],
  env: {
    node: true
  },
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname
  },
  overrides: [
    {
      files: ['__tests__/**/*'],
      env: {
        jest: true
      },
      parserOptions: { project: null }
    }
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false
      }
    ],
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
            pattern: 'express',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: ['express']
      }
    ]
  }
};
