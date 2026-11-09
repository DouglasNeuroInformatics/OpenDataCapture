# Workspace map

What each package is, who depends on it, which packages must be built before anything can import
them, and which are published. Everything else about a workspace is in its own `AGENTS.md`.

Workspaces are the globs in `pnpm-workspace.yaml`: `apps/*`, `packages/*`, `runtime/*`,
`storybook`, `testing` and `vendor/**/*`. A directory under one of them becomes a workspace as soon
as it has a `package.json`. `pnpm ls -r --depth -1` lists them all.

## Who depends on what

The five `apps/*`, `storybook` and `testing` are leaves: no workspace depends on them. The root
"Where to look" table describes the apps. "Used by" below lists first-party consumers only.

| Workspace                   | What it is                                                                                                                | Used by                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `demo`                      | Seed data (groups, users) for demo instances                                                                              | api, web                                                                                                                                      |
| `instrument-bundler`        | Compiles instrument source into runtime-loadable bundles                                                                  | api, instrument-library, playground, react-core, serve-instrument                                                                             |
| `instrument-guidelines`     | The instrument-authoring `AGENTS.md` that its `bin` installs into external repos                                          | nothing (published)                                                                                                                           |
| `instrument-interpreter`    | Evaluates a bundled instrument and validates it against the schemas                                                       | react-core, web                                                                                                                               |
| `instrument-library`        | The built-in instrument catalog                                                                                           | api                                                                                                                                           |
| `instrument-stubs`          | Minimal stub instruments for tests                                                                                        | react-core, schemas, web                                                                                                                      |
| `instrument-utils`          | Helpers for working with instrument definitions                                                                           | api, react-core, web                                                                                                                          |
| `licenses`                  | SPDX and custom license metadata                                                                                          | outreach, runtime-core, runtime-v1, schemas, web                                                                                              |
| `playground-url`            | Encodes and decodes shareable playground URLs                                                                             | playground, testing                                                                                                                           |
| `react-core`                | Components and hooks shared by more than one frontend                                                                     | gateway, playground, serve-instrument, storybook, web                                                                                         |
| `release-info`              | Resolves version, branch and commit at build time                                                                         | api, gateway, web                                                                                                                             |
| `runtime-bundler`           | The `runtime-bundler` bin that builds `runtime/v1`                                                                        | runtime-v1                                                                                                                                    |
| `runtime-core`              | The public instrument API (`defineInstrument`)                                                                            | api, instrument-interpreter, instrument-stubs, instrument-utils, outreach, react-core, runtime-v1, schemas, web                               |
| `runtime-internal`          | Instrument execution primitives (interactive-task iframe and worker bootstrap)                                            | instrument-bundler, instrument-interpreter, runtime-v1, serve-instrument, subject-utils                                                       |
| `runtime-meta`              | The runtime version list and per-version asset manifest types                                                             | outreach, serve-instrument, vite-plugin-runtime                                                                                               |
| `schemas`                   | Zod schemas shared across tiers                                                                                           | api, demo, gateway, instrument-interpreter, instrument-utils, outreach, playground, react-core, release-info, subject-utils, testing, web     |
| `serve-instrument`          | CLI that previews one instrument outside the app                                                                          | nothing (published)                                                                                                                           |
| `subject-utils`             | Derives and hashes subject identifiers                                                                                    | api, react-core, web                                                                                                                          |
| `vite-plugin-runtime`       | Vite plugin that wires the runtime into an app build                                                                      | gateway, playground, storybook, web                                                                                                           |
| `runtime/v1` (`runtime-v1`) | The versioned runtime that instruments import, built from every `vendor/*` wrapper plus runtime-core and runtime-internal | api, gateway, instrument-bundler, instrument-library, outreach, playground, react-core, serve-instrument, storybook, vite-plugin-runtime, web |

`vendor/` holds the version-pinned library wrappers that instruments import. `runtime/v1` depends on
all of them. See `vendor/AGENTS.md`.

The root `vitest.config.ts` collects projects only from `apps/*`, `packages/*` and `runtime/*`, so
a `vitest.config.ts` placed in `storybook/` or `testing/` never runs.

## Built vs source-only

Most packages have no `build` script. Their `exports` point at `src/`, the consumer compiles it,
and a change is visible immediately. The exceptions:

- **`instrument-library`, `runtime-core` and `runtime/v1`** export only build output (`dist`,
  `lib`). Nothing can import them until they have been built.
- **`playground-url` and `serve-instrument`** build only their `bin`. `playground-url`'s library
  export is still source. `serve-instrument` has no `exports` at all.

Turbo's `build`, `lint`, `dev` and `test:e2e` tasks depend on `^build`, so `pnpm build` and
`pnpm lint` from the root are always correct. Running `tsc` inside one package after a clean
checkout is not, and `pnpm test` builds nothing.

## Published to npm

`scripts/list-publishable.sh` decides at release time: a workspace is published when it is not
`private` and declares `publishConfig`. Today that is `instrument-bundler`,
`instrument-guidelines`, `playground-url`, `runtime-v1` and `serve-instrument`.
`scripts/increment-version.ts` gives them all the same version. Every other workspace stays at
`0.0.0`. For the release procedure, see `.agents/docs/playbooks/cut-a-release.md`.

## Directories that are not workspaces

| Directory  | What it is                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------- |
| `cli/`     | `odc-cli`, a self-contained Python 3 script with no `package.json`, outside the TS toolchain |
| `docs/`    | User documentation, symlinked into `apps/outreach` (see `apps/outreach/AGENTS.md`)           |
| `blog/`    | Blog posts, symlinked into `apps/outreach` (see `.agents/docs/playbooks/add-blog-post.md`)   |
| `scripts/` | Scripts that root `package.json` runs or that are invoked by path. Untested by decision      |
| `.agents/` | Agent documentation and skills                                                               |
