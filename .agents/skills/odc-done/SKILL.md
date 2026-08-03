---
name: odc-done
description: Close out a change to Open Data Capture before committing, opening a PR, or reporting it done. Use also when another skill hands off its close-out, or when asked whether the current uncommitted change is ready to merge — an already-opened PR is review-pr's job.
---

If you are still writing code, keep writing — this is the sweep for the moment the change is
finished.

**Green is not done.** Nothing downstream catches what you skip here: `.husky/pre-commit` only
formats the staged files, and CI runs on a pull request to `main`, which is after this moment
(`.agents/docs/architecture/testing-strategy.md`).

A check you cannot meet is an **exception**: one line in your reply naming the check and why. Step 8
collects them.

## 1. Lint, then read what it rewrote

```sh
pnpm lint
git status --porcelain
```

`eslint --fix` writes to disk, so a green run can hand back a tree it edited. A tree that already
conforms comes back untouched; a rewrite appears when your new code disagrees with
`perfectionist/sort-objects` or `import/exports-last`. Those rewrites are correct — read them and
keep them.

A cold run builds every dependency, generates both Prisma clients and pushes the gateway schema
(`.agents/docs/architecture/testing-strategy.md`). Slow is the expected state, not a hang.

**Done when** `pnpm lint` exits green and every path `git status` reports is one whose diff you have
read and intend to commit. TS2345 on a route literal you added is the one failure that is correct as
it stands — it clears when the user regenerates `route-tree.ts`, but only if the literal matches its
file path character-for-character (`.agents/skills/odc-web-route/SKILL.md`). Raise it as an
exception rather than editing the tree yourself.

## 2. Test, and make the run name your file

```sh
pnpm test
pnpm exec vitest list --filesOnly   # a green run prints counts only; this prints the collected files
```

A test file the listing never names was collected by nothing —
`.agents/skills/odc-testing/SKILL.md` opens on that failure and owns both the diagnosis and the fix.

**Done when** the run is green _and_ `list --filesOnly` names every test file this change added.

## 3. Run the end-to-end suite, or raise the exception

```sh
pnpm test:e2e
```

Playwright boots `apps/api`, `apps/gateway` and `apps/web` itself. The browsers must be installed
once per machine — `pnpm --filter @opendatacapture/testing exec playwright install chromium firefox`
(`.agents/docs/playbooks/add-e2e-test.md`, which also carries the single-spec and UI-mode
invocations for when you are iterating on one failure).

**Done when** the suite is green, or its exception is in your reply.

## 4. Account for both tests

Every change needs a unit test **and** an end-to-end test in `testing/` (root `AGENTS.md`).

**Done when** you can name the unit test file and the `testing/src/specs/` file this change added,
or each missing one carries its exception.

## 5. Follow the change through its second file

Each row is a pair of files that must agree, where the second is easy to leave unfinished.

| You touched                               | What must follow                                                                   | Owned by                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| a file under `apps/web/src/routes/`       | `route-tree.ts` (the user's) and `testing/src/generated/route.d.ts`                | `.agents/skills/odc-web-route/SKILL.md`        |
| a new folder under `packages/schemas/src` | its subpath in that package's `exports` — there is no `.` export                   | `packages/schemas/AGENTS.md`                   |
| a new instrument directory                | the hand-written import _and_ `create` call in `apps/api/src/demo/demo.service.ts` | `.agents/docs/playbooks/add-instrument.md`     |
| a wrapper under `vendor/`                 | `runtime/v1/package.json` devDependencies _and_ `runtime.config.js`                | `.agents/docs/playbooks/add-vendor-package.md` |
| an environment variable                   | the rest of the chain, in the playbook's order                                     | `.agents/docs/playbooks/add-env-var.md`        |
| a `packages/react-core` component         | `src/index.ts` — the barrel is the public API, there are no deep imports           | `packages/react-core/AGENTS.md`                |
| a request or response shape in `apps/api` | `cli/odc-cli`, which nothing links to the API                                      | `cli/AGENTS.md`                                |
| a new workspace or vitest project         | the tables in `workspace-map.md` and `testing-strategy.md`                         | `.agents/skills/odc-agent-docs/SKILL.md`       |

**Done when** every row whose left column matches your diff is either done or carries its exception.

## 6. If the diff touched `apps/api`, sweep every query

Open `.agents/skills/odc-api/SKILL.md` before you sweep — it carries why an omitted ability silently
returns an empty `where`, and how the guard and the `where` clause divide the work.

**Done when** every Prisma query in the diff is accounted for — each one either names
`accessibleQuery` in its `where`, or is unscoped for a reason your reply states — and every handler
calling a scoped service forwards `@CurrentUser('ability')`. Every one, not a sample.

## 7. Reconcile the AGENTS.md you contradicted

Where the change disagrees with a workspace `AGENTS.md`, `.agents/skills/odc-agent-docs/SKILL.md`
carries the house format for the edit — open it before you write.

**Done when** you have opened the `AGENTS.md` of every workspace in the diff and each one is either
consistent with the change or edited in this commit.

## 8. Say what you did not verify

Some exceptions were never a command: a row in step 5 you took on trust, a behaviour no test
exercises.

**Done when** your reply lists every exception raised above, or states that every check ran green.
