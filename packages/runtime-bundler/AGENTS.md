# packages/runtime-bundler

Builds `runtime/v1/dist` — the catalog of libraries that instruments are allowed to import (react,
jspsych, zod, `@opendatacapture/runtime-core`, …). Its only consumer is `runtime/v1`, whose `build`
script is `pnpm exec runtime-bundler`. The emitted tree is then served under `/runtime/v1/...` by
`packages/runtime-meta` and `packages/vite-plugin-runtime`.

**This is not `packages/instrument-bundler`.** That one compiles an instrument author's source into a
loadable bundle. This one builds the library catalog that such an instrument imports _from_. Read
`.agents/docs/architecture/runtime-and-vendor.md` for how the two meet.

## The two kinds of export

`src/resolver.ts` reads each included package's `exports` map and `src/bundler.ts` turns it into
esbuild entry points. The shape of the export value decides everything:

| In the package's `exports`                        | Meaning                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------- |
| `"./x.js": "./src/x.js"` (bare string)            | Static asset. Copied byte-for-byte, never bundled, no chunk imports.          |
| `"./x": { "import": ..., "types": ... }` (object) | ES module. Joins the shared module graph and is built with `splitting: true`. |

The asset kind exists because chunk imports are ESM syntax, which a classic script or a service
worker cannot execute — `@opendatacapture/runtime-internal`'s `interactive/bootstrap.js`,
`interactive/worker.js` and `interactive/iframe.html` are the motivating cases, and the four
vendored CSS exports (`jspsych@7.x`, `jspsych@8.x`, `normalize.css@8.x`, `psychojs@2023.1.3`) ride
the same mechanism. Splitting is equally
non-optional for the module kind: with it off, every entry inlined its own copy of shared code, so
`react` and `react-dom` each got their own `ReactSharedInternals` and every hook threw. Do not turn
either half off to make a build pass; see commit `8fd683efb`.

Shared chunks are emitted under `_chunks/`. **The leading underscore is load-bearing** — npm forbids
it in a package name, so `_chunks` cannot collide with a served package, and
`parsePackages` in `packages/runtime-meta/src/index.js` skips any path starting with `_`. Change
`chunkNames` here and that filter must change with it.

`src/bundler.ts` also defines `__ODC_RUNTIME_BUILD__`. Several vendor wrappers are bundled twice —
once here to be served, once by an app that aliases the same wrapper as an ordinary dependency — and
that define is how a wrapper knows which copy it is. `vendor/react@19.x` and `vendor/react-dom@19.x`
depend on it; `vendor/AGENTS.md` explains what they do with it. Only the runtime build sets it, so a
wrapper must read it as `typeof __ODC_RUNTIME_BUILD__`, never as a bare reference.

## Path conventions

`pkg.name.split('__').join('@')` is how a vendor package reaches its served URL: `vendor/react@19.x`
declares `"name": "react__19.x"` (npm rejects a second `@`), and the bundler converts it back, so the
output lands at `react@19.x/`. `runtime-meta` re-parses `name@version` out of that path.

The **export key**, not the source filename, determines the output path — its extension is stripped
and esbuild re-appends the source file's own extension. So `"./css/jspsych.css": "./src/index.css"`
emits `jspsych@7.x/css/jspsych.css`. Give the key the extension you want served. The `./package.json`
key is skipped.

## Constraints when adding a package to the runtime

`src/resolver.ts` accepts only `.css`, `.json`, `.js`, `.mjs`, `.html` for source exports and
`.d.ts`/`.d.mts` for `types`. **There is no `.ts` loader** — a workspace package must build to JS plus
declarations before it can be included (see `packages/runtime-core`'s `build` script). Anything else
is a hard resolver error naming the file.

`src/plugin.ts`'s `dtsPlugin` rewrites bare imports inside each `.d.ts` to a relative path into the
emitted tree, and **throws if a declaration references a package not in the `include` list**. Adding a
vendor package whose types import another package means adding that one too. Only `import`
declarations are rewritten; `export ... from 'pkg'` in a `.d.ts` passes through untouched.

## The CLI

`src/cli.ts` (the `runtime-bundler` bin, run with `tsx`) resolves `runtime.config.js` from
`process.cwd()`, so it only works when invoked from `runtime/v1`, and `outdir` is relative to that
cwd. The default export is validated by `$UserConfigs` in `src/schemas.ts` and may be one config or an
array.

**A bundle failure is logged and the process still exits 0.** A broken runtime build will not fail
CI on its own — check the output, or the tests below.

## Tests

`pnpm exec vitest --project runtime-bundler`. There is a `vitest.config.ts` here.

`src/__tests__/` is unit-level with `esbuild` and `fs` mocked. The coverage that matters is
`test/e2e.test.ts`: it copies `test/fixtures/` into a temp directory as `node_modules`, runs a real
build, then imports the output. Each fixture is a minimal npm package encoding one regression —
`shared-state` + `state-writer` prove one module instance is shared across entry points,
`classic-script` proves a bare-path export comes out byte-identical. A new fixture is a directory
whose name matches its `package.json` `name` (resolution depends on it) plus an entry in the test's
`include` array.
