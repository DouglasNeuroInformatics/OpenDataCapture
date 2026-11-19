# packages/oxlint-config

The repo's base oxlint config and its custom rules. `src/index.js` exports `config`, the rule set
applied by file extension; `src/plugin.js` is the `opendatacapture` JS plugin, one rule per file in
`src/rules/`. The root `oxlint.config.ts` `extends` `config` and adds everything scoped to a repo
path: overrides, `ignorePatterns`, `env`, `globals` and `settings`. Not published, no build:
`exports` points at `src/index.js`.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## Traps

**A rule not named in `src/index.js` or the root `oxlint.config.ts` is off.** `categories` turns
`correctness` off so that an oxlint release cannot enable a rule on its own; a new rule runs only once
it is listed by name.

**An override replaces a rule's options instead of merging them.** When two blocks set
`no-restricted-imports` or `no-restricted-properties` for the same file, the later one wins
outright, so a narrower block in the root `oxlint.config.ts` restates every entry of the broader one.
That is why those entries are constants at the top of that file.

**Every JS plugin is named by absolute path**, so that it loads from this package's own dependencies
wherever the extending config lives. A new plugin goes through `resolvePlugin` in `src/index.js` and
into this package's `dependencies`. knip cannot see a
dependency named only in a string, so one that `src/index.js` never imports also needs an
`ignoreDependencies` entry under `packages/oxlint-config` in `knip.ts`.

**The source is plain JavaScript with JSDoc types, on purpose.** Node does not strip types from a file
under `node_modules`, and the package is meant to be extractable and consumed from there. `tsc` in
`lint` checks the JSDoc; the tests are TypeScript because only vitest loads them.

**`eslint-plugin-perfectionist` is pinned to 5.9.0**, the version ESLint ran, because 5.13.0 reports
class members differently. Bumping it changes `perfectionist/sort-classes` results across the repo.

**An oxlint bump can break the plugin or the config.** oxlint marks JS plugins alpha and outside
semver, and JS/TS config files experimental. `oxlint`, `@oxlint/plugins` and `oxlint-tsgolint` are
pinned exactly in the `pnpm-workspace.yaml` catalog; after moving any of them, run this package's
tests and a root `pnpm lint`.

## Adding a rule

Copy `src/rules/require-route-access.js` and its test, `src/rules/__tests__/require-route-access.test.ts`.
Register the rule in `src/plugin.js` under its file name — `src/__tests__/plugin.test.ts` fails on a
file that is missing or named differently — then enable it as `opendatacapture/<rule>`: in
`src/index.js` when it applies by file extension, in the root `oxlint.config.ts` when it applies to a
repo path.

## Tests

`pnpm exec vitest --project oxlint-config`. `src/` is inside the 100% coverage gate, so every rule
needs a test. Rule tests use `ruleTester` from `src/rules/__tests__/rule-tester.ts`, a `RuleTester`
from `oxlint/plugins-dev` wired to vitest's `describe` and `it`, which parses each case as TSX.
