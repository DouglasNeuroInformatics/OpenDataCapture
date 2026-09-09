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

**Every `fs.watch` handle must be reachable from `Server.stop()`.** `InstrumentLoader` opens one per
instrument directory and exposes `close()`; `InstrumentLoaderMap` and both handlers forward it, and
`Server.stop()` calls `handler.close()` before closing the http server. A new watcher (or a new
handler) that is not wired into that chain leaks a live watcher per `Server` instance, which keeps
the process alive and, in tests, keeps firing against deleted temp directories.

**`cli.ts` validation belongs in commander's parsers, not the `.action()` body.** `parseTarget` is
passed to `.argument()` and `parsePort` to `.option()`, so an `InvalidArgumentError` thrown by
either takes commander's print-message-and-`process.exit(1)` path. `parseTarget` needs the `--all` flag,
which is safe because commander runs argument parsers after option parsing — `program.opts()` is
already populated inside it, whatever order the flags appear in. Validating inside `.action()`
instead would escape that handling: the body is `async`, and `program.parse()` does not await it, so
the throw would surface as a bare unhandled rejection with a stack trace rather than a clean error.

**`program.parse()` does not await the async `.action()` body.** Anything that throws _after_
validation — `Server.create` failing to resolve runtime metadata, `listen` hitting `EADDRINUSE` —
is still an unhandled rejection. Only the argument/option parsers exit cleanly today.

## Tests and running it

`pnpm exec vitest --project serve-instrument`. `src/__tests__/cli.test.ts` drives the CLI with a
stubbed `process.argv` and a fresh module per test, `Server` itself mocked out.
`src/__tests__/root.test.tsx` renders `Root` with `renderToStaticMarkup` — no DOM, so
`LanguageSwitcher`'s interactive half goes unexercised. `src/__tests__/server.test.ts` starts a real
`Server` against real temp-directory fixtures and drives it with real `fetch` calls; it stubs the
`client.js` / `__TAILWIND_STYLES__` globals that only exist post-build, and replaces `fs.watch` at
the module level (it is a named ESM export, which `vi.spyOn` cannot touch) so a test can fire the
rebuild callback on demand and assert every watcher's `close()` ran after `stop()`.

There is no `dev` script either: `pnpm --filter @opendatacapture/serve-instrument build`, then
`node dist/cli.js <dir>`.
