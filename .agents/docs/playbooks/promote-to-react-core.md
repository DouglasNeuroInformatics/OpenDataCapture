# Promote a component to `packages/react-core`

Conventions live in `packages/react-core/AGENTS.md`; read it first. This file is only the ordering
that matters.

**Plan around this:** react-core has no build, so every consumer (`apps/gateway`, `apps/playground`,
`packages/serve-instrument`, `storybook`, `apps/web`) compiles its source. A component that keeps its
`apps/web` habits — a keyed translation, an `@/…` import, a router or React Query hook — keeps working
in `apps/web` and breaks in the others. react-core's lint is red from step 2 until steps 6 and 7 are
done; `apps/web`'s until step 9.

## Steps

1. **Name the consumer file in the second frontend** that will render it — `apps/gateway/src/Root.tsx`,
   `apps/playground/src/components/…`, `packages/serve-instrument/src/root.tsx` — or the react-core
   component that will. "Looks reusable" is not the bar. `apps/web/AGENTS.md` sets it narrower
   (**only if `apps/gateway` also uses it**), so if the consumer is playground or serve-instrument
   alone, settle which rule applies with the user before moving anything.

2. **`git mv` the whole folder** to `packages/react-core/src/components/<X>/` — `<X>.tsx`, `index.ts`
   and `<X>.stories.tsx` together. Storybook scans only `src/components/` in this package.

3. **Add `export * from './components/<X>';` to `src/index.ts`.** There are no deep import paths, so an
   unexported folder publishes nothing. An internal part of `InstrumentRenderer` stays off the barrel
   and joins that AGENTS.md's deliberately-unexported list instead.

4. **Convert every keyed `t('namespace.key')` to inline `t({ en: '…', es: '…', fr: '…' })`**, except
   libui's own `t('libui.…')`. Gateway, playground and serve-instrument register no namespaces, so a
   keyed call renders an empty string there. Host-owned copy arrives as a `LocalizedText` prop
   (`submitButtonLabel` on `FormContent`). Storybook will not catch a leftover — its preview loads web's
   i18n resources for every story — so read the diff for `t('`.

5. **Move host behaviour to a prop.** Only `apps/web` has a router and a `QueryClientProvider`
   (`src/App.tsx`), so a promoted `<Link>`, `useBlocker` or `useQuery` typechecks and throws at first
   render everywhere else. Inject a component, an `href` or the data instead; `InstrumentRenderer`'s
   `NavigationBlocker` prop is the pattern. Declaring `@tanstack/react-query` here only moves the
   failure to render time.

6. **Repoint every `@/…` import.** react-core has no `@` alias, and neither does Storybook for files
   here. `@/components/*` becomes a relative sibling import; `@/store`, `@/hooks/*`, `@/config`,
   `@/services/*` and `@/utils/*` become props per step 5. A relative path climbing into
   `apps/web/src` typechecks and no eslint rule forbids it — nothing under `src/` may resolve outside
   the package.

7. **Declare every remaining bare import in `packages/react-core/package.json`** (`@heroicons/react`,
   `recharts`, …) as `"catalog:"` — not a literal version, though some entries there are — after
   asking per the root rule. Run `pnpm install` and commit `pnpm-lock.yaml`; CI installs with
   `--frozen-lockfile`.

8. **Keep browser work inside `useEffect`.** Gateway server-renders react-core, so module-scope
   `window` or `document` access throws in Node (`apps/gateway/AGENTS.md`). react-core's tsconfig
   carries the DOM lib, so its own lint will not flag it; `pnpm test:e2e` does, once step 9 is done.

9. **Wire both ends.** The origin's `@/components/<X>` import becomes
   `{ <X> } from '@opendatacapture/react-core'`, and the step-1 consumer imports and renders it. Until
   it does, steps 5 and 8 are untested and gateway's lint passes vacuously. Carry every `data-testid`
   across unchanged.

10. **Place the tests** in react-core's own project (`pnpm exec vitest --project react-core`; its
    environment is in that package's `AGENTS.md` §Tests), or leave them in the origin's suite
    importing from `@opendatacapture/react-core`. The e2e test is
    `.agents/docs/playbooks/add-e2e-test.md`.

## Verify

```sh
pnpm --filter @opendatacapture/react-core lint      # an unresolved `@/…` here means step 6 is unfinished
pnpm --filter @opendatacapture/web lint
pnpm --filter @opendatacapture/gateway lint         # meaningful only once step 9 wired the consumer
pnpm lint && pnpm test:coverage
pnpm test:e2e
pnpm --filter @opendatacapture/storybook storybook  # listed under React Core; prerequisites in storybook/AGENTS.md
```

If the promotion changed react-core's deliberately-unexported list or makes the "only if" rule in
`apps/web/AGENTS.md` wrong, update that file in the same commit.
