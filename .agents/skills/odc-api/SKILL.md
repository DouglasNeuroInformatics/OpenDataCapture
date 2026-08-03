---
name: odc-api
description: Change apps/api — an endpoint or controller, a route's `@RouteAccess`, a service's `accessibleQuery` scoping, a Prisma model or a CASL permission — or an environment variable anywhere in the repo. Use also when asked who can see or do what.
---

`apps/api` serves clinical data segregated by group. Access is decided in two independent places: a
**guard** that sees the request and no data, and a **scope** in the Prisma `where` that sees the
rows. The only half a tool checks is the guard's presence (`REQUIRE_ROUTE_ACCESS` in the root
`eslint.config.js`); the guard's value, and the scope entirely, are **silent** — no compiler, no
test — so satisfying one and forgetting the other is green everywhere.

## The scope is the half nothing checks

**`accessibleQuery(undefined, …)` returns `{}`.** `apps/api/src/auth/ability.utils.ts` opens the
function with `if (!ability) { return {}; }` — an empty `where`, which reads every group's rows. The
ability is optional by type (`EntityOperationOptions` in `apps/api/src/core/types.ts` is
`{ ability?: AppAbility }`), so `tsc` is satisfied, and a service spec running against a mocked
model asserts back whatever arguments you passed it. This is the highest-severity mistake available
in this repo, and the only thing standing in front of it is you reading the `where`
(`.agents/docs/architecture/auth-and-permissions.md`, Layer 2).

**Forwarding is the other half, and it has two shapes.** Either the service method takes
`{ ability }: EntityOperationOptions` and its controller forwards `@CurrentUser('ability')`, or it
takes `currentUser?: RequestUser` and reads `.ability` off it itself while its controller forwards
`@CurrentUser()` — the second shape is `apps/api/src/instruments/instruments.service.ts` and
`apps/api/src/instrument-records/files/files.service.ts`. In `instruments.service.ts` the parameter
is optional, so a call site that omits it compiles and queries unscoped.

**Unscoped is a decision, not an omission.** `AuditService.find` takes no ability at all, because a
manage-all guard is the whole check on `GET /v1/audit/logs`; the inventory of routes that are
deliberately unscoped is in `.agents/docs/architecture/auth-and-permissions.md`.

- **Done when every Prisma query in your diff is accounted for** — each one either names
  `accessibleQuery` in its `where`, or is unscoped for a reason your reply states. Every query, not
  a sample of them.
- **Done when every handler whose service method receives an ability forwards it** —
  `@CurrentUser('ability')` for the `EntityOperationOptions` shape, `@CurrentUser()` for the
  `RequestUser` shape — established by opening each handler, because nothing else establishes it.

## The guard: `@RouteAccess`

Every controller handler carries one; `REQUIRE_ROUTE_ACCESS` in the root `eslint.config.js` flags a
missing decorator, which is a 500 at request time rather than an open route. That rule sees nothing
else — a wrong value is silent, and two of them are traps:

| Value      | Grants                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------- |
| `'public'` | No authentication at all. Adding one is a security decision — raise it rather than deciding alone. |
| `[]`       | Any authenticated user, because `[].every(...)` is `true`. Easy to write by accident.              |

`{ action, subject }` runs `ability.can` against the subject **type**, never against rows; an array
of them is `.every(...)`.

**Done when** every handler your diff adds or changes names a `@RouteAccess` value and your reply
says which — `'public'` and `[]` in writing, because neither is distinguishable from a considered
choice once written.

## The two lists that must agree

What a _user_ can be granted through `additionalPermissions` is not the CASL subject list Prisma
derives: it is `enum AppSubject` (`apps/api/prisma/schema.prisma`) and `$AppSubjectName`
(`packages/schemas/src/core/core.ts`), hand-written and deliberately narrower.

**Done when** a model users must hold a permission on appears in both lists in the same commit, or
your reply says you left the pair narrower deliberately.

## Where the procedure lives

The order of operations is silent when skipped, and lives in files this skill does not restate:

| When                                                              | Open                                                                                                                                                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Adding or reshaping an endpoint                                   | `.agents/docs/playbooks/add-api-endpoint.md` — read it before writing the first file; it carries the registration steps                                                                    |
| Any environment variable, in any workspace                        | `.agents/docs/playbooks/add-env-var.md` — `$Env` (`apps/api`) and `apps/gateway/src/config.ts` are separate declaration sites; declaring it in one and stopping there is the usual failure |
| Judging who may see or do what, or picking a `@RouteAccess` value | `.agents/docs/architecture/auth-and-permissions.md` — the route-by-route inventory, where an ability comes from, and which models are grantable to nobody                                  |
| Writing anything in this app                                      | `apps/api/AGENTS.md` — libnest replaces enough of NestJS that stock Nest tutorials mislead; read `apps/api/node_modules/@douglasneuroinformatics/libnest/src` for a signature              |
| Your change moved who can see what                                | `.agents/skills/odc-testing/SKILL.md` — row scoping is not observable in the tier `apps/api` tests itself in                                                                               |

## Consumers the compiler does not connect

Each hard-codes the path, the method and the expected status, so a rename or a changed status code
reaches it even when `tsc` sees the schema change:

| Consumer                            | Breaks as                                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `apps/web/src/hooks/`               | a 404 in the clinician SPA at runtime — `.agents/docs/playbooks/add-web-data-hook.md`                       |
| `cli/odc-cli`                       | nothing at all; it is outside the pnpm workspace and every check — `cli/AGENTS.md` holds its endpoint table |
| `testing/src/support/api-client.ts` | a red `pnpm test:e2e`, which CI does run — a failed run rather than a compile error                         |

**Done when** every hit of `grep -rn '<segment>' apps/web/src cli/odc-cli testing/src` is accounted
for — grep the bare segment, because `api-client.ts` builds every path as `${API}/<segment>` — and an
endpoint an e2e test would otherwise reach through the UI has a method on that file, or your reply
names the one that already seeds it.
