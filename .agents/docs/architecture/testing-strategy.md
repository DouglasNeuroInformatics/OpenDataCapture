# Testing strategy

What is tested where, and what CI actually blocks a merge on. Writing an e2e test is
`.agents/docs/playbooks/add-e2e-test.md`; this file is the reference.

## The failure that is silent

The root `vitest.config.ts` declares
`projects: ['apps/*/vitest.config.ts', 'packages/*/vitest.config.ts', 'runtime/*/vitest.config.ts']`.
**A workspace with no `vitest.config.ts` of its own is invisible to `pnpm test`.** A test file added
to `apps/gateway` or `packages/react-core` today is collected by nothing, reported by nothing, and
passes CI green.

Check the table below before writing a unit test. If the package is not in it, add a
`vitest.config.ts` in the same change — `.agents/docs/playbooks/add-vitest-project.md` is the order
of operations.

## Tiers

| Tier       | Runner     | Where                                                    | Command         |
| ---------- | ---------- | -------------------------------------------------------- | --------------- |
| Unit       | vitest     | `src/__tests__/` (or `test/`) in a participating package | `pnpm test`     |
| End-to-end | Playwright | `testing/src/specs/`                                     | `pnpm test:e2e` |
| Type-check | `tsc`      | —                                                        | `pnpm lint`     |

There is no integration tier. `apps/api` unit tests mock the Prisma layer entirely; the only code
path exercised against a real database is Playwright.

## Vitest projects

Thirteen. Scope a run with `pnpm exec vitest --project <name>`; the name is the `name` field in that
package's config, which is **not** always the directory name.

| Project                  | Package                           | Notable config                                                              |
| ------------------------ | --------------------------------- | --------------------------------------------------------------------------- |
| `api`                    | `apps/api`                        | libnest SWC plugin; `globals: true`; extra `include` for `src/**/*.spec.ts` |
| `web`                    | `apps/web`                        | `environment: 'happy-dom'`; redeclares the `@` alias                        |
| `instrument-bundler`     | `packages/instrument-bundler`     |                                                                             |
| `instrument-interpreter` | `packages/instrument-interpreter` |                                                                             |
| `instrument-utils`       | `packages/instrument-utils`       |                                                                             |
| `playground-url`         | `packages/playground-url`         |                                                                             |
| `release-info`           | `packages/release-info`           |                                                                             |
| `runtime-bundler`        | `packages/runtime-bundler`        |                                                                             |
| `runtime-meta`           | `packages/runtime-meta`           |                                                                             |
| `schemas`                | `packages/schemas`                |                                                                             |
| `subject-utils`          | `packages/subject-utils`          |                                                                             |
| `vite-plugin-runtime`    | `packages/vite-plugin-runtime`    |                                                                             |
| `runtime-v1`             | `runtime/v1`                      | directory is `v1`, project is `runtime-v1`                                  |

Everything else has no unit tests and no way to run them: `apps/gateway`, `apps/outreach`,
`apps/playground`, and `packages/{demo, instrument-guidelines, instrument-library, instrument-stubs,
licenses, react-core, runtime-core, runtime-internal, serve-instrument}`. `testing/`, `storybook/` and `vendor/**` fall outside the
project globs by design — `testing/` is Playwright, not vitest.

## Test environment

- **There are no setup files anywhere in the repo.** No `setupFiles`, no `globalSetup`. Whatever a
  test needs, it arranges in its own body.
- **`@testing-library/jest-dom` is not installed.** `toBeInTheDocument()` does not exist; assert
  `expect(screen.getByText(x)).toBeTruthy()`.
- Workspace packages export TypeScript source from `exports` (`@opendatacapture/schemas` maps
  `./core` to `./src/core/core.ts`), so unit tests never read a `dist/`. This is why `pnpm test`
  needs no prior build.

## Conventions by package

Read the canonical file before writing a test in that tier.

