---
name: finishing-changes
description: Close out a change to Open Data Capture before committing, opening a PR, or reporting it done — run `pnpm check`, then the checks a green run does not prove. Use also when asked whether the current uncommitted change is ready to merge; an already-opened PR is review-pr's job.
---

Nothing downstream catches a skipped check: `.husky/pre-commit` only formats staged files, and CI runs only on a
pull request. A PR with a failing check is never acceptable. A check you cannot meet is an **exception**: one
line in your reply naming it and why. A failure unrelated to your change is not yours to patch over: file it
with `.agents/skills/opening-issues/SKILL.md` and name the issue in your reply.

1. **Run `pnpm check` from the repo root** and fix every failure, a coverage shortfall included. It runs
   `pnpm lint`, `pnpm test:coverage` and `pnpm test:e2e` in sequence, so a lint failure hides the rest until it
   is fixed. `pnpm test:e2e` needs its browsers installed once per machine
   (`.agents/docs/playbooks/add-e2e-test.md`).
2. **After it, read `git status`.** `eslint --fix` rewrites as it checks; the rewrites are your own code being
   sorted, so keep them. TS2345 on a route literal you added is an exception until the user regenerates
   `route-tree.ts` (`.agents/docs/playbooks/add-web-route.md`); revert any `route-tree.ts` diff. Because that
   failure stops `pnpm check` at lint, run `pnpm test:coverage` directly and leave `pnpm test:e2e` for after
   the regeneration.
3. **Prove vitest collected your tests.** `pnpm exec vitest list --filesOnly` must name every test file the
   change added. A workspace with no `vitest.config.ts` collects nothing and still passes
   (`.agents/docs/playbooks/add-vitest-project.md`).
4. **Say what covers the change end to end.** Name the `testing/src/specs/` file that exercises it, or state
   that it is not important user-facing functionality and needs none. Add a spec only for functionality no
   existing spec reaches: the suite is kept small on purpose.
5. **Finish the second file.** Each row is a pair that must agree, where the second is easy to forget:

   | You touched                               | What must follow                                                         | Owner                                             |
   | ----------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------- |
   | a file under `apps/web/src/routes/`       | `route-tree.ts` (the user's) and `testing/src/generated/route.d.ts`      | `.agents/docs/playbooks/add-web-route.md`         |
   | a new folder under `packages/schemas/src` | its subpath in that package's `exports` — there is no `.` export         | `packages/schemas/AGENTS.md`                      |
   | a new instrument directory                | its import _and_ `create` call in `apps/api/src/demo/demo.service.ts`    | `.agents/docs/playbooks/add-instrument.md`        |
   | a wrapper under `vendor/`                 | `runtime/v1/package.json` devDependencies _and_ `runtime.config.js`      | `.agents/docs/playbooks/add-vendor-package.md`    |
   | an environment variable                   | the rest of the chain, in the playbook's order                           | `.agents/docs/playbooks/add-env-var.md`           |
   | a `packages/react-core` component         | `src/index.ts` — the barrel is the public API, there are no deep imports | `packages/react-core/AGENTS.md`                   |
   | a request or response shape in `apps/api` | `cli/odc-cli`, which nothing links to the API                            | `cli/AGENTS.md`                                   |
   | a new workspace or vitest project         | the tables in `workspace-map.md` and `testing-strategy.md`               | `.agents/skills/writing-docs-for-agents/SKILL.md` |

6. **If the diff touches `apps/api`, account for every Prisma query, not a sample**: each `where` names
   `accessibleQuery` or your reply says why it is unscoped, and every handler calling a scoped service
   forwards `@CurrentUser('ability')` (`apps/api/AGENTS.md`).
7. **Re-read the `AGENTS.md` of every package or app you modified** and confirm your change does not
   contradict it. If it does, revise the change, or propose the smallest `AGENTS.md` edit and wait for the
   user's approval (root `AGENTS.md` hard rule); `.agents/skills/writing-docs-for-agents/SKILL.md` has the house format.
8. **Before opening a PR, or pushing a follow-up that adds code to one, run
   `.agents/skills/adversarial-review/SKILL.md`** on the green branch. Fix, or decline with a reason, every confirmed finding,
   then repeat from step 1; review again only when the fixes added code beyond what the findings named.
   Then open or update the PR with `.agents/skills/opening-pr/SKILL.md`, which carries the review's
   result.

**Done when** your reply lists every exception, including any row above you took on trust, or states that
every check ran green.
