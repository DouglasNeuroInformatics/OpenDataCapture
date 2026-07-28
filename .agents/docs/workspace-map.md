# Workspace map

What every workspace is, who depends on it, and whether it needs building before a consumer can use
it. Read the `AGENTS.md` in a directory before editing it; this file only says what lives where.

## Before you add or move anything

- **Workspace globs are `apps/*`, `packages/*`, `runtime/*`, `storybook`, `testing`, `vendor/**/\*`**
(`pnpm-workspace.yaml`). A new directory under one of those is a workspace the moment it has a
`package.json`. `cli/`, `docs/`, `blog/`and`.agents/` are not workspaces.
- There are **27 first-party workspaces plus 38 under `vendor/`** — 66 entries including the root, as
  reported by `pnpm ls -r --depth -1`. The tables below cover the 27; `vendor/` is described as one
  group because every entry there follows the same shape.
- **Most packages are source-only** and export `./src/*.ts` directly. Their consumers compile them.
  The few that export `./dist` must be built first — see [Built vs source-only](#built-vs-source-only).
- **Versions are pinned in the `catalog:` block of `pnpm-workspace.yaml`.** A dependency entry says
  `"catalog:"`, never a literal version.
- `tsc` in every `lint` script is a **typecheck only** — `noEmit: true` comes from
  `@douglasneuroinformatics/tsconfig` via `tsconfig.base.json`. Nothing is emitted by `pnpm lint`.

## Apps — `apps/*`

Nothing depends on an app. All five are leaves.

| Workspace         | What it is                                                                                       | Build                                                  | Vitest project |
| ----------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | -------------- |
| `apps/api`        | NestJS backend on `libnest`; Fastify, MongoDB via Prisma, CASL                                   | `libnest build` → single `dist/app.js`                 | `api`          |
| `apps/gateway`    | SSR app for patient self-administration of remote assignments; its own Prisma schema (`db:push`) | `vite build` ×2 (client + SSR) then `scripts/build.ts` | none           |
| `apps/outreach`   | Astro marketing site and user docs                                                               | `astro build`                                          | none           |
| `apps/playground` | In-browser instrument build/edit environment                                                     | `tsc && vite build`                                    | none           |
| `apps/web`        | Clinician-facing React SPA                                                                       | `tsc && vite build`                                    | `web`          |

`apps/gateway` is the only workspace with a `db:push` task, which is why `turbo.json` special-cases
`@opendatacapture/gateway#build`.

## Packages — `packages/*`

"Used by" lists first-party consumers only.

| Workspace                | What it is                                                                           | Build                                                        | Vitest project        | Used by                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `demo`                   | Seed data (demo groups/users) for demo instances                                     | no                                                           | none                  | api, web                                                                                                                                  |
| `instrument-bundler`     | Compiles instrument source into runtime-loadable bundles                             | no                                                           | `instrument-bundler`  | api, instrument-library, playground, react-core, serve-instrument                                                                         |
| `instrument-guidelines`  | Instrument-authoring guidelines written for an AI agent; ships `AGENTS.md` + a `bin` | no                                                           | none                  | nothing (published for external use)                                                                                                      |
| `instrument-interpreter` | Evaluates a bundled instrument and validates it against the schemas                  | no                                                           | none                  | react-core, web                                                                                                                           |
| `instrument-library`     | Built-in catalog of ready-made instruments                                           | **yes** — `instrument-bundler` CLI → `dist`                  | none                  | api                                                                                                                                       |
| `instrument-stubs`       | Minimal stub instruments for tests and examples                                      | no                                                           | none                  | instrument-bundler, react-core, schemas, storybook, web                                                                                   |
| `instrument-utils`       | Helpers for working with instrument definitions                                      | no                                                           | none                  | api, react-core, web                                                                                                                      |
| `licenses`               | SPDX + custom license metadata                                                       | no                                                           | none                  | outreach, react-core, runtime-core, runtime-v1, schemas, web                                                                              |
| `playground-url`         | Encodes/decodes shareable playground URLs and editor file state                      | `dist` holds the `bin` only; the `.` export is still source  | `playground-url`      | playground                                                                                                                                |
| `react-core`             | React components/hooks shared by more than one frontend                              | no                                                           | none                  | gateway, playground, serve-instrument, storybook, web                                                                                     |
| `release-info`           | Resolves version/branch/commit at build time                                         | no                                                           | `release-info`        | api, gateway, web                                                                                                                         |
| `runtime-bundler`        | Bundles the instrument **runtime**; provides the `runtime-bundler` bin               | no                                                           | `runtime-bundler`     | runtime-v1                                                                                                                                |
| `runtime-core`           | Public runtime API (`defineInstrument`, i18n, notifications)                         | **yes** — `tsc -b` → `lib`, esbuild + api-extractor → `dist` | none                  | api, gateway, instrument-interpreter, instrument-stubs, instrument-utils, outreach, playground, react-core, runtime-v1, schemas, web      |
| `runtime-internal`       | Internal runtime execution primitives (interactive-task iframe/worker bootstrap)     | no                                                           | none                  | instrument-bundler, instrument-interpreter, react-core, runtime-v1, serve-instrument, subject-utils                                       |
| `runtime-meta`           | Runtime version list and per-version asset manifest types                            | no                                                           | `runtime-meta`        | outreach, serve-instrument, vite-plugin-runtime                                                                                           |
| `schemas`                | Zod schemas/types shared across tiers, one export per domain                         | no                                                           | `schemas`             | api, demo, gateway, instrument-interpreter, instrument-utils, outreach, playground, react-core, release-info, subject-utils, testing, web |
| `serve-instrument`       | CLI/server for previewing one instrument outside the full app                        | **yes** — esbuild → `dist/cli.js` (the `bin`)                | none                  | nothing (published for external use)                                                                                                      |
| `subject-utils`          | Subject identification (deriving/hashing clinical subject IDs)                       | no                                                           | `subject-utils`       | api, react-core, web                                                                                                                      |
| `vite-plugin-runtime`    | Vite plugin wiring the instrument runtime into an app build                          | no                                                           | `vite-plugin-runtime` | gateway, playground, storybook, web                                                                                                       |

`schemas` has **no root export.** Import a domain: `@opendatacapture/schemas/subject`, `/instrument`,
`/auth`, `/group`, `/assignment`, `/audit`, `/core`, `/gateway`, `/instrument-records`,
`/instrument-repo`, `/session`, `/setup`, `/storage`, `/summary`, `/user`. Adding a domain means
adding an `exports` entry.

Five packages ship **hand-written `.js`** rather than `.ts`: `licenses`, `runtime-internal` and
`runtime-meta` pair it with a sibling `.d.ts`, while `instrument-stubs` and `vite-plugin-runtime`
rely on JSDoc alone. Nothing compiles them, so a `.ts` file added to one of those will not be
transpiled.

## Runtime — `runtime/*`

| Workspace                                    | What it is                                                                                                                       | Build                                | Vitest project | Used by                                                                                                                                       |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `runtime/v1` (`@opendatacapture/runtime-v1`) | The versioned artifact instruments import at runtime; built from every `vendor/*` package plus `runtime-core`/`runtime-internal` | **yes** — `runtime-bundler` → `dist` | `runtime-v1`   | api, gateway, instrument-bundler, instrument-library, outreach, playground, react-core, serve-instrument, storybook, vite-plugin-runtime, web |

Apart from `./env` and `./package.json`, its exports map is `./*` → `./dist/*`, so **nothing
resolves until it is built.** `apps/api` reaches
it through the `#runtime/v1/*` subpath import declared in `apps/api/package.json`, which points at
`runtime/v1/dist` under the `development` condition and at the app's own `dist` otherwise.

Six differently-scoped things are named `runtime-*`. If you are unsure which one a task belongs in,
read `.agents/docs/architecture/runtime-and-vendor.md` before editing.

## Tooling workspaces

| Workspace   | What it is                                                                            | Build | Vitest project                |
| ----------- | ------------------------------------------------------------------------------------- | ----- | ----------------------------- |
| `storybook` | Shared Storybook config (`config/`); discovers stories across the repo centrally      | no    | none                          |
| `testing`   | Playwright end-to-end suite; `test:e2e`, and `gen:routes` which runs on `postinstall` | no    | none — Playwright, not vitest |

The root `vitest.config.ts` only globs `apps/*`, `packages/*` and `runtime/*`, so a `vitest.config.ts`
placed in `storybook/` or `testing/` would never run.

## Built vs source-only

This is the one distinction that changes how you import a workspace.

- **Source-only** (the default — 15 of the 19 packages have no `build` script at all): `exports`
  points at `./src/...` and the consumer's bundler compiles it. Nothing to build, no stale `dist`,
  and a change is visible immediately.
- **Built**: `instrument-library`, `runtime-core`, `runtime/v1` publish `dist`/`lib` and **cannot be
  imported until built**. `playground-url` and `serve-instrument` build only their `bin`;
  `playground-url`'s library export stays source, and `serve-instrument` has no `exports` at all —
  it is bin-only.

Turbo handles ordering (`build` depends on `^build` and `db:generate`), so `pnpm build` and
`pnpm lint` from the root are always correct. Running `tsc` inside a single package after a clean
checkout is not — build its dependencies first.

## Published to npm

Five workspaces, determined at release time by `scripts/list-publishable.sh`: a package is
publishable when it is **not private and declares `publishConfig`**. There is no hard-coded list.

`instrument-bundler`, `instrument-guidelines`, `playground-url`, `runtime-v1`, `serve-instrument` —
all versioned together (`2.1.4` at time of writing, bumped by `scripts/increment-version.sh`; the
root `package.json` version can run ahead of them). Everything else is `0.0.0` and internal.

## `vendor/`

38 workspaces under `vendor/**/*`, each a thin pinned wrapper around one version of a third-party
library that instruments may import — `react@18.x`, `react@19.x`, `jspsych@7.x`, `jspsych@8.x`,
`zod@3.x`, `zod@3.23.x`, the `@jspsych/plugin-*` set, and so on.

- The **package name mangles the version**: directory `vendor/jspsych@8.x` is package `jspsych__8.x`.
  Dependents write `"jspsych__8.x": "workspace:*"`, or alias it, as `playground-url` does with
  `"zod": "workspace:zod__3.x@*"`.
- Each wrapper's `exports` point at hand-written files under its own `src/` — usually `index.js` +
  `index.d.ts` re-exporting the real dependency by name, sometimes only a stylesheet
  (`normalize.css@8.x`).
- **`vendor/**/\*`is excluded from`tsconfig.base.json`,\*\* so these are not typechecked with the rest
  of the repo.
- `runtime/v1` depends on all of them as `devDependencies` and is what turns them into the
  published runtime; many other workspaces alias individual wrappers under the real name
  (`"zod": "workspace:zod__3.x@*"`, `"react": "workspace:react__19.x@*"`) in their `dependencies`.

Adding one: `.agents/docs/playbooks/add-vendor-package.md`.

## Non-workspace directories

| Directory  | What it is                                                                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cli/`     | `odc-cli`, a single self-contained Python 3 script (`login`, `status`, `set-url`, and CRUD over instrument/subject records). Not a workspace, no `package.json`, not covered by `pnpm lint` or the TS toolchain.                                                   |
| `docs/`    | User documentation, `docs/en` and `docs/fr`. **Symlinked into `apps/outreach/src/content/docs/{en,fr}/docs`** and rendered by Astro Starlight — edit here, not in `apps/outreach`.                                                                                 |
| `blog/`    | Blog posts, flat `.md`. **Symlinked to `apps/outreach/src/content/blog`.** Frontmatter is validated by the `blog` collection schema in `apps/outreach/src/content/config.ts`, whose `author` field is a `reference('team')` into `apps/outreach/src/content/team`. |
| `.agents/` | Agent-facing documentation (`.agents/docs`) and skills (`.agents/skills`). Not shipped, not linted.                                                                                                                                                                |
| `scripts/` | Repo shell scripts invoked by root `package.json` — `generate-env.sh`, `list-publishable.sh`, `increment-version.sh`, `publish.sh`, `workspace.sh` and others.                                                                                                     |
