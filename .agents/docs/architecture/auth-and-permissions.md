# Authorization in `apps/api`

CASL (`@casl/ability` + `@casl/prisma`) over Prisma models, evaluated in two independent places.
**Getting one right does not make the other right.** Everything below hangs off that split.

| Layer             | Where                                                                                       | What it can see                                                  | What it cannot see                                   |
| ----------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| `JwtAuthGuard`    | `src/auth/guards/jwt-auth.guard.ts`, registered as `APP_GUARD` in `src/auth/auth.module.ts` | The `@RouteAccess` metadata — an **action and a subject _type_** | Any row. It runs before the handler and has no data. |
| The service query | every `*.service.ts`                                                                        | The actual rows, via `accessibleQuery` in the Prisma `where`     | Nothing enforces it is called                        |

A `GROUP_MANAGER` who passes `@RouteAccess({ action: 'read', subject: 'Subject' })` has proved only
that they may read _some_ subject. Whether they may read _this_ subject is decided by the `where`
clause, and only there.

## Layer 1 — `@RouteAccess`

Every controller handler needs one. The guard throws `InternalServerErrorException` when the
metadata is absent, so a forgotten decorator is a 500, never an open route. It is also
eslint-enforced: `REQUIRE_ROUTE_ACCESS` in the root `eslint.config.js` flags any
`@Get`/`@Post`/`@Patch`/`@Put`/`@Delete` method in `apps/api/src/**/*.controller.ts` without it.

| Value                        | Meaning                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| `'public'`                   | No authentication at all. Three routes use it — see below.                                   |
| `{ action, subject }`        | `ability.can(action, subject)` against the subject **name**.                                 |
| `[{ action, subject }, ...]` | `.every(...)` — all must pass.                                                               |
| `[]`                         | `[].every(...)` is `true`, so this is **any authenticated user**. Easy to write by accident. |

Routes are URI-versioned (`version: '1'` in `src/main.ts`), so paths are `/v1/...`.

The full inventory of non-ordinary access declarations, current as of writing:

