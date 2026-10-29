import * as fs from 'node:fs';
import * as path from 'node:path';

import { config } from '@douglasneuroinformatics/eslint-config';
import vitest from '@vitest/eslint-plugin';
import playwright from 'eslint-plugin-playwright';

import { rules as localRules } from './.eslint/rules/index.js';

// Restricted imports and syntax are declared as constants because flat config *replaces* a rule's
// options when a later block matches the same file rather than merging them. Any narrower block
// must therefore restate everything a broader block set for that rule.

const NO_BARE_ZOD = {
  message:
    "Import from 'zod/v4'. Bare 'zod' resolves to the v3 API, which is a separate schema registry — v3 and v4 schemas, error maps and issue formats do not interoperate.",
  name: 'zod'
};

// `z3` and `z4` are the names a file importing both zod majors gives them.
const NO_ZOD_COERCE = ['z', 'z3', 'z4'].map((object) => ({
  message:
    "`z.coerce` turns inputs like `''`, `null` and `true` into valid values instead of rejecting them. Parse the format the input actually arrives in, then convert it: a date sent as an ISO string is `z.iso.datetime()`, turned into a `Date` once it validates.",
  object,
  property: 'coerce'
}));

const NO_CLSX = {
  message: "Use `cn` from '@douglasneuroinformatics/libui/utils', which also merges conflicting Tailwind classes.",
  name: 'clsx'
};

