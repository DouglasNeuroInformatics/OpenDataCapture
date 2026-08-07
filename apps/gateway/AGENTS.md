# apps/gateway

The patient-facing app that serves one remote assignment per page. Express 5 + React 19, server
rendered. `apps/api` is its only programmatic client — `apps/api/src/gateway/gateway.service.ts`
creates, fetches and deletes assignments here over HTTP, and the patient is given a link to
`/assignments/:id`.

Read the root `AGENTS.md` first for the rules that apply everywhere.

**There is no client-side router, no TanStack Query and no Zustand.** Express routing
(`src/routers/*.router.ts`) is the only routing.

## SSR traps

**Nothing reachable from `src/Root.tsx` may touch `window` or `document` at module scope.**
`renderToString` evaluates the whole import graph in Node. Put browser work in `useEffect`. The one
existing exception, `@cap.js/widget` (imported by `src/components/Cap.tsx`), survives only because
Node defines a global `navigator` and the package returns early on `typeof window === 'undefined'`.

**Everything in `RootProps` is public and must be latin1-safe.** `src/server/server.base.ts`
serializes it with `btoa(JSON.stringify(props))` into `{{ ROOT_PROPS_OUTLET }}`, and
`src/entry-client.tsx` reads it back off `window.__ROOT_PROPS__`. So:

- `btoa` throws on any code point above U+00FF. A curly quote anywhere in the instrument bundle
  becomes a 500 from `rootLoader`, not a render error.
- The per-assignment bearer token is in there deliberately. Do not add anything a patient must not
  see.

`index.html` is patched by **string replacement**, not a template engine — the markers
`{{ ROOT_PROPS_OUTLET }}` and `{{ ROOT_SSR_OUTLET }}` must survive verbatim.

## Server

`src/server/index.ts` picks `DevelopmentServer` or `ProductionServer` off `import.meta.env.DEV`;
both extend `BaseServer`, which owns the middleware order:

| Mount       | Handler                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------- |
| `/api/auth` | `capRouter` — mounted **before** the API key check, so the widget reaches it unauthenticated |
| `/api`      | `apiKeyMiddleware`, then `apiRouter`                                                         |
| `/`         | `rootLoader` (installs `res.locals.loadRoot`), then `rootRouter`                             |

Reordering those lines is a security change. Wrap every async handler in `ah()`
(`src/utils/async-handler.ts`); an unwrapped rejection never reaches `errorHandlerMiddleware`.
Throw `HttpException(status, message)`. `src/middleware/not-found.middleware.ts` is defined but
never mounted — an unknown path currently gets Express's built-in 404.

Auth is not the web app's JWT. Two credentials, both sent as `Authorization: Bearer …`:
`config.apiKey` (`GATEWAY_API_KEY`, used by `apps/api`), and a per-assignment token
`sha256(apiKey + assignmentId)` from `src/utils/auth.ts` that authorizes only
`PATCH /api/assignments/:id`. That PATCH additionally requires the assignment id to be in the
in-memory set in `src/lib/assignment-verification.ts`, which the Cap.js proof-of-work flow
populates. The set is deliberately not persisted; a restart just makes the patient re-verify.

`src/config.ts` parses `process.env` through a Zod schema once at import time. New gateway env vars
go there — see `.agents/docs/playbooks/add-env-var.md`.

## Database

Its own SQLite database, entirely separate from the API's MongoDB: `prisma/schema.prisma`, one model
(`RemoteAssignmentModel`), generated to `node_modules/@prisma/generated-client` and wrapped in
`src/lib/prisma.ts` with a computed `getPublicKey()`.

A `Json` column is typed by `prisma-json-types-generator`, the same generator `apps/api` uses: a
`/// [TypeName]` docstring above the field names a type from the `PrismaJson` namespace declared in
`src/typings/prisma-json-types-generator.d.ts`, and the generated client uses it on both the read
and the write side. **The name must exist in that namespace** — the generator emits the reference
either way, so a typo surfaces as an unresolved type in the generated client rather than an error
from `prisma generate`.

`GATEWAY_DATABASE_URL` is an absolute `file:` URL written by `pnpm generate:env`. Turbo runs
`db:push` before `dev`, `lint`, `test:e2e` and — via the `@opendatacapture/gateway#build` key in
`turbo.json` — before `build`, so a gateway build needs `GATEWAY_DATABASE_URL` set.

## Build and dev

`pnpm build` is three passes into `dist/`: Vite client build (`dist/client`), Vite SSR build
(`dist/server/entry-server.js`), then `scripts/build.ts` esbuilding `src/main.ts` to a single
`dist/main.js`, with `@douglasneuroinformatics/esbuild-plugin-prisma` copying the query engine into
`dist/prisma/client`. `@opendatacapture/vite-plugin-runtime` emits `dist/runtime/<version>` during
the client build, which `ProductionServer` serves via `sirv` at `/runtime` — see
`.agents/docs/architecture/runtime-and-vendor.md`.

`pnpm dev` runs `scripts/dev.ts` once and then `node dist/main.js`. **The esbuild watcher is
disposed immediately** (the script says so on stdout), and `DevelopmentServer` loads SSR from
`/dist/entry-server.js`, the esbuild output. So a change to server code _or_ to `Root.tsx` needs
`pnpm dev` restarted; only assets served through the Vite middleware refresh, which means the
hydrated tree can disagree with the SSR'd HTML until you do.

## Conventions specific to here

- `@/` aliases `src/`, declared in both `vite.config.ts` and `tsconfig.json`.
- Ambient declarations live in `src/typings/` and `src/vite-env.d.ts`: the `PrismaJson` namespace,
  `res.locals.loadRoot`, `window.__ROOT_PROPS__`, the `cap-widget` JSX element, `__RELEASE__`.
- The eslint blocks for `apps/web` and `packages/react-core` (no default exports, no bare `clsx`,
  `jsx-no-literals`) **do not cover this app**, and default exports are in use. Translation is still
  required, and there are no translation resource files — `src/services/i18n.ts` initializes with
  `{}`, so every string is inline `t({ en, es, fr })`. Every interface language needs an entry;
  `requireCompleteTranslations` in that service makes a missing one a type error caught by
  `pnpm lint`.
- Shared UI comes from `packages/react-core` (`InstrumentRenderer`, `Branding`). Put anything both
  apps need there, not here.
- Validation messages are localized by `src/services/zod.ts`, a thin call to react-core's
  `localizeZodErrors`. **`entry-client.tsx` is the only place it may be called** — its `'runtime'`
  target dynamically imports `/runtime/v1/zod@3.x/…`, a browser URL that does not resolve in node,
  and nothing is validated during SSR anyway. The copy lives in
  `packages/react-core/src/utils/zodErrorMap.ts`; do not add a message table here.
- Instrument bundles arrive already built and are validated with `$InstrumentBundleContainer` in
  `src/routers/root.router.ts`. Background: `.agents/docs/architecture/instrument-pipeline.md`.

## Tests

**There is no `apps/gateway/vitest.config.ts`**, so this app has no unit tests and
`pnpm exec vitest --project gateway` does not exist. Adding a unit test means adding that config
first — `.agents/docs/playbooks/add-vitest-project.md`.

The coverage that exists is `testing/src/specs/gateway-assignment.spec.ts`, which drives the real
two-origin flow through the Cap widget. See `.agents/docs/architecture/testing-strategy.md`.
