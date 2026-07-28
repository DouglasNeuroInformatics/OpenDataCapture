# Add a built-in instrument

Adding a directory under `packages/instrument-library/src` builds a bundle that **nothing loads**.
Step 6 is the one that actually puts it in a demo instance, and skipping it fails silently.

Conventions for the package: `packages/instrument-library/AGENTS.md`. The authoring specification is
`packages/instrument-guidelines/AGENTS.md` — read the section for your kind. That file is a
**published npm artifact** written for authors outside this repo, so its `lib/forms` file-layout
advice does not apply here; everything it says about the definition object does.

## Checklist

1. **Create the directory.** `packages/instrument-library/src/<kind-dir>/<NAME>/`, `<NAME>` in
   `SCREAMING_SNAKE_CASE`. Instruments authored by the DNP carry a `DNP_` prefix; the two generic
   file instruments do not.

   | `kind` in the definition | Directory                  | Read first                                                     |
   | ------------------------ | -------------------------- | -------------------------------------------------------------- |
   | `'FORM'`                 | `src/forms/` (plural)      | `src/forms/DNP_HAPPINESS_QUESTIONNAIRE/index.ts`               |
   | `'INTERACTIVE'`          | `src/interactive/`         | `src/interactive/DNP_STROOP_TASK/` (multi-file JSX)            |
   | `'SERIES'`               | `src/series/`              | `src/series/DNP_HAPPINESS_QUESTIONNAIRE_WITH_CONSENT/index.ts` |
   | `'FILE'`                 | `src/file/` (**singular**) | `src/file/MRI_SCAN_SESSION/index.ts`                           |

2. **Add `index.ts` (or `index.tsx` for JSX) with a default export.** The bundler globs
   `src/**/*/index.{js,jsx,ts,tsx}`, so the directory is the unit of work and `index.*` is the only
   fixed filename. **The directory must be flat**: the CLI then globs `<dir>/*` and reads every entry
   as a file, so a subdirectory fails the build with a `Cannot infer loader` error. Relative imports
   need their extension (`'./StroopTask.tsx'`, `'./styles.css'`).

3. **Import everything from `/runtime/v1/...`**, never from `node_modules` or a workspace package:

   ```ts
   import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
   import { z } from '/runtime/v1/zod@3.x/v4'; // omit `/v4` for the Zod v3 API
   ```

   `defineSeriesInstrument` (not `defineInstrument`) for `kind: 'SERIES'`.

4. **Fill in the required fields.** For a scalar instrument: `kind`, `language`, `tags`, `internal`
   (`{ name, edition }`), `content`, `details` (`description`, `license`, `title`), `measures` (`null`
   is allowed) and `validationSchema`. A `SERIES` takes `kind`, `language`, `tags`, `details` and
   `content`, and has **no** `internal`, `measures` or `validationSchema`.
   - **Never write `__runtimeVersion`.** `defineInstrument` `Omit`s it from its argument type and
     assigns it; writing it by hand is a type error.
   - `language: 'en'` makes every UI string a plain string; `language: ['en', 'fr']` makes each one
     `{ en, fr }`. It is all-or-nothing across `title`, `description`, `instructions`, `tags` and
     every label.
   - `details.license` narrows to `ApprovedLicense` inside this repo (see
     `packages/licenses/src/index.d.ts`); `'Apache-2.0'` is what the existing catalog uses (except `DNP_BREAKOUT_TASK`, which is
     `'CC0-1.0'`).
   - `internal.name` is what the API hashes into the instrument ID, so make it match the directory
     name. Nothing enforces that.
   - **Do not alphabetise the keys.** `perfectionist/sort-objects` is switched off for this package in
     `eslint.config.js` on purpose so definitions read in semantic order.

5. **For a `SERIES`, every item must already exist as an instrument.** `content.items` is
   `{ name, edition }` pairs matching another instrument's `internal`, and `validateSeriesInstrument`
   in `apps/api/src/instruments/instruments.service.ts` rejects the series at creation time if any
   item is missing, or if there are fewer than two items.

6. **Add the import and the `create` call to `apps/api/src/demo/demo.service.ts`.** There is no
   registry file — the build globs the directory — but this file holds one hand-written named import
   per instrument:

   ```ts
   import myNewForm from '@opendatacapture/instrument-library/forms/MY_NEW_FORM.js';
   ```

   then `await this.instrumentsService.create({ bundle: myNewForm })` inside `init`. **Order in
   `init` is load-bearing**: a series must be created after every instrument it references (step 5).
   Skipping this step compiles, builds, and produces an instrument that is never in a demo instance —
   `DNP_STROOP_TASK` is the live example of that.

7. **Add an end-to-end test** in `testing/` — see `.agents/docs/playbooks/add-e2e-test.md`. There are
   no unit tests here: `packages/instrument-library` has no `vitest.config.ts`, so `pnpm test` runs
   nothing for it.

## Verify

```sh
pnpm exec turbo run build --filter=@opendatacapture/instrument-library  # builds runtime/v1 first
pnpm --filter @opendatacapture/instrument-library run available         # reads dist, not src
pnpm lint
pnpm test
pnpm test:e2e
```

`available` must list your title under the right kind. `pnpm lint` (`tsc`) needs `runtime/v1/dist` to
exist, which is why the build comes first.
