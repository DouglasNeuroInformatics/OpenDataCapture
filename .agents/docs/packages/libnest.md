# libnest

Generic NestJS decorators, pipes, modules, and utilities used across DNP projects. Also ships the `libnest` CLI that builds and runs the app.

**Status in Open Data Capture:** used extensively in `apps/api` (~68 files), and nowhere else. It is the foundation of the API's bootstrap, config, database access, logging, validation, and test doubles — `apps/api` contains no `NestFactory` call, and no `PrismaClient` is constructed outside the options factory.

## When to reach for this

- Bootstrapping the app, wiring middleware, or generating OpenAPI docs — use `AppFactory` instead of assembling `NestFactory` boilerplate by hand.
- Reading typed/validated env vars — inject `ConfigService` instead of touching `process.env`.
- Talking to Prisma — use `InjectModel` / `Model<'X'>` / `InjectPrismaClient` instead of instantiating `PrismaClient`.
- Validating a request DTO against a Zod schema — use the `@ValidationSchema()` decorator, or `ParseSchemaPipe` / `ValidObjectIdPipe`, instead of a custom pipe.
- Mocking a Prisma model or libnest service in a unit test — use `MockFactory` from `./testing` instead of hand-rolling a stub.
- Logging, hashing/encrypting, or running virtualized code inside Nest — use `LoggingModule`/`CryptoModule`/`VirtualizationModule` instead of a third-party Nest integration. (`MailModule` is the one deliberate exception in this repo — see below.)

## Subpath exports

| Subpath            | Purpose                                   | Used in this repo                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.` (root)         | App bootstrap, modules, pipes, decorators | `AppFactory`, `ConfigService`, `LoggingService`, `CryptoService`, `CurrentUser`, `ValidationSchema`, `PrismaModule`, `InjectModel`, `InjectPrismaClient`, `LibnestPrismaExtension`, `getModelToken`, `PRISMA_CLIENT_TOKEN`, `Model`, `PrismaModelKey`, `PrismaModelName`, `PrismaModuleOptions`, `ParseSchemaPipe`, `ValidObjectIdPipe`, `VirtualizationModule`, `VirtualizationService`, `$BaseEnv`, `$MongoEnv`, `RequestUser` |
| `./testing`        | Test doubles for Nest providers           | `MockFactory`, `MockedInstance` — used in 13 `__tests__` spec files in `apps/api`; also exports `MockPrismaClient` and `e2e`                                                                                                                                                                                                                                                                                                     |
| `./testing/plugin` | Vitest plugin (path aliases, env)         | `apps/api/vitest.config.ts`                                                                                                                                                                                                                                                                                                                                                                                                      |
| `./user-config`    | User-supplied app config typing           | `defineUserConfig` in `apps/api/libnest.config.ts`                                                                                                                                                                                                                                                                                                                                                                               |

**`MailModule`/`MailService` are deliberately not used.** `apps/api/src/mail/` builds its own
nodemailer transporter instead, because libnest's `MailService` constructs `this.transporter` in
its constructor from `MAIL_MODULE_OPTIONS_TOKEN` — so the SMTP options resolve once at boot. The
configuration here is admin-editable and stored on `SetupState`, and `POST /v1/mail/test` has to
send with settings that have not been saved yet; neither works with a transporter fixed at
startup, and `forRootAsync` does not help because the limitation is the transporter's lifetime
rather than where the options come from. libnest is expected to gain a lazily-derived transporter
and a per-call transport override, at which point this app should consume it and drop the local
copy.

The root subpath is the only fully re-exporting barrel; its `index.ts` is ~38 lines and lists the entire public surface.

## Common patterns in this repo

### App bootstrap (`apps/api/src/main.ts`)

`AppFactory.create` takes the env schema, the OpenAPI docs config, and the module list. Modules can be imported conditionally on an env var via the `{ module, when }` form — that is how the gateway is toggled:

```ts
import { AppFactory, PrismaModule } from '@douglasneuroinformatics/libnest';

