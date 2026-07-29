# packages/instrument-utils

Pure helpers over instrument definitions: form-field flattening (`form.ts`), kind and language
guards (`guards.ts`), measure computation (`measures.ts`), and multilingual → unilingual translation
(`translate.ts`). Imported by `apps/api`, `apps/web` and `packages/react-core`. Source-only, no
build.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## Traps

**`translate.ts` is the only place a multilingual instrument becomes unilingual**, and its
`ts-pattern` matches end in `.exhaustive()`. Adding a field `kind` or `variant` to
`@opendatacapture/runtime-core` therefore fails `pnpm lint` in this package until the new case is
handled. That coupling is the point — do not add a catch-all pattern to make it compile.

**`computeInstrumentMeasures` swallows `const`-measure failures.** A `const` measure whose value
fails `$InstrumentMeasureValue`, or whose label cannot be resolved, is `console.error`ed and dropped
from the returned record; non-object `data` returns `{}`. The visible symptom is a summary missing a
row, not an error. Check a measure's `ref` and `label` rather than trusting that the page rendered.
A `computed` measure is different: its author-supplied `value(data)` function is called bare, so if
it throws, the whole computation throws.

**`isScalarInstrument` tests `Object.hasOwn(instrument, 'internal')`, not `kind`.** See
`.agents/docs/architecture/instrument-pipeline.md` for why.

`getFormFields` merges a grouped form's content by spreading each group's `fields`, so a key
appearing in two groups silently keeps the last one.

## Tests

None, and there is no `vitest.config.ts` here. These helpers are covered only through their
consumers' suites (`apps/api`, `apps/web`) and the Playwright suite in `testing/`.
