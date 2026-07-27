# testing

The Playwright end-to-end suite. It is the only tier that exercises `apps/api`, `apps/gateway` and
`apps/web` together against a real database.

Read the root `AGENTS.md` first for the rules that apply everywhere. The procedure for adding a test
is `.agents/docs/playbooks/add-e2e-test.md`; the tier-by-tier picture is
`.agents/docs/architecture/testing-strategy.md`.

## Traps

- **Specs import `{ expect, test }` from `../support/fixtures`, never from `@playwright/test`.**
  Importing the raw `test` silently loses every fixture below. The only two spec files that
  legitimately use the raw import are `src/global/setup.spec.ts` and `src/global/teardown.spec.ts`,
  because no admin account exists to authenticate as until setup finishes (the fixtures and page
  objects themselves necessarily import `@playwright/test`).
- **Route literals come from a generated file.** `src/generated/route.d.ts` is git-ignored and
  written by `scripts/gen-routes.ts`, which parses `FileRouteTypes['to']` out of
  `apps/web/src/route-tree.ts`. A route added in `apps/web` does not exist here until
  `pnpm --filter @opendatacapture/testing gen:routes` runs (it is also wired into `postinstall`,
  `lint` and the `test:*` scripts). Never hand-edit that file.
- **Selectors are `data-testid` attributes owned by `apps/web`.** A new spec usually means adding a
  testid over there in the same change. Roles and labels are used only where no testid exists.
- **One database, shared by every worker.** `setup` seeds it once through the UI and `teardown`
  drops it; `fullyParallel` is on. Any data a test creates must be uniquely named — use the
  `uniqueId` fixture (`Subject${uniqueId}`), never a fixed string.
- **`getPageModel` asserts it landed on the route it asked for** (`RootPage.goto` does
  `expect(page).toHaveURL(url)`). When the expected outcome _is_ a redirect, use `authenticateAs`
  plus a raw `page.goto` instead — see the standard-user cases in `src/specs/authorization.spec.ts`.
- **`authenticateAs` works through `page.addInitScript`**, so it must run before the navigation it
  is meant to affect.
- **`.env` at the repo root must exist.** `src/support/env.ts` reads `API_DEV_SERVER_PORT`,
  `GATEWAY_DEV_SERVER_PORT` and `WEB_DEV_SERVER_PORT` and throws while `playwright.config.ts` is
  loading if any is missing. `./scripts/generate-env.sh` produces it.

## Layout

| Path                     | Holds                                                                             |
| ------------------------ | --------------------------------------------------------------------------------- |
| `src/specs/*.spec.ts`    | The tests. One file per user-facing flow                                          |
| `src/pages/**/*.page.ts` | Page objects, mirroring `apps/web`'s route tree                                   |
| `src/support/`           | `fixtures.ts`, `api-client.ts`, `constants.ts`, `env.ts`, `types.ts`, `unique.ts` |
| `src/global/`            | `setup.spec.ts` (seeds through the UI), `teardown.spec.ts` (drops the DB)         |
| `src/generated/`         | Generated, git-ignored                                                            |

## Page objects

Extend `AppPage` (`src/pages/_app/route.page.ts`) for anything behind auth, or `RootPage` directly
and set `_requiresAuth = false` — that flag is what makes `getPageModel` inject a token. Read
`src/pages/_app/session/start-session.page.ts` for the shape: locators assigned in the constructor,
interactions as small async methods.

A page object is only reachable from a spec once it is registered in the `pageModels` map in
`src/support/fixtures.ts`, keyed by the real route literal. The map is
`satisfies { [K in RouteTo]?: any }`, so a key that is not a route fails type-check. Routes with
`$param` segments take a typed params object as `getPageModel`'s second argument.

## Fixtures

| Fixture                | Scope       | Notes                                                                      |
| ---------------------- | ----------- | -------------------------------------------------------------------------- |
| `getPageModel`         | test        | Authenticates as `actingRole`, navigates, returns the page object          |
| `authenticateAs(role)` | test        | Injects a token without navigating                                         |
| `actingRole`           | test option | Default `GROUP_MANAGER`; override with `test.use({ actingRole: 'ADMIN' })` |
| `appState`             | test option | localStorage first-run gating; both flags default to accepted/complete     |
| `uniqueId`             | test        | Short random suffix for seeded data                                        |
| `api`                  | worker      | `ApiClient` as admin — `createGroup()` / `createUser()` for preconditions  |
| `roleToken(role)`      | worker      | Seeds a group + user per role once, then caches the token                  |

Set up preconditions over the API with the `api` fixture rather than by clicking through the UI;
only drive the UI for the behaviour actually under test.

Auth is injected as `window.__PLAYWRIGHT_ACCESS_TOKEN__`, which `apps/web`'s
`src/store/slices/auth.slice.ts` reads on boot. It is memory-only and never persisted.

## Running

`pnpm test:e2e` from the repo root (turbo), or `pnpm --filter @opendatacapture/testing test:dev` for
Playwright's UI mode. `playwright.config.ts` starts api, gateway and web itself through each app's
`pnpm dev:test`, which sets `NODE_ENV=test` and so gives the API an in-memory Mongo replica set — no
external database, and nothing to start by hand.

Projects: `setup` (with `teardown` attached), `chromium` (every spec), and `firefox`, which greps
`/@smoke/`. **Cross-browser coverage exists only for tests whose title contains `@smoke`** — add the
tag to a critical flow, leave it off everything else.

There is **no `vitest.config.ts` here and no unit tier**; `pnpm test` never looks at this directory.

`lint` is `pnpm gen:routes && tsc && eslint --fix .` — note the `.`, not `src`, so the config and
scripts are checked too.

The `test:chrome` script passes `--project='*Desktop Chrome'`, which matches none of the four project
names and errors immediately. Use `test:e2e`.
