# Add a data-fetching hook to `apps/web`

Conventions live in `apps/web/AGENTS.md` — read it first. This is the order of operations; a skipped
step compiles, then fails at runtime or serves the wrong cached data.

1. **Put the response schema in `packages/schemas`**, exported from
   `@opendatacapture/schemas/<domain>`. Query _parameter_ types stay in the hook file
   (`SubjectsQueryParams` in `apps/web/src/hooks/useSubjectsQuery.ts`).

2. **Create `apps/web/src/hooks/use<Name>Query.ts`**, one hook per file, no barrel.
   `useSubjectsQuery.ts` is the whole pattern in 22 lines.

3. **Export the `queryOptions` factory as well as the hook**, so a route loader can prefetch through
   it (`apps/web/src/routes/_app/admin/audit/logs.tsx`). The loader must pass the factory exactly the
   params the component passes the hook, including ones the component adds from its own state (that
   route's `page` and `sortOrder`); otherwise it prefetches a different key and the component fetches
   again on mount.

4. **Parse in `queryFn`** — `$Subject.array().parse(response.data)`, never `response.data` raw. This
   is the app's only validation boundary.

5. **Put every input that changes the response into `queryKey`**, including ones the caller never
   passes: the selected group id (`useInstrumentBundle.ts`) and `resolvedLanguage`
   (`useInstrumentInfoQuery.ts`). A missing element silently serves another group's or language's
   cached data.

6. **Export the first key element as `X_QUERY_KEY` if a mutation will invalidate it**
   (`GROUPS_QUERY_KEY` in `useGroupsQuery.ts`). Invalidation is prefix-matched, so one key clears
   every parameterised variant.

7. **Default to `useSuspenseQuery`.** Needing `enabled`, `throwOnError` or `placeholderData` means
   `useQuery` — gated fetching in `useInstrumentBundle.ts`, `keepPreviousData` paging in
   `useAuditLogsQuery.ts`.

8. **No React Query `retry`, no `axios.create`.** Retries, the 10s timeout, auth headers and the error
   toast are interceptors in `apps/web/src/services/axios.ts`. Opt one request out with its `meta`
   bag: `disableDefaultTimeout` (the server may legitimately take >10s), `disableDefaultErrorNotification`
   (the caller shows its own error), `disableDefaultAuth` (must go out unauthenticated).

9. **Mutations go in `use<X>Mutation.ts`.** `onSuccess` calls `addNotification({ type: 'success' })`
   from `useNotificationsStore`, then `void queryClient.invalidateQueries({ queryKey: [X_QUERY_KEY] })`
   — the `void` satisfies `no-floating-promises`. See `useCreateGroupMutation.ts`.

10. **If a rejection is an outcome the user must read**, override the app-wide `throwOnError: true`
    (`apps/web/src/services/react-query.ts`): `throwOnError: false` on the mutation _and_
    `meta: { disableDefaultErrorNotification: true }` on the request, then notify in `onError` with
    `getApiErrorMessage(err, t({ en: …, es: …, fr: … }))` from `@/utils/error`. Without the meta flag
    the user gets two toasts. See `useDeleteSeriesInstrumentMutation.ts`.

11. **Write the unit test** in `apps/web/src/hooks/__tests__/<hookName>.test.ts`, either rendering the
    hook against a fresh `QueryClient` with `retry: false` (`useInstrumentBundle.test.ts`) or running
    the factory through `new QueryClient().fetchQuery(...)` (`useAuditLogsQuery.test.ts`). Mock `axios`,
    `@/store` and `@douglasneuroinformatics/libui/hooks` with `vi.hoisted` + `vi.mock`. Assert that two
    parameter sets produce different keys; that is what catches step 5.

12. **Add the end-to-end test**: `.agents/docs/playbooks/add-e2e-test.md`.

## Verify

```sh
pnpm exec vitest apps/web/src/hooks/__tests__/<hookName>.test.ts
pnpm exec vitest --project web
pnpm lint && pnpm test:coverage
```
