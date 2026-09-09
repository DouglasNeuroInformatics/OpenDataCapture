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

**`Server.stop()` closes the http server, not the file watcher.** `InstrumentLoader`'s constructor
calls `fs.watch(target, ...)` and nothing ever calls `.close()` on the returned watcher — every
`Server` instance leaks one. `src/__tests__/server.test.ts` works around this by mocking `fs.watch`
outright rather than by fixing it; do not copy that pattern as evidence the leak is fine.

**`cli.ts`'s target/`--all` validation does not exit cleanly.** `parseTarget` is called by hand
inside the async `.action()` body rather than passed to `.argument()` as commander's own parser, so
throwing `InvalidArgumentError` from it does not go through commander's usual
print-message-and-`process.exit(1)` handling — it does not even reject the promise `program.parse()`
returns. It surfaces as a bare unhandled rejection on the process, which crashes with an ugly stack
trace instead of the clean CLI error the code reads as though it produces. The `--port` validator
(`parsePort`, passed directly to `.option()`) does not have this problem.

## Tests and running it

`pnpm exec vitest --project serve-instrument`. `src/__tests__/cli.test.ts` drives the CLI with a
stubbed `process.argv` and a fresh module per test, `Server` itself mocked out.
`src/__tests__/root.test.tsx` renders `Root` with `renderToStaticMarkup` — no DOM, so
`LanguageSwitcher`'s interactive half goes unexercised. `src/__tests__/server.test.ts` starts a real
`Server` against real temp-directory fixtures and drives it with real `fetch` calls; it mocks
`fs.watch` (see the trap above) and stubs the `client.js` / `__TAILWIND_STYLES__` globals that only
exist post-build.

There is no `dev` script either: `pnpm --filter @opendatacapture/serve-instrument build`, then
`node dist/cli.js <dir>`.
