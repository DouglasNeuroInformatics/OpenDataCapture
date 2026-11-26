# Authorization in `apps/api`

CASL (`@casl/ability` + `@casl/prisma`) over Prisma models, evaluated in two independent places.
Getting one right does not make the other right. The rules for writing code against this are in
`apps/api/AGENTS.md` §Permissions; this file is the mechanism behind them and the inventory of
exceptions.

| Layer             | Where                                                                    | Sees                                                    | Cannot see                    |
| ----------------- | ------------------------------------------------------------------------ | ------------------------------------------------------- | ----------------------------- |
| `JwtAuthGuard`    | `src/auth/guards/jwt-auth.guard.ts`, the `APP_GUARD` in `auth.module.ts` | `@RouteAccess` metadata: an action and a subject _type_ | Any row                       |
| The service query | every `*.service.ts`                                                     | The rows, via `accessibleQuery` in the Prisma `where`   | Nothing enforces it is called |

A `GROUP_MANAGER` who passes `@RouteAccess({ action: 'read', subject: 'Subject' })` has proved only
that they may read _some_ subject; the `where` decides whether they may read _this_ one.

## Layer 1: `@RouteAccess`

`opendatacapture/require-route-access` (`packages/oxlint-config/src/rules/`) flags a handler without
one; the guard turns a missing one into a 500. Nothing checks the value. Routes whose declaration is not the ordinary
`{ action, subject }` on the model they serve:

| Route                             | Declaration                                   | Why it is safe                                                                                                                   |
| --------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `POST /v1/auth/login`             | `'public'`                                    | `@ThrottleLoginRequest()`; credentials checked in `AuthService.login`.                                                           |
| `POST /v1/auth/refresh`           | `[]`                                          | Any login token that has not expired. Which of them is renewed is not a permission; `AuthService.refresh` decides it (below).    |
| `GET /v1/setup`                   | `'public'`                                    | Returns only `SetupState`.                                                                                                       |
| `POST /v1/setup`                  | `'public'`                                    | **`SetupService.initApp` drops the whole database.** It refuses only when `isSetup` is true and `NODE_ENV` is not `development`. |
| `DELETE /v1/setup`                | `{ action: 'delete', subject: 'all' }`        | Also refuses unless `NODE_ENV === 'test'`.                                                                                       |
| `GET /v1/gateway/healthcheck`     | `[]`                                          | Any login token. The module loads only when `GATEWAY_ENABLED`.                                                                   |
| `POST /v1/instruments`            | `{ action: 'manage', subject: 'Instrument' }` | No base level grants it, so admin-only in practice. The one `@AcceptsInstrumentToken()` route (below).                           |
| `PATCH /v1/users/self-update/:id` | `{ action: 'read', subject: 'User' }`         | Deliberately weak; `UsersService.updateSelfById` refuses unless `id === currentUser.id`.                                         |
| `GET /v1/summary`                 | five `read` rules                             | The only multi-element array; all five must pass.                                                                                |

Adding a fourth `'public'` route or a third `[]` is a security decision: raise it rather than
deciding alone.

**`ADMIN_ONLY` (`manage all`) is the only way to confine a route to administrators**, because a
conditional rule satisfies a subject-type check. It is used where any narrower grant would let its
holder escalate (every route that writes a user or their permissions, every `/v1/permission-sets`
route, `POST /v1/groups` per #1468, and `PATCH /v1/groups/:id/archive` and `/unarchive`, which
replaced a `DELETE /v1/groups/:id` that a group manager's `manage Group` reached; `$UpdateGroupData`
omits `archivedAt`, so `PATCH /v1/groups/:id` cannot archive either), and where the data crosses
groups with nothing to scope it by (audit logs, the instrument series overview, every repository's
sync log, mail settings). Most handlers carry their reason in a comment;
`grep -rn 'RouteAccess(ADMIN_ONLY)' apps/api/src` lists them. `UsersService` refuses an admin
archiving, disabling or demoting their own account, so the last admin cannot lock every `ADMIN_ONLY`
route.

**Deliberately unscoped service paths:** `AuditService.find` and
`InstrumentsService.findSeriesOverview` (an administrator belongs to no group), each behind an
`ADMIN_ONLY` guard; `InstrumentsService.findBundleById` called without a `currentUser`, which the
API's gateway module does to resolve an assignment's bundle; and `UsersService.findTokenHolder`,
which `AuthService.refresh` calls with the id off a verified token. That last one must stay
unscoped: a user with no `read User` rule, or a group manager whose groups are all archived, cannot
read themselves, and a scoped lookup would refuse every renewal they ask for. The `currentUser`
parameter of `findBundleById` is optional for the gateway's sake, so a new call site that omits it
compiles and reads every group's instruments.

## Layer 2: row scoping

