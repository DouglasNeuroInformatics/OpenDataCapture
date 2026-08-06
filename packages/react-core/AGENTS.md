# packages/react-core

React components shared across the frontends: `apps/web`, `apps/gateway`, `apps/playground`,
`packages/serve-instrument` and `storybook`. Its centrepiece is `InstrumentRenderer`, which turns a
compiled instrument bundle into a running instrument.

Read the root `AGENTS.md` first for the rules that apply everywhere. Conventions for components,
props and styling are the same as `apps/web` — see `apps/web/AGENTS.md`; eslint applies its
`no-clsx` / `no-tailwind-merge` / `import/no-default-export` / `jsx-no-literals` rules to
`packages/react-core/src/**` and `apps/web/src/**` together.

## Source-only: the barrel _is_ the public API

There is **no `build` script and no `dist`**. `exports['.']` points straight at `./src/index.ts`, so
every consumer typechecks and bundles this package's TypeScript itself. A mistake here fails in five
other workspaces, not in this one.

- **Creating a folder under `src/components/` publishes nothing.** It becomes importable only once
  you add an `export * from './components/X';` line to `src/index.ts`.
- **Four components are deliberately absent from that list** — `FormContent`, `InteractiveContent`,
  `FileInstrumentContent`, `InstrumentOverview` — along with `src/hooks/useInterpretedInstrument.ts`.
  They are internal parts of `InstrumentRenderer`. Do not export one unless a consumer needs it.
- **There are no deep import paths.** The exports map is exactly `.`, `./globals.css` and
  `./package.json`, so `@opendatacapture/react-core/components/Foo` will not resolve.

A component earns a place here when a _second_ frontend needs it. Anything only `apps/web` renders
belongs in `apps/web/src/components`.

## No translation resource files

There are no JSON translations here and there should never be: `apps/gateway` initialises i18n with
`i18n.init({ translations: {} })`, so a namespaced key resolves to nothing there — `t()` logs
`Failed to extract translation from object '{}'` and returns the **empty string**, which renders as
missing copy rather than as a visible key.

Use inline `t({ en: '...', fr: '...' })`. The only keyed calls that are safe are libui's own
namespace — `t('libui.yes')`, `t('libui.no')`, `t('libui.form.submit')` — which libui registers.

Copy supplied by the host app arrives as a prop typed `LocalizedText` (`src/types.ts`), a partial
`{ en?, fr? }` record the component resolves with `t()`. `submitButtonLabel` is the only prop using
it today; follow that shape rather than inventing a namespace.

## Validation messages

`src/utils/zodErrorMap.ts` owns the localized copy for **every** zod validation error either
frontend shows — instruments and the apps' own forms alike. `apps/web/src/services/zod.ts` and
`apps/gateway/src/services/zod.ts` are thin adapters over its `localizeZodErrors`.

- **`MESSAGES` / `COUNTED_MESSAGES` are the only place message copy belongs.** Both carry
  `as const satisfies { ... { [L in Language]: string } }`, so a new interface language fails to
  compile until every message has one. `COUNTED_MESSAGES` exists because French puts zero in the
  singular where English and Spanish do not; the form is picked by `Intl.PluralRules`.
- **zod v3 and v4 name almost every issue field differently.** `normalizeV3Issue` and
  `normalizeV4Issue` reduce both to one `FormIssue`, and `describeIssue` writes the message once.
  Add an issue code to the normalizers, not a second message table.
- **`V4Issue` is a deliberate widening.** `vendor/zod@3.x` pins declarations older than the zod it
  resolves at runtime, so `exact` and a string-format issue's `prefix`/`suffix`/`includes` are
  emitted but not declared.
- Anything unmapped renders the generic `invalid` message rather than `undefined`. Returning
  `undefined` from the v4 map would defer to `config.localeError`, which the runtime bundle sets to
  zod's **English** locale at module init.
- A message written by the schema author always wins — both majors skip the error map entirely when
  an issue already carries one.

Tests live in `apps/web/src/__tests__/zod-error-maps.test.ts` (this package has no vitest project).
They drive `createZodErrorMaps` through per-parse maps rather than registering globally.

## `@tanstack/react-router` is an optional peer — never import it

Gateway, playground and serve-instrument have no router. Nothing under `src/` imports the router
except `InstrumentRenderer.stories.tsx`.

Router-dependent behaviour is **injected as a component prop**: `InstrumentRenderer` accepts
`NavigationBlocker?: NavigationBlockerComponent` and forwards it to `FileInstrumentContent`;
`apps/web/src/components/NavigationBlocker.tsx` is the implementation that calls `useBlocker`. Note
that only the scalar path takes it — `SeriesInstrumentRenderer` has no such prop. Add any new
host-specific behaviour the same way, as an injected component or callback.

## Interactive instruments run in an iframe

`InteractiveContent` renders
`<iframe src="/runtime/v1/@opendatacapture/runtime-internal/interactive/iframe.html">` and passes the
bundle through the `data-bundle` attribute. The iframe talks back by dispatching `CustomEvent`s on
`window.parent.document` — `done`, `changeLanguage`, `changeTheme`, `addNotification` — whose payload
types are the `declare global` / `GlobalEventHandlersEventMap` block in `src/types.ts`. Adding an
event means editing that block, or the listener will not typecheck.

That absolute `/runtime/v1` URL only resolves in a host that installs the runtime Vite plugin.
Background: `.agents/docs/architecture/runtime-and-vendor.md` and
`.agents/docs/architecture/instrument-pipeline.md`.

## globals.css

`src/globals.css` is the Tailwind v4 entry every frontend imports — `apps/web/src/styles.css`,
`apps/gateway/src/entry-client.tsx`, `apps/playground/src/main.tsx`, `storybook/config/preview.ts`.
It holds three directives: the libui globals `@import` plus `@source` directives for libui and this
package's `src`.
Those paths are relative to this file, so consumers do not declare their own `@source` for
react-core, and anything added outside `src/` would not be scanned.

## Stories

`storybook/config/main.ts` scans **`packages/react-core/src/components`** with the title prefix
"React Core". A `*.stories.tsx` anywhere else under `src/` is invisible. Fixtures come from the
`@opendatacapture/instrument-stubs` devDependency. Run with
`pnpm --filter @opendatacapture/react-core storybook`.

Import siblings by relative path. `InstrumentSummary.tsx` importing `CopyButton` from
`@opendatacapture/react-core` (a Node self-reference back through the barrel) is an outlier, not the
pattern to copy.

## Tests

**This package has no `vitest.config.ts`, so it contributes no vitest project and `pnpm test` skips
it entirely** — the root config globs `packages/*/vitest.config.ts`. There are no tests here at all
today.

Behaviour changed here is currently only covered from a consumer's suite
(`pnpm exec vitest --project web`) and by `testing/`. If a change warrants a unit test, add a
config first — `.agents/docs/playbooks/add-vitest-project.md` is the order of operations; the
environment caveats in `apps/web/AGENTS.md` apply.

`pnpm --filter @opendatacapture/react-core lint` runs `tsc` then eslint.
