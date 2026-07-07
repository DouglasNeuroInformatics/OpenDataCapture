# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Open Data Capture is an electronic data capture platform for administering remote and in-person clinical instruments. It's a pnpm/Turborepo monorepo written in TypeScript.

## Commands

Package manager is pnpm (>=10). Node >= v24.15.0 (see `.nvmrc`, currently `lts/krypton`).

```sh
pnpm install                # install deps
pnpm dev                    # run core apps (api, gateway, web) via turbo
pnpm build                  # turbo build (all packages/apps)
pnpm lint                   # turbo lint (tsc + eslint per package)
pnpm format                 # turbo format (prettier per package)
pnpm test                   # run vitest across the whole workspace (root vitest.config.ts references apps/*/vitest.config.ts and
```

Run a single test file with vitest directly, e.g. `pnpm exec vitest apps/api/src/auth/__tests__/ability.factory.test.ts`. Each app/package has its own `vitest.config.ts` (a vitest "project") that extends the root config; scope a run to one project with `pnpm exec vitest --project api` (project names match the `name` field in that config, e.g. `api`).

Per-package scripts (run from repo root via turbo filters, or `cd` into the package): `build`, `dev`, `lint` (`tsc && eslint --fix src`), `format`, `test`. Use `pnpm --filter @opendatacapture/<pkg> <script>` or turbo's `--filter=<pkg>` to target one workspace package.

`apps/web` uses TanStack Router with a generated `src/route-tree.ts`. **Do not run the route-tree generator yourself** — the user runs it manually after route changes.

## Architecture

### Workspace layout

- `apps/api` — NestJS backend, built on `@douglasneuroinformatics/libnest` (custom Nest wrapper: `libnest.config.ts`, `libnest dev`/`libnest build`).
- `apps/gateway` — SSR app that lets patients self-administer remote assignments.
- `apps/outreach` — Astro marketing/docs-adjacent site.
- `apps/playground` — in-browser instrument build/edit environment (WebAssembly-based bundling).
- `apps/web` — the main clinician-facing React SPA.
- `packages/*` — shared libraries published under `@opendatacapture/*` and consumed via `workspace:*`:
  - `demo` — seed data (demo groups/users) used to populate demo instances.
  - `instrument-bundler` — compiles/bundles instrument source (TS/JS) into runtime-loadable bundles via a parse/transform/resolve/preprocess pipeline.
  - `instrument-guidelines` — instrument-authoring guidelines written to be read by an AI coding agent.
  - `instrument-interpreter` — evaluates a bundled instrument at runtime and validates it against the instrument schemas.
  - `instrument-library` — a built-in catalog of ready-made instruments (forms, interactive tasks, series, file instruments).
  - `instrument-stubs` — minimal stub instrument implementations used for testing/examples.
  - `instrument-utils` — shared helpers for working with instrument definitions (forms, guards, measures, translation).
  - `licenses` — license metadata (SPDX + custom) used for license selection/display.
  - `playground-url` — encodes/decodes shareable playground URLs and editor file state.
  - `react-core` — shared React components/hooks used across web and gateway (branding, error boundaries, instrument renderer, etc.).
  - `release-info` — resolves build/release metadata (version, git branch, commit) at build time.
  - `runtime-bundler` — bundles the instrument runtime (i.e., shared libraries that instruments can use) itself (distinct from `instrument-bundler`, which bundles instrument code).
  - `runtime-core` — public runtime types/constants/definitions (`defineInstrument`, i18n, notifications) shared by instrument authors and consumers.
  - `runtime-internal` — internal runtime execution primitives (e.g. interactive-task iframe/worker bootstrap) not meant for direct consumption.
  - `runtime-meta` — runtime metadata used to describe/version the runtime.
  - `schemas` — Zod schemas/types shared across apps and packages, organized by domain (`src/instrument`, `src/auth`, `src/group`, `src/subject`, etc.); the source of truth for cross-cutting types.
  - `serve-instrument` — CLI/server for previewing a single instrument locally outside the full app.
  - `subject-utils` — subject identification helpers (e.g. deriving/hashing clinical subject IDs).
  - `vite-plugin-runtime` — Vite plugin that wires the instrument runtime into an app's build.
- `runtime/v1` — versioned instrument runtime package (imported by the API as `@opendatacapture/runtime-v1` and resolved at `#runtime/v1` for virtualized instrument execution).
- `cli/` — standalone CLI for making requests to the API.
- `testing/` — end-to-end tests.
- `storybook/` — shared Storybook config.

## Conventions

- Make small, incremental, easily reviewable changes — avoid sweeping refactors unless explicitly requested.
- Favor type safety over convenience; avoid type casting unless necessary. Never silently swallow errors.
- No new dependencies without approval.
- Prefer descriptive variable names over terse or cryptic ones.
- Avoid excessive comments; don't comment obvious behavior. Use comments only to explain non-obvious behavior or pitfalls.
- Once all changes are complete, run `pnpm lint` and `pnpm test` from the repo root to verify them.
