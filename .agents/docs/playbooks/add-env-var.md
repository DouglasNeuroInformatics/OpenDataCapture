# Add an environment variable

`.env` is gitignored and generated from `.env.template` by `pnpm generate:env`. Configuration
conventions for the backend live in `apps/api/AGENTS.md` — read that section first. Follow the steps
below in order; each skipped one type-checks and compiles, then produces `undefined` at runtime.

1. **Check it is not already declared upstream.** `$Env` composes libnest's `$BaseEnv` (`NODE_ENV`,
   `SECRET_KEY`, `DEBUG`, `VERBOSE`, `LOG`, `THROTTLER_ENABLED`, `API_RESPONSE_DELAY`,
   `DANGEROUSLY_DISABLE_PBKDF2_ITERATION`) with `$MongoEnv` (`MONGO_*`) — read
   `apps/api/node_modules/@douglasneuroinformatics/libnest/src/schemas/` (pnpm does not hoist it to
   the repo root). `API_PORT` is deliberately `omit`ted
   and re-derived from `API_DEV_SERVER_PORT` in the transform; leave that alone.

2. **Add it to `.env.template`** with a comment above it, under the right heading — `PRODUCTION`,
   `PRODUCTION + DEVELOPMENT` or `DEVELOPMENT`. This file is the only inventory of what a deployment
   must set; a variable absent from it exists nowhere a human will look.

3. **If the value must be generated rather than authored, edit `scripts/generate-env.sh`.** It does
   plain substring replacement over the template text
   (`envContent=${envContent//KEY=/"KEY=$value"}`), so a short key name also matches longer keys that
   end with it. `SECRET_KEY=` is anchored with a leading `$'\n'` precisely because it otherwise
   rewrote `STORAGE_SECRET_KEY=` too. Anchor any new key that is a suffix of another.

4. **Declare it in `$Env` — `apps/api/src/core/schemas/env.schema.ts`** — inside the `.extend({...})`
   block, if the API reads it. `$Env` is passed to `AppFactory.create` as `envSchema` in
   `apps/api/src/main.ts`, so an invalid or missing required variable is a hard startup crash. Every
   value arriving from the environment is a **string**, so `z.boolean()` and `z.number()` always
   fail. Use the coercion helpers from `@douglasneuroinformatics/libjs`:

   | Helper         | Accepts                                          | Yields                                                                   |
   | -------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
   | `$BooleanLike` | `'true'` / `'false'` (trimmed, case-insensitive) | `boolean`                                                                |
   | `$NumberLike`  | numeric string                                   | `number` — pipe it, e.g. `$NumberLike.pipe(z.number().int().positive())` |
   | `$UrlLike`     | URL string                                       | a `URL` **instance**, not a string                                       |

   libnest's `parseEnv` strips empty-string values before parsing, so `YOUR_KEY=` in the template
   reads as absent — mark such variables `.optional()` or give them a `.default()`.

5. **Put any cross-field requirement in the `.transform((env, ctx) => ...)` at the bottom of `$Env`,**
   not in the field itself — `ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [key] })`.
   The `STORAGE_ENABLED` block there is the pattern for "these four are required when this is on".

6. **Read it through `ConfigService`: `this.configService.get('YOUR_KEY')`,** fully typed from `$Env`.
   `process.env` is an eslint error across `apps/api/src/**/*.ts`. The single exception is
   `apps/api/src/core/decorators/throttle-login-request.decorator.ts`, where decorator arguments are
   evaluated at module load before the DI container exists; it parses `process.env` by hand with an
   explicit `eslint-disable`. Do not add a second exception. To gate a whole module on a boolean, use
   `{ module: XModule, when: 'YOUR_KEY' }` in the `imports` array of `apps/api/src/main.ts`.

7. **If anything reads it at build time, add it to the task's `env` array in `turbo.json`.** Turbo 2
   runs in strict env mode by default: a task process receives _only_ the variables listed in
   `globalEnv` or that task's `env`, so an undeclared variable is `undefined` during `pnpm build` even
   though `env-cmd` loaded `.env` before turbo started. Build scripts (`apps/web`, `apps/playground`,
   `apps/outreach`) do not load `.env` themselves; `dev`/`start`/`test` scripts do, via
   `env-cmd -f ../../.env`, which is why only build-time reads need this step.

8. **If the browser needs it, three files in `apps/web` must agree:** `apps/web/.env.public` (the
   manifest `@import-meta-env/unplugin` and the `inject`/`start` scripts read — values are substituted
   into `dist/index.html` after the build, not baked in), the `ImportMetaEnv` interface in
   `apps/web/src/vite-env.d.ts`, and the parsed `config` object in `apps/web/src/config.ts`.

9. **If it must reach the production stack, add it to `docker-compose.yaml`** under the `environment:`
   list of the service that reads it (`api`, `gateway`, `web`). A bare `- YOUR_KEY` forwards the value
   compose read from `.env`; anything not listed never reaches the container.

10. **Regenerate your own `.env`.** `pnpm generate:env` overwrites the file wholesale and mints fresh
    secrets, so either rerun it and re-enter local overrides, or hand-add the new line to `.env`.

**Worked example.** `GITHUB_TOKEN` (server-wide fallback token for syncing instrument repositories)
touched exactly two of these: `.env.template` and `$Env`, replacing a direct
`process.env.GITHUB_TOKEN` read in `apps/api/src/instrument-repos/instrument-repos.service.ts` with
`this.configService.get('GITHUB_TOKEN')`. No `turbo.json` entry, because it is read at runtime; no
`generate-env.sh` entry, because the operator supplies it.

## Verify

```sh
grep -n YOUR_KEY .env    # present after regeneration
pnpm dev                 # $Env is validated at boot; an invalid value crashes here. Ctrl-C once up
pnpm lint                # tsc + the no-process.env rule
pnpm test
pnpm build               # only this catches a missing turbo.json `env` entry
```
