---
name: odc-debugging
description: What actually breaks in Open Data Capture — a failing build, lint, unit test or e2e run; a change with no visible effect; a suite that stays green after you broke the code on purpose; an error naming runtime/v1, btoa or turbo. Read before diagnosing; systematic-debugging and diagnosing-bugs supply the method, this supplies what is wrong here.
---

Failures in this repo sort into two piles that want opposite reactions.

**Loud and correct** — a command failed, and the failure is the repo working as designed. Name it as designed
behaviour, leave it standing, and carry on with the change it interrupted. The whole answer here is the
explanation plus, at most, a change to your own uncommitted work — the configs, CI and docs stay as they are.

**Quiet and wrong** — nothing failed, and that is the symptom: the test never ran, the query returned every group's
rows, the story is not in Storybook, the instrument was never loaded. These are the expensive ones, because the signal
that would have caught them is the signal you are trusting.

**Done when** the symptom has been read against both piles, and you have either opened the owner named by the matching
row or can say that no row matches.

## Loud and correct

**TS2345 on a route file you just wrote.**

```
error TS2345: Argument of type '"/_app/your-route"' is not assignable to parameter of type 'keyof FileRoutesByPath | undefined'.
```

The expected state of a correct new route until the user regenerates `route-tree.ts` —
`.agents/skills/odc-web-route/SKILL.md`. There is no generator command to avoid: every Vite run in `apps/web`
(`pnpm dev`, `dev:test`, the Playwright webServer, `vite build`) rewrites that tracked file from `configResolved`, so
when `git status` shows `route-tree.ts` after a debugging run, revert it and leave the regeneration to the user.

**`pnpm lint` came back green and the working tree moved.** Lint is `eslint --fix`, so it rewrites while it checks, and
a tree that already conforms comes back untouched — the rewrites in front of you are your own new code being sorted.
Read that diff as your work and keep it.

**A fresh checkout fails in places that never name the cause.** `runtime/v1/dist` is gitignored and unbuilt, so a dev
server dies with ENOENT while a Vite config is still resolving, and every consumer whose tsconfig maps `/runtime/v1/*`
reports unresolved modules instead. `.env` is gitignored too and every root script is `env-cmd`-wrapped, so a clone
that has never been set up fails earlier still, with `Failed to find .env file at default paths`. Both are
prerequisites rather than bugs: `.agents/skills/odc-run-locally/SKILL.md`. Turbo repairs the build for you; anything
run outside turbo — a bare `tsc`, `vitest`, storybook — does not.

