# apps/web

The clinician-facing React SPA. Vite + React 19 + TanStack Router + TanStack Query + Zustand,
styled with Tailwind v4 through `@douglasneuroinformatics/libui`.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## Where things go

The organizing principle is **layer folders, not feature folders**. There is no `src/features`,
`src/lib` or `src/api`.

| Directory                                                        | Holds                                                                                  |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/routes/`                                                    | **Route files and nothing else** — see below                                           |
| `src/components/`                                                | Shared presentational components                                                       |
| `src/hooks/`                                                     | All data fetching — one file per hook, named after its export                          |
| `src/services/`                                                  | Module-level side-effect singletons: `axios.ts`, `i18n.ts`, `react-query.ts`, `zod.ts` |
| `src/store/`                                                     | The single Zustand store: `index.ts`, `types.ts`, `slices/*.slice.ts`                  |
| `src/providers/`                                                 | Context/HOC providers used by `_app/route.tsx`                                         |
| `src/utils/`                                                     | Pure helpers only                                                                      |
| `src/translations/`                                              | Namespace JSON, registered in `src/services/i18n.ts`                                   |
| `src/__tests__/`, `src/hooks/__tests__/`, `src/utils/__tests__/` | Tests                                                                                  |

`@/*` aliases `src/*` and is declared in **three files that must agree**: `vite.config.ts`,
`vitest.config.ts` and `tsconfig.json`. Use `@/` across layers, relative imports within a folder.

## Routes

`src/route-tree.ts` is generated and git-tracked. **Never hand-edit it and never run the
generator** — the user does that manually after route changes.

**Only route files may live under `src/routes/`.** The generator scans the directory
indiscriminately and warns about any file that does not `export const Route`. Tests importing
`vitest` or `@testing-library/*` from there is an eslint error. Put a test in `src/hooks/__tests__/`,
`src/utils/__tests__/` or `src/__tests__/`, and a helper in `src/hooks/` or `src/utils/`.

Naming: `__root.tsx` is the root; `_app/` is a pathless layout (contributes no URL segment);
`route.tsx` is a directory's layout; `index.tsx` is its `/`; `$param` is dynamic; ordinary routes are
kebab-case. **A `.` in a filename is a path separator**, which is why a stray `logs.test.tsx` would
become the route `/logs/test`.

`src/routes/_app/admin/audit/logs.tsx` is the canonical route file — read it before writing one. The
shape is: components defined above, `export const Route = createFileRoute('<literal id>')({...})`
last.

- **`beforeLoad` is where auth and redirects go** (`_app/route.tsx`). Read the store imperatively
  there with `useAppStore.getState()`, never a hook.
- **`loader` prefetches into React Query** via `context.queryClient.ensureQueryData(...)` and returns
  `void`; the component then calls `useSuspenseQuery`. Router context is typed by `RouterContext` in
  `__root.tsx` and supplied in `src/router.tsx`.
- `Route.useSearch()` / `useNavigate()` / `useParams()` work in nested non-route components in the
  same file, because `Route` is in module scope.

## Data fetching

axios (the default instance) + TanStack Query v5. A fetch hook that a route loader prefetches must
export **both** a `queryOptions` factory and the hook, so the loader and the component share the
exact same key (hooks nothing prefetches may call `useQuery` inline).
`src/hooks/useSubjectsQuery.ts` is the canonical example:

```ts
export const subjectsQueryOptions = ({ params }: { params?: SubjectsQueryParams } = {}) =>
  queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/subjects', { params });
      return $Subject.array().parse(response.data); // parse at the boundary, always
    },
    queryKey: ['subjects', params?.groupId, params?.hasRecord]
  });
```

- Default to `useSuspenseQuery` so `.data` is non-nullable. Use `useQuery` only where paging or a
  placeholder demands it.
- **Both `queries` and `mutations` set `throwOnError: true`.** Errors reach the router error
  boundary, so do not write `if (query.isError)` UI.
- **Do not add a React Query `retry`, and do not create a second axios instance.** Retries live in
  `src/services/axios.ts`: it retries only idempotent methods on transient errors, under a total
  budget, and drives `ConnectivityBanner` through the store. Opt out of its defaults per-request with
  the `meta` bag (`disableRetry`, `disableDefaultTimeout`, `disableDefaultErrorNotification`,
  `disableDefaultAuth`). Only the second half is mechanically enforced — eslint bans `axios.create`,
  but nothing stops you setting a React Query `retry`, so that one is on you.

## State

One Zustand store, slice pattern. Slice _types_ all live in `store/types.ts`; each slice file exports
`createXSlice: SliceCreator<XSlice>` — use `SliceCreator`, don't hand-roll `StateCreator`. Immer is
enabled, so mutate inside `set`.

Persistence is an explicit allowlist: `PERSISTED_KEYS` in `store/index.ts`, used by both `partialize`
and `migrate`. Adding a field that must survive a reload means adding it there; anything else must
not be.

In components use a selector: `useAppStore((store) => store.currentGroup)`. Outside React use
`useAppStore.getState()`.

## Translations

`useTranslation` comes from `@douglasneuroinformatics/libui/hooks`. Two forms:

```tsx
t({ en: 'Connection Problem', fr: 'Problème de connexion' }); // inline — prefer this
t('layout.tabs.table'); // keyed, from a namespace JSON
```

Use the keyed form only when a string is reused. Resource files are `src/translations/*.json`, keyed
per-leaf as `{ "en": ..., "fr": ... }` and kept sorted by
`pnpm --filter @opendatacapture/web format:translations`.

**Adding a namespace means three edits in `src/services/i18n.ts`** — the import, the `declare module`
interface member, and the `init` object. Without the interface member the keys do not type-check.

Instrument validation errors are localized by `src/services/zod.ts`, which registers the
required-field error map on **four** zod instances: this bundle's v3 and v4, plus the v3 and v4 of
the runtime-served `/runtime/v1/zod@3.x` that instrument bundles import at runtime — a separate
browser module instance with its own error registry. Change that file rather than calling
`setErrorMap`/`z.config` anywhere else, or one of the four silently keeps the default messages.

`react/jsx-no-literals` makes bare JSX text an **error**. Punctuation and proper nouns are
allowlisted in `eslint.config.js` and `*.stories.tsx` is exempt; anything else it flags is a string
that needs translating. Strings that are genuinely not copy — stack-frame syntax, for example —
belong in a named variable outside the JSX with a comment saying why, not in the allowlist.

## Styling

Tailwind v4, CSS-first — **there is no `tailwind.config.js` or `postcss.config.js` anywhere in this
repo**. `src/styles.css` is a single `@import` of `@opendatacapture/react-core/globals.css`, which
holds the `@source` directives.

Use `cn` from `@douglasneuroinformatics/libui/utils`; importing `clsx` or `tailwind-merge` directly
is an eslint error. Prefer semantic libui tokens (`bg-muted`, `text-muted-foreground`) over raw
colour scales. Class order is fixed by prettier — don't hand-sort.

## Components

Named exports only (`import/no-default-export` enforces this for `src/components/**` outside
`*.stories.tsx`; elsewhere it is convention — `src/services/i18n.ts` default-exports deliberately).
Arrow-function
components. Props typed as `type XProps = {...}` declared immediately above the component — `type`,
never `interface`. Files are PascalCase for components, camelCase for hooks and utils.

A component folder is `Foo/Foo.tsx` + `Foo/index.ts` (`export * from './Foo'`) + optional
`Foo/Foo.stories.tsx`. Stories are discovered centrally by `storybook/config/main.ts`, not by
colocation alone.

Put something in `packages/react-core` instead **only if `apps/gateway` also uses it**.

`data-testid` attributes are the Playwright suite's selectors. Don't remove them; add one when you
add UI that an e2e test will drive.

## Tests

`pnpm exec vitest --project web`. Environment is happy-dom. There are no setup files anywhere in the
repo, and `vite.config.ts` is **not** loaded during tests — `vitest.config.ts` supersedes it, which is
why the `@` alias is redeclared there. Nothing that depends on `import.meta.env` injection or the
runtime plugin works in a unit test.

`src/hooks/__tests__/useInstrumentBundle.test.ts` is the canonical test — read it before writing one.
Mock `axios` and `@/store` with `vi.hoisted` + `vi.mock`; wrap hooks in a fresh `QueryClient` with
`retry: false`.

Two environment gaps to work around explicitly:

- **`@testing-library/jest-dom` is not installed.** `toBeInTheDocument()` does not exist — assert
  with `expect(screen.getByText(x)).toBeTruthy()`.
- **happy-dom has no layout engine.** Rendering a libui `DataTable` needs a `ResizeObserver` stub;
  see `src/__tests__/data-table-server-mode.test.tsx`.

Import `@/services/i18n` for its side effect before rendering any libui component with controls.
