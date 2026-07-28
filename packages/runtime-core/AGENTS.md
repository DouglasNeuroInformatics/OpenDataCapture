# packages/runtime-core

The public API instrument authors write against: `defineInstrument`, `defineSeriesInstrument`, the
`Translator` classes, `addNotification`, and the instrument type definitions. Everything in `apps/*`
consumes it, and `runtime/v1` re-bundles it so authored instruments can import it at runtime.

Read the root `AGENTS.md` first for the rules that apply everywhere.

> Treat every exported name here as a published API. A rename is a breaking change for instruments
> already stored in the database, not a refactor.

## Editing `src/` alone changes nothing consumers see

Consumers resolve through `package.json` `exports`, which points at build output, and both `lib/` and
`dist/` are gitignored. Rebuild with `pnpm --filter @opendatacapture/runtime-core build` before
testing a change anywhere else.

`build` is three stages, in order:

| Stage            | Command                                          | Produces                                                       |
| ---------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| `build:lib`      | `tsc -b tsconfig.build.json`                     | `lib/` — JS + per-file `.d.ts`, `src/**/__tests__/**` excluded |
| `build:dist` (1) | `esbuild --bundle` over `lib/index.js`           | `dist/index.js`                                                |
| `build:dist` (2) | `api-extractor run -c config/api-extractor.json` | `dist/index.d.ts` (rollup) + `dist/tmp/api.json`               |

`lib/` is an intermediate but not a private one. **The `./constants` subpath export resolves to
`lib/constants.js`, not `dist/`** (`packages/schemas/src/instrument/instrument.file.ts` imports it),
and `apps/outreach` points typedoc at `lib/index.d.ts` in `astro.config.ts`. Do not delete `lib/`
from the build, and do not assume a turbo cache hit restores it — `turbo.json` declares
`outputs: ["dist/**"]` only.

api-extractor reads TSDoc release tags, so a new export needs `/** @public */` (or `@internal` /
`@alpha`) like its neighbours.

## `defineInstrument`

`src/define.ts` is short — read it before changing anything below.

- **Authors never write `__runtimeVersion`.** `InstrumentDef` `Omit`s it from the argument type and
  the function `Object.assign`s `{ __runtimeVersion: 1 }` onto the result. Same for
  `defineSeriesInstrument`.
- **`TData` is inferred from `validationSchema['_output']`**, which is why `measures` and (for forms)
  the `content` field keys type-check against the data shape. `InstrumentValidationSchema` accepts
  **both** `zod/v3` and `zod/v4` schemas; `src/__tests__/define.test-d.ts` covers both.
- `DiscriminatedInstrument` resolves to `never` when `TKind` and the schema output disagree (e.g.
  `'FORM'` with non-object data). A confusing "not assignable" error at a call site usually means a
  schema/kind mismatch, not a missing property.
- **`language` switches the shape of every UI string.** `InstrumentUIOption` in
  `types/instrument.base.ts` resolves to `TValue` for `language: 'en'` and to `{ en: ..., fr: ... }`
  for `language: ['en', 'fr']`. It governs `title`, `description`, `instructions`, `tags`, field
  labels and measure labels alike.
- `defineSeriesInstrument` is deliberately separate: series instruments have no `validationSchema`
  and `internal?: never`. Its `const TItems` parameter is what narrows `terminate`'s and
  `completionMessage`'s `context.itemName` to the literal union of the series' item names.
- New fields on `InstrumentDetails` / `ClientInstrumentDetails` should not repeat the deprecation
  mistakes already recorded there (`details.estimatedDuration`, `details.instructions`,
  `measure.hidden`). Prefer `clientDetails.*` and `visibility` in anything you author.

## The in-repo license narrowing

`details.license` is a full `LicenseIdentifier` for outside authors, but narrows to
`ApprovedLicense` (`packages/licenses/src/index.d.ts`) for instruments in this repo. The mechanism:

- `runtime/v1/global.d.ts` declares `interface OpenDataCaptureContext { isRepo: ... }`, set to `true`
  iff the resolved root `package.json` has an `__isODCRepo` key.
- `src/define.ts` pulls that in with a `/// <reference types="../../../runtime/v1/global.d.ts" />`
  and intersects `InternalLicensingRequirements` into `InstrumentDef`.

`"__isODCRepo": true` is the last key of the **root** `package.json`. Removing it, or dropping
`resolveJsonModule`, silently widens the license type back to every SPDX identifier with no error
anywhere. Do not "clean up" either one.

## Keeping `packages/schemas` in sync

Every type here has a Zod mirror in `packages/schemas/src/instrument/*`, tied back with
`satisfies z.ZodType<TypeFromRuntimeCore>`. That assertion is not a full equivalence check — it
catches a schema that can no longer produce the type, not one that has drifted looser. Change a type
here and update its mirror in the same commit.

Background on how a definition becomes a stored, runnable instrument:
`.agents/docs/architecture/instrument-pipeline.md`. On how `runtime/v1` re-exports this package:
`.agents/docs/architecture/runtime-and-vendor.md`.

## Tests

**There is no `vitest.config.ts` here, so `pnpm test` runs nothing for this package.** The only tests
are type-level: `src/__tests__/define.test-d.ts` and `src/types/__tests__/instrument.form.test-d.ts`,
written with `expectTypeOf` from `expect-type` (a root devDependency). They are checked by the
`tsc --noEmit` half of the `lint` script, because `tsconfig.json` includes all of `src/`.

Run them with `pnpm --filter @opendatacapture/runtime-core lint`. A type change that breaks an
assertion shows up as a tsc error, not a test failure — add cases to these files rather than reaching
for a runtime test.
