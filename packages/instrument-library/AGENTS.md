# packages/instrument-library

The built-in catalog of ready-made instruments. Each source directory is compiled by the
`instrument-bundler` CLI into one `dist` file whose **default export is the bundle as a string**.
The only consumer in this repo is `apps/api/src/demo/demo.service.ts`, which seeds a demo instance.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## Adding an instrument is not self-wiring

**`apps/api/src/demo/demo.service.ts` holds one hand-written named import per instrument.** Adding a
directory here and nothing else produces a bundle that is built, exported, and never loaded by
anything. `src/interactive/DNP_STROOP_TASK` is the live proof: it builds, `pnpm run available` lists
it, and it does not exist in a demo instance because no import was added.

**Order in `demo.service.init` is load-bearing for series.** `validateSeriesInstrument` in
`instruments.service.ts` rejects a `SERIES` whose `content.items` (`{ name, edition }` pairs) do not
already exist, so a series must be created after every instrument it references. That is why the
forms are awaited before `happinessQuestionnaireWithConsent`.

`demo.service.ts` also declares a local `HappinessQuestionnaireData` type mirroring
`DNP_HAPPINESS_QUESTIONNAIRE`'s fields. Changing that form's schema means changing that type too.

Full checklist: `.agents/docs/playbooks/add-instrument.md`.

## Layout and build

**There is no registry file and nothing to register.** `pnpm build` runs
`tsx ../instrument-bundler/src/cli.ts --clean --declaration --outdir dist src`, which globs
`src/**/*/index.{js,jsx,ts,tsx}` and turns each matching _directory_ into `dist/<kind>/<NAME>.js`.
Directory name is the unit of work; the filename `index.*` is the only fixed name.

| Source                    | Ships as                                              | Note         |
| ------------------------- | ----------------------------------------------------- | ------------ |
| `src/forms/<NAME>/`       | `@opendatacapture/instrument-library/forms/<NAME>.js` | plural       |
| `src/interactive/<NAME>/` | `.../interactive/<NAME>.js`                           |              |
| `src/series/<NAME>/`      | `.../series/<NAME>.js`                                |              |
| `src/file/<NAME>/`        | `.../file/<NAME>.js`                                  | **singular** |

`package.json` `exports` already wildcards those four kinds, so a new instrument inside one of them
needs no `package.json` edit. A new top-level kind directory would need a new export entry.

`dist` is gitignored and rebuilt from scratch each time (`--clean`).

## Authoring rules the bundler enforces at build time

Read `src/forms/DNP_HAPPINESS_QUESTIONNAIRE/index.ts` (multilingual form) and
`src/interactive/DNP_STROOP_TASK/` (multi-file JSX task) before writing one. The authoring spec
itself is `packages/instrument-guidelines/AGENTS.md` — note it is a **published npm artifact**
written for users outside this repo, so its instruction to put files in `lib/forms` / `lib/interactive`
does not apply here.

- **Instrument directories must be flat.** The CLI globs `<dir>/*` and reads every entry as a file,
  so a subdirectory fails the build with `Cannot infer loader due to unexpected extension`.
- **Relative imports need their file extension** (`./StroopTask.tsx`, `./styles.css`); esbuild will
  not resolve `./StroopTask`. `allowImportingTsExtensions` is on for this reason.
- Runtime imports use the absolute `/runtime/v1/...` specifier, resolved by the `paths` mapping in
  `tsconfig.json` to `runtime/v1/dist/*`. **`runtime/v1` must be built or `pnpm lint` (`tsc`) fails**
  — turbo handles this via `^build`. Background: `.agents/docs/architecture/runtime-and-vendor.md`.
- The directory name matches `internal.name` in every instrument. `SERIES` instruments have no
  `internal` field at all.
- **`perfectionist/sort-objects` is off for this package** (`eslint.config.js`, `files:
['packages/instrument-library/**/*']`). Instrument definitions are written in reading order. Do not
  reorder keys of an existing definition to look sorted.

## Checking what is in the catalog

`pnpm run available` (`scripts/available.ts`) reads `dist`, evals each bundle, and prints titles
grouped by kind; `--title` prints a flat list. **It reads `dist`, not `src`, so build first.**

## Tests

**This package has no `vitest.config.ts` and therefore no unit tests** (adding one:
`.agents/docs/playbooks/add-vitest-project.md`). Correctness is covered by the bundler's own suite and by
Playwright: `testing/src/specs/instrument-completion.spec.ts` and `gateway-assignment.spec.ts` drive
`Happiness Questionnaire` end to end. See `.agents/docs/architecture/testing-strategy.md` and
`.agents/docs/architecture/instrument-pipeline.md`.
