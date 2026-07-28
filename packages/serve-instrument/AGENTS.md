# packages/serve-instrument

The `serve-instrument` CLI: bundles the instrument(s) in a directory with
`@opendatacapture/instrument-bundler` and serves them from a plain `node:http` server, SSR'd with
React and rehydrated in the browser. `--all` serves every instrument under `forms/` and
`interactive/`. No app in this repo imports it; it is **published to npm** for instrument authors.

## Traps

**`dependencies` vs `devDependencies` decides bundled vs external.** `scripts/build.js` passes
`external: Object.keys(pkg.dependencies)` to esbuild, so only `chalk`, `commander` and `esbuild` stay
as real installs. React, `react-core`, `instrument-bundler`, `runtime-internal`, `runtime-meta` and
libui are in `devDependencies` deliberately — that is what gets them inlined into `dist/cli.js`. Moving
a package between the two fields silently changes what ships.

**The version field is managed by `scripts/increment-version.sh`.** This is one of five publishable
workspaces (non-private + a `publishConfig` field, enumerated by `scripts/list-publishable.sh`); its
version tracks the monorepo release. Do not hand-bump it.

**The server reads `dist/client.js` off disk at request time** (`path.resolve(import.meta.dirname,
'client.js')`) and inlines it into the SSR'd HTML prefixed with a `__ROOT_PROPS__` const. Both esbuild
builds must land in the same `dist`, and `RootProps` must stay JSON-serializable.

`__TAILWIND_STYLES__` and `__ROOT_PROPS__` are `declare const` globals with no runtime import —
the first is an esbuild `define` holding base64 Tailwind CSS built from
`@opendatacapture/react-core/globals.css`, the second is injected by the server.

Runtime assets are not bundled: `Server.create` calls `generateMetadata({ rootDir: import.meta.dirname })`,
which resolves the `@opendatacapture/runtime-v1` **peer** dependency from the installed `dist/`.

## Tests and running it

No `vitest.config.ts` and no `test` script — this package has no unit tests. There is no `dev` script
either: `pnpm --filter @opendatacapture/serve-instrument build`, then `node dist/cli.js <dir>`.