export default AppFactory.create({
  docs: { title: 'Open Data Capture', path: '/' /* ... */ },
  envSchema: $Env,
  imports: [
    AuthModule,
    PrismaModule.forRootAsync({ useClass: PrismaModuleOptionsFactory }),
    /* ...feature modules */
    { module: AssignmentsModule, when: 'GATEWAY_ENABLED' }
  ]
});
```

### Typing the app to libnest (`apps/api/libnest.config.ts`)

This is the seam that makes `ConfigService.get()`, `Model<'X'>`, and `@CurrentUser()` type-safe against _this_ app's env, Prisma schema, and JWT payload. Augment `UserTypes` when any of those three change:

```ts
import { defineUserConfig } from '@douglasneuroinformatics/libnest/user-config';

declare module '@douglasneuroinformatics/libnest/user-config' {
  export namespace UserTypes {
    export interface Env extends $Env {}
    export interface PrismaClient extends RuntimePrismaClient {}
    export interface RequestUser extends TokenPayload {
      ability: AppAbility;
    }
  }
}

const config = defineUserConfig({
  build: {
    onComplete: async () => {
      /* copy runtime/v1 into dist */
    }
  }
});
```

The same file drives the CLI: `libnest dev -c libnest.config.ts` and `libnest build -c libnest.config.ts` are the `dev` and `build` scripts in `apps/api/package.json`.

### Env schema (`apps/api/src/core/schemas/env.schema.ts`)

Compose from libnest's base schemas rather than declaring env vars from scratch:

```ts
import { $BaseEnv, $MongoEnv } from '@douglasneuroinformatics/libnest';

export type $Env = z.infer<typeof $Env>;
export const $Env = $BaseEnv.omit({ API_PORT: true }).extend($MongoEnv.shape).extend({
  GATEWAY_ENABLED: $BooleanLike
  /* ... */
});
```

### Prisma wiring (`apps/api/src/core/prisma.ts`)

The options factory is the one place a `PrismaClient` is constructed. It resolves the datasource URL through `ConfigService` (spinning up an in-memory replica set under `NODE_ENV=test`) and applies `LibnestPrismaExtension`:

```ts
const client = new PrismaClient({ datasourceUrl, omit: { user: { hashedPassword: true } } }).$extends(
  LibnestPrismaExtension
);
await client.$connect();
return { client } satisfies PrismaModuleOptions;
```

Everywhere else, inject a model: `@InjectModel('Group') private readonly groupModel: Model<'Group'>`.

### Unit tests (`apps/api/src/**/__tests__/*.spec.ts`)

```ts
import { getModelToken } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';

let groupModel: MockedInstance<Model<'Group'>>;

const moduleRef = await Test.createTestingModule({
  providers: [GroupsService, MockFactory.createForModelToken(getModelToken('Group'))]
}).compile();
groupModel = moduleRef.get(getModelToken('Group'));
```

See `apps/api/src/auth/` (`auth.module.ts`, `guards/jwt-auth.guard.ts`, `ability.factory.ts`) for the `CurrentUser`/guard/CASL patterns, and `apps/api/src/instrument-repos/` for a compact controller + DTO example using `@ValidationSchema()`.

## Reading the source

Publishes `src` alongside `dist` — 109 `.ts` files of original TypeScript, including the CLI. This is the fastest way to answer a question about libnest behaviour:

```sh
cat apps/api/node_modules/@douglasneuroinformatics/libnest/src/index.ts          # full root export list
ls  apps/api/node_modules/@douglasneuroinformatics/libnest/src/modules           # config, crypto, logging, mail, prisma, virtualization
cat apps/api/node_modules/@douglasneuroinformatics/libnest/src/testing/index.ts  # MockFactory, MockPrismaClient, e2e
cat apps/api/node_modules/@douglasneuroinformatics/libnest/src/app/app.factory.ts
```

## Docs

https://douglasneuroinformatics.github.io/libnest
