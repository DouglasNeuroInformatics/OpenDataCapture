# Playbook: add an endpoint to `apps/api`

The order of operations only; the conventions and their reasons are in `apps/api/AGENTS.md`, the
permission model in `.agents/docs/architecture/auth-and-permissions.md`. Most of these steps fail at
request time rather than compile time. `apps/api/src/groups/` has a counterpart for almost every
step.

## Checklist

1. **Schema** in `packages/schemas/src/<domain>/<domain>.ts`. A new domain folder also needs an entry
   in the hand-maintained `exports` map of `packages/schemas/package.json`, or the import will not
   resolve.

2. **Prisma model**, only if the endpoint persists a new one: add it to
   `apps/api/prisma/schema.prisma` with `@@map("<Name>Model")`, then run
   `pnpm --filter @opendatacapture/api db:generate` (MongoDB, so no migration). The model becomes a
   valid `@RouteAccess` subject only once the client is regenerated.

3. **Service method** in `src/<feature>/<feature>.service.ts`, with
   `{ ability }: EntityOperationOptions = {}` as its last parameter and the ability in every Prisma
   `where`:

   ```ts
   where: {
     AND: ([accessibleQuery(ability, 'read', 'Group')], id);
   }
   ```

   `accessibleQuery(undefined, …)` returns `{}`, an unrestricted query, and nothing catches it. Done
   when every query in your diff either calls `accessibleQuery` or is unscoped for a reason you state.

4. **Body**: type the parameter as the schema, `@Body() data: $CreateXData`, imported as a **value**.
   `import type` erases the binding and the pipe throws on the first request.

5. **Controller handler** in `src/<feature>/<feature>.controller.ts`: a `@RouteAccess` on every
   handler (state it if you chose `'public'` or `[]`), and the ability forwarded in the shape its
   service takes (`apps/api/AGENTS.md` §Permissions). The guard checks the subject type only; nothing
   checks the forwarding, so open each handler.

6. **Params and query strings** need an explicit `new ParseSchemaPipe({ schema })` or
   `ValidObjectIdPipe`; the global pipe covers bodies only.

7. **Module**: a new feature needs `src/<feature>/<feature>.module.ts` **and** an entry in the
   `imports` array of `apps/api/src/main.ts`, or the route silently does not exist.

8. **Permissions**, if no role grants the action/subject pair yet: edit
   `src/auth/ability.factory.ts` and add an allow **and** a deny case to
   `src/auth/__tests__/ability.factory.test.ts`. To make the subject grantable per user, add it to
   `enum AppSubject` (`schema.prisma`) and `$AppSubjectName` (`packages/schemas/src/core/core.ts`) in
   the same commit, since nothing compares the two; `tsc` then asks for its group field in
   `GROUP_SCOPED_CONDITIONS` unless `$GroupScopableSubjectName` excludes it.

9. **Service spec** at `src/<feature>/__tests__/<feature>.service.test.ts`, set up like
   `src/groups/__tests__/groups.service.test.ts`. Assert the `where`, not only `data`.

10. **End-to-end test** (`.agents/docs/playbooks/add-e2e-test.md`): a mocked Prisma layer cannot see
    row scoping. An endpoint useful for seeding preconditions also gets a method on
    `testing/src/support/api-client.ts`.

11. **Renamed a path, or changed a method or status code?** Three consumers hard-code them and no
    compiler connects them: `apps/web/src/hooks/` (a 404 at runtime), `testing/src/support/api-client.ts`
    (a red `pnpm test:e2e`) and `cli/odc-cli` (checked by nothing; `cli/AGENTS.md` lists its
    endpoints). `api-client.ts` builds paths as `${API}/<segment>`, so grep the bare segment:
    `grep -rn '<segment>' apps/web/src cli/odc-cli testing/src`.

## Verify

```sh
pnpm --filter @opendatacapture/api db:generate   # only if schema.prisma changed
pnpm lint
pnpm exec vitest --project api
pnpm test:e2e
```
