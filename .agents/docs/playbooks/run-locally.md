# Run Open Data Capture locally

Per-app conventions live in each app's `AGENTS.md`; the human-facing tutorial is
`docs/en/2-tutorials/2.0-development.mdx`. This file is only the order of operations, plus the three
things that tutorial does not have: `STORAGE_ENABLED` (step 4), the first `pnpm build` (step 7), and
the apps `pnpm dev` does not start.

**Plan around this:** a freshly generated `.env` carries `STORAGE_ENABLED=true` with
`STORAGE_ENDPOINT=http://localhost:9000` (`.env.template`), and `docker-compose.dev.yaml` defines
only the mongo service. `StorageService.onModuleInit` then sends `HeadBucketCommand`, catches, and
sends an unguarded `CreateBucketCommand` (`apps/api/src/storage/storage.service.ts`); both reject
against a dead port and the api exits during boot. Turbo kills every sibling persistent task when
one exits non-zero, so the whole `pnpm dev` dies with `ERROR run failed`, reported as a socket error
that never says the word storage. Step 4 is where you avoid it.

## Steps

1. **Install the system dependencies.** `brew install bash jq` on macOS,
   `apt-get install build-essential jq openssl` on Ubuntu. Every shell script in `scripts/` opens
   with `[ "${BASH_VERSINFO:-0}" -ge 5 ] || ... exit 1`, and macOS ships bash 3.2 as `/bin/bash`, so
   an uninstalled bash 5 turns `pnpm generate:env` into a one-line failure. `jq` is how
   `scripts/workspace.sh` reads workspace names; `openssl` is how `scripts/generate-env.sh` mints
   secrets. You also need Docker, or a host MongoDB (step 5). `package.json` restricts `os` to
   `darwin`/`linux` and `cpu` to `x64`/`arm64`, so a native Windows install is refused — use WSL.

   Done when `bash --version` reports 5 or newer and `jq --version` and `openssl version` print.

2. **Install Node and enable pnpm.** `nvm install $(cat .nvmrc)` — `.nvmrc` pins `lts/krypton` and
   `engines.node` requires `>=v24.15.0`. Then `corepack enable`; the pnpm version comes from
   `packageManager` in `package.json`, so there is nothing to pick by hand.

   Done when `node --version` is v24.15.0 or newer and `pnpm --version` prints.

3. **Generate `.env` — once per clone.** `pnpm generate:env` runs `scripts/generate-env.sh`, which
   writes `.env` wholesale from `.env.template`: it fills `PROJECT_ROOT`, mints `SECRET_KEY`,
   `GATEWAY_API_KEY`, `STORAGE_ACCESS_KEY` and `STORAGE_SECRET_KEY` with `openssl rand -hex`, and
   points `GATEWAY_DATABASE_URL` at a sqlite file under `apps/gateway/data` (creating the
   directory). Never re-run it over a working `.env`: it discards every local override and mints a
   fresh `SECRET_KEY`, which invalidates live sessions and permanently orphans any stored
   instrument-repo credential — `InstrumentReposService` encrypts those under `sha256(SECRET_KEY)`.
   Adding one variable to an existing `.env` is `.agents/docs/playbooks/add-env-var.md`.

   Done when `.env` exists, `PROJECT_ROOT` is the absolute repo root, and none of the four generated
   keys is empty.

4. **Set `STORAGE_ENABLED=false` in `.env`** unless an S3-compatible service is listening on
   `STORAGE_ENDPOINT`. With it false, `StorageModule` provides `null` for the `S3Client`,
   `onModuleInit` returns early, and file instruments answer `503 File storage is not configured` at
   request time (`storage.service.ts`, `requireStorage`) — a working backend with one feature off.
   The env schema will not catch the alternative for you: `generate-env.sh` and `.env.template`
   between them fill all four storage variables, so `$Env`'s `STORAGE_ENABLED` branch
   (`apps/api/src/core/schemas/env.schema.ts`) is satisfied and validation passes. `.env` is one of
   turbo's `globalDependencies`, so this edit and every later one busts the whole turbo cache.

   Done when `grep STORAGE_ENABLED .env` reads `false`.

5. **Start MongoDB as a replica set.** Prisma's MongoDB provider requires one — the header of
   `docker-compose.dev.yaml` cites `prisma/prisma#8266` and carries both commands:

   ```sh
   docker compose -f docker-compose.dev.yaml up -d
   docker compose -f docker-compose.dev.yaml exec mongo mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]});"
   ```

   That file defines mongo alone (`--replSet rs0`, port 27017, data in the gitignored `./data/mongo`),
   and `rs.initiate` is one-time per volume. A host install works the same way: put
   `replication.replSetName: rs0` in `mongod.conf` and run the same `rs.initiate` against it —
   `docs/en/2-tutorials/2.0-development.mdx` has the Homebrew variant.

   Development builds its URL from `MONGO_URI` and connects to `data-capture-development`. The e2e
   suite starts its own in-memory replica set (`.agents/docs/architecture/testing-strategy.md`), so
   a green `pnpm test:e2e` proves nothing about this step.

   Done when `rs.status().ok` returns 1.

