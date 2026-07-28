# Playbook: add an endpoint to `apps/api`

Conventions are in `apps/api/AGENTS.md`; the permission model is
`.agents/docs/architecture/auth-and-permissions.md`. Read both first — this file is only the order of
operations, because most of these steps fail at request time rather than at compile time. Almost
every step has a counterpart in `apps/api/src/groups/`, the canonical feature module (step 6's
examples live in other controllers, as noted there).

## Checklist

1. **Schema.** Put the request/response shape in `packages/schemas/src/<domain>/<domain>.ts`. A
   **new** domain folder also needs an entry in the hand-maintained `exports` map of
   `packages/schemas/package.json`, or the import will not resolve. See `packages/schemas/AGENTS.md`.

2. **Prisma model**, only if the endpoint persists a new one. Add it to
   `apps/api/prisma/schema.prisma` with `@@map("<Name>Model")`, then run
   `pnpm --filter @opendatacapture/api db:generate`. Provider is MongoDB, so there is no migration.
   `AppSubjectName` in `apps/api/src/auth/auth.types.ts` is derived from the generated Prisma types,
   so the model becomes a valid `@RouteAccess` subject with no edit — but only once regenerated.

3. **Service method** in `apps/api/src/<feature>/<feature>.service.ts`. Last parameter is
   `{ ability }: EntityOperationOptions = {}` (`apps/api/src/core/types.ts`), and the ability must
   reach the Prisma `where`:

   ```ts
   const group = await this.groupModel.findFirst({
     where: { AND: [accessibleQuery(ability, 'read', 'Group')], id }
   });
   ```

   `accessibleQuery(undefined, ...)` returns `{}`, meaning **no restriction at all**. Nothing catches
   an omitted ability: not tsc, not eslint, not a green test suite.

4. **Request body typing**, if the handler takes a body. Pick one of the two patterns in use:
   - a DTO class in `apps/api/src/<feature>/dto/<verb>-<x>.dto.ts` carrying **both**
     `@ValidationSchema($CreateXData)` and `implements CreateXData` — see
     `apps/api/src/groups/dto/create-group.dto.ts`;
   - or the schema as the parameter type (`@Body() data: $CreateSeriesInstrumentData`), which **must
     be a value import**. `import type` erases the runtime binding and the pipe throws when the route
     is called. See `apps/api/src/instruments/instruments.controller.ts`.

5. **Controller handler** in `apps/api/src/<feature>/<feature>.controller.ts`. Every handler needs
   `@RouteAccess` (eslint-enforced; missing it is a 500 at request time, not an open route), and any
   handler whose service method takes an ability must forward `@CurrentUser('ability')`. The guard
   checks the subject _type_ only — step 3 is the only thing that checks rows.

6. **Params and query strings are not validated by the global pipe**, which covers bodies only.
   Attach `new ParseSchemaPipe({ schema })` or `ValidObjectIdPipe` explicitly — see
   `apps/api/src/audit/audit.controller.ts` and
   `apps/api/src/instrument-records/instrument-records.controller.ts`.

7. **Module.** A new feature needs `apps/api/src/<feature>/<feature>.module.ts` (controller in
   `controllers`, service in `providers` and, by convention here, `exports`) **and** an entry in the
   `imports` array of `apps/api/src/main.ts`. There is no `AppModule`; omitting `main.ts` means the
   route silently does not exist.

8. **Permissions**, if the endpoint needs an action/subject pair no role currently grants. Edit
   `apps/api/src/auth/ability.factory.ts` and add **both an allow and a deny** case to
   `apps/api/src/auth/__tests__/ability.factory.test.ts`. To make the subject assignable as a
   per-user `additionalPermission`, two hand-maintained lists must be updated together: `enum
AppSubject` in `apps/api/prisma/schema.prisma` and `$AppSubjectName` in
   `packages/schemas/src/core/core.ts`. They are narrower than the derived list on purpose.

9. **Service spec** at `apps/api/src/<feature>/__tests__/<feature>.service.spec.ts`. Copy the setup
   from `apps/api/src/groups/__tests__/groups.service.spec.ts`:
   `MockFactory.createForModelToken(getModelToken('X'))` per injected model, then assert with
   `model.<method>.mock.lastCall?.[0]` and `toMatchObject`. Assert the `where` clause, not only
   `data`.

10. **End-to-end test** in `testing/` — row scoping is invisible to a unit test with a mocked Prisma
    layer, so anything changing who can see what needs one. Follow
    `.agents/docs/playbooks/add-e2e-test.md`. If the endpoint is useful for seeding preconditions,
    add a method to `testing/src/support/api-client.ts`.

## Verify

```sh
pnpm --filter @opendatacapture/api db:generate   # only if schema.prisma changed
pnpm lint
pnpm exec vitest --project api
pnpm test:e2e
```
