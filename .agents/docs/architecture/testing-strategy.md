# Testing strategy

What is tested where, and what CI blocks a merge on. Writing an e2e test is
`.agents/docs/playbooks/add-e2e-test.md`; adding a unit tier to a package is
`.agents/docs/playbooks/add-vitest-project.md`.

## Tiers

| Tier        | Runner     | Where                                                                 | Command              |
| ----------- | ---------- | --------------------------------------------------------------------- | -------------------- |
| Unit        | vitest     | `__tests__/<file>.test.ts` beside `<file>.ts`, or a package's `test/` | `pnpm test:coverage` |
| Integration | vitest     | `apps/api/test/suites/`, run through `apps/api/test/app.test.ts`      | `pnpm test:coverage` |
| End-to-end  | Playwright | `testing/src/specs/`                                                  | `pnpm test:e2e`      |
| Type-check  | oxlint     | code that fails to compile if the type breaks, e.g. `*.test-d.ts`     | `pnpm lint`          |

`apps/api` unit tests mock the Prisma layer entirely. The integration suites boot the real app on an
in-memory replica set (`apps/api/AGENTS.md` §Tests), so a permissions or row-scoping change is tested
there, at a few milliseconds a case; an e2e spec is for what needs the browser and the other apps.

## Scoping a run

Scope a package script with `pnpm --filter @opendatacapture/<pkg> <script>` or turbo's
`--filter=<pkg>`. Scope vitest to one project with `pnpm exec vitest --project <name>` (names come
from the `name` field in each package's `vitest.config.ts`, e.g. `api`, `web`, `schemas`), or run a
single file with `pnpm exec vitest path/to/file.test.ts`. A scoped run with `--coverage` measures
only what it ran against the whole coverage scope, so add `--coverage.thresholds.100=false` to it.

**`pnpm test:coverage` and `pnpm test:e2e` take one lock per machine.** `scripts/with-test-lock.sh`
holds a directory in the git common directory, which every worktree shares, so a second heavy run —
from another session or worktree — waits and says whose run it is waiting on, rather than exhausting
memory or colliding on the e2e ports. A lock whose holder has exited is taken over. `vitest` without
`--coverage` and the scoped runs above take no lock.

## A test nothing collects passes silently

Root `vitest.config.ts` collects only `.github/vitest.config.ts`, `apps/*/vitest.config.ts`,
`packages/*/vitest.config.ts` and `runtime/*/vitest.config.ts`. A test file in a workspace with no config of its own is collected by
nothing, reported by nothing, and passes CI green. A green run prints counts, not file names;
`pnpm exec vitest list --filesOnly [--project <name>]` prints every collected file prefixed with its
project. Before trusting a new test, see it listed and watch it fail on purpose.

## Vitest projects

Twenty-three, each named after its directory except `runtime/v1` (`runtime-v1`) and `.github` (`github`). Quirks of each live in
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
| `oxlint-config`          | `packages/oxlint-config`          | `RuleTester` from `oxlint/plugins-dev`                   |
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

Root `lint:root` is `oxlint --type-check --fix`: one process lints every file in the repo and reports
TypeScript's diagnostics for it, each file under its nearest `tsconfig.json`. No workspace has a `lint`
script except `apps/outreach`, and there is no separate `typecheck` script, so a type error surfaces as
a lint failure and every run may rewrite the working tree. To check part of the repo, pass a path:
`pnpm exec oxlint --type-check apps/web`. What that pass does not cover:

| Files                                                             | Checked by                                                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `.astro` templates                                                | `apps/outreach`'s `lint`, which is `astro check`                                     |
| `vendor/**`, `packages/runtime-bundler/test/fixtures/**`          | nothing: `ignorePatterns` in `oxlint.config.ts`                                      |
| `packages/instrument-stubs`, `packages/instrument-guidelines/bin` | linted, but neither has a `tsconfig.json`, so the repo's strict options do not apply |

## Turbo task graph

`pnpm lint` is `turbo run lint lint:root`. `//#lint:root` depends on `//#generated`, a task with no
script that names what a tool run over the whole repo reads and source control does not hold: both
Prisma clients, `testing`'s route types, `apps/outreach`'s content collection types (`gen:types`,
`astro sync`, into the git-ignored `.astro/`), and `instrument-library`'s build, which reaches
`runtime-v1` and `runtime-core` through `^build`. Without the content types, the type-check reads every
`astro:content` import as `any` on a fresh checkout such as CI's. `test:e2e` depends on the same task, the gateway's `db:push`, the
`build` of gateway, web and playground, whose production builds the suite serves, and `^build`, which
builds the `playground-url` CLI that `testing/src/specs/playground.spec.ts` runs.
`dev` and `dev:test` depend on `["^build", "db:generate"]`, to which `apps/gateway/turbo.json` adds
`db:push`; `build` depends on `["^build", "db:generate"]` and `start` on `build`. `dev`, `dev:test`,
`start`, `test:e2e` and `db:push` are `cache: false`. A workspace whose task differs from the root
definition says so in its own `turbo.json` (`git ls-files '*turbo.json'` lists them).

**`test` is not a turbo task**: root `pnpm test` runs `pnpm build:exports`, which builds the packages
that export only build output, and then `env-cmd vitest`, with no database.

**A task sees a variable only through `env`.** `.env` is not a `globalDependency`, so editing it
invalidates nothing; `pnpm build` loads it with `env-cmd` and turbo passes on the keys a task declares.
Root `tsconfig.json` is the one `globalDependency`, and turbo adds `packages/oxlint-config` to every
task's hash because the root `package.json` depends on it. `build` hashes neither `*.md` nor
`__tests__/`, so editing an `AGENTS.md` or a unit test rebuilds nothing downstream.

## Coverage scope

The 100% gate (root `AGENTS.md`) measures `coverage.include` in root `vitest.config.ts`:
`.github/scripts`, `apps/{api,gateway,web}/src` and `packages/*/src`. `runtime/**` and `apps/playground`
are outside it.
`apps/api` confines SWC to its own files because letting it transform imported workspace packages
counts their functions twice in the merged report.

## What CI gates

`.github/workflows/ci.yaml`, one job, on `pull_request` to `main` or a `release/**` branch and
`workflow_dispatch` only — a push alone runs nothing. In order: `./scripts/generate-env.sh`, `pnpm install --frozen-lockfile`,
`pnpm lint`, `pnpm test:coverage`, Playwright install (chromium, capped at 10 minutes, after
lint and unit tests so a hung download cannot hide them), `pnpm test:e2e`. `actions/cache` restores
`.turbo/cache` before the first of them: a pull request reads the caches its own earlier runs saved
and the one the Release workflow's `validate` job last saved on its base branch.

Not gated: knip (`pnpm knip` exists), and formatting — oxfmt runs only in the `.husky/pre-commit`
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
  out, so `apps/api/turbo.json` sets its `db:generate` to `cache: false` to stop a cache hit restoring
  nothing. Changing either half changes what `db:generate` produces.