const NO_TAILWIND_MERGE = {
  message: "Use `cn` from '@douglasneuroinformatics/libui/utils'.",
  name: 'tailwind-merge'
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

const TEST_TOOLING = /^(?:vitest|@testing-library\/[^/]+)(?:\/|$)/;

const UNIT_TEST_FILENAME = /^(?<subject>.+)\.(?<suffix>test|spec)\.[jt]sx?$/;

const SUBJECT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// The recommended set enables some rules as warnings, which never fail `pnpm lint` or CI.
const PLAYWRIGHT_RECOMMENDED_RULES = Object.fromEntries(
  Object.entries(playwright.configs['flat/recommended'].rules).map(([rule, severity]) => {
    return [rule, severity === 'off' ? 'off' : 'error'];
  })
);

const unitTestLayout = {
  rules: {
    'test-tooling-in-tests-folder': {
      create(context) {
        const folders = context.filename.split(path.sep);
        if (folders.includes('__tests__')) {
          return {};
        }
        return {
          ImportDeclaration(node) {
            if (TEST_TOOLING.test(node.source.value)) {
              context.report({ data: { source: node.source.value }, messageId: 'testTooling', node });
            }
          }
        };
      },
      meta: {
        messages: {
          testTooling: "'{{source}}' is test tooling; only a file in a __tests__/ folder may import it."
        },
        schema: [],
        type: 'problem'
      }
    },
    'unit-test-names-subject': {
      create(context) {
        const { base, dir } = path.parse(context.filename);
        const { subject, suffix } = UNIT_TEST_FILENAME.exec(base).groups;
        return {
          Program(node) {
            if (path.basename(dir) !== '__tests__') {
              context.report({ messageId: 'outsideTestsFolder', node });
              return;
            }
            if (suffix === 'spec') {
              context.report({ messageId: 'specSuffix', node });
            }
            const subjectPath = path.join(dir, '..', subject);
            if (!SUBJECT_EXTENSIONS.some((extension) => fs.existsSync(subjectPath + extension))) {
              context.report({ data: { subject }, messageId: 'noSubject', node });
            }
          }
        };
      },
      meta: {
        messages: {
          noSubject:
            'A unit test is named after the file it tests, but there is no {{subject}}.ts, .tsx, .js or .jsx beside this __tests__/ folder.',
          outsideTestsFolder: 'A unit test lives in a __tests__/ folder beside the file it tests.',
          specSuffix: 'Name a unit test *.test.*; *.spec.* is the suffix of the Playwright suite in testing/.'
        },
        schema: [],
        type: 'problem'
      }
    }
  }
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
      // Generated by the TanStack Router plugin, which writes a bare `eslint-disable` at its top.
      'apps/web/src/route-tree.ts',
      'testing/.playwright/**',
      'vendor/**/*'
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
    // Instrument definitions are written in reading order, and a form's fields render in key order.
    files: [
      'apps/playground/src/instruments/{examples,templates}/**/*',
      'packages/instrument-library/**/*',
      'packages/instrument-stubs/src/{file,forms,interactive,series}.js'
    ],
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
    plugins: {
      odc: {
        rules: { ...unitTestLayout.rules, ...localRules }
      }
    }
  },
  {
    files: ['**/*.{cjs,js,jsx,mjs,ts,tsx}'],
    rules: {
      curly: ['error', 'all'],
      'default-case-last': 'error',
      eqeqeq: 'error',
      'import/enforce-node-protocol-usage': ['error', 'always'],
      'logical-assignment-operators': 'error',
      'no-constructor-return': 'error',
      'no-extend-native': 'error',
      'no-implicit-coercion': ['error', { allow: ['!!'] }],
      'no-lonely-if': 'error',
      'no-nested-ternary': 'error',
      'no-promise-executor-return': 'error',
      'no-restricted-properties': ['error', ...NO_ZOD_COERCE],
      'no-return-assign': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-unassigned-vars': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unneeded-ternary': 'error',
      'no-useless-assignment': 'error',
      'no-useless-concat': 'error',
      'no-useless-rename': 'error',
      'object-shorthand': 'error',
      'odc/multiline-arrow-body': 'error',
      'odc/no-coverage-ignore': 'error',
      'odc/require-disable-reason': 'error',
      // A named function passed to forwardRef or memo is what gives the component its display name.
      'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
      'prefer-template': 'error',
      'preserve-caught-error': 'error',
      radix: 'error',
      'symbol-description': 'error'
    }
  },
  {
    files: ['**/*.{cts,mts,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-mixed-enums': 'error',
      '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
      '@typescript-eslint/no-unnecessary-qualifier': 'error',
      '@typescript-eslint/no-unnecessary-template-expression': 'error',
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-return-this-type': 'error',
      '@typescript-eslint/related-getter-setter-pairs': 'error',
      '@typescript-eslint/return-await': ['error', 'error-handling-correctness-only'],
      '@typescript-eslint/unified-signatures': 'error'
    }
  },
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'jsx-a11y/anchor-ambiguous-text': 'error',
      'jsx-a11y/lang': 'error',
      'jsx-a11y/no-aria-hidden-on-focusable': 'error',
      'odc/class-name-composition': 'error',
      'odc/handler-names': 'error',
      'react/button-has-type': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-no-script-url': 'error',
      'react/self-closing-comp': 'error'
    }
  },
  {
    files: ['apps/web/src/routes/**/*.{ts,tsx}'],
    ignores: ['**/__tests__/**'],
    rules: {
      'odc/route-exports': 'error'
    }
  },
  {
    files: ['{apps,packages,runtime}/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    plugins: {
      vitest
    },
    rules: {
      'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
      'vitest/require-to-throw-message': 'error',
      'vitest/require-top-level-describe': 'error'
    }
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['testing/src/**/*.ts'],
    rules: {
      ...PLAYWRIGHT_RECOMMENDED_RULES,
      // The fixture asserts that the page landed on the requested route.
      'playwright/expect-expect': ['error', { assertFunctionNames: ['getPageModel'] }]
    }
  },
  {
    files: ['{apps,packages,runtime}/*/src/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'odc/test-tooling-in-tests-folder': 'error'
    }
  },
  {
    files: ['{apps,packages,runtime}/*/src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    rules: {
      'odc/unit-test-names-subject': 'error',
      'odc/unit-test-subject': 'error'
    }
  },
  {
    // A __tests__/ folder inside an instrument directory fails the build, so an instrument's tests sit
    // in the top-level folder, named after the instrument rather than a file beside them.
    files: ['packages/instrument-library/src/__tests__/*'],
    rules: {
      'odc/unit-test-names-subject': 'off',
      'odc/unit-test-subject': 'off'
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
            '%',
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
            '—'
          ],
          ignoreProps: true,
          noStrings: true
        }
      ]
    }
  }
);
