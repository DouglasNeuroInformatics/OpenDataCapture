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
pnpm lint                   # turbo lint — this is `tsc && eslint --fix src` per package
pnpm format                 # turbo format (prettier per package)
pnpm test                   # vitest across the workspace
pnpm test:e2e               # playwright, in testing/
```

Scope a run to one package with `pnpm --filter @opendatacapture/<pkg> <script>` or turbo's
`--filter=<pkg>`. Scope vitest to one project with `pnpm exec vitest --project <name>` (names come
from the `name` field in each package's `vitest.config.ts`, e.g. `api`, `web`, `schemas`). Run a
single file with `pnpm exec vitest path/to/file.test.ts`.

`pnpm lint` and `pnpm test` both need `.env` to exist. `pnpm lint` also needs a generated Prisma
client, so a cold run is not fast.

## Hard rules

These apply in every directory. They are repeated here rather than only in a nested file because
not every tool loads nested files.

- **Ask before writing code if the task is ambiguous** or its stated scope cannot accomplish the
  goal.
- **No new dependencies without asking in-conversation.** Versions are pinned in the `catalog:`
  block of `pnpm-workspace.yaml` — reference `"catalog:"` in a `package.json`, never a literal
  version. `minimumReleaseAge` is 7 days, so a freshly published package will be rejected.
- **Every change needs a unit test _and_ an end-to-end test in `testing/`.** See
  `.agents/docs/playbooks/add-e2e-test.md`.
- **All frontend user-facing strings go through `useTranslation`.** Prefer inline
  `t({ en: '...', fr: '...' })` unless the string is used more than once.
- **Never run the `apps/web` route-tree generator.** `src/route-tree.ts` is generated and
  git-tracked, but the user regenerates it manually after route changes. Never hand-edit it either.
- **If code needs a comment to be understood, the code is wrong** — rewrite it. Comments are for
  the non-obvious: a vendor bug, a protocol quirk, a deliberate version pin. Never restate the code.
- **Make small, incremental, easily reviewable changes.** No sweeping refactors unless asked.
- **Never silently fail on errors.** Fail loudly on an undeclared policy.

### Before you are done

1. Run `pnpm lint`, `pnpm test`, and `pnpm test:e2e` from the repo root and fix every failure.
2. **Re-read the `AGENTS.md` of every package or app you modified and confirm your change does not
   contradict it.** If it does, either revise the change or update that `AGENTS.md` in the same
   commit — never leave the two disagreeing.

## Where to look

Read the `AGENTS.md` in the directory you are editing. Each one covers only that workspace.

| Working on                                      | Read first                                |
| ----------------------------------------------- | ----------------------------------------- |
| Clinician-facing React SPA                      | `apps/web/AGENTS.md`                      |
| NestJS backend                                  | `apps/api/AGENTS.md`                      |
| Patient-facing SSR app for remote assignments   | `apps/gateway/AGENTS.md`                  |
| In-browser instrument editor                    | `apps/playground/AGENTS.md`               |
| Marketing site and user docs                    | `apps/outreach/AGENTS.md`                 |
| Shared Zod schemas / cross-tier contracts       | `packages/schemas/AGENTS.md`              |
| Compiling instrument source into bundles        | `packages/instrument-bundler/AGENTS.md`   |
| Building the library catalog instruments import | `packages/runtime-bundler/AGENTS.md`      |
| The `defineInstrument` public API               | `packages/runtime-core/AGENTS.md`         |
| Adding or editing a built-in instrument         | `packages/instrument-library/AGENTS.md`   |
| Pinned library wrappers instruments import      | `vendor/AGENTS.md`                        |
| The published runtime artifact                  | `runtime/v1/AGENTS.md`                    |
| End-to-end tests                                | `testing/AGENTS.md`                       |
| User documentation                              | `docs/AGENTS.md`                          |
| Blog posts                                      | `.agents/docs/playbooks/add-blog-post.md` |

Every other workspace has its own `AGENTS.md` too — check the directory before assuming there
isn't one.

> **`packages/instrument-guidelines/AGENTS.md` is the one exception.** It is not this repo's
> conventions: it is a published npm artifact (`@opendatacapture/instrument-guidelines`) whose bin
> installs it into _external_ instrument repositories as their `AGENTS.md`. Read it as the
> specification for authoring an instrument. Editing it changes a published package, so treat any
> change there as a release, and do not add Open Data Capture repo rules to it.

### Deeper reference, read on demand

| Topic                                                           | Path                                                |
| --------------------------------------------------------------- | --------------------------------------------------- |
| What every workspace is and how they depend on each other       | `.agents/docs/workspace-map.md`                     |
| The 11 `@douglasneuroinformatics/*` packages this repo consumes | `.agents/docs/packages/index.md`                    |
| Instrument source → bundle → store → interpret → render         | `.agents/docs/architecture/instrument-pipeline.md`  |
| The six similarly-named `runtime-*` things, and `vendor/`       | `.agents/docs/architecture/runtime-and-vendor.md`   |
| CASL, `@RouteAccess`, and group scoping                         | `.agents/docs/architecture/auth-and-permissions.md` |
| What is tested where, and what CI gates                         | `.agents/docs/architecture/testing-strategy.md`     |

### Step-by-step playbooks

Follow these in full. Each covers a task where **skipping a step compiles cleanly and fails at
runtime**.

| Task                                   | Playbook                                       |
| -------------------------------------- | ---------------------------------------------- |
| Add an API endpoint                    | `.agents/docs/playbooks/add-api-endpoint.md`   |
| Add a route to `apps/web`              | `.agents/docs/playbooks/add-web-route.md`      |
| Add a data-fetching hook to `apps/web` | `.agents/docs/playbooks/add-web-data-hook.md`  |
| Add an end-to-end test                 | `.agents/docs/playbooks/add-e2e-test.md`       |
| Add a built-in instrument              | `.agents/docs/playbooks/add-instrument.md`     |
| Add a vendored library for instruments | `.agents/docs/playbooks/add-vendor-package.md` |
| Add an environment variable            | `.agents/docs/playbooks/add-env-var.md`        |
| Add a blog post                        | `.agents/docs/playbooks/add-blog-post.md`      |

## Internal DNP packages

This repo depends on 11 `@douglasneuroinformatics/*` packages, maintained in separate repos and
consumed from npm: `eslint-config`, `prettier-config`, `tsconfig`, `esbuild-plugin-prisma`, `libjs`,
`libcrypto`, `libnest`, `libpasswd`, `libstats`, `libui-form-types`, `libui`.

**Check `.agents/docs/packages/index.md` before writing utility, crypto, stats, form-typing or UI
code from scratch, or before adding a third-party dependency** — one of these probably already
solves it. Most publish their original TypeScript under `src/` in `node_modules`; read that instead
of guessing at a signature.

## What good code looks like here

Each principle applies where its problem exists. Machinery without its justifying problem is
ceremony, and ceremony is worse than plain code.

- **Correctness is structural, not vigilant.** A correct system is one where the invalid state
  cannot be written, not one where a careful person catches it. Anything a human must remember, the
  compiler should remember instead.
- **One source of truth; everything derived.** A contract exists once; types, variants and fixtures
  flow from it. Two artifacts that must agree is a bug waiting for its trigger.
- **Strict validation at the boundary, trust inside.** Data is distrusted exactly once — at the
  perimeter — then the interior runs clean, with no defensive re-checking cluttering the logic.
- **Shape is never repeated.** Shared structure gets abstracted, with types before runtime
  indirection, so change propagates instead of being replicated.
- **Names and types carry all meaning.** Guards first, success path flat, reading top to bottom.
- Prefer descriptive variable names over terse or cryptic ones.

## Conventions

Define Zod schemas for data validation; derive types via `z.infer`. Convention: `$`-prefixed schema,
same-named inferred type, type declared first:

```ts
export type Entity = z.infer<typeof $Entity>;
export const $Entity = z.object({ ... });
```

Variants are composed from a base shape, never written from scratch. Schemas exist only for data
actually parsed at a perimeter; everything else is a plain type. See `packages/schemas/AGENTS.md`.

**Types.** Strict mode; no casting at call sites. No loose records where a closed key set is known;
if only a subset of keys is known, type those and add an index signature. Type safety takes
precedence over convenience.

Use conditional types, template literal types, inference extraction and mapped types as routine
tools to keep call sites short and fully inferred. Concentrate the cost: complex type machinery
belongs in a small number of utilities, never spread across ordinary code.

Name generics with a `T` prefix and a PascalCase noun describing the parameter's role — `TValue`,
`TError`. The prefix distinguishes a type parameter from a concrete type at a glance; the noun
explains it.

**Formatting is not your problem.** `eslint --fix` and prettier run as part of `pnpm lint` and
`pnpm format`. In particular `perfectionist/sort-objects` alphabetizes every object literal and
`import/exports-last` moves exports to the bottom — write code in a sensible order and let the
tooling rearrange it. Where ordering is load-bearing, the existing code carries an explicit
`eslint-disable` comment; follow that pattern rather than fighting the rule.

**Tests.** Keep test bodies short; each verifies one behavior. Descriptions are concise, grammatical
sentences stating the behavioral reason, e.g. `'should key the cache on every parameter, so paging
does not serve a stale page'`.
