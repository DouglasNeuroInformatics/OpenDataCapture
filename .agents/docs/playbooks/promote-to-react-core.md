# Promote a component to `packages/react-core`

Conventions live in `packages/react-core/AGENTS.md`; read it first. This file is only the ordering
that matters.

**Plan around this:** the origin app is not the test. `packages/react-core` has no `build` script and
no `dist` — `exports['.']` points at `./src/index.ts`, so every consumer compiles this TypeScript
itself, and a component that keeps its `apps/web` habits fails in the _other_ consumers: `gateway`,
`playground`, `serve-instrument`, `storybook` (`.agents/docs/workspace-map.md`). The three habits
that travel badly are a keyed translation, an `@/…` import and a router import — and the last program
to notice is the one you moved the file out of.

Two programs go red on purpose while you work. `packages/react-core` lint is red from step 2 until
steps 6 _and_ 7 are both done — unresolved `@/…` specifiers are step 6, unresolved bare package names
are step 7. `apps/web` is red from step 2 until step 9. The eslint blocks that govern components name
`apps/web/src/**` and `packages/react-core/src/**` together (`.agents/skills/odc-frontend/SKILL.md`),
so nothing that passed lint in `apps/web` fails on style here; what breaks is resolution and rendering.

## Steps

1. **Name the second frontend and the file that will import it.** The bar is a second frontend that
   renders it, not "looks reusable" (`packages/react-core/AGENTS.md`); a promotion no second consumer
   imports leaves the component further from its only caller. Done when you can name the consumer
   file — `apps/gateway/src/Root.tsx`, `apps/playground/src/components/…`,
   `packages/serve-instrument/src/root.tsx` — or the exported react-core component that will render
   it. `apps/web/AGENTS.md` states the bar more narrowly (**only if `apps/gateway` also uses it**), so
   if your consumer is playground or serve-instrument alone, settle which rule applies with the user
   before the `git mv`, not after.

2. **`git mv` the whole folder** to `packages/react-core/src/components/<X>/`, keeping `<X>.tsx`,
   `index.ts` (`export * from './<X>'`) and `<X>.stories.tsx` together. The destination is
   `src/components/`, not somewhere else under `src/`: a story that lands one level too high is
   silently absent from the Storybook sidebar, with no warning (`storybook/AGENTS.md`).

3. **Add `export * from './components/<X>';` to `packages/react-core/src/index.ts`.** A folder nobody
   adds to the barrel publishes nothing, and there are no deep import paths —
   `@opendatacapture/react-core/components/<X>` does not resolve (`packages/react-core/AGENTS.md`). If
   the component is an internal part of `InstrumentRenderer` rather than something a consumer imports
   directly, leave it off the barrel and add it to that AGENTS.md's deliberately-unexported list.

4. **Convert every keyed `t('namespace.key')` to inline `t({ en: '…', es: '…', fr: '…' })`** — libui's own
   registered namespace is the exception (`.agents/skills/odc-frontend/SKILL.md`). `apps/gateway`
   initialises i18n with no resources (`apps/gateway/src/services/i18n.ts`), and libui's
   `Translator.t()` logs `Failed to extract translation from object '{}'` and returns the
   **empty string** for a missing key. The patient sees blank text, so there is no visible key to find
   in the UI. Host-owned copy arrives as a prop typed `LocalizedText`
   (`packages/react-core/src/types.ts`); `submitButtonLabel` on `FormContent` is the shape to follow.

   **Storybook does not catch this.** `storybook/config/preview.ts` imports `apps/web/src/services/i18n`
   for its side effect, so every story — react-core's included — boots with web's resources and the
   keyed call renders correctly in the sidebar. Read the diff for `t('`; do not trust the story.

5. **Move host behaviour to a prop.** Gateway, playground and serve-instrument have no router, and
   `QueryClientProvider` is mounted only in `apps/web/src/App.tsx` — so a promoted `<Link>`,
   `useBlocker` or `useQuery` throws at first render in every consumer but the one it came from. Each
   becomes an injected component, an `href`, or data passed in: `InstrumentRenderer`'s
   `NavigationBlocker?: NavigationBlockerComponent`, implemented by
   `apps/web/src/components/NavigationBlocker.tsx`, is the pattern, and `packages/react-core/AGENTS.md`
   carries the rule and its exceptions. Declaring `@tanstack/react-query` here instead would make the
   import resolve and the typecheck pass; the throw arrives only at render, which nothing before the
   Verify block's `pnpm test:e2e` reaches — and only where step 9's second consumer renders it.

