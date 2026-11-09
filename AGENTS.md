# Open Data Capture

An electronic data capture platform for administering remote and in-person clinical instruments.
It is a pnpm/Turborepo monorepo written in TypeScript: 27 first-party workspaces under `apps/`,
`packages/`, `runtime/`, `storybook/` and `testing/`, plus 38 thin version-pinned wrappers under
`vendor/` that are also workspaces.

**This file is a router, not a manual.** It holds the rules that apply everywhere; the map of where
everything else is documented is @.agents/docs/index.md. Read the `AGENTS.md` for the area you are
working in before you write code there.

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
pnpm test:coverage          # vitest with coverage — fails below 100%, the gate CI runs
pnpm test:e2e               # playwright, in testing/
pnpm check                  # lint, test:coverage and test:e2e in sequence — what "done" means
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
- **A change is not done until `.agents/skills/finishing-changes/SKILL.md` has run green.** It runs
  `pnpm check` and the checks a green run does not prove.
- **Adding a dependency follows `.agents/skills/adding-dependencies/SKILL.md`**, which starts with
  asking in-conversation.
- **Unit test coverage stays at 100%.** `pnpm test:coverage` fails below 100% statements, branches,
  functions or lines, and CI runs it. Code no test can reach is dead code: prove it dead (the types,
  the callers, the library contract) and delete it. Never widen `coverage.exclude` to get past the
  gate; that list is for non-code — fixtures, generated files and bare entrypoints.
- **All frontend user-facing strings go through `useTranslation`.** Prefer inline
  `t({ en: '...', es: '...', fr: '...' })` unless the string is used more than once.
- **Never edit an `AGENTS.md` without the user's express approval**, and keep any proposed edit as
  minimal as possible.

## Commits and pull requests

Commit messages follow Conventional Commits: `type(scope): subject`, where `type` is one of the 11
`@commitlint/config-conventional` types and `scope`, if present, is an `@opendatacapture/*`
workspace name without the prefix. A `commit-msg` hook and the `Commitlint` CI job enforce it, and
`CHANGELOG.md` is generated from the `feat`, `fix`, `perf` and breaking commits: one commit is one
entry.

Pull requests and issues go to `DouglasNeuroInformatics/OpenDataCapture`, base `main`.

## Coding Guidelines

**Principles**

- Correctness is structural, not vigilant. A correct system is one where the invalid state cannot be written, not one where a careful person catches it. Anything a human must remember, the compiler should remember instead.
- One source of truth; everything derived. Two artifacts that must agree is a bug waiting for its trigger.
- Strict data validation at the boundary, trusting inside. Data is distrusted exactly once, at the perimeter, then the interior runs clean, with no defensive re-checking cluttering the logic. The perimeter is where data arrives from outside the system's control: a request, the environment, a third-party response. What the system wrote, such as a JSON column, is inside.
- A declaration's name and type carry its meaning. When you reach for a doc comment to say what something is, returns or contains, use a more descriptive name instead. A comment explaining what code does usually means the code should be clearer. Save comments for what code can't say: facts about the outside world (a vendor bug, a protocol quirk) and navigation aids (e.g., section banners in long declaration files).
- Complexity concentrated, periphery boring. Sophistication lives in a small framework core so that ordinary code stays trivial, short, and fully inferred. Clever call sites mean the cleverness is in the wrong place.
- Never silently fail on errors. Fail loudly on an undeclared policy.

**Style**

- A name says what the thing is. A request's parameters are not its result, a container is not its content, and raw input is not parsed data. When a name is another name plus a word, that word says how the two differ.
- Name a database model or entity type as a domain noun: a thing a user would recognize, not a process.
- Prefer one general function or component to several near-duplicates. Delete code that exists only to keep variants alike.
- Match existing code of the same role. New code takes the naming, parameters and shape of the code that already does the same kind of job.

_Break any of these guidelines sooner than write anything outright barbarous._

## Conventions

Define Zod schemas for data validation; derive types via `z.infer`. Convention: `$`-prefixed schema,
same-named inferred type, type declared first:

```ts
export type Entity = z.infer<typeof $Entity>;
export const $Entity = z.object({ ... });
```

Variants are composed from a base shape, never written from scratch. Schemas exist only for data
actually parsed at a perimeter; everything else is a plain type. See `packages/schemas/AGENTS.md`.

**Types.**

Strict mode; no casting at call sites. No loose records where a closed key set is known. If only a subset of keys is known, type those keys and add an index signature. Type safety takes precedence over convenience.

Outside call sites, an assertion the lint flags (`as`, `!`) is allowed only when the fact holds for every input the exported signature admits, so no test could reach a guard for it; when the proof is code in the same function, a documented contract of the language, platform or a library, or a brand on the value's type applied where the fact is checked; and when no rewrite of similar size would remove it (e.g., having the function that produces the value return a discriminated union). Name the proof in the lint-disable reason. When the proof is a brand, a spec beside the assertion checks that the code applying it rejects the case the assertion excludes.

Advanced type-level constructs (e.g., conditional types, template literal types, inference extraction, mapped types) are a routine tool.

**Tests.** A unit test is `<file>.test.ts(x)` in a `__tests__/` folder beside the file it tests, or
in a package's `test/` folder when it drives the whole package; eslint enforces the layout
(`odc/unit-test-subject` in `.eslint/rules/`, beside the repo's other custom rules). Keep test
bodies short; each verifies one behavior. Descriptions are concise, grammatical sentences stating
the behavioral reason, e.g. `'should key the cache on every parameter, so paging does not serve a
stale page'`.
