# Add a data-fetching hook to `apps/web`

Conventions live in `apps/web/AGENTS.md` — read it first. This is the order of operations; a skipped
step type-checks and compiles, and fails at runtime or serves the wrong cached data.

1. **Get the response schema into `packages/schemas` first**, exported from
   `@opendatacapture/schemas/<domain>` (`./subject`, `./audit`, `./group`, …) — not into `apps/web`.
   Query _parameter_ types do stay local to the hook file (`SubjectsQueryParams` in
   `apps/web/src/hooks/useSubjectsQuery.ts`).

2. **Create `apps/web/src/hooks/use<Name>Query.ts`** — one file per hook, named after its export, no
   barrel file to register it in. Read `apps/web/src/hooks/useSubjectsQuery.ts` first: at 22 lines it
   is the entire pattern.

3. **Export the `queryOptions` factory as well as the hook.** Route loaders prefetch through the
   factory, e.g. `context.queryClient.ensureQueryData(auditLogsQueryOptions({ params: deps.search }))`
   in `apps/web/src/routes/_app/admin/audit/logs.tsx`. A hook that inlines its options cannot be
   prefetched by the route rendering it.

4. **Parse in `queryFn`, never return `response.data` raw.** `$Subject.array().parse(response.data)`.
   This is the app's only validation boundary; everything downstream trusts the result.

5. **Put every input that changes the response into `queryKey`**, including the ones the caller never
   passes: the selected group id (`apps/web/src/hooks/useInstrumentBundle.ts`) and
   `resolvedLanguage` (`apps/web/src/hooks/useInstrumentInfoQuery.ts`). A missing key element serves
   another group's or another language's cached data, silently.

6. **Export the first key element as a `X_QUERY_KEY` const if a mutation will invalidate it** — see
   `GROUPS_QUERY_KEY` in `apps/web/src/hooks/useGroupsQuery.ts`. Invalidation is prefix-matched, so
   `['instrument-info']` clears every parameterised variant.

7. **Default to `useSuspenseQuery`** so `.data` is non-nullable. Its options type omits `enabled`,
   `throwOnError` and `placeholderData`; needing any of those means `useQuery` instead — gated
   fetching in `useInstrumentBundle.ts`, `placeholderData: keepPreviousData` paging in
   `apps/web/src/hooks/useAuditLogsQuery.ts`.

8. **Do not add a React Query `retry` and do not call `axios.create`** (the latter is an eslint
   error). Retries, the 10s timeout, auth headers and the error toast are interceptors on the default
   instance in `apps/web/src/services/axios.ts`. Opt one request out via the `meta` bag declared there:

   | `meta` key                        | Use when                                      |
   | --------------------------------- | --------------------------------------------- |
   | `disableRetry`                    | An idempotent request must not be retried     |
   | `disableDefaultTimeout`           | The server may legitimately take >10s (setup) |
   | `disableDefaultErrorNotification` | The caller shows its own error message        |
   | `disableDefaultAuth`              | The request must go out unauthenticated       |

9. **Mutations go in `use<X>Mutation.ts`.** `onSuccess` adds a libui notification and invalidates:
   `addNotification({ type: 'success' })` from `useNotificationsStore`, then
   `void queryClient.invalidateQueries({ queryKey: [X_QUERY_KEY] })`. The `void` is required —
   `@typescript-eslint/no-floating-promises` is an error. See `useCreateGroupMutation.ts`.

10. **If a rejection is an expected outcome the user must read**, override the app defaults
    (`throwOnError: true` for both queries and mutations, in `apps/web/src/services/react-query.ts`,
    which routes errors to the route error boundary). Set `throwOnError: false` on the mutation _and_
    `meta: { disableDefaultErrorNotification: true }` on the request, then notify in `onError` with
    `getApiErrorMessage(err, t({ en: …, es: …, fr: … }))` from `@/utils/error`. Omitting the meta flag shows
    two toasts. Canonical: `apps/web/src/hooks/useDeleteSeriesInstrumentMutation.ts`.

11. **Write the unit test in `apps/web/src/hooks/__tests__/<hookName>.test.ts` — never under
    `src/routes/`**, where importing `vitest` or `@testing-library/*` is an eslint error. Two proven
    shapes: render the hook against a fresh `QueryClient` with `retry: false`
    (`__tests__/useInstrumentBundle.test.ts`), or run the options factory through a real client with
    `new QueryClient().fetchQuery(...)` (`__tests__/useAuditLogsQuery.test.ts`). Mock `axios`, `@/store`
    and `@douglasneuroinformatics/libui/hooks` with `vi.hoisted` + `vi.mock`. Asserting that two
    parameter sets produce different keys is what catches step 5.

12. **Add the end-to-end test** required by the root `AGENTS.md`:
    `.agents/docs/playbooks/add-e2e-test.md`.

## Verify

```sh
pnpm exec vitest apps/web/src/hooks/__tests__/<hookName>.test.ts   # the new test alone
pnpm exec vitest --project web                                     # every web test
pnpm lint && pnpm test                                             # required before you are done
```
