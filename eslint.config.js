import { config } from '@douglasneuroinformatics/eslint-config';

// Restricted imports and syntax are declared as constants because flat config *replaces* a rule's
// options when a later block matches the same file rather than merging them. Any narrower block
// must therefore restate everything a broader block set for that rule.

const NO_BARE_ZOD = {
  message:
    "Import from 'zod/v4'. Bare 'zod' resolves to the v3 API, which is a separate schema registry — v3 and v4 schemas, error maps and issue formats do not interoperate.",
  name: 'zod'
};

const NO_CLSX = {
  message: "Use `cn` from '@douglasneuroinformatics/libui/utils', which also merges conflicting Tailwind classes.",
  name: 'clsx'
};

const NO_TAILWIND_MERGE = {
  message: "Use `cn` from '@douglasneuroinformatics/libui/utils'.",
  name: 'tailwind-merge'
};

const NO_TESTS_IN_ROUTES = {
  group: ['vitest', '@testing-library/*'],
  message:
    'The TanStack route generator scans every file under src/routes and warns on any that does not export a Route. Put tests in src/hooks/__tests__/, src/utils/__tests__/ or src/__tests__/.'
};

const NO_AXIOS_INSTANCE = {
  message:
    'apps/web uses the default axios instance; the retry, offline and error-notification interceptors in src/services/axios.ts are installed on it. A separate instance silently bypasses all of them.',
  selector: "CallExpression[callee.object.name='axios'][callee.property.name='create']"
};

const NO_PROCESS_ENV = {
  message:
    'Read configuration through ConfigService, typed by $Env in src/core/schemas/env.schema.ts, so an absent variable fails at startup rather than at first use.',
  selector: "MemberExpression[object.name='process'][property.name='env']"
};

const REQUIRE_ROUTE_ACCESS = {
  message:
    'Every controller handler needs @RouteAccess. Without it JwtAuthGuard throws InternalServerErrorException at request time. Note that @RouteAccess([]) grants access to any authenticated user.',
  selector:
    'MethodDefinition:has(Decorator > CallExpression > Identifier.callee[name=/^(Delete|Get|Patch|Post|Put)$/]):not(:has(Decorator > CallExpression > Identifier.callee[name="RouteAccess"]))'
};

export default config(
  {
    astro: {
      enabled: true
    },
    env: {
      browser: true,
      es2021: true,
      node: true
    },
    react: {
      enabled: true,
      version: '18'
    },
    typescript: {
      enabled: true
    }
  },
  {
    ignores: [
      'apps/playground/src/instruments/examples/interactive/Interactive-With-Legacy-Script/legacy.js',
      'runtime/v1/src/**/*.d.ts',
      'vendor/**/*',
      'knip.ts',
      'vitest.config.ts'
    ]
  },
  {
    files: ['**/*.tsx'],
    rules: {
      '@typescript-eslint/only-throw-error': 'off',
      'jsx-a11y/media-has-caption': 'off'
    }
  },
  {
    files: ['packages/instrument-library/**/*'],
    rules: {
      'perfectionist/sort-objects': 'off'
    }
  },
  {
    rules: {
      'no-restricted-imports': ['error', { paths: [NO_BARE_ZOD] }]
    }
  },
  {
    files: ['packages/schemas/src/**/*.ts'],
    rules: {
      'import/extensions': ['error', 'always', { ignorePackages: true }]
    }
  },
  {
    files: ['apps/api/src/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error', NO_PROCESS_ENV]
    }
  },
  {
    files: ['apps/api/src/**/*.controller.ts'],
    rules: {
      'no-restricted-syntax': ['error', NO_PROCESS_ENV, REQUIRE_ROUTE_ACCESS]
    }
  },
  {
    files: ['apps/web/src/**/*', 'packages/react-core/src/**/*'],
    rules: {
      'no-restricted-imports': ['error', { paths: [NO_BARE_ZOD, NO_CLSX, NO_TAILWIND_MERGE] }],
      'no-restricted-syntax': ['error', NO_AXIOS_INSTANCE]
    }
  },
  {
    files: ['apps/web/src/routes/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [NO_BARE_ZOD, NO_CLSX, NO_TAILWIND_MERGE], patterns: [NO_TESTS_IN_ROUTES] }
      ]
    }
  },
  {
    files: ['apps/web/src/components/**/*', 'packages/react-core/src/components/**/*'],
    ignores: ['**/*.stories.tsx'],
    rules: {
      'import/no-default-export': 'error'
    }
  },
  {
    files: ['apps/web/src/**/*.tsx', 'packages/react-core/src/**/*.tsx'],
    // Story fixtures are authored for developers and never reach a user.
    ignores: ['**/*.stories.tsx'],
    rules: {
      'react/jsx-no-literals': [
        'error',
        {
          // Punctuation and separators carry no meaning to translate, and proper nouns must survive
          // translation unchanged.
          allowedStrings: [
            '&copy;',
            '(',
            ')',
            '-',
            '/',
            ':',
            'Douglas Neuroinformatics',
            'Douglas Neuroinformatics Platform',
            'EN',
            'FR',
            'Open Data Capture',
            'SSL/TLS',
            'STARTTLS',
            '×',
            '·',
            '—',
            '%'
          ],
          ignoreProps: true,
          noStrings: true
        }
      ]
    }
  }
);