6. **`pnpm install`.** This also installs the husky pre-commit hook, which formats staged files with
   prettier and re-stages them — it formats rather than verifies, and runs neither lint nor tests.

   Done when the install exits 0 and `node_modules/.bin/turbo` exists.

7. **Run `pnpm build` once.** `runtime/v1/dist` is gitignored and is resolved against while a Vite
   config is still starting, so a missing build is a startup crash, not a missing feature
   (`.agents/docs/architecture/runtime-and-vendor.md`). Turbo repairs it for you: `dev`, `dev:test`,
   `lint` and `test:e2e` each declare `dependsOn: ["^build", ...]` (`turbo.json`), which is why the
   first `pnpm dev` is slow and why it works anyway. Anything started outside turbo gets no
   `^build`: storybook and outreach (both below), root `pnpm test`, and any bare `tsc` or `vitest`.

   Done when `runtime/v1/dist` exists.

8. **`pnpm dev`.** It is `dev:core` — the turbo `dev` task filtered to api, gateway and web only
   (`package.json`). The gateway's sqlite database needs no manual step: `db:push` is a `dependsOn`
   of the same task. Ports come from `.env`:

   | App     | Variable                  | Default |
   | ------- | ------------------------- | ------- |
   | web     | `WEB_DEV_SERVER_PORT`     | 3000    |
   | gateway | `GATEWAY_DEV_SERVER_PORT` | 3500    |
   | api     | `API_DEV_SERVER_PORT`     | 5500    |

   Browse http://localhost:3000. Vite proxies `/api/*` from there to the api port
   (`apps/web/vite.config.ts`), which is how the browser reaches `/v1` routes. Gateway server code
   is the exception to hot reload — see `apps/gateway/AGENTS.md`.

   Done when all three servers log a listening port and the `curl` below returns JSON.

9. **Complete the setup screen.** `apps/web/src/routes/_app/route.tsx` guards twice: `isSetup` false
   redirects to `/setup`, then a missing `accessToken` redirects to `/auth/login`. The form creates
   the first admin and optionally seeds demo data — `initDemo`, `dummySubjectCount`,
   `recordsPerSubject` (`apps/web/src/routes/setup.tsx`). **There is no seed script in this repo**;
   `POST /v1/setup` is the only path data arrives by, and `SetupService.initApp` calls
   `dropDatabase()` before creating the admin, refusing only when `isSetup` is already true _and_
   `NODE_ENV` is not development. A development instance therefore re-runs setup happily and takes
   the existing data with it. `initApp` then imports a hard-coded GitHub instrument repository, so
   the request is slow, and an offline machine logs a caught
   `Failed to import default instrument repository` and finishes setup anyway.

   Done when the app bounces you to `/auth/login` — setup stores no token — and signing in as the
   admin you just created lands on `/dashboard`. `VITE_DEV_BYPASS_AUTH=true` with
   `VITE_DEV_USERNAME`/`VITE_DEV_PASSWORD` skips that login in development.

   To start over on purpose: `./scripts/drop-database.sh development` drops `data-capture-development`
   through a host `mongosh`. With the Docker setup, run
   `docker compose -f docker-compose.dev.yaml exec mongo mongosh data-capture-development --eval 'db.dropDatabase()'`
   instead.

## The apps `pnpm dev` does not start

Turbo hashes `.env` but never loads it, and `astro dev` does not read it either, so the `env-cmd`
prefix is what makes the third column count; storybook's own script already carries one.

| App                       | Command                                                                | Port                              |
| ------------------------- | ---------------------------------------------------------------------- | --------------------------------- |
| playground                | `pnpm exec env-cmd turbo run dev --filter=@opendatacapture/playground` | `PLAYGROUND_DEV_SERVER_PORT` 3750 |
| outreach (site plus docs) | `pnpm exec env-cmd pnpm --filter @opendatacapture/outreach dev`        | `OUTREACH_DEV_SERVER_PORT` 4000   |
| storybook                 | `pnpm --filter @opendatacapture/storybook storybook`                   | 6006, hard-coded                  |

## Verify

```sh
docker compose -f docker-compose.dev.yaml exec mongo mongosh --quiet --eval "rs.status().ok"  # 1
curl -s http://localhost:5500/v1/setup        # {"isSetup":false,...} before setup, true after
curl -s http://localhost:3000/api/v1/setup    # the same JSON, through the vite proxy
```

`pnpm dev` ending in `ERROR run failed` is one task dying and taking the other two down with it —
scroll above turbo's summary to see which, and check step 4 first. `"isSetup":true` on what you
believed was a fresh instance means the database already holds an admin, so `/setup` redirects to
`/dashboard`, whose guard sends you to `/auth/login`, and the setup screen never appears.

Two states that look broken and are correct: the first `pnpm dev` after a clean checkout — or after
any `.env` edit — spends minutes building every dependency before anything listens (that is
`^build`), and a file instrument answering `503 File storage is not configured` is exactly what
`STORAGE_ENABLED=false` buys you.