| Route                             | Declaration                                                                                   | Why it is safe                                                                                                                                                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /v1/auth/login`             | `'public'`                                                                                    | `@ThrottleLoginRequest()`; credentials checked in `AuthService.login`.                                                                                                                                                             |
| `GET /v1/setup`                   | `'public'`                                                                                    | Returns only `SetupState` (branding, flags, release, uptime).                                                                                                                                                                      |
| `POST /v1/setup`                  | `'public'`                                                                                    | **`SetupService.initApp` drops the whole database.** Its only protection is `if (savedOptions?.isSetup && !isDev) throw new ForbiddenException()` — an initialised production instance refuses, a development instance never does. |
| `DELETE /v1/setup`                | `{ action: 'delete', subject: 'all' }`                                                        | Also refuses unless `NODE_ENV === 'test'`.                                                                                                                                                                                         |
| `PATCH /v1/setup`                 | `{ action: 'manage', subject: 'all' }`                                                        | Only `ADMIN` gets `manage all`.                                                                                                                                                                                                    |
| `GET /v1/audit/logs`              | `{ action: 'manage', subject: 'all' }`                                                        | `AuditService.find` is deliberately unscoped; the guard is the whole check.                                                                                                                                                        |
| `GET /v1/gateway/healthcheck`     | `[]`                                                                                          | Any authenticated user. Module only loads when `GATEWAY_ENABLED`.                                                                                                                                                                  |
| `POST /v1/instruments`            | `{ action: 'manage', subject: 'Instrument' }`                                                 | No base permission level grants `manage Instrument`, so this is `ADMIN`-only in practice.                                                                                                                                          |
| `PATCH /v1/users/self-update/:id` | `{ action: 'read', subject: 'User' }`                                                         | Deliberately weak; `UsersService.updateSelfById` throws `ForbiddenException` unless `id === currentUser.id`. The controller carries a comment saying so.                                                                           |
| `GET /v1/summary`                 | five-element array (`read` on `Instrument`, `InstrumentRecord`, `Session`, `Subject`, `User`) | The only use of the multi-element array form; all five must pass.                                                                                                                                                                  |

Adding a fourth `'public'` route, or a second `[]`, is a security decision — raise it rather than
deciding alone.

## Layer 2 — row scoping in the service

Convention: the service method takes `{ ability }: EntityOperationOptions = {}` (`src/core/types.ts`)
as its last parameter, the controller forwards `@CurrentUser('ability')`, and the ability goes into
the Prisma `where` through `accessibleQuery(ability, action, modelName)`. The dominant shape is
`where: { AND: [accessibleQuery(...)], id }`; `src/groups/groups.service.ts` is the cleanest example.

```ts
// src/auth/ability.utils.ts
export function accessibleQuery<T extends Prisma.ModelName>(ability: AppAbility | undefined, ...) {
  if (!ability) {
    return {};
  }
  ...
}
```

**An omitted or `undefined` ability returns `{}`, which is an empty `where` — no restriction at
all.** For clinical models that reads every group's data. Nothing catches it: not `tsc` (the
parameter is optional), not eslint, not a passing test. This is the highest-severity mistake
available in this codebase. Check the `where` clause of every query you add or touch, and check
that the controller actually forwards `@CurrentUser('ability')` — `EntityOperationOptions.ability`
is optional, so a controller that simply never passes it compiles and runs.

One call site uses `{ ...accessibleQuery(...), id: subjectId }` instead of `AND: [...]`
(`src/subjects/subjects.service.ts`). Spreading merges keys and will silently lose a condition if
the generated query and the literal share one. Prefer `AND`.

### Object-level checks

When you hold a plain object rather than a Prisma result, CASL cannot infer its subject type. Use
`forcedAppSubject(name, partial)` from `src/auth/ability.utils.ts`, which stamps the `__modelName`
field that `detectAppSubject` reads. `src/instrument-records/files/files.service.ts` is the only
production use:

```ts
currentUser.ability.can('create', forcedAppSubject('InstrumentRecordFile', { groupId: record.groupId }));
```

Prisma results already carry `__modelName` — it is a computed field added by
`LibnestPrismaExtension`, wired up in `src/core/prisma.ts`.

## Where an ability comes from

1. `AuthService.login` builds one with `AbilityFactory.createForPayload`, switching on
   `basePermissionLevel` (`ADMIN` / `GROUP_MANAGER` / `STANDARD`) and then applying the user's
   `additionalPermissions` on top.
2. The **serialized rules** (`ability.rules`) are signed into the JWT alongside the payload,
   `expiresIn: '1h'`.
3. On every request `JwtStrategy.validate` rebuilds the ability from those rules with
   `createForPermissions` and attaches it to `request.user`.

Consequences worth knowing:

- **Permissions are frozen into the token.** Changing a user's groups, base level or additional
  permissions has no effect until they obtain a new token. There is no refresh endpoint.
- **`basePermissionLevel` is nullable** and the `switch` has no `default`, so a user with `null` gets
  only whatever `additionalPermissions` grants — usually nothing.
- **JWT expiry is ignored in development.** `ignoreExpiration: configService.getOrThrow('NODE_ENV') === 'development'`
  in `src/auth/strategies/jwt.strategy.ts`. A dev token never expires; do not conclude from local
  testing that expiry works.
- `AuthService.getCreateInstrumentToken` mints a second, narrower token signed with **only**
  `{ permissions: [{ action: 'create', subject: 'Instrument' }] }`. It carries no `id`, `username` or
  `groups`, so `@CurrentUser()` fields other than `ability` are `undefined` on any route it reaches.

The `RequestUser` shape (`TokenPayload` plus `ability`) is declared in the `declare module`
augmentation at the top of `apps/api/libnest.config.ts`.

## Subject types: one derived list, two hand-maintained ones

`src/auth/auth.types.ts` derives subjects from Prisma, so every model is automatically a CASL
subject and `AppSubjectName` needs no maintenance:

```ts
type AppSubjectModels = {
  [K in keyof Prisma.TypeMap['model']]: DefaultSelection<Prisma.TypeMap['model'][K]['payload']>;
};
type AppSubjects = 'all' | Subjects<AppSubjectModels>;
```

Two other lists gate what can be _stored and transmitted_ as a user permission, and both are
hand-written:

| List              | File                                | Constrains                                                 |
| ----------------- | ----------------------------------- | ---------------------------------------------------------- |
| `enum AppSubject` | `apps/api/prisma/schema.prisma`     | `type AuthRule.subject`, i.e. `User.additionalPermissions` |
| `$AppSubjectName` | `packages/schemas/src/core/core.ts` | `$UserPermission`, the wire format for the same field      |

**These two currently agree with each other but not with the derived list.** They contain `all`,
`Assignment`, `Group`, `Instrument`, `InstrumentRecord`, `InstrumentRepo`, `Session`, `Subject`,
`User`. The Prisma schema also defines `AuditLog`, `InstrumentRecordFile` and `SetupState`, which
are therefore valid in `@RouteAccess` and in `AbilityFactory` rules (`InstrumentRecordFile` is used
in both) but cannot be granted as an `additionalPermission`. Treat that as the existing state, not
as a licence to widen it silently.

Adding a rule for a new model means editing `src/auth/ability.factory.ts` and adding tests for
**both** the allow and the deny case. If it must also be assignable per-user, update the Prisma
enum and `$AppSubjectName` together.

## Adjacent things that are not the permission system

- **Audit logging is not automatic.** `AuditLogger` (`src/audit/audit.logger.ts`) is injected into
  exactly two services and produces exactly three log calls: `CREATE`/`UPDATE` on `ASSIGNMENT`
  (`src/assignments/assignments.service.ts`) and `LOGIN` on `USER` (`src/auth/auth.service.ts`).
  Nothing else in the API writes an audit log. Do not assume a new mutation is recorded.
- **`user.hashedPassword` is globally omitted** by the Prisma client constructed in
  `src/core/prisma.ts`. `UsersService.findByUsername` re-enables it via
  `{ includeHashedPassword: true }`, which is how login reads it. Individual `UsersService` methods
  also pass `omit: { hashedPassword: true }` explicitly — redundant, but harmless.
- **Password policy lives in `UsersService.validatePassword`** (private): strength via
  `estimatePasswordStrength` from libpasswd, rejection when the password equals the username, and a
  Have I Been Pwned breach check that **fails open** if the API is unreachable. It runs on `create`,
  `updateById` and `updateSelfById`. Failures throw `BadRequestException` with a machine-readable
  `code` from `PASSWORD_ERROR_CODES` (`packages/schemas/src/user/user.ts`) so the web client can
  localize; the API does not localize.

## Tests

`pnpm exec vitest --project api`. Two suites define the contract and are the ones to extend:

- `src/auth/__tests__/ability.factory.test.ts` — role-to-rule mapping. Each case asserts an allow
  _and_ a deny.
- `src/auth/__tests__/ability.utils.test.ts` — pins the `undefined` ability behavior and
  `forcedAppSubject`.
- `src/auth/guards/__tests__/jwt-auth.guard.spec.ts` — the guard's own branches.

Service tests mock the Prisma layer, so they verify the arguments passed to the model, not the
database's answer. Assert the `where` clause the same way the existing specs assert `data`:
`model.<method>.mock.lastCall?.[0]` plus `toMatchObject` — see
`src/groups/__tests__/groups.service.spec.ts`.

Row-level scoping is not observable in a unit test with a mocked model, which is why an end-to-end
test in `testing/` is required for anything that changes who can see what.
