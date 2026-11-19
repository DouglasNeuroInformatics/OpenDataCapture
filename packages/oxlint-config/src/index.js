import { fileURLToPath } from 'node:url';

import playwright from 'eslint-plugin-playwright';

/** @import { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from 'oxlint' */

const SCRIPT_FILES = ['**/*.{astro,cjs,cts,js,jsx,mjs,mts,ts,tsx}'];

const JAVASCRIPT_FILES = ['**/*.{cjs,js,jsx,mjs}'];

const TYPESCRIPT_FILES = ['**/*.{astro,cts,mts,ts,tsx}'];

const JSX_FILES = ['**/*.{jsx,tsx}'];

const NATURAL_ORDER = { order: 'asc', type: 'natural' };

/**
 * Each plugin is named by the absolute path of its entry file, so that it loads from this package's own
 * dependencies wherever the config that extends this one lives.
 *
 * @param {string} specifier
 * @returns {string}
 */
const resolvePlugin = (specifier) => fileURLToPath(import.meta.resolve(specifier));

/** @type {ExternalPluginEntry[]} */
const jsPlugins = [
  { name: 'opendatacapture', specifier: resolvePlugin('./plugin.js') },
  { name: 'perfectionist', specifier: resolvePlugin('eslint-plugin-perfectionist') },
  { name: 'playwright', specifier: resolvePlugin('eslint-plugin-playwright') }
];

/**
 * The plugin's recommended set enables some rules as warnings, which never fail `pnpm lint` or CI.
 *
 * @type {DummyRuleMap}
 */
export const playwrightRecommendedRules = Object.fromEntries(
  Object.entries({ ...playwright.configs['flat/recommended'].rules }).map(([rule, severity]) => {
    return [rule, severity === 'off' ? 'off' : 'error'];
  })
);

