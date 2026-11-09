---
name: odc-done
description: Close out a change to Open Data Capture before committing, opening a PR, or reporting it done — the checks beyond root AGENTS.md "Before you are done". Use also when asked whether the current uncommitted change is ready to merge; an already-opened PR is review-pr's job.
---

Run root `AGENTS.md` "Before you are done" first; this adds what a green run does not prove. Nothing
downstream catches a skipped check: `.husky/pre-commit` only formats staged files, and CI runs only on a pull
request. A check you cannot meet is an **exception**: one line in your reply naming it and why.

1. **After `pnpm lint`, read `git status`.** `eslint --fix` rewrites as it checks; the rewrites are your own
   code being sorted, so keep them. TS2345 on a route literal you added is an exception until the user
   regenerates `route-tree.ts` (`.agents/docs/playbooks/add-web-route.md`); revert any `route-tree.ts` diff.
2. **Prove vitest collected your tests.** `pnpm exec vitest list --filesOnly` must name every test file the
   change added. A workspace with no `vitest.config.ts` collects nothing and still passes
   (`.agents/docs/playbooks/add-vitest-project.md`).
3. **Name both tests** — the unit test file and the `testing/src/specs/` file — or the exception for each.
   `pnpm test:e2e` needs its browsers installed once per machine (`.agents/docs/playbooks/add-e2e-test.md`).
4. **Finish the second file.** Each row is a pair that must agree, where the second is easy to forget:

   | You touched                               | What must follow                                                         | Owner                                          |
   | ----------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------- |
   | a file under `apps/web/src/routes/`       | `route-tree.ts` (the user's) and `testing/src/generated/route.d.ts`      | `.agents/docs/playbooks/add-web-route.md`      |
   | a new folder under `packages/schemas/src` | its subpath in that package's `exports` — there is no `.` export         | `packages/schemas/AGENTS.md`                   |
   | a new instrument directory                | its import _and_ `create` call in `apps/api/src/demo/demo.service.ts`    | `.agents/docs/playbooks/add-instrument.md`     |
   | a wrapper under `vendor/`                 | `runtime/v1/package.json` devDependencies _and_ `runtime.config.js`      | `.agents/docs/playbooks/add-vendor-package.md` |
   | an environment variable                   | the rest of the chain, in the playbook's order                           | `.agents/docs/playbooks/add-env-var.md`        |
   | a `packages/react-core` component         | `src/index.ts` — the barrel is the public API, there are no deep imports | `packages/react-core/AGENTS.md`                |
   | a request or response shape in `apps/api` | `cli/odc-cli`, which nothing links to the API                            | `cli/AGENTS.md`                                |
   | a new workspace or vitest project         | the tables in `workspace-map.md` and `testing-strategy.md`               | `.agents/skills/odc-agent-docs/SKILL.md`       |

5. **If the diff touches `apps/api`, account for every Prisma query, not a sample**: each `where` names
   `accessibleQuery` or your reply says why it is unscoped, and every handler calling a scoped service
   forwards `@CurrentUser('ability')` (`apps/api/AGENTS.md`).
6. **Fixing a contradicted `AGENTS.md`?** `.agents/skills/odc-agent-docs/SKILL.md` has the house format.

**Done when** your reply lists every exception, including any row above you took on trust, or states that
every check ran green.
