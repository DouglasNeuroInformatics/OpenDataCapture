# Add an environment variable

`.env` is gitignored and generated from `.env.template`. Backend configuration conventions are in
`apps/api/AGENTS.md` §Configuration. Do the steps in order; each skipped one compiles and then reads
`undefined` at runtime.

1. **Check libnest does not already declare it.** `$Env` extends libnest's `$BaseEnv` (`NODE_ENV`,
   `SECRET_KEY`, `DEBUG`, `VERBOSE`, `LOG`, `THROTTLER_ENABLED`, `API_RESPONSE_DELAY`,
   `DANGEROUSLY_DISABLE_PBKDF2_ITERATION`) and `$MongoEnv` (`MONGO_*`); the source is under
   `apps/api/node_modules/@douglasneuroinformatics/libnest/src/schemas/` (pnpm does not hoist it).
   `API_PORT` is deliberately omitted and re-derived from `API_DEV_SERVER_PORT`; leave it.

2. **Add it to `.env.template`** with a comment, under `PRODUCTION`, `PRODUCTION + DEVELOPMENT` or
   `DEVELOPMENT`. It is the only inventory of what a deployment must set.

3. **If the value is generated rather than authored, edit `scripts/generate-env.sh`.** It does plain
   substring replacement (`envContent=${envContent//KEY=/"KEY=$value"}`), so a key that is a suffix of
   another must be anchored with a leading `$'\n'`, as `SECRET_KEY=` is against
   `STORAGE_SECRET_KEY=`.

4. **If the API reads it, declare it in `$Env`** (`apps/api/src/core/schemas/env.schema.ts`, the
   `.extend({...})` block). Every value is a string, so `z.boolean()` and `z.number()` always fail;
   use the libjs coercion helpers:

   | Helper         | Accepts                                          | Yields                                                                   |
   | -------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
   | `$BooleanLike` | `'true'` / `'false'` (trimmed, case-insensitive) | `boolean`                                                                |
   | `$NumberLike`  | numeric string                                   | `number` — pipe it, e.g. `$NumberLike.pipe(z.number().int().positive())` |
   | `$UrlLike`     | URL string                                       | a `URL` **instance**, not a string                                       |

   libnest's `parseEnv` strips empty strings, so `YOUR_KEY=` reads as absent: make it `.optional()`
   or give it a `.default()`. A cross-field requirement goes in the `.transform((env, ctx) => ...)` at
   the bottom of `$Env` via `ctx.addIssue`; the `STORAGE_ENABLED` block is the pattern.

5. **Read it as `this.configService.get('YOUR_KEY')`.** `process.env` is an eslint error in
   `apps/api/src`; do not add a second exception to
   `src/core/decorators/throttle-login-request.decorator.ts`. To gate a whole module on a boolean, use
   `{ module: XModule, when: 'YOUR_KEY' }` in the `imports` array of `apps/api/src/main.ts`.

6. **If the gateway reads it, add it to `apps/gateway/src/config.ts`.** That is a separate Zod schema
   parsing `process.env` at import time; `$Env` never reaches the gateway.

7. **If a build reads it, add it to that task's `env` array in `turbo.json`.** Turbo runs in strict
   env mode: a task sees only `globalEnv` plus its own `env`, so the variable is `undefined` during
   `pnpm build` even though `env-cmd` loaded `.env` before turbo started. `dev`/`start`/`test` scripts
   load `.env` themselves (`env-cmd -f ../../.env`), so only build-time reads need this.

8. **If the browser needs it, three `apps/web` files must agree:** `.env.public` (read by
   `@import-meta-env/unplugin`, the `start` script and the Docker image, which substitute values into
   `dist/index.html` after the build), the `ImportMetaEnv` interface in `src/vite-env.d.ts`, and the
   `config` object in `src/config.ts` (unless only the inline script in `index.html` reads it, as
   `PLAUSIBLE_*` do).

9. **If production needs it, list it under the `environment:` of each service that reads it in
   `docker-compose.yaml`.** A bare `- YOUR_KEY` forwards the value from `.env`; an unlisted variable
   never reaches the container.

10. **Hand-add the line to your own `.env`.** Re-running `pnpm generate:env` overwrites the file,
    discarding local overrides and minting a fresh `SECRET_KEY`.

## Verify

```sh
grep -n YOUR_KEY .env    # present
pnpm dev                 # $Env is validated at boot; an invalid value crashes here. Ctrl-C once up
pnpm lint                # tsc + the no-process.env rule
pnpm test:coverage
pnpm build               # only this catches a missing turbo.json `env` entry
```
