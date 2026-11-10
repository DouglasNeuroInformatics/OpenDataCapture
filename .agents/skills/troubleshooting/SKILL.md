---
name: troubleshooting
description: Symptom index for what actually breaks in Open Data Capture — a failing build, lint, unit test or e2e run; a change with no visible effect; a suite that stays green after you broke the code on purpose; an error naming runtime/v1, btoa, turbo or .env. Each row names the doc that owns the fix.
---

Read the owner before changing anything: a row tells you where you are, not what to type. Known breakage
that is deliberately left alone is recorded in the owning workspace's `AGENTS.md` and in `## Known warts` of
`.agents/docs/architecture/testing-strategy.md` — name it in your reply and leave it.

## Loud and correct — leave it standing

- **TS2345 on a route literal you just added** is expected until the user regenerates `route-tree.ts`
  (`.agents/docs/playbooks/add-web-route.md`). Every Vite run in `apps/web` (`dev`, `dev:test`, the Playwright
  webServer, `vite build`) rewrites that tracked file; if `git status` shows it after a debugging run, revert it.
- **`pnpm lint` passed and the tree changed**: `eslint --fix` sorted your new code. Keep the rewrite.
- **`Failed to find .env file at default paths`**: run `pnpm generate:env` (root `AGENTS.md`).
- **ENOENT while a Vite config resolves, or `/runtime/v1/*` unresolved**: `runtime/v1/dist` is unbuilt. Turbo
  builds it; a bare `tsc`, `vitest` or storybook does not (`.agents/docs/playbooks/run-locally.md`).

## Quiet and wrong

| Symptom                                                        | Owner                                               |
| -------------------------------------------------------------- | --------------------------------------------------- |
| A new unit test passes but `pnpm test` never names its file    | `.agents/docs/architecture/testing-strategy.md`     |
| A type error survives `pnpm lint` and CI                       | `.agents/docs/architecture/testing-strategy.md`     |
| `toBeInTheDocument` is not a function                          | `.agents/docs/architecture/testing-strategy.md`     |
| An endpoint returns every group's rows (`accessibleQuery`)     | `apps/api/AGENTS.md`                                |
| Any authenticated user reaches a route (`@RouteAccess([])`)    | `apps/api/AGENTS.md`                                |
| A route 500s in the validation pipe on first call              | `apps/api/AGENTS.md` (`import type` on the schema)  |
| Two identical-looking schemas reject each other                | `packages/schemas/AGENTS.md` (`zod` v3 vs `zod/v4`) |
| An instrument builds and is listed, but no instance has it     | `.agents/docs/playbooks/add-instrument.md`          |
| The runtime build logged an error and still exited 0           | `packages/runtime-bundler/AGENTS.md`                |
| A route literal in a Playwright spec does not type-check       | `testing/AGENTS.md` (`route.d.ts`, `gen:routes`)    |
| A spec has no auth and every fixture is undefined              | `testing/AGENTS.md`                                 |
| An e2e test passes alone and fails in the suite                | `testing/AGENTS.md` (`fullyParallel`, one database) |
| A variable present in `.env` is undefined inside a task        | `.agents/docs/playbooks/add-env-var.md`             |
| A gateway change does nothing, or hydration disagrees with SSR | `apps/gateway/AGENTS.md`                            |
| A gateway page 500s from `rootLoader`                          | `apps/gateway/AGENTS.md` (`btoa` above U+00FF)      |
| A playground instrument is missing, or an edit vanished        | `apps/playground/AGENTS.md`                         |
| A story never appears in Storybook                             | `storybook/AGENTS.md`                               |
| Keyed translations fail to type-check or render nothing        | `apps/web/AGENTS.md`, `apps/gateway/AGENTS.md`      |
| A route file resolves to a URL nobody asked for                | `apps/web/AGENTS.md` (`.` is a path separator)      |
| `odc-cli` rejects a value the API accepts                      | `cli/AGENTS.md`                                     |
| A token keeps old permissions, or never expires                | `.agents/docs/architecture/auth-and-permissions.md` |
| A bug reproduces in only one environment                       | `testing/AGENTS.md`, `apps/api/AGENTS.md`           |

The last row is usually the database: `NODE_ENV=test` gives the API an in-memory replica set seeded by
`testing/src/global/setup.spec.ts`, while development uses a real Mongo that nothing resets, and JWT expiry is
ignored in development.

When no row matches and you find the cause, land the missing fact where `.agents/skills/writing-agent-docs/SKILL.md`
says it belongs — this table is a candidate.
