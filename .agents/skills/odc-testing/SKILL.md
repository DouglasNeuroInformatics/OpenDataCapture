---
name: odc-testing
description: Test a change in Open Data Capture. Use when adding a unit test or a Playwright e2e test, when a package has no vitest.config.ts of its own, when a suite passes without executing your test, or when vitest reports "No projects matched the filter". tdd supplies the red-green method; a one-off manual check in the browser is agent-browser's job.
---

A test file is worth nothing until it is **collected** — an uncollected file reports the behaviour as
covered and never runs. This repo's collection mechanism fails silently, so nothing below is
finished on a green run alone.

## The package may have no unit tier at all

**A workspace with no `vitest.config.ts` of its own contributes no project**, so a test file dropped
into `packages/react-core` or `apps/gateway` today is collected by nothing, reported by nothing, and
passes CI green, with no error to search for. `.agents/docs/architecture/testing-strategy.md` holds
the table of which packages have a project and which do not; check it before you write the file.

When yours is not in that table, read that package's own `AGENTS.md` §Tests first: several
workspaces are end-to-end-only by design and say so — `packages/instrument-library` (whose
`.agents/docs/playbooks/add-instrument.md` step 7 makes the e2e test the whole answer),
`apps/gateway`, and `packages/react-core` ("**if** a change warrants a unit test"). Where this one
does, `.agents/docs/playbooks/add-vitest-project.md` is the ordering; for a package that renders
React it adds a `happy-dom` devDependency, which the root hard rule says to confirm in-conversation
before writing.

**Done when** the package appears in that table, or its `AGENTS.md` puts the unit tier out of scope
and the e2e test carries the change, or this change adds its `vitest.config.ts`.

## Choose the tier before you choose the file

| What you changed                                        | The tier that can prove it                 | Runner          |
| ------------------------------------------------------- | ------------------------------------------ | --------------- |
| A pure function, a schema, a hook, a rendered component | Unit, in that package's own project        | `pnpm test`     |
| Who can see or do what; anything reading real rows      | End-to-end only                            | `pnpm test:e2e` |
| A type contract — inference, a discriminated union      | The type-check, which is `tsc` inside lint | `pnpm lint`     |

**There is no integration tier, and the middle row is why.** `apps/api` unit tests mock the Prisma
layer entirely (`apps/api/src/groups/__tests__/groups.service.spec.ts`), so the only code path
exercised against a database is Playwright: a permissions or scoping change that a green unit suite
appears to cover has not been tested at all. The type-check tier has no file of its own — a type
that must hold is asserted by code that would not compile if it broke.

**Done when** you can name the unit file and the e2e spec this change needs, or state which row of
this table makes one of them inapplicable.

## Make the run name your file

A green vitest run reports counts only — `Test Files … passed` names no file, so it is not evidence
that yours was collected. The listing is:

```sh
pnpm exec vitest list --filesOnly            # every collected file, each prefixed [<project>]
pnpm exec vitest list --filesOnly --project <name>
```

Run both from the repo root. The `name` that `--project` takes is the `name` field inside that
package's config, not always its directory; `.agents/docs/playbooks/add-vitest-project.md` decodes
`Error: No projects matched the filter "<name>"`.

Then invert one assertion and watch it go red before you restore it. If a suite stays green past
this point with the code deliberately wrong, `.agents/skills/odc-debugging/SKILL.md` is the symptom
index.

**Done when** `list --filesOnly` has printed your file under its project name and you have watched
that file fail on purpose.

## What the unit environment gives you

Open `.agents/docs/architecture/testing-strategy.md` before writing the file: §Test environment says
what is not arranged for you, and §Conventions by package names the canonical test to copy for your
package. Two things it does not carry:

- **`.env` must exist.** `pnpm test` is `env-cmd vitest` — no turbo task, no build, no database —
  and `env-cmd` exits before vitest starts when `.env` is absent.
- **happy-dom, which `apps/web` runs under, computes no layout**: `getBoundingClientRect` and
  `offsetWidth` return 0, so assert on rendered content, never on geometry or visibility. happy-dom
  ≥ 20 supplies its own no-op `ResizeObserver`, so the stub in
  `apps/web/src/__tests__/data-table-server-mode.test.tsx` never assigns — copying it buys nothing,
  whatever `apps/web/AGENTS.md` §Tests still says about needing one.

Writing a component test under `apps/web`? That same §Tests adds the `@/services/i18n` side-effect
import libui controls need.

## End-to-end tests

`.agents/docs/playbooks/add-e2e-test.md` is the order of operations; read `testing/AGENTS.md` before
its step 1, because two of the conventions there decide whether the spec is real: the
`{ expect, test }` import from `../support/fixtures`, and naming every seeded record with the
`uniqueId` fixture. A raw `@playwright/test` import fails loudly once the spec destructures a repo
fixture, and silently when it takes `{ page }` alone — that page is never authenticated. A fixed
seed name is silent always: it passes alone and collides under `fullyParallel`.

**Done when** `pnpm --filter @opendatacapture/testing test:e2e --list src/specs/<file>.spec.ts` has
printed your test titles under `[chromium]`, and you have watched one of them fail on purpose.

## Pushing proves nothing

CI fires on a `pull_request` to `main` and on `workflow_dispatch`, never on a push
(`.agents/docs/architecture/testing-strategy.md` §What CI gates), so until that PR exists the run
you did locally is the only one there has been. Run `.agents/skills/odc-done/SKILL.md` before you
open it — that is the sweep that re-runs lint, unit and e2e together.
