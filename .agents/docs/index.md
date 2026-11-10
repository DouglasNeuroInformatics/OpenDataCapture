# Where to look

Read the `AGENTS.md` in the directory you are editing; each covers only that workspace. New here?
`.agents/docs/playbooks/run-locally.md`, then `.agents/docs/workspace-map.md`.

| Working on                                      | Read first                              |
| ----------------------------------------------- | --------------------------------------- |
| Clinician-facing React SPA                      | `apps/web/AGENTS.md`                    |
| NestJS backend                                  | `apps/api/AGENTS.md`                    |
| Patient-facing SSR app for remote assignments   | `apps/gateway/AGENTS.md`                |
| In-browser instrument editor                    | `apps/playground/AGENTS.md`             |
| Marketing site and user docs                    | `apps/outreach/AGENTS.md`               |
| Shared Zod schemas / cross-tier contracts       | `packages/schemas/AGENTS.md`            |
| Compiling instrument source into bundles        | `packages/instrument-bundler/AGENTS.md` |
| Building the library catalog instruments import | `packages/runtime-bundler/AGENTS.md`    |
| The `defineInstrument` public API               | `packages/runtime-core/AGENTS.md`       |
| Adding or editing a built-in instrument         | `packages/instrument-library/AGENTS.md` |
| Pinned library wrappers instruments import      | `vendor/AGENTS.md`                      |
| The published runtime artifact                  | `runtime/v1/AGENTS.md`                  |
| End-to-end tests                                | `testing/AGENTS.md`                     |
| User documentation                              | `docs/AGENTS.md`                        |

Every other workspace has its own `AGENTS.md` too — check the directory before assuming there
isn't one.

> **`packages/instrument-guidelines/AGENTS.md` is not this repo's conventions.** Its bin installs it
> into _external_ instrument repositories as their `AGENTS.md`, so it is the specification for
> authoring an instrument and a published npm package: treat a change there as a release, and keep
> Open Data Capture repo rules out of it.

## Deeper reference, read on demand

| Topic                                                           | Path                                                |
| --------------------------------------------------------------- | --------------------------------------------------- |
| Which workspace depends on which, what is built, what publishes | `.agents/docs/workspace-map.md`                     |
| The 11 `@douglasneuroinformatics/*` packages this repo consumes | `.agents/docs/packages/index.md`                    |
| Instrument source → bundle → store → interpret → render         | `.agents/docs/architecture/instrument-pipeline.md`  |
| The six similarly-named `runtime-*` things, and `vendor/`       | `.agents/docs/architecture/runtime-and-vendor.md`   |
| CASL, `@RouteAccess`, and group scoping                         | `.agents/docs/architecture/auth-and-permissions.md` |
| What is tested where, and what CI gates                         | `.agents/docs/architecture/testing-strategy.md`     |

## Step-by-step playbooks

Follow these in full. Each covers a task where **skipping a step compiles cleanly and fails at
runtime**.

| Task                                   | Playbook                                          |
| -------------------------------------- | ------------------------------------------------- |
| Add an API endpoint                    | `.agents/docs/playbooks/add-api-endpoint.md`      |
| Add a route to `apps/web`              | `.agents/docs/playbooks/add-web-route.md`         |
| Add a data-fetching hook to `apps/web` | `.agents/docs/playbooks/add-web-data-hook.md`     |
| Add an end-to-end test                 | `.agents/docs/playbooks/add-e2e-test.md`          |
| Add a built-in instrument              | `.agents/docs/playbooks/add-instrument.md`        |
| Add a vendored library for instruments | `.agents/docs/playbooks/add-vendor-package.md`    |
| Add an environment variable            | `.agents/docs/playbooks/add-env-var.md`           |
| Add a blog post                        | `.agents/docs/playbooks/add-blog-post.md`         |
| Run the stack on a fresh clone         | `.agents/docs/playbooks/run-locally.md`           |
| Cut a release                          | `.agents/docs/playbooks/cut-a-release.md`         |
| Add a vitest project to a package      | `.agents/docs/playbooks/add-vitest-project.md`    |
| Promote a component to react-core      | `.agents/docs/playbooks/promote-to-react-core.md` |
