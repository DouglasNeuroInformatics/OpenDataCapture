# packages/schemas

The Zod contract shared across tiers. `api`, `web`, `gateway`, `outreach`, `playground`, `testing`
and six other packages all import from here, so a change to a schema here is a change to the wire
format between them.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## Traps

**There is no `.` export.** `import { $User } from '@opendatacapture/schemas'` does not resolve.
`package.json` maps one subpath per folder under `src/` (`./auth`, `./core`, `./instrument`, ...)
straight to the `.ts` file. Add a new domain folder and you must add its subpath to `exports` or no
one can import it.

**There is no build step** — no `build` script, and the export map points at raw TypeScript.
Consumers transpile the source themselves. Nothing here is emitted, so nothing here may depend on a
compile step running first.

**`import { z } from 'zod/v4'`.** Bare `zod` is an eslint error repo-wide: it resolves to the
vendored `vendor/zod@3.x`, whose root export is the v3 API. v3 and v4 are separate schema
registries and their schemas do not interoperate.

**Relative imports need an explicit `.js` extension** (`from '../core/core.js'`), enforced only in
this package by `import/extensions: ['error', 'always', { ignorePackages: true }]` in the root
`eslint.config.js`. Package imports stay extensionless.

**`import/exports-last` has no autofix.** It reports every export that appears before the last
non-export statement, so a private helper must be declared _before_ the first export or lint fails
and you fix it by hand. Two shapes are in use: files where every declaration is inline-exported
(`src/group/group.ts`), and files with private helpers first and one `export { ... }` block at the
bottom (`src/setup/setup.ts`, all of `src/instrument/`). Adding a private helper to a file of the
first kind means converting it to the second.

## Naming

Two variants coexist and both are deliberate.

| Form                                        | Example                                                  | Use when                                                                  |
| ------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| plain type + `$Schema`                      | `type User` / `const $User`                              | the default                                                               |
| `$`-prefixed type sharing the schema's name | `type $SelfUpdateUserData` / `const $SelfUpdateUserData` | the identifier must be a type _and_ a runtime value at the same call site |

The second is load-bearing: it lets an `apps/api` controller write
`@Body() update: $SelfUpdateUserData` with no DTO class, because the one identifier supplies both
the parameter type and the schema the global `ValidationPipe` reads off the metadata. **It only
works if the consumer imports it as a value** — `import type` erases the runtime binding and the
route throws when called. See `apps/api/src/users/users.controller.ts`.

`src/instrument-records/instrument-records.ts` exports both forms for the same schema
(`$CreateInstrumentRecordData` and `CreateInstrumentRecordData`); that is legacy, not a pattern to
copy.

## A schema only where something is parsed

`src/auth/auth.ts` is the whole rule in 26 lines: `$LoginCredentials` is a schema because a request
body is parsed against it; `AuthPayload` and `TokenPayload` are plain types because nothing ever
parses them. Do not add a schema for a shape that only crosses a typed boundary.

Variants are composed with `.extend()` / `.pick()` / `.omit()` / `.partial()` off an existing shape,
never rewritten — `$UpdateUserData = $CreateUserData.partial().extend({...})`. Rewriting is how the
two drift.

## src/instrument

The one barrel in the package (`instrument.ts` re-exports the six sibling files), and the only place
using schema **factories**: `$$Name(language?)` returns a schema specialised to `'en'`, `'fr'`,
`['en', 'fr']` or, with no argument, the permissive union. Every file pairs the factory with its
default instance — `const $FormInstrument = $$FormInstrument()`.

Read `src/instrument/instrument.file.ts` before adding one — it is short and shows the whole shape.
Two constraints on anything you write there:

- **Every schema is checked against its `@opendatacapture/runtime-core` counterpart** with
  `satisfies z.ZodType<FileInstrument<TLanguage>>`. `runtime-core` is the source of truth; this
  package is the runtime validator for it, and the `satisfies` is what keeps them from diverging.
  See `.agents/docs/architecture/instrument-pipeline.md`.
- **The result must survive `z.toJSONSchema`.** `apps/outreach` calls the `$$` factories directly to
  publish JSON Schema for every kind × language. This is why `$InstrumentValidationSchema` is
  `z.any().refine(...)` rather than `z.custom()`, which cannot be converted.

## One security-relevant export

`$AppSubjectName` in `src/core/core.ts` is the hand-maintained list of CASL subject names. It is not
derived from `schema.prisma` and does not mirror it. A model that needs permission checks has to be
added here as well as in `apps/api/src/auth/ability.factory.ts` —
`.agents/docs/architecture/auth-and-permissions.md`.

## Tests

`pnpm exec vitest --project schemas`. There is a `vitest.config.ts`; no setup files, no environment
beyond node.

Tests live in two places: `src/instrument/__tests__/*.test.ts`, and colocated `*.test.ts` beside the
schema for `setup` and `summary`. Fixtures come from the `@opendatacapture/instrument-stubs`
devDependency (`@opendatacapture/instrument-stubs/forms`), not hand-written objects — see
`src/instrument/__tests__/instrument.form.test.ts`.

Assert with `safeParse(...).success`, and cover the reject case as well as the accept case. Where a
schema is a security boundary the rejects are the point: `src/setup/setup.test.ts` exists to pin
down that `javascript:` and `data:text/html` never pass `$BrandingConfig`.
