# Run Open Data Capture locally

The order of operations for a fresh clone. The human-facing tutorial is
`docs/en/2-tutorials/2.0-development.mdx`; per-app conventions are in each app's `AGENTS.md`. Every
startup crash below names something other than its cause, so check steps 4, 5 and 7 before debugging
one.

## Steps

1. **System dependencies.** `brew install bash jq` on macOS, `apt-get install build-essential jq openssl`
   on Ubuntu, plus Docker or a host MongoDB. Every script in `scripts/` requires bash 5, which macOS
   does not ship, so without it `pnpm generate:env` fails in one line. `package.json` restricts `os`
   to `darwin`/`linux`, so native Windows is refused; use WSL.

   Done when `bash --version` reports 5 or newer and `jq --version` and `openssl version` print.

2. **Node and pnpm.** `nvm install $(cat .nvmrc)`, then `corepack enable` (pnpm's version comes from
   `packageManager`).

3. **`pnpm generate:env`, once per clone.** It writes `.env` wholesale from `.env.template`, minting
   `SECRET_KEY`, `GATEWAY_API_KEY` and the two storage keys. Never re-run it over a working `.env`: it
   discards local overrides, and the fresh `SECRET_KEY` ends live sessions and permanently orphans
   every stored instrument-repo credential (encrypted with it). To add one variable, hand-add the line.

   Done when `.env` exists and none of the four generated keys is empty.

4. **Set `STORAGE_ENABLED=false` in `.env`** unless an S3-compatible service listens on
   `STORAGE_ENDPOINT`. The generated `.env` enables storage at `http://localhost:9000`, which
   `docker-compose.dev.yaml` does not provide, and `$Env` validation passes because every storage
   variable is filled. `StorageService.onModuleInit` then fails against the dead port and the api
   exits during boot; turbo kills its sibling dev servers, so `pnpm dev` ends in `ERROR run failed`
   over a nested `connect ECONNREFUSED ::1:9000` that never says storage. With it false, file
   instruments answer `503 File storage is not configured` and everything else works.
   `pnpm test:e2e` ignores this setting: the api's `dev:test` sets `STORAGE_ENABLED=true` after it
   loads `.env`, and in `NODE_ENV=test` the api never contacts storage at boot.

   Done when `grep STORAGE_ENABLED .env` reads `false`.

5. **Start MongoDB as a replica set**, which Prisma's MongoDB provider requires:

   ```sh
   docker compose -f docker-compose.dev.yaml up -d
   docker compose -f docker-compose.dev.yaml exec mongo mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]});"
   ```

   `rs.initiate` is once per volume (`./data/mongo`). A host install needs
   `replication.replSetName: rs0` in `mongod.conf` and the same `rs.initiate`; the tutorial has the
   Homebrew variant. Only `NODE_ENV=test` gets an in-memory replica set, so a green `pnpm test:e2e`
   proves nothing about this step.

   Done when `rs.status().ok` returns 1.

6. **`pnpm install`.** It also installs the husky pre-commit hook, which formats staged files with
   prettier and runs neither lint nor tests.

7. **Run `pnpm build` once.** `runtime/v1/dist` is gitignored and read while Vite configs load, so a
   dev server started without it dies with
   `ENOENT: no such file or directory, scandir '<repo>/runtime/v1/dist'` from `generateManifest`
   (`packages/runtime-meta`), raised inside a plugin factory so it looks like a Vite configuration
   error. Turbo's `dev`, `dev:test`, `lint` and `test:e2e` depend on `^build` and repair it; storybook,
   outreach, root `pnpm test` and any bare `tsc` or `vitest` do not.

   Done when `runtime/v1/dist` exists.

8. **`pnpm dev`** starts api, gateway and web only (`dev:core`); the gateway's sqlite `db:push` runs as
   a dependency. The first run, and the first after any `.env` edit (`.env` is a turbo
   `globalDependency`), spends minutes building before anything listens.

   | App     | Variable                  | Default |
   | ------- | ------------------------- | ------- |
   | web     | `WEB_DEV_SERVER_PORT`     | 3000    |
   | gateway | `GATEWAY_DEV_SERVER_PORT` | 3500    |
   | api     | `API_DEV_SERVER_PORT`     | 5500    |

   Browse http://localhost:3000; Vite proxies `/api/*` to the api. Gateway server code does not hot
   reload (`apps/gateway/AGENTS.md`).

9. **Complete the setup screen.** The app redirects to `/setup` until setup is done, then to
   `/auth/login`. The form creates the first admin and can seed demo data. **There is no seed script:**
   `POST /v1/setup` is the only bulk path, and `SetupService.initApp` drops the database first,
   refusing only on an already-set-up non-development instance, so re-running setup in development
   takes every record with it. It also imports a default instrument repository from GitHub, which is
   slow and, offline, logs `Failed to import default instrument repository` and finishes anyway.

   Done when signing in as the new admin lands on `/dashboard`. `VITE_DEV_BYPASS_AUTH=true` with
   `VITE_DEV_USERNAME`/`VITE_DEV_PASSWORD` skips the login in development.

   To start over on purpose: `./scripts/drop-database.sh development` (host `mongosh`), or
   `docker compose -f docker-compose.dev.yaml exec mongo mongosh data-capture-development --eval 'db.dropDatabase()'`.

## The apps `pnpm dev` does not start

Turbo hashes `.env` but never loads it, and `astro dev` does not read it either, hence the `env-cmd`
prefix.

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

`ERROR run failed` is one task dying and taking the other two with it: scroll above turbo's summary
to see which, and check step 4 first. `"isSetup":true` on what you believed was a fresh instance means
the database already holds an admin, so the setup screen never appears.