/** @type {OxlintConfig} */
export const config = {
  // Every rule is enabled by name, so that a new oxlint release cannot add one.
  categories: { correctness: 'off' },
  jsPlugins,
  options: {
    typeAware: true
  },
  overrides: [
    {
      files: SCRIPT_FILES,
      rules: {
        'constructor-super': 'error',
        curly: ['error', 'all'],
        'default-case-last': 'error',
        eqeqeq: 'error',
        'for-direction': 'error',
        'getter-return': 'error',
        'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
        'import/exports-last': 'error',
        'import/no-duplicates': 'error',
        'logical-assignment-operators': 'error',
        'max-depth': ['error', { max: 4 }],
        'no-alert': 'error',
        'no-async-promise-executor': 'error',
        'no-case-declarations': 'error',
        'no-class-assign': 'error',
        'no-compare-neg-zero': 'error',
        'no-cond-assign': 'error',
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'no-const-assign': 'error',
        'no-constant-binary-expression': 'error',
        'no-constant-condition': 'error',
        'no-constructor-return': 'error',
        'no-control-regex': 'error',
        'no-debugger': 'error',
        'no-delete-var': 'error',
        'no-dupe-class-members': 'error',
        'no-dupe-else-if': 'error',
        'no-dupe-keys': 'error',
        'no-duplicate-case': 'error',
        'no-empty': 'error',
        'no-empty-character-class': 'error',
        'no-empty-pattern': 'error',
        'no-empty-static-block': 'error',
        'no-ex-assign': 'error',
        'no-extend-native': 'error',
        'no-extra-boolean-cast': 'error',
        // ESLint's default pattern, which oxlint's own default is looser than
        'no-fallthrough': ['error', { commentPattern: 'falls?\\s?through' }],
        'no-func-assign': 'error',
        'no-global-assign': 'error',
        'no-implicit-coercion': ['error', { allow: ['!!'] }],
        'no-import-assign': 'error',
        'no-invalid-regexp': 'error',
        // ESLint's defaults; oxlint's own skip comments, regular expressions, templates and JSX text
        'no-irregular-whitespace': [
          'error',
          { skipComments: false, skipJSXText: false, skipRegExps: false, skipStrings: true, skipTemplates: false }
        ],
        'no-lonely-if': 'error',
        'no-loss-of-precision': 'error',
        'no-misleading-character-class': 'error',
        'no-nested-ternary': 'error',
        'no-new-native-nonconstructor': 'error',
        'no-nonoctal-decimal-escape': 'error',
        'no-obj-calls': 'error',
        'no-promise-executor-return': 'error',
        'no-prototype-builtins': 'error',
        'no-regex-spaces': 'error',
        'no-return-assign': 'error',
        'no-self-assign': 'error',
        'no-self-compare': 'error',
        'no-sequences': 'error',
        'no-setter-return': 'error',
        'no-shadow-restricted-names': ['error', { reportGlobalThis: false }],
        'no-sparse-arrays': 'error',
        'no-this-before-super': 'error',
        'no-unassigned-vars': 'error',
        'no-unexpected-multiline': 'error',
        'no-unmodified-loop-condition': 'error',
        'no-unneeded-ternary': 'error',
        'no-unreachable': 'error',
        'no-unsafe-finally': 'error',
        'no-unsafe-negation': 'error',
        'no-unsafe-optional-chaining': 'error',
        'no-unused-labels': 'error',
        'no-unused-private-class-members': 'error',
        'no-useless-assignment': 'error',
        'no-useless-backreference': 'error',
        'no-useless-catch': 'error',
        'no-useless-concat': 'error',
        'no-useless-escape': 'error',
        'no-useless-rename': 'error',
        'no-var': 'error',
        'no-with': 'error',
        'object-shorthand': 'error',
        'opendatacapture/multiline-arrow-body': 'error',
        'opendatacapture/no-coverage-ignore': 'error',
        'opendatacapture/require-disable-reason': 'error',
        'perfectionist/sort-array-includes': ['error', NATURAL_ORDER],
        'perfectionist/sort-classes': [
          'error',
          {
            ...NATURAL_ORDER,
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
            ]
          }
        ],
        'perfectionist/sort-decorators': ['error', NATURAL_ORDER],
        'perfectionist/sort-enums': ['error', NATURAL_ORDER],
        'perfectionist/sort-exports': ['error', NATURAL_ORDER],
        'perfectionist/sort-heritage-clauses': ['error', NATURAL_ORDER],
        'perfectionist/sort-interfaces': ['error', NATURAL_ORDER],
        'perfectionist/sort-intersection-types': [
          'error',
          {
            groups: ['named', 'unknown'],
            ignoreCase: true,
            order: 'asc',
            partitionByComment: false,
            partitionByNewLine: false,
            specialCharacters: 'keep',
            type: 'alphabetical'
          }
        ],
        'perfectionist/sort-jsx-props': [
          'error',
          {
            ...NATURAL_ORDER,
            customGroups: [{ elementNamePattern: '^on.+', groupName: 'callback' }],
            groups: ['shorthand-prop', 'unknown', 'callback']
          }
        ],
        'perfectionist/sort-maps': ['error', NATURAL_ORDER],
        'perfectionist/sort-named-exports': ['error', NATURAL_ORDER],
        'perfectionist/sort-named-imports': ['error', NATURAL_ORDER],
        'perfectionist/sort-object-types': ['error', NATURAL_ORDER],
        'perfectionist/sort-objects': ['error', NATURAL_ORDER],
        'perfectionist/sort-sets': ['error', NATURAL_ORDER],
        'perfectionist/sort-switch-case': ['error', NATURAL_ORDER],
        'perfectionist/sort-union-types': ['error', NATURAL_ORDER],
        'perfectionist/sort-variable-declarations': ['error', NATURAL_ORDER],
        // A named function passed to memo is what gives the component its display name.
        'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
        'prefer-const': 'error',
        'prefer-template': 'error',
        'preserve-caught-error': 'error',
        radix: 'error',
        'require-yield': 'error',
        'symbol-description': 'error',
        'unicorn/prefer-node-protocol': 'error',
        'use-isnan': 'error',
        'valid-typeof': 'error'
      }
    },
    {
      files: JAVASCRIPT_FILES,
      rules: {
        // oxlint parses a file with no import or export as a script, where a declaration shadowing a global is legal
        'no-redeclare': ['error', { builtinGlobals: false }],
        'no-undef': 'error',
        // With no options, oxlint ignores every name that starts with an underscore
        'no-unused-vars': ['error', { args: 'after-used', caughtErrors: 'all', vars: 'all' }]
      }
    },
    {
      files: TYPESCRIPT_FILES,
      rules: {
        'no-array-constructor': 'error',
        'no-empty-function': 'error',
        'no-unused-expressions': 'error',
        'no-unused-vars': [
          'error',
          {
            args: 'all',
            argsIgnorePattern: '^_',
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            ignoreRestSiblings: true,
            reportVarsOnlyUsedAsTypes: true,
            varsIgnorePattern: '^_'
          }
        ],
        'typescript/adjacent-overload-signatures': 'error',
        'typescript/array-type': 'error',
        'typescript/await-thenable': 'error',
        'typescript/ban-ts-comment': 'error',
        'typescript/class-literal-property-style': 'error',
        'typescript/consistent-generic-constructors': 'error',
        'typescript/consistent-indexed-object-style': ['error', 'index-signature'],
        'typescript/consistent-type-assertions': 'error',
        'typescript/consistent-type-definitions': ['error', 'type'],
        'typescript/dot-notation': 'error',
        'typescript/no-array-delete': 'error',
        'typescript/no-base-to-string': 'error',
        'typescript/no-confusing-non-null-assertion': 'error',
        'typescript/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
        'typescript/no-duplicate-enum-values': 'error',
        'typescript/no-duplicate-type-constituents': 'error',
        'typescript/no-empty-object-type': 'error',
        'typescript/no-extra-non-null-assertion': 'error',
        'typescript/no-floating-promises': 'error',
        'typescript/no-for-in-array': 'error',
        'typescript/no-inferrable-types': 'error',
        'typescript/no-misused-new': 'error',
        'typescript/no-misused-promises': 'error',
        'typescript/no-mixed-enums': 'error',
        'typescript/no-namespace': 'error',
        'typescript/no-non-null-asserted-nullish-coalescing': 'error',
        'typescript/no-non-null-asserted-optional-chain': 'error',
        'typescript/no-redundant-type-constituents': 'error',
        'typescript/no-require-imports': ['error', { allowAsImport: true }],
        'typescript/no-this-alias': 'error',
        'typescript/no-unnecessary-qualifier': 'error',
        'typescript/no-unnecessary-template-expression': 'error',
        'typescript/no-unnecessary-type-assertion': 'error',
        'typescript/no-unnecessary-type-constraint': 'error',
        'typescript/no-unsafe-argument': 'error',
        'typescript/no-unsafe-assignment': 'error',
        'typescript/no-unsafe-call': 'error',
        'typescript/no-unsafe-declaration-merging': 'error',
        'typescript/no-unsafe-function-type': 'error',
        'typescript/no-unsafe-member-access': 'error',
        'typescript/no-unsafe-return': 'error',
        'typescript/no-unsafe-unary-minus': 'error',
        'typescript/no-wrapper-object-types': 'error',
        'typescript/non-nullable-type-assertion-style': 'error',
        'typescript/only-throw-error': 'error',
        'typescript/prefer-as-const': 'error',
        'typescript/prefer-find': 'error',
        'typescript/prefer-for-of': 'error',
        'typescript/prefer-function-type': 'error',
        'typescript/prefer-includes': 'error',
        'typescript/prefer-namespace-keyword': 'error',
        'typescript/prefer-nullish-coalescing': ['error', { ignorePrimitives: { boolean: true } }],
        'typescript/prefer-optional-chain': 'error',
        'typescript/prefer-promise-reject-errors': 'error',
        'typescript/prefer-reduce-type-parameter': 'error',
        'typescript/prefer-regexp-exec': 'error',
        'typescript/prefer-return-this-type': 'error',
        'typescript/prefer-string-starts-ends-with': 'error',
        'typescript/related-getter-setter-pairs': 'error',
        'typescript/require-await': 'error',
        'typescript/restrict-plus-operands': 'error',
        'typescript/restrict-template-expressions': [
          'error',
          { allowBoolean: true, allowNever: true, allowNumber: true }
        ],
        'typescript/return-await': ['error', 'error-handling-correctness-only'],
        'typescript/unbound-method': 'error',
        'typescript/unified-signatures': 'error'
      }
    },
    {
      files: ['**/*.{test,spec}.{cts,mts,ts,tsx}'],
      rules: {
        'typescript/no-unsafe-argument': 'off',
        'typescript/no-unsafe-assignment': 'off',
        'typescript/no-unsafe-call': 'off',
        'typescript/no-unsafe-declaration-merging': 'off',
        'typescript/no-unsafe-function-type': 'off',
        'typescript/no-unsafe-member-access': 'off',
        'typescript/no-unsafe-return': 'off',
        'typescript/no-unsafe-unary-minus': 'off'
      }
    },
    {
      files: JSX_FILES,
      rules: {
        'jsx-a11y/alt-text': 'error',
        'jsx-a11y/anchor-ambiguous-text': 'error',
        'jsx-a11y/anchor-has-content': 'error',
        'jsx-a11y/anchor-is-valid': 'error',
        'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
        'jsx-a11y/aria-props': 'error',
        'jsx-a11y/aria-proptypes': 'error',
        'jsx-a11y/aria-role': 'error',
        'jsx-a11y/aria-unsupported-elements': 'error',
        'jsx-a11y/autocomplete-valid': 'error',
        'jsx-a11y/click-events-have-key-events': 'error',
        'jsx-a11y/heading-has-content': 'error',
        'jsx-a11y/html-has-lang': 'error',
        'jsx-a11y/iframe-has-title': 'error',
        'jsx-a11y/img-redundant-alt': 'error',
        'jsx-a11y/interactive-supports-focus': [
          'error',
          { tabbable: ['button', 'checkbox', 'link', 'searchbox', 'spinbutton', 'switch', 'textbox'] }
        ],
        'jsx-a11y/label-has-associated-control': 'error',
        'jsx-a11y/lang': 'error',
        'jsx-a11y/media-has-caption': 'error',
        'jsx-a11y/mouse-events-have-key-events': 'error',
        'jsx-a11y/no-access-key': 'error',
        'jsx-a11y/no-aria-hidden-on-focusable': 'error',
        'jsx-a11y/no-autofocus': 'error',
        'jsx-a11y/no-distracting-elements': 'error',
        'jsx-a11y/no-interactive-element-to-noninteractive-role': [
          'error',
          { canvas: ['img'], tr: ['none', 'presentation'] }
        ],
        'jsx-a11y/no-noninteractive-element-interactions': [
          'error',
          {
            alert: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
            body: ['onError', 'onLoad'],
            dialog: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
            handlers: [
              'onClick',
              'onError',
              'onLoad',
              'onMouseDown',
              'onMouseUp',
              'onKeyPress',
              'onKeyDown',
              'onKeyUp'
            ],
            iframe: ['onError', 'onLoad'],
            img: ['onError', 'onLoad']
          }
        ],
        'jsx-a11y/no-noninteractive-element-to-interactive-role': [
          'error',
          {
            fieldset: ['radiogroup', 'presentation'],
            li: ['menuitem', 'menuitemradio', 'menuitemcheckbox', 'option', 'row', 'tab', 'treeitem'],
            ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
            table: ['grid'],
            td: ['gridcell'],
            ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid']
          }
        ],
        'jsx-a11y/no-noninteractive-tabindex': [
          'error',
          { allowExpressionValues: true, roles: ['tabpanel'], tags: [] }
        ],
        'jsx-a11y/no-redundant-roles': 'error',
        'jsx-a11y/no-static-element-interactions': [
          'error',
          {
            allowExpressionValues: true,
            handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp']
          }
        ],
        'jsx-a11y/role-has-required-aria-props': 'error',
        'jsx-a11y/role-supports-aria-props': 'error',
        'jsx-a11y/scope': 'error',
        'jsx-a11y/tabindex-no-positive': 'error',
        'opendatacapture/class-name-composition': 'error',
        'opendatacapture/handler-names': 'error',
        'react/button-has-type': 'error',
        'react/display-name': 'error',
        'react/function-component-definition': [
          'error',
          { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' }
        ],
        'react/jsx-boolean-value': ['error', 'never'],
        'react/jsx-key': 'error',
        'react/jsx-no-comment-textnodes': 'error',
        'react/jsx-no-duplicate-props': 'error',
        'react/jsx-no-script-url': 'error',
        'react/jsx-no-target-blank': 'error',
        'react/jsx-no-undef': 'error',
        'react/no-children-prop': 'error',
        'react/no-danger-with-children': 'error',
        'react/no-direct-mutation-state': 'error',
        'react/no-find-dom-node': 'error',
        'react/no-is-mounted': 'error',
        'react/no-render-return-value': 'error',
        'react/no-string-refs': 'error',
        'react/no-unescaped-entities': 'error',
        'react/no-unknown-property': 'error',
        'react/require-render-return': 'error',
        'react/self-closing-comp': 'error'
      }
    },
    {
      files: ['**/*.tsx'],
      rules: {
        'jsx-a11y/media-has-caption': 'off',
        'typescript/only-throw-error': 'off'
      }
    },
    {
      files: ['**/*.stories.{jsx,tsx}'],
      rules: {
        'no-alert': 'off'
      }
    }
  ],
  plugins: ['import', 'jsx-a11y', 'react', 'typescript', 'unicorn', 'vitest']
};
