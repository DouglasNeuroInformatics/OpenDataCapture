# Playbook: add an end-to-end test

Conventions and fixtures live in `testing/AGENTS.md`; read it first. This file is the order of
operations.

**Once per machine:** a repo-root `.env` (`pnpm generate:env`) and the browsers,
`pnpm --filter @opendatacapture/testing exec playwright install chromium firefox`. Nothing else needs
starting — `playwright.config.ts` boots api, gateway, web and playground itself.

## Steps

1. **Add the `data-testid` in `apps/web`**, on the component — `PageHeader.tsx` carries
   `data-testid="page-header"`. Fall back to roles or labels only where a testid is not sensible.

2. **For a new route, wait for the user to regenerate `apps/web/src/route-tree.ts`**
   (`.agents/docs/playbooks/add-web-route.md`). `gen:routes`, which this package's `lint` and
   `test:e2e` run first, derives the `RouteTo` union from that tree, so until then step 4 does not
   type-check.

3. **Write the page object** at `testing/src/pages/<mirror of the web route path>.page.ts`, extending
   `AppPage` for anything behind auth, or `RootPage` with `readonly _requiresAuth = false` for a public
   page (`auth/login.page.ts`). Shape: `_app/session/start-session.page.ts`.

4. **Register it in `pageModels` in `testing/src/support/fixtures.ts`** if the spec navigates to it with
   `getPageModel`, keyed by the route literal — `'/datahub/subjects/$subjectId/assignments':
SubjectAssignmentsPage`. A page reached by clicking through needs no entry; use `new XPage(page)`.

5. **Write the spec** at `testing/src/specs/<flow>.spec.ts`, importing
   `import { expect, test } from '../support/fixtures';`. With the raw `@playwright/test` import, a
   test that destructures a repo fixture fails `tsc`, and one that takes only `{ page }` runs
   unauthenticated.

6. **Navigate with `getPageModel('/route')`** — or, when the expected outcome is a redirect,
   `authenticateAs(role)` then a raw `page.goto(...)` (`testing/AGENTS.md` §Traps).

7. **Seed preconditions with the `api` fixture**, naming every record with `uniqueId`; drive the UI
   only for the behaviour under test.

8. **Set the role and first-run state** with `test.use({ actingRole: 'ADMIN' })` (default
   `GROUP_MANAGER`) and `test.use({ appState: {...} })` (`testing/src/specs/disclaimer.spec.ts`).

9. **Tag `@smoke` only a critical flow**; those are the only tests firefox runs.

## Verify

```sh
pnpm --filter @opendatacapture/testing lint                                      # gen:routes, tsc, eslint .
pnpm --filter @opendatacapture/testing test:e2e --list src/specs/<flow>.spec.ts  # your titles, under [chromium]
pnpm --filter @opendatacapture/testing test:e2e src/specs/<flow>.spec.ts         # one spec; setup still runs
pnpm test:e2e                                                                    # whole suite, from repo root
```

Watch one of your tests fail on purpose before trusting it green. `test:dev` opens Playwright's UI
mode.
