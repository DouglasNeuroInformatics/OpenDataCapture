# apps/api

The NestJS backend. Built on `@douglasneuroinformatics/libnest`, which replaces enough of standard
NestJS that stock Nest tutorials will mislead you. Fastify, MongoDB via Prisma, Zod for validation,
CASL for permissions.

Read the root `AGENTS.md` first for the rules that apply everywhere.

> This service holds clinical data segregated by group. The two rules under
> [Permissions](#permissions) are the ones worth being slow and careful about — everything else in
> this file is recoverable.

## How it differs from stock NestJS

There is **no `nest-cli.json`, no `AppModule` class, and no `NestFactory.create`**. `src/main.ts`
default-exports `AppFactory.create({...})`, and the `libnest` CLI (`libnest dev` / `libnest build`)
drives it. `libnest.config.ts` is the real entry configuration.

| Stock NestJS                      | Here                                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `@nestjs/config`                  | libnest `ConfigService`, typed from `$Env` — `.get(key)` is fully inferred                                  |
| a `PrismaService` you write       | `@InjectModel('Group') private readonly groupModel: Model<'Group'>`                                         |
| `class-validator` DTOs            | Zod, via `@ValidationSchema($Schema)` and a global `ValidationPipe`                                         |
| you register global pipes/filters | `AppFactory` registers the exception filter, validation pipe, throttler, config, crypto and logging modules |

`libnest.config.ts` also carries the `declare module` augmentation that types `ConfigService`,
`Model<'X'>` and `@CurrentUser()`. Deleting or renaming those interfaces silently degrades every
call site to `any`.

libnest publishes its TypeScript source — read
`node_modules/@douglasneuroinformatics/libnest/src` rather than guessing at a signature.

## Adding a feature module

**Read `src/groups/` end to end first.** It is the canonical shape:

```
src/<feature>/
  <feature>.module.ts       @Module({ controllers, exports: [Service], providers: [Service] })
  <feature>.controller.ts   @Controller(path); @RouteAccess on every handler
  <feature>.service.ts      @Injectable; @InjectModel(...) per model
  dto/create-<x>.dto.ts     @ValidationSchema($CreateXData) class CreateXDto implements CreateXData
  __tests__/<feature>.service.spec.ts
```

There is no repository layer and no `entity/` folder — `Model<'X'>` _is_ the repository.

**A new module must be added to the `imports` array in `src/main.ts`** or its routes will not exist.
Modules can be imported conditionally with `{ module: XModule, when: 'SOME_BOOLEAN_ENV_KEY' }`.

Full checklist: `.agents/docs/playbooks/add-api-endpoint.md`.

## Permissions

Two independent things must both be right. The guard checks the _subject type_; only the service can
check _which rows_.

**1. Every handler needs `@RouteAccess`.** A handler without one throws
`InternalServerErrorException` at request time — so the failure mode is a 500, not an accidentally
public route. This is eslint-enforced. Know what you are choosing:

| Value                               | Means                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| `@RouteAccess('public')`            | No authentication at all. Only three routes use this; adding a fourth is a security decision. |
| `@RouteAccess([])`                  | `[].every(...)` is `true` — **any authenticated user**. Easy to write by accident.            |
| `@RouteAccess({ action, subject })` | `ability.can(action, subject)` on the subject _type_ only.                                    |

**2. Every service query must be scoped.** Take `{ ability }: EntityOperationOptions = {}` as the
last parameter, have the controller forward `@CurrentUser('ability')`, and put `accessibleQuery` in
the `where`:

```ts
async findById(id: string, { ability }: EntityOperationOptions = {}) {
  const group = await this.groupModel.findFirst({
    where: { AND: [accessibleQuery(ability, 'read', 'Group')], id }
  });
  ...
}
```

`accessibleQuery(undefined, ...)` returns `{}` — **an omitted or undefined ability means no
restriction**, which reads clinical data across every group. Nothing catches this: not `tsc`, not
eslint, not a passing test suite. It is the single highest-severity mistake available in this
codebase, so verify the `where` clause of any query you add or edit.

Granting a new `action`/`subject` pair means editing `src/auth/ability.factory.ts` and adding tests
for **both** the allow and the deny case — see `src/auth/__tests__/ability.factory.test.ts`.

CASL subjects are derived automatically from the Prisma `TypeMap`, so every model is a subject
without you doing anything. But the subjects a user can be _granted_ through `additionalPermissions`
come from **two hand-maintained lists that must agree with each other**: `enum AppSubject` in
`prisma/schema.prisma` and `$AppSubjectName` in `packages/schemas/src/core/core.ts`. Both currently
list the same eight models plus `all`. Three models — `AuditLog`, `InstrumentRecordFile` and
`SetupState` — appear in neither, so no user can be granted a permission naming them; they are
reachable only through rules the ability factory writes itself. Adding a model that users should be
able to hold a permission on means editing both lists.

Background: `.agents/docs/architecture/auth-and-permissions.md`.

## Validation

The global `ValidationPipe` runs on **request bodies only**. Two patterns, both in use:

- **DTO class** (dominant): `@ValidationSchema($CreateGroupData)` on a class that also
  `implements CreateGroupData`. The decorator supplies both validation and Swagger metadata; the
  `implements` is what stops the class drifting from the schema. Both are required.
- **Schema as the parameter type**: `@Body() data: $CreateSeriesInstrumentData`, where the schema is
  exported as a type and a const under the same name. **It must be imported as a value.**
  `import type` erases the runtime binding and the pipe throws when the route is called.

**Params and query strings are not validated automatically.** Use `new ParseSchemaPipe({ schema })`
or `ValidObjectIdPipe` explicitly — see `src/audit/audit.controller.ts` and
`src/instrument-records/instrument-records.controller.ts`.

## Prisma / database

Provider is **MongoDB, so there are no migrations** — `prisma db push` only, and nothing to check in
after a schema change beyond `schema.prisma` itself.

`datasource db { url = env("_") }` in `apps/api/prisma/schema.prisma` is **deliberate**; the real
connection string is built at runtime in `src/core/prisma.ts`. Do not "fix" it.

When `NODE_ENV=test`, `src/core/prisma.ts` starts an in-memory replica set
(`mongodb-memory-server`), which is how `pnpm dev:test` and the Playwright suite get a database
without external Mongo. Local development does need a real replica set — see the header comment in
`docker-compose.dev.yaml`.

Every model has `@@map("<Name>Model")`. libnest's Prisma extension adds `model.exists(where)` and a
computed `__modelName` field, which is what CASL subject detection reads.

## Configuration

All environment variables are declared in `$Env` (`src/core/schemas/env.schema.ts`) and read through
`ConfigService`. **Reading `process.env` directly is an eslint error** — the one exception is
`src/core/decorators/throttle-login-request.decorator.ts`, where decorator arguments are evaluated
before the DI container exists.

Env values are strings, so use the `$BooleanLike` / `$NumberLike` / `$UrlLike` coercion helpers from
libjs, not `z.boolean()`. Cross-field requirements go in the `.transform` at the bottom of `$Env`. A
missing or invalid variable is a hard startup crash, by design.

Adding a variable touches several files that must agree — follow
`.agents/docs/playbooks/add-env-var.md` step by step.

## Tests

`pnpm exec vitest --project api`. These are **unit tests with a mocked Prisma layer**; there are no
integration tests in the suite.

`src/groups/__tests__/groups.service.spec.ts` is the canonical example. Build a testing module with
`MockFactory.createForModelToken(getModelToken('Group'))` from
`@douglasneuroinformatics/libnest/testing`, type mocks as `MockedInstance<Model<'Group'>>`, and
assert Prisma arguments with `model.create.mock.lastCall?.[0]` and `toMatchObject`. A fresh module is
compiled per test, so there is no shared mock state to reset.

The `apps/api/vitest.config.ts` `libnest` plugin is required — it applies the SWC decorator
transforms, without which `@Injectable`/`@Body` metadata does not exist at runtime.

Ignore `apps/api/.vscode/test/*` — it is stale, never runs, and references modules that no longer
exist.

## Build

`libnest build` bundles to a single `dist/app.js` via esbuild. The `build.onComplete` hook in
`libnest.config.ts` copies `@opendatacapture/runtime-v1/dist` and the export worker into `dist/`.
**Any other non-bundled runtime asset must be copied there too, or it will not exist in production.**

`#runtime/v1/*` is a Node subpath import declared in `apps/api/package.json` and mirrored in
`apps/api/tsconfig.json` — two files that must agree. See
`.agents/docs/architecture/runtime-and-vendor.md`.
