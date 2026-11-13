# Testing strategy

What is tested where, and what CI blocks a merge on. Writing an e2e test is
`.agents/docs/playbooks/add-e2e-test.md`; adding a unit tier to a package is
`.agents/docs/playbooks/add-vitest-project.md`.

## Tiers

| Tier       | Runner     | Where                                                                 | Command              |
| ---------- | ---------- | --------------------------------------------------------------------- | -------------------- |
| Unit       | vitest     | `__tests__/<file>.test.ts` beside `<file>.ts`, or a package's `test/` | `pnpm test:coverage` |
| End-to-end | Playwright | `testing/src/specs/`                                                  | `pnpm test:e2e`      |
| Type-check | `tsc`      | code that fails to compile if the type breaks, e.g. `*.test-d.ts`     | `pnpm lint`          |

**There is no integration tier.** `apps/api` unit tests mock the Prisma layer entirely, so Playwright
is the only code path that touches a real database: a permissions or row-scoping change is untested
until an e2e spec covers it.

## Scoping a run

Scope a package script with `pnpm --filter @opendatacapture/<pkg> <script>` or turbo's
`--filter=<pkg>`. Scope vitest to one project with `pnpm exec vitest --project <name>` (names come
from the `name` field in each package's `vitest.config.ts`, e.g. `api`, `web`, `schemas`), or run a
single file with `pnpm exec vitest path/to/file.test.ts`. A scoped run with `--coverage` measures
only what it ran against the whole coverage scope, so add `--coverage.thresholds.100=false` to it.

## A test nothing collects passes silently

Root `vitest.config.ts` collects only `.github/vitest.config.ts`, `apps/*/vitest.config.ts`,
`packages/*/vitest.config.ts` and `runtime/*/vitest.config.ts`. A test file in a workspace with no config of its own is collected by
nothing, reported by nothing, and passes CI green. A green run prints counts, not file names;
`pnpm exec vitest list --filesOnly [--project <name>]` prints every collected file prefixed with its
project. Before trusting a new test, see it listed and watch it fail on purpose.

## Vitest projects

Twenty-two, each named after its directory except `runtime/v1` (`runtime-v1`) and `.github` (`github`). Quirks of each live in
that package's `AGENTS.md` §Tests. Three run under happy-dom; the rest run in node, where one file
opts into a DOM with a first-line `// @vitest-environment happy-dom` docblock.

| Project                  | Package                           | Notes                                                    |
| ------------------------ | --------------------------------- | -------------------------------------------------------- |
| `github`                 | `.github`                         | not a workspace; tests every file in `scripts/`          |
| `api`                    | `apps/api`                        | libnest SWC plugin, confined to `apps/api` sources       |
| `gateway`                | `apps/gateway`                    |                                                          |
| `playground`             | `apps/playground`                 |                                                          |
| `web`                    | `apps/web`                        | happy-dom                                                |
| `instrument-bundler`     | `packages/instrument-bundler`     |                                                          |
| `instrument-interpreter` | `packages/instrument-interpreter` |                                                          |
| `instrument-library`     | `packages/instrument-library`     | happy-dom; aliases `/runtime/v1/…` to sources, no build  |
| `instrument-stubs`       | `packages/instrument-stubs`       | tests are `.test.js`                                     |
| `instrument-utils`       | `packages/instrument-utils`       |                                                          |
| `playground-url`         | `packages/playground-url`         |                                                          |
| `react-core`             | `packages/react-core`             | happy-dom                                                |
| `release-info`           | `packages/release-info`           |                                                          |
| `runtime-bundler`        | `packages/runtime-bundler`        | tests in `test/`                                         |
| `runtime-core`           | `packages/runtime-core`           | `*.test-d.ts` are checked by `tsc` in `lint`, not vitest |
| `runtime-internal`       | `packages/runtime-internal`       |                                                          |
| `runtime-meta`           | `packages/runtime-meta`           |                                                          |
| `schemas`                | `packages/schemas`                |                                                          |
| `serve-instrument`       | `packages/serve-instrument`       |                                                          |
| `subject-utils`          | `packages/subject-utils`          |                                                          |
| `vite-plugin-runtime`    | `packages/vite-plugin-runtime`    |                                                          |
| `runtime-v1`             | `runtime/v1`                      | tests in `test/`; can fail on a stale install            |

Everything else has no unit tests and no way to run them: `apps/outreach` and
`packages/{demo, instrument-guidelines, licenses}`. `testing/`, `storybook/` and `vendor/**` fall
outside the project globs by design.

## Test environment

- **No setup files anywhere** — no `setupFiles`, no `globalSetup`. A test arranges what it needs.
- **Mock call records are cleared before each test** (Vitest's `clearMocks` default, never
  overridden). A call made at import time or in `beforeAll` is gone by the time an `it` runs, so copy
  what the assertion reads into a variable at the end of `beforeAll`
  (`packages/serve-instrument/src/__tests__/client.test.tsx`). Implementations survive the clear.
- **`@testing-library/jest-dom` is not installed**; assert `expect(screen.getByText(x)).toBeTruthy()`.
- Workspace packages export TypeScript source, so `pnpm test` needs no prior build — except an import
  of `instrument-library`, `runtime-core` or `runtime/v1`, which export only build output.

## Canonical test per package

| Package                       | Read first                                                                      | Shape                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api`                    | `src/groups/__tests__/groups.service.test.ts`                                   | `Test.createTestingModule` + `MockFactory.createForModelToken(getModelToken('Group'))` from `@douglasneuroinformatics/libnest/testing`; a fresh module per test           |
| `apps/web`                    | `src/hooks/__tests__/useInstrumentBundle.test.ts`                               | `vi.hoisted` + `vi.mock` for `axios` and `@/store`; a real `QueryClient` per test with `retry: false`                                                                     |
| `packages/react-core`         | `src/components/InstrumentRenderer/__tests__/SeriesInstrumentRenderer.test.tsx` | hand-written bundles run by the real interpreter; `i18n.init({ translations: {} })` in `beforeAll`; `fireEvent`, since `userEvent` is not installed                       |
| `packages/schemas`            | `src/instrument/__tests__/instrument.form.test.ts`                              | parses fixtures from `@opendatacapture/instrument-stubs/*`, never hand-written literals, so schema and fixture cannot drift                                               |
| `packages/instrument-bundler` | `src/__tests__/build.test.ts`                                                   | real instrument sources under `src/__tests__/repositories/{form,interactive}/`, read into a `Map` at import time; a new file in the folder joins the fixture, no manifest |
| `packages/runtime-bundler`    | `test/e2e.test.ts`                                                              | minimal npm packages from `test/fixtures/` copied into a temp `node_modules`, bundled by the real `Bundler`, then imported                                                |

## `pnpm lint` is the type-check, and it edits files

Per-package `lint` is `tsc && eslint --fix src`; there is no separate `typecheck` script, so a type
error surfaces as a lint failure and every run may rewrite the working tree. Exceptions:

| Package                                                       | `lint`                                     |
| ------------------------------------------------------------- | ------------------------------------------ |
| `apps/outreach`                                               | `astro check && eslint --fix src`          |
| `packages/runtime-core`                                       | `tsc --noEmit && eslint --fix src`         |
| `packages/instrument-stubs`, `packages/instrument-guidelines` | eslint only — **no `tsc`**                 |
| `testing`                                                     | `pnpm gen:routes && tsc && eslint --fix .` |
| `runtime/v1`                                                  | **none**, so never type-checked            |

## Turbo task graph

`lint`, `dev`, `dev:test` and `test:e2e` depend on `["^build", "^db:generate", "db:push"]`; `build`
on `["^build", "db:generate"]`. `test:e2e` is `cache: false`. **`test` is not a turbo task**: root
`pnpm test` is `env-cmd vitest`, with no build and no database. `globalDependencies` (`.env`,
`eslint.config.js`, `tsconfig.json`, `prettier.config.js`) invalidate every cached task when touched.

## Coverage scope

The 100% gate (root `AGENTS.md`) measures `coverage.include` in root `vitest.config.ts`:
`.github/scripts`, `apps/{api,gateway,web}/src` and `packages/*/src`. `runtime/**` and `apps/playground`
are outside it.
`apps/api` confines SWC to its own files because letting it transform imported workspace packages
counts their functions twice in the merged report.

## What CI gates

`.github/workflows/ci.yaml`, one job, on `pull_request` to `main` or a `release/**` branch and
`workflow_dispatch` only — a push alone runs nothing. In order: `./scripts/generate-env.sh`, `pnpm install --frozen-lockfile`,
`pnpm lint`, `pnpm test:coverage`, Playwright install (chromium + firefox, capped at 10 minutes, after
lint and unit tests so a hung download cannot hide them), `pnpm test:e2e`.

Not gated: knip (`pnpm knip` exists), and formatting — prettier runs only in the `.husky/pre-commit`
hook, which formats rather than verifies.

`.github/workflows/release.yaml` (push to `main`, dispatch on `release/<major>`) validates with `pnpm lint` only — **no unit or e2e
tests before a release build.** `.github/workflows/commitlint.yaml` (`pull_request` to any branch)
lints the commits the PR adds against `commitlint.config.ts`.

The `main: pull requests only` ruleset requires `lint-and-test`, `commitlint` and `check` (from
`.github/workflows/pr-body.yaml`) to pass before a merge, each pinned to the GitHub Actions app. Renaming
one of those jobs blocks every pull request until the ruleset is updated to match.

`.github/workflows/pr-status.yaml` gates nothing. It gives each open pull request exactly one `Status:`
label, recomputed from GitHub's state by `.github/scripts/pr-status.ts`. Never set those labels by hand,
because the next run overwrites them.

## Known warts

Flag these rather than fixing them in passing; each is load-bearing somewhere.

- `turbo.json` declares `db:generate` `outputs: ["node_modules/@prisma/generated-client/**"]`, which
  matches only `apps/gateway`'s schema; `apps/api/prisma/schema.prisma` has its `output` commented
  out, so `@opendatacapture/api#db:generate` is `cache: false` to stop a cache hit restoring nothing.
  Changing either half changes what `db:generate` produces.
