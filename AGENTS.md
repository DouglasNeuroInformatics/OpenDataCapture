# Open Data Capture

An electronic data capture platform for administering remote and in-person clinical instruments.
It is a pnpm/Turborepo monorepo written in TypeScript: 27 first-party workspaces under `apps/`,
`packages/`, `runtime/`, `storybook/` and `testing/`, plus 38 thin version-pinned wrappers under
`vendor/` that are also workspaces.

**This file is a router, not a manual.** It holds the rules that apply everywhere plus a map of
where everything else is documented. Read the `AGENTS.md` for the area you are working in before
you write code there.

## Commands

Package manager is pnpm (>=10). Node >= v24.15.0 (see `.nvmrc`, currently `lts/krypton`).

```sh
pnpm install                # install deps
pnpm generate:env           # create .env from .env.template — required before anything else runs
pnpm dev                    # run core apps (api, gateway, web) via turbo
pnpm build                  # turbo build (all packages/apps)
pnpm lint                   # turbo lint — `tsc && eslint --fix src` per package, plus lint:root for root-level scripts and configs
pnpm format                 # turbo format (prettier per package)
pnpm test                   # vitest across the workspace
pnpm test:coverage          # vitest with coverage — fails below 100%, the gate CI and "Before you are done" run
pnpm test:e2e               # playwright, in testing/
```

Everything after `pnpm generate:env` needs `.env` to exist, and a fresh clone needs more than
`pnpm install` before `pnpm dev` serves anything: `.agents/docs/playbooks/run-locally.md` is the
order of operations. Scoping a run to one package, project or file is in
`.agents/docs/architecture/testing-strategy.md`.

## Hard rules

These apply in every directory. They are repeated here rather than only in a nested file because
not every tool loads nested files.

- **Ask before writing code if the task is ambiguous** or its stated scope cannot accomplish the
  goal.
- **No new dependencies without asking in-conversation.** Check `.agents/docs/packages/index.md`
  first: one of the `@douglasneuroinformatics/*` packages this repo already consumes probably solves
  it. Versions are pinned in the `catalog:` block of `pnpm-workspace.yaml` — reference `"catalog:"`
  in a `package.json`, never a literal version. `minimumReleaseAge` is 7 days, so a freshly published
  package will be rejected.
- **Every change needs a unit test _and_ an end-to-end test in `testing/`.** See
  `.agents/docs/playbooks/add-e2e-test.md`. Utility scripts under `scripts/` and the standalone
  `cli/odc-cli` script, which has no test harness, are the exceptions and need no tests.
- **Unit test coverage stays at 100%.** `pnpm test:coverage` fails below 100% statements, branches,
  functions or lines, and CI runs it. Code no test can reach is dead code: prove it dead (the types,
  the callers, the library contract) and delete it. Never widen `coverage.exclude` to get past the
  gate; that list is for non-code — fixtures, generated files and bare entrypoints.
- **Commit messages follow Conventional Commits.** `type(scope): subject`, where `type` is one of the
  11 `@commitlint/config-conventional` types and `scope`, if present, is an `@opendatacapture/*`
  workspace name without the prefix. A `commit-msg` hook and the `Commitlint` CI job enforce it, and
  `CHANGELOG.md` is generated from the `feat`, `fix`, `perf` and breaking commits: one commit is one
  entry.
- **Pull requests and issues go to `DouglasNeuroInformatics/OpenDataCapture`, base `main`.**
  `origin` is your fork (`CONTRIBUTING.md`), so pass `--repo DouglasNeuroInformatics/OpenDataCapture`
  to `gh`.
- **All frontend user-facing strings go through `useTranslation`**, with an entry for every language
  the frontend exposes. Prefer inline `t({ en: '...', es: '...', fr: '...' })` unless the string is
  used more than once.
- **If code needs a comment to be understood, the code is wrong** — rewrite it. Comments are for
  the non-obvious: a vendor bug, a protocol quirk, a deliberate version pin. Never restate the code.
- **Make small, incremental, easily reviewable changes.** No sweeping refactors unless asked.
- **Never silently fail on errors.** Fail loudly on an undeclared policy.

### Before you are done

1. Run `pnpm lint`, `pnpm test:coverage`, and `pnpm test:e2e` from the repo root and fix every
   failure, a coverage shortfall included.
2. **Re-read the `AGENTS.md` of every package or app you modified and confirm your change does not
   contradict it.** If it does, either revise the change or update that `AGENTS.md` in the same
   commit — never leave the two disagreeing.

`.agents/skills/odc-done/SKILL.md` runs these two plus the checks a green `pnpm lint` does not
cover.

## Where to look

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

### Deeper reference, read on demand

| Topic                                                           | Path                                                |
| --------------------------------------------------------------- | --------------------------------------------------- |
| Which workspace depends on which, what is built, what publishes | `.agents/docs/workspace-map.md`                     |
| The 11 `@douglasneuroinformatics/*` packages this repo consumes | `.agents/docs/packages/index.md`                    |
| Instrument source → bundle → store → interpret → render         | `.agents/docs/architecture/instrument-pipeline.md`  |
| The six similarly-named `runtime-*` things, and `vendor/`       | `.agents/docs/architecture/runtime-and-vendor.md`   |
| CASL, `@RouteAccess`, and group scoping                         | `.agents/docs/architecture/auth-and-permissions.md` |
| What is tested where, and what CI gates                         | `.agents/docs/architecture/testing-strategy.md`     |

### Step-by-step playbooks

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

## Conventions

- **Strict validation at the boundary, trust inside.** Data is distrusted exactly once — at the
  perimeter — then the interior runs clean, with no defensive re-checking cluttering the logic.
- **One source of truth; everything derived.** A contract exists once; types, variants and fixtures
  flow from it. Two artifacts that must agree is a bug waiting for its trigger.

Define Zod schemas for data validation; derive types via `z.infer`. Convention: `$`-prefixed schema,
same-named inferred type, type declared first:

```ts
export type Entity = z.infer<typeof $Entity>;
export const $Entity = z.object({ ... });
```

Variants are composed from a base shape, never written from scratch. Schemas exist only for data
actually parsed at a perimeter; everything else is a plain type. See `packages/schemas/AGENTS.md`.

**Types.** Strict mode; no casting at call sites. No loose records where a closed key set is known;
if only a subset of keys is known, type those and add an index signature.

**Formatting is not your problem.** `pnpm lint` runs `eslint --fix` and prettier, so write code in a
sensible order and let the tooling sort objects and move exports. Where ordering is load-bearing,
the existing code carries an `eslint-disable` comment with its reason after `--`; follow that pattern
rather than fighting the rule.

**Tests.** A unit test is `<file>.test.ts(x)` in a `__tests__/` folder beside the file it tests, or
in a package's `test/` folder when it drives the whole package; eslint enforces the layout
(`odc/unit-test-subject` in `.eslint/rules/`, beside the repo's other custom rules). Keep test
bodies short; each verifies one behavior. Descriptions are concise, grammatical sentences stating
the behavioral reason, e.g. `'should key the cache on every parameter, so paging does not serve a
stale page'`.