6. **Repoint every `@/…` import.** `packages/react-core/tsconfig.json` declares one path mapping,
   `/runtime/v1/*` — there is no `@/*` here, so every `@/…` specifier is a module-resolution error.
   Storybook agrees: its `vite.config.js` resolves `@` through a `customResolver` keyed on the
   importing file and returns `null` for anything outside `apps/web/src` and `apps/playground/src`.
   `@/components/*` becomes a relative sibling import. Everything else — `@/store`, `@/hooks/*`,
   `@/config`, `@/services/*`, `@/utils/*` — does not move; it becomes a prop or callback per step 5.
   No import under `packages/react-core/src` may resolve outside the package: a relative path that
   climbs into `apps/web/src` typechecks, and no eslint rule forbids it.

7. **Declare every remaining non-relative import in `packages/react-core/package.json`.**
   `@douglasneuroinformatics/libui`, `lucide-react`, `motion`, `zustand` and the `@opendatacapture/*`
   workspaces are already there; `apps/web` deps that are not — `@heroicons/react`, `recharts` — need
   an entry here, written as `"catalog:"` (some entries in this file carry literal versions; do not
   copy that), and the root `AGENTS.md` requires you to ask in-conversation before adding one. Then run
   `pnpm install` from the repo root and commit `pnpm-lock.yaml` — CI installs with `--frozen-lockfile`.

8. **Keep browser work inside `useEffect`.** `apps/gateway` server-renders react-core: `renderToString`
   evaluates the whole import graph in Node, and nothing reachable from `src/Root.tsx` may touch
   `window` or `document` at module scope (`apps/gateway/AGENTS.md`). react-core's own lint cannot see
   this — its tsconfig carries the DOM lib, so a module-scope `document.querySelector(…)` typechecks
   clean. `pnpm test:e2e` is what evaluates it, and only once step 9 is done.

9. **Wire both ends.** The origin app's `@/components/<X>` becomes
   `{ <X> } from '@opendatacapture/react-core'`, and the consumer you named in step 1 gets the import
   and the JSX that renders it. Until that second import exists the promotion's justification is
   unrealised and steps 5 and 8 are untested — `pnpm --filter @opendatacapture/gateway lint`
   typechecks gateway's own graph only, so it passes vacuously on a component gateway never imports.
   Carry every `data-testid` across unchanged, or the existing spec stops selecting it
   (`.agents/docs/playbooks/add-e2e-test.md`).

10. **Place the tests.** `packages/react-core` contributes no vitest project, so a test file left beside
    the component is collected by nothing and reported by nothing
    (`.agents/skills/odc-testing/SKILL.md`). Either keep the unit test in the origin app's suite
    (`pnpm exec vitest --project web`) importing the component from `@opendatacapture/react-core`, or
    give react-core its own project first: `.agents/docs/playbooks/add-vitest-project.md`. The
    end-to-end test is `.agents/docs/playbooks/add-e2e-test.md`.

## Verify

```sh
pnpm --filter @opendatacapture/react-core lint      # no app aliases in this program
pnpm --filter @opendatacapture/web lint
pnpm --filter @opendatacapture/gateway lint         # meaningful only once step 9 wired the consumer
pnpm exec vitest --project web
pnpm lint && pnpm test
pnpm test:e2e
pnpm --filter @opendatacapture/storybook storybook  # port 6006 — listed under React Core, not Web
```

`pnpm --filter @opendatacapture/react-core lint` failing on an unresolved `@/…` specifier means step 6
is unfinished, not that the mapping is missing — react-core deliberately has no `@` alias. Storybook
needs a repo-root `.env` and a built `runtime/v1/dist` before it starts (`storybook/AGENTS.md`).

A promotion changes state two documents describe: react-core's deliberately-unexported list, and the
"put it in react-core only if" rule in `apps/web/AGENTS.md`. Update whichever drifted in the same commit.
