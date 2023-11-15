import path from 'node:path';
import url from 'node:url';

import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astroParser from 'astro-eslint-parser';
import astroPlugin from 'eslint-plugin-astro';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: ['**/.astro/*', '**/.next/*', '**/build/*', '**/dist/*']
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals['shared-node-browser']
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
    files: ['**/*.config.js', '**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: path.resolve(__dirname, 'tsconfig.base.json'),
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs['eslint-recommended'].rules,
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-type-checked'].rules,
      ...tsPlugin.configs['stylistic-type-checked'].rules,
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowBoolean: true,
          allowNumber: true
        }
      ],
      'no-redeclare': 'off',
      'no-undef': 'off'
    }
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off'
    }
  },
  {
    files: ['**/*.jsx', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser
      },
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
    plugins: {
      astro: astroPlugin
    },
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
    rules: {
      ...astroPlugin.configs.recommended.rules
    }
  },
  {
    files: ['apps/api/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, 'apps', 'api', 'tsconfig.json')
      }
    }
  },
  {
    files: ['apps/gateway/**/*.ts', 'apps/gateway/**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser
      },
      parserOptions: {
        project: path.resolve(__dirname, 'apps', 'gateway', 'tsconfig.json')
      }
    }
  },
  {
    files: ['apps/marketing/**/*.astro', 'apps/marketing/**/*.ts', 'apps/marketing/**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser
      },
      parserOptions: {
        project: path.resolve(__dirname, 'apps', 'marketing', 'tsconfig.json')
      }
    }
  },
  {
    files: ['apps/web/**/*.ts', 'apps/web/**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser
      },
      parserOptions: {
        project: path.resolve(__dirname, 'apps', 'web', 'tsconfig.json')
      }
    }
  },
  {
    files: ['apps/web/cypress/**/*.ts', 'apps/web/cypress/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, 'apps', 'web', 'cypress', 'tsconfig.json')
      }
    }
  },
  {
    files: ['packages/instruments/**/*.ts', 'packages/instruments/**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser
      },
      parserOptions: {
        project: path.resolve(__dirname, 'packages', 'instruments', 'tsconfig.json')
      }
    }
  },
  {
    files: ['packages/react-core/**/*.ts', 'packages/react-core/**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser
      },
      parserOptions: {
        project: path.resolve(__dirname, 'packages', 'react-core', 'tsconfig.json')
      }
    }
  }
];