`accessibleQuery(ability, action, modelName)` (`src/auth/ability.utils.ts`) has three outcomes:

- **`undefined` ability → `{}`**, no restriction at all. Nothing catches an omitted ability.
- **An ability with no rule for the subject → it throws CASL's `ForbiddenError`**, which is not an
  `HttpException` and so renders as a 500. Reachable when the guard names a different subject than
  the service queries. Where such a caller is legitimate, short-circuit with
  `ability.can(action, subject)` and return the empty result (`findInstrumentIdsBySubject` in
  `src/instruments/instruments.service.ts`); `can` refuses in every case where the query would throw.
- Otherwise, the Prisma filter.

Call `accessibleBy` only through `accessibleQuery`. `@casl/prisma` 2 signals "no rule" with
`{ OR: [] }`, which Prisma ignores inside an `AND` (prisma/prisma#17367), so passing it on lifts the
restriction. `accessibleQuery` throws on it instead, which is also why `src/core/prisma.ts` wires no
`createCaslExtension()`.

Write `where: { AND: [accessibleQuery(...)], id }`, never `{ ...accessibleQuery(...), id }`: a
spread silently drops a condition when the generated query and the literal share a key.

**Plain objects need `forcedAppSubject(name, partial)`** before `ability.can`, which stamps the
`__modelName` that `detectAppSubject` reads; without it a plain object resolves to `Object` and only
`manage all` passes. Prisma results already carry `__modelName` (`LibnestPrismaExtension`). Rows from
`aggregateRaw` are plain objects, which is why `queryRecordsRaw` in
`src/instrument-records/instrument-records.service.ts` checks each one this way.

## Where an ability comes from

1. `AuthService.signLoginToken`, which login and renewal both sign through, builds it with
   `AbilityFactory.createForPayload`: the `basePermissionLevel` switch, then the permission set's
   rules (`HOLDER_GROUPS` conditioned on the holder's groups, `ALL_GROUPS` unconditional), then
   `additionalPermissions` (a `groupId` applies that model's `GROUP_SCOPED_CONDITIONS` entry). It first leaves every **archived** group (`Group.archivedAt`
   set) off the payload's `groups`, so no rule derived from them applies, and drops every grant
   confined to a group outside the remaining ones; since a grant is accepted only for a group the
   user belongs to, that is exactly the grants confined to an archived group. A rule that is not
   confined (a `null` `groupId`, `ALL_GROUPS`, an admin's `manage all`) still reads an archived
   group's rows, which is how administrators see and unarchive it. Its records, files and series
   stay where they are.
2. The serialized rules are signed into the JWT with the payload. The token lasts one hour, or the
   idle limit for an interactive sign-in (see "Token lifetime and renewal").
3. On every request `JwtStrategy.validate` rebuilds the ability with `createForPermissions` and
   attaches it to `request.user`.
4. `POST /v1/auth/refresh` repeats steps 1 and 2 for the holder of an unexpired login token, reading
   the user, their groups and their permission set from the database again.

Consequences:

- **Permissions are frozen into the token until it is renewed or replaced.** A change to a user's
  groups, level, grants or permission set, to the set itself, or the archiving of a group they belong
  to takes effect at their next renewal or login. The web app renews while its user is working; a
  client that never renews keeps what its token says for the hour it lasts.
- **`basePermissionLevel` is nullable** and the switch has no `default`, so a `null` user gets only
  what their set or grants give.
- **JWT expiry is ignored in development** (`ignoreExpiration` in
  `src/auth/strategies/jwt.strategy.ts`). Local testing proves nothing about expiry: an expired token
  is even renewed there, until the absolute limit, which the service enforces itself.
- **Every token carries a `kind`.** `getCreateInstrumentToken` mints an `'instrument'` token holding
  only `manage Instrument`, for the playground's uploads. `JwtAuthGuard` refuses it on any route not
  marked `@AcceptsInstrumentToken()`; the one marked route takes no `@CurrentUser()`, so the `id`,
  `username` and `groups` the token lacks are never read. Neither the minting route nor
  `POST /v1/auth/refresh` is marked, or one token could renew itself forever. It expires after an
  hour, or when the sign-in of the login token that minted it ends, whichever is first.

## Token lifetime and renewal

Nothing is stored per sign-in: no session row, no cookie, no refresh token. Everything below is
decided from the signed token and the user's row.

- **A login token lasts one hour unless the login asks for less.** `POST /v1/auth/login` sent with
  the header `INTERACTIVE_SIGN_IN_HEADER` (`packages/schemas/src/auth/auth.ts`) set to `true` gets a
  token lasting `AUTH_IDLE_TIMEOUT_MINUTES` instead (default 15), which is how the web app signs in.
  Any other value, like no header at all, gets the plain hour. That hour is what scripts,
  `cli/odc-cli` and the playground rely on, and it is not configurable.
- **The idle limit is the token's lifetime, not a timer.** The web app renews while it sees input;
  when it stops, the token expires and nothing can renew it, because the refresh route sits behind
  the ordinary guard and takes only an unexpired token.
- **Every login token carries `renewal`** (`TokenRenewal`): when the password was entered, when the
  sign-in ends (`AUTH_ABSOLUTE_TIMEOUT_HOURS` later, default 12), the holder's token generation and
  whether it is interactive. A renewal copies the first and the last unchanged, so no amount of
  activity moves the end, and no token's `exp` passes it. The end is always worked out again from the
  time of entry and the current setting, never read off the token, so lowering the limit applies to
  tokens already issued.
- **`AuthService.refresh` refuses with 401** a token with no `renewal`, one whose holder no longer
  exists, one past the absolute limit and one of an earlier token generation; and with 403 and
  login's own messages an archived or disabled account. A token signed before the route existed has
  no `renewal`, and its `iat` is not a substitute: each renewal would restart the limit.
- **`User.tokenGenerationId` is the only revocation there is.** `UsersService` replaces it with a
  new random id when a password changes, a reset is forced, or the account is disabled or archived,
  and a token carrying any other value is never renewed. Without it, a token from before an account
  was disabled would be renewed again once the account was enabled. It is an id, not a time, because
  it is written in the same document update as the change: login reads it with the hashed password
  (`findByUsername({ includeSignInFields: true })`), so a sign-in racing a password change gets the
  old password with the old id or the new with the new, and no two clocks are compared. The field
  is omitted from every other user query (`src/core/prisma.ts`); `UsersService.findTokenHolder` is
  its one other reader. A token already issued still works until it expires.
- **A copied token can be renewed until the absolute limit.** Accepted when renewal was added
  (#1535): before it, a copy died within the hour. Both limits are capped in `$Env`, the idle one at
  60 minutes and the absolute one at 12 hours, so configuration cannot loosen either past that.
- **Renewals are throttled per user, not per address** (`@ThrottleRefreshRequest()`), since every
  tab in a hospital renews from one address. The throttler guard runs before `JwtAuthGuard`, so the
  tracker reads the id off the unverified token and pairs it with the address.

## Grantable subjects

Every Prisma model is a CASL subject automatically (`src/auth/auth.types.ts`). What can be _stored_
as a grant is narrower and hand-written: `enum AppSubject` (`prisma/schema.prisma`, which also types
permission set rules) and `$AppSubjectName` (`packages/schemas/src/core/core.ts`, the wire format).
Treat the models in neither as deliberate. `PermissionSet` must stay out: a grant on it would let its
holder edit a set they hold, and so grant themselves anything.

`$GroupScopableSubjectName` is `$AppSubjectName` minus `all` (a condition on it would apply to every
model, each naming its group field differently) and `Instrument` (a shared asset with no owning
group). `$UserPermission` refuses a `groupId` on any other subject, and the factory throws on one
anyway.

**Storable is not grantable.** Every route that writes a user is `ADMIN_ONLY`, so a `User` grant of
anything but `read` reaches nothing. `isGrantablePermission` (`core.ts`) encodes that:
`$UpdateUserPermissionsData` applies it and the web permissions editor offers only what it allows.
`isPermissionSetGrantable` (`packages/schemas/src/permission-set/permission-set.ts`) also refuses
`manage all`, since one edit to a set would make every holder an administrator. `$UserPermission`
applies neither, because it is also the read model and grants stored before a rule still have to
parse; the editor marks those "No effect" and drops them on its next save. A new admin-only route
that a grantable pair used to reach belongs in the same predicate.

## Adjacent, but not the permission system

- **Audit logging is not automatic.** Only explicit `AuditLogger.log` calls write one
  (`grep -rn 'auditLogger.log' apps/api/src`); do not assume a new mutation is recorded.
- **`user.hashedPassword` and `assignment.encryptionKeyPair` are globally omitted** by the client in
  `src/core/prisma.ts`. `UsersService.findByUsername({ includeSignInFields: true })` is how login
  reads the hash; `AssignmentsService.findPrivateKeyById`, called only by the gateway synchronizer,
  is the only read of the key.
- **Password policy is `UsersService.validatePassword`**: strength via libpasswd, not equal to the
  username, and a Have I Been Pwned check that **fails open** when the API is unreachable and is
  skipped when `PASSWORD_BREACH_CHECK_ENABLED=false` (the e2e suite and the api vitest project). Failures
  carry a `code` from `PASSWORD_ERROR_CODES` (`packages/schemas/src/user/user.ts`); the web client
  localizes it, the API does not.

Row scoping is invisible to a unit test with a mocked model, so a change to who can see what needs an
integration test against the real database in `apps/api/test/suites/` (see `08-authorization.suite.ts`).