**Some breakage is known, documented, and deliberately left alone.** Before calling anything a new bug, read the
`AGENTS.md` of the package that owns it — that is where these are recorded (the always-skipped development block in
`packages/release-info`, `testing`'s `test:chrome` naming a Playwright project that does not exist), with the build-
and test-infrastructure ones in the `Known warts` section of `.agents/docs/architecture/testing-strategy.md`. Name any
you hit in your reply and leave it as it is.

## Quiet and wrong

Read the owner before changing anything: the row tells you where you are, not what to type.

| Symptom                                                                   | Cause                                                                                                                                            | Owner                                               |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| A new unit test passes; `pnpm test` output never names its file           | The package has no `vitest.config.ts`, and the root config globs only `apps/*`, `packages/*` and `runtime/*`                                     | `.agents/skills/odc-testing/SKILL.md`               |
| A type error survives `pnpm lint` and CI                                  | Lint is the only type-check, and `runtime/v1` has no `lint` script while `instrument-stubs` and `instrument-guidelines` run eslint with no `tsc` | `.agents/docs/architecture/testing-strategy.md`     |
| An endpoint returns rows belonging to every group                         | `accessibleQuery(undefined, …)` returns `{}`; an omitted ability is caught by neither tsc, nor eslint, nor a green suite                         | `.agents/skills/odc-api/SKILL.md`                   |
| A new route is reachable by any authenticated user                        | `@RouteAccess([])` passes because `[].every(...)` is `true` — a handler with no decorator 500s instead of opening                                | `.agents/skills/odc-api/SKILL.md`                   |
| A route 500s inside the validation pipe the first time it is called       | The `$Schema` used as the `@Body()` parameter type arrived through `import type`, which erases the runtime binding                               | `.agents/skills/odc-api/SKILL.md`                   |
| Two apparently identical schemas reject each other; error maps miss       | A bare `zod` import resolves to the vendored v3, a separate registry from `zod/v4`                                                               | `packages/schemas/AGENTS.md`                        |
| An instrument builds and is listed, but no instance has it                | `apps/api/src/demo/demo.service.ts` holds one hand-written import per instrument; `DNP_STROOP_TASK` is the live proof                            | `.agents/skills/odc-instruments/SKILL.md`           |
| The runtime build logged an error and the command still succeeded         | `runtime-bundler`'s CLI catches a bundle failure, prints it, and exits 0                                                                         | `packages/runtime-bundler/AGENTS.md`                |
| A route literal a Playwright spec uses does not type-check                | `testing/src/generated/route.d.ts` is git-ignored and rewritten by `gen:routes` from `route-tree.ts`                                             | `.agents/skills/odc-web-route/SKILL.md`             |
| A spec has no authentication and every fixture is undefined               | It imported `test` from `@playwright/test` rather than `../support/fixtures`                                                                     | `.agents/skills/odc-testing/SKILL.md`               |
| An e2e test passes alone and fails inside the suite                       | One database, shared by every worker, with `fullyParallel` on — fixed names collide                                                              | `.agents/skills/odc-testing/SKILL.md`               |
| A variable that is present in `.env` is undefined inside a task           | Turbo runs strict env mode: a task sees `globalEnv` (`NODE_ENV`, `NODE_OPTIONS`) plus its own `env` array and nothing else                       | `.agents/docs/playbooks/add-env-var.md`             |
| A gateway change does nothing, and hydration disagrees with the SSR       | `pnpm dev` disposes the esbuild watcher immediately and SSR loads from its output; only Vite-middleware assets refresh                           | `apps/gateway/AGENTS.md`                            |
| A gateway page 500s from `rootLoader`; the same content renders elsewhere | `RootProps` is serialized with `btoa`, which throws above U+00FF — one curly quote anywhere in the bundle is enough                              | `apps/gateway/AGENTS.md`                            |
| A playground instrument you added is missing, or an edit vanished         | The store persists to IndexedDB via `idb-keyval`, and its `merge` keeps only instruments whose `category` is `Saved`                             | `apps/playground/AGENTS.md`                         |
| A story never appears in Storybook                                        | `storybook/config/main.ts` enumerates its story directories explicitly; anything outside them is invisible                                       | `.agents/skills/odc-frontend/SKILL.md`              |
| Keyed translations fail to type-check, or render as nothing               | A namespace takes three separate edits in `apps/web/src/services/i18n.ts`; `apps/gateway` has no resource files at all                           | `.agents/skills/odc-frontend/SKILL.md`              |
| A route file resolves to a URL nobody asked for                           | A `.` in a filename under `src/routes/` is a path separator, not part of the name                                                                | `.agents/skills/odc-web-route/SKILL.md`             |
| `toBeInTheDocument` is not a function                                     | `@testing-library/jest-dom` is not installed anywhere in the repo                                                                                | `.agents/docs/architecture/testing-strategy.md`     |
| `odc-cli` rejects a value the API accepts                                 | `cli/odc-cli` has no generated client and no compile-time link to `packages/schemas`, so API drift reaches it silently                           | `cli/AGENTS.md`                                     |
| A token keeps working after its permissions changed, and never expires    | Permissions are frozen into the JWT at login with no refresh endpoint, and `JwtStrategy` ignores expiry in development                           | `.agents/docs/architecture/auth-and-permissions.md` |

## Which database is under the failure

A bug that reproduces in one environment and not the other is usually about the database rather than the code. What
each environment is — an in-memory replica set under `NODE_ENV=test`, a real Mongo otherwise — and what `POST /v1/setup`
destroys are in `.agents/skills/odc-run-locally/SKILL.md`; why no unit test can see a row is in
`.agents/skills/odc-testing/SKILL.md`. Two consequences those two do not draw:

- **Contents.** The e2e database is seeded once through the UI by `testing/src/global/setup.spec.ts` and dropped by
  `teardown.spec.ts`. Nothing resets a development database automatically, so it holds whatever was last put there.
- **`NODE_ENV` itself changes behaviour**, which makes an environment-dependent bug a candidate before the code is —
  JWT expiry is ignored in development only (`.agents/docs/architecture/auth-and-permissions.md`).

## When no row matches

Fall back to the method: `.agents/skills/systematic-debugging/SKILL.md`. Reproduce it, find the root cause, then fix
that — a symptom fix in this codebase usually just moves the silence somewhere else.

**Done when** the fact you needed and could not find has landed in a repo document — `.agents/skills/odc-agent-docs/SKILL.md`
decides which one, and this file is a candidate — or you can name the document that already carries it.