| Package                       | Canonical file                                     | Shape                                                                                                                                                                                                                                                                                                         |
| ----------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api`                    | `src/groups/__tests__/groups.service.spec.ts`      | `Test.createTestingModule` + `MockFactory.createForModelToken(getModelToken('Group'))` from `@douglasneuroinformatics/libnest/testing`; mocks typed `MockedInstance<Model<'Group'>>`; assert with `model.create.mock.lastCall?.[0]` and `toMatchObject`. A fresh module per test, so no mock state to reset.  |
| `apps/web`                    | `src/hooks/__tests__/useInstrumentBundle.test.ts`  | `vi.hoisted` + `vi.mock` for `axios` and `@/store`; a **real** `QueryClient` per test with `retry: false`, wrapped in `QueryClientProvider`.                                                                                                                                                                  |
| `packages/schemas`            | `src/instrument/__tests__/instrument.form.test.ts` | Parse fixtures imported from `@opendatacapture/instrument-stubs/*`, never hand-written literals, so schema and fixture cannot drift.                                                                                                                                                                          |
| `packages/instrument-bundler` | `src/__tests__/build.test.ts`                      | Fixtures are real instrument sources under `src/__tests__/repositories/{form,interactive}/`. `repositories/index.ts` reads each directory at import time into a `Map`; a test does `repositories.get('interactive')!`. Dropping a file in the folder adds it to the fixture — there is no manifest to update. |
| `packages/runtime-bundler`    | `test/e2e.test.ts`                                 | Fixtures under `test/fixtures/` are minimal real npm packages (`name`, `type`, `exports`). The test copies them into a temp dir _as `node_modules`_, writes a bare `package.json`, runs the real `Bundler`, then dynamically imports the emitted output.                                                      |
| `runtime/v1`                  | `test/vendor-pairing.test.ts`                      | Resolves the `vendor/` wrappers from the installed `node_modules` layout. It can fail on a stale install rather than on a code change.                                                                                                                                                                        |

`testing/` is page-object style: page objects under `testing/src/pages/` mirroring the web route
tree, specs under `testing/src/specs/`, shared helpers under `testing/src/support/`. Selectors are
the `data-testid` attributes in `apps/web` — do not remove them.

## `pnpm lint` is the type-check, and it edits your files

Per-package `lint` is `tsc && eslint --fix src`. There is no separate `typecheck` script anywhere.
Two consequences: a type error surfaces as a lint failure, and running lint **mutates the working
tree** (`--fix` rewrites imports, object key order, and export placement).

Exceptions worth knowing:

| Package                                                       | `lint`                                                           |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| `apps/outreach`                                               | `astro check && eslint --fix src`                                |
| `packages/runtime-core`                                       | `tsc --noEmit && eslint --fix src`                               |
| `packages/instrument-stubs`, `packages/instrument-guidelines` | eslint only — **no `tsc`**                                       |
| `testing`                                                     | `pnpm gen:routes && tsc && eslint --fix .`                       |
| `runtime/v1`                                                  | **no `lint` script**, so it is never type-checked by `pnpm lint` |

## Turbo task graph

`lint`, `dev`, `dev:test` and `test:e2e` all depend on `["^build", "^db:generate", "db:push"]`
(`build` itself depends on `^build` and `db:generate`). A cold `pnpm lint` therefore builds every
dependency, generates both Prisma clients, and pushes the gateway SQLite schema — it is not fast.

**`test` is not a turbo task at all.** Root `pnpm test` is `env-cmd vitest`: plain vitest, no build,
no database. Only `testing` owns a `test:e2e` script; only `apps/gateway` owns a `db:push`.

`globalDependencies` are `.env`, `eslint.config.js`, `tsconfig.base.json` and `prettier.config.js`.
Touching any of them invalidates the cache for every task in the repo.

## What CI gates

`.github/workflows/ci.yaml`, one job (`lint-and-test`, ubuntu-latest), triggered on
`pull_request` to `main` and `workflow_dispatch` only.

| #   | Step                 | Command                                                |
| --- | -------------------- | ------------------------------------------------------ |
| 1   | Generate Environment | `./scripts/generate-env.sh`                            |
| 2   | Install Dependencies | `pnpm install --frozen-lockfile`                       |
| 3   | Lint                 | `pnpm lint`                                            |
| 4   | Unit Tests           | `pnpm test`                                            |
| 5   | Install Playwright   | chromium + firefox `--with-deps`, capped at 10 minutes |
| 6   | End-to-End Tests     | `pnpm test:e2e`                                        |

Lint and unit tests run **before** the Playwright install deliberately, so a hung browser download
does not hide their results.

Not gated, despite existing in the repo:

- **No separate type-check step** — it is folded into step 3.
- **No coverage.** Nothing in CI runs `pnpm test:coverage`, and the root config declares no
  `thresholds`. Its `include` is `apps/**/*` and `packages/**/*`, so `runtime/**` is outside it.
- **No knip step**, although `knip.ts` and a `pnpm knip` script exist.
- **No format check.** Prettier runs only in the `.husky/pre-commit` hook (`prettier-pre-commit`),
  which formats rather than verifies; the hook does not run lint or tests.

`.github/workflows/release.yaml` (push to `main`) has a `Validate` job that runs `pnpm lint` only —
**no unit tests and no e2e before a release build.**

## Playwright specifics

`testing/playwright.config.ts` defines four projects: `setup` (with `teardown` attached),
`teardown`, `chromium` (every spec), and `firefox` (only specs matching `@smoke`). Cross-browser
coverage is therefore a smoke subset, not the full suite.

`webServer` boots `apps/api`, `apps/gateway` and `apps/web` by running each app's own `pnpm dev:test`
with `NODE_ENV=test`, which is what gives the API an in-memory Mongo replica set instead of an
external database. `workers: 1` on CI; `fullyParallel` otherwise. The default assertion timeout is
raised to 15s because a 2-core runner doing real DB work misses the 5s default.

## Known warts

Flag these rather than fixing them in passing — each one is load-bearing somewhere.

- `turbo.json` declares `db:generate` `outputs: ["node_modules/@prisma/generated-client/**"]`. That
  is correct for `apps/gateway`, whose `schema.prisma` sets that `output`, but the equivalent line in
  `apps/api/prisma/schema.prisma` is **commented out**, so the API client generates to the default
  pnpm location; `@opendatacapture/api#db:generate` is therefore declared `cache: false` so a cache
  hit never restores an empty output set. Changing either half changes what a `db:generate` run
  produces.
- `packages/instrument-bundler/vitest.config.ts` aliases `/runtime/v1` to
  `packages/instrument-bundler/runtime/v1/dist`, a directory that does not exist. It is inert today:
  the fixtures under `src/__tests__/repositories/` are read as raw strings and handed to the bundler,
  never resolved by vitest. Do not rely on the alias.
- Root `test` is `env-cmd vitest` but `test:coverage` is `vitest --coverage` with no `env-cmd`, so
  the two do not run under the same environment.
