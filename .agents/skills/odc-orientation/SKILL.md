---
name: odc-orientation
description: The reading order for Open Data Capture — what to run first, which docs to open in what order, and every repo skill in one place.
disable-model-invocation: true
---

Root `AGENTS.md` is already in context and says where everything is documented. This file adds the
two things it cannot: the **order** to read it in, and the index of skills.

## The reading order

1. **Bring the stack up before you read anything else** — `.agents/skills/odc-run-locally/SKILL.md`.
   Nothing here is verifiable until a dev server serves, four prerequisites have to hold first, and
   each one fails as a decoy that names something other than itself. A cold checkout that looks
   broken is usually a checkout that has never run `pnpm build`.

2. **Learn which workspace owns the change** — `.agents/docs/workspace-map.md`. The "Where to look"
   table in root `AGENTS.md` sends you to the right `AGENTS.md` once you know the area; the map is
   what tells you which of the 27 first-party workspaces — and which of six similarly-named
   `runtime-*` packages — the change belongs in before you open one.

3. **Learn what is checked and what is not** — `.agents/docs/architecture/testing-strategy.md`. Green
   carries less information here than in most repos: the only type-check is the `tsc` inside
   `pnpm lint`, several workspaces contribute no vitest project at all, and CI fires on a pull
   request rather than on a push. Read this before you trust a passing run.

4. **Read the failures once, cold** — `.agents/skills/odc-debugging/SKILL.md`. It is a symptom index,
   and an index earns its keep only when you have seen the rows before you need them. The three that
   cost the most are below.

5. **Then, per change: skill → playbook → workspace `AGENTS.md` → `.agents/skills/odc-done/SKILL.md`.**
   Four files, four different jobs — the skill carries the trap, the playbook the order of
   operations, the `AGENTS.md` the conventions, and `odc-done` the close-out. Skipping any one of
   them still compiles, which is why the order is written down.

## Three landmines

- **An omitted ability reads every group's rows.** `accessibleQuery(undefined, …)` returns `{}` — an
  empty Prisma `where` — and no compiler, eslint rule or unit test stands behind it
  (`.agents/skills/odc-api/SKILL.md`).
- **A test file in a workspace with no `vitest.config.ts` is collected by nothing.** It reports the
  behaviour as covered, names no error, and passes CI green
  (`.agents/skills/odc-testing/SKILL.md`).
- **TS2345 on a route literal you just wrote is the correct state**, not a defect to chase:
  `route-tree.ts` is generated and git-tracked, and the user regenerates it
  (`.agents/skills/odc-web-route/SKILL.md`).

Those three recur. `.agents/skills/odc-debugging/SKILL.md` keys roughly twenty more to the symptom
actually in front of you, and names the file that owns each fix.

## Every skill in this repo

Each lives at `.agents/skills/<name>/SKILL.md`. The third column is there because the near-miss is
the expensive mistake: the wrong skill answers truthfully, just not the question you asked.

| Skill                  | Reach for it when                                                                                                                  | Not this                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `odc-run-locally`      | Bringing the stack up, a fresh clone, or a dev server that dies at startup                                                         | Not a failure that happens after the server serves — `odc-debugging`                              |
| `odc-debugging`        | A failing build, lint, test or e2e run; a change with no visible effect; a suite that stays green after you broke the code         | Not a method — it is this repo's symptoms, each keyed to the file that owns the fix               |
| `odc-api`              | `apps/api` — an endpoint, a `@RouteAccess` value, `accessibleQuery` scoping, a Prisma model — and an environment variable anywhere | Not the permission model itself — `.agents/docs/architecture/auth-and-permissions.md`             |
| `odc-web-route`        | A file under `apps/web/src/routes`, its loader, or the query hook it prefetches                                                    | Not the components the page renders — `odc-frontend`                                              |
| `odc-frontend`         | React UI in `apps/web`, `apps/gateway` or `packages/react-core`: a component, its strings, its story, its promotion to react-core  | Not the route file that renders the component — `odc-web-route`                                   |
| `odc-testing`          | Choosing the tier, placing the test file, and proving the run collected it                                                         | Not how to drive a change test-first — `tdd`                                                      |
| `odc-instruments`      | Instruments, the wrappers under `vendor/`, and the runtime workspaces they are served from                                         | Not the rules for authoring an instrument definition — `packages/instrument-guidelines/AGENTS.md` |
| `odc-release`          | Bumping the version, publishing npm and the images, tagging — or a merge to `main` that produced no release                        | Not what CI gates in general — `.agents/docs/architecture/testing-strategy.md`                    |
| `odc-done`             | The code is written and you are about to commit, open a PR, or report it done                                                      | Not a judgment of the code — it establishes the change is complete, not that it is good           |
| `odc-agent-docs`       | Writing or correcting an `AGENTS.md`, a playbook, an architecture doc or the workspace map                                         | Not writing a skill — `writing-great-skills`                                                      |
| `systematic-debugging` | The method itself: reproduce it, find the root cause, fix that                                                                     | Not repo knowledge — it supplies the loop that `odc-debugging` supplies the facts for             |
| `tdd`                  | Driving a feature or a bug fix red-green-refactor                                                                                  | Not where a test file goes in this repo, or whether anything collects it — `odc-testing`          |
| `review-pr`            | Triaging open pull requests — one verdict each, and which ones need the user                                                       | Not your own uncommitted diff — `code-review`                                                     |
| `code-review`          | Reviewing the working diff since a fixed point, on Standards and on Spec                                                           | Not triage of what is open on GitHub — `review-pr`                                                |

## When you learn something this file could not tell you

A fact you needed and could not find is a defect in the documentation rather than a gap in your
memory, and the moment you have just paid for it is the cheapest moment to land it.
`.agents/skills/odc-agent-docs/SKILL.md` decides which file owns it — root `AGENTS.md`, a workspace
`AGENTS.md`, a playbook, an architecture doc, or a skill — and carries the grep that proves it ended
up in exactly one of them. A skill added or renamed moves the table above too, which is a row of that
skill's own "Tables that move together".
