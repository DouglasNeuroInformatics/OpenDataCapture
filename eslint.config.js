// @ts-nocheck

import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astroParser from 'astro-eslint-parser';
import astroPlugin from 'eslint-plugin-astro';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: ['**/.astro/*', '**/build/*', '**/dist/*', '**/lib/*', '**/node_modules/*', '**/*.d.ts']
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      perfectionist
    },
    rules: {
      ...js.configs.recommended.rules,
      ...perfectionist.configs['recommended-natural'].rules,
      'perfectionist/sort-classes': [
        'error',
        {
          groups: [
            'index-signature',
            'static-property',
            'property',
            'private-property',
            'constructor',
            'static-method',
            'static-private-method',
            ['get-method', 'set-method'],
            'method',
            'private-method',
            'unknown'
          ],
          order: 'asc',
          type: 'natural'
        }
      ],
      'perfectionist/sort-imports': [
        'error',
        {
          'custom-groups': {
            type: {
              react: ['react', 'react-dom/*']
            },
            value: {
              react: ['react', 'react-dom/*']
            }
          },
          groups: [
            'react',
            ['builtin', 'builtin-type'],
            ['external', 'external-type'],
            ['internal', 'internal-type'],
            ['index', 'sibling', 'parent'],
            'type',
            'style',
            'unknown'
          ],
          'internal-pattern': ['@/**'],
          'newlines-between': 'always',
          type: 'natural'
        }
      ],
      'perfectionist/sort-jsx-props': [
        'error',
        {
          'custom-groups': {
            callback: 'on*'
          },
          groups: ['shorthand', 'unknown', 'callback'],
          order: 'asc',
          type: 'natural'
        }
      ]
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs['eslint-recommended'].rules,
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs.stylistic.rules,
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      'no-undef': 'off'
    }
  },
  {
    files: ['**/*.jsx', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      'jsx-a11y': jsxA11yPlugin,
      react: reactPlugin
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      'no-alert': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function'
        }
      ],
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/*.stories.jsx', '**/*.stories.tsx'],
    rules: {
      'no-alert': 'off'
    }
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parser: astroParser,
      parserOptions: {
        extraFileExtensions: ['.astro'],
        parser: tsParser,
        sourceType: 'module'
      }
    },
    plugins: {
      astro: astroPlugin
    },
    rules: {
      ...astroPlugin.configs.recommended.rules
    }
  }
];
