# The runtime, and `vendor/`

Six workspaces have `runtime` in the name and they do different jobs. This file tells them apart,
explains the three unrelated ways `runtime/v1` is spelled in an import, and documents `vendor/`.

**`runtime/v1/dist` is gitignored and nothing works until it is built.** Nine `tsconfig.json` files
map a path into it, so `pnpm lint` fails across most of the repo on a cold checkout. Build it with
`pnpm --filter @opendatacapture/runtime-v1 build`, or just `pnpm build` (turbo's `^build` ordering
gets there).

## The six things

| Workspace                      | Kind        | Job                                                       |
| ------------------------------ | ----------- | --------------------------------------------------------- |
| `packages/runtime-core`        | library     | The public API instrument authors import                  |
| `packages/runtime-internal`    | library     | Platform plumbing; instruments have no reason to touch it |
| `packages/runtime-bundler`     | build tool  | Produces `runtime/v1/dist`                                |
| `packages/runtime-meta`        | library     | Maps a built runtime directory onto HTTP URLs             |
| `runtime/v1`                   | artifact    | The published bundle, `@opendatacapture/runtime-v1`       |
| `packages/vite-plugin-runtime` | Vite plugin | Serves that artifact to a Vite app                        |

`packages/instrument-bundler` is **not** in this family. It compiles one instrument's source;
`runtime-bundler` compiles the libraries that instrument imports. See
`.agents/docs/architecture/instrument-pipeline.md`.

### `packages/runtime-core`

`defineInstrument`, `defineSeriesInstrument`, the `Translator` family, `addNotification`,
`asSnakeCase`, and every instrument type. This is the contract with instrument authors — changing
an exported type changes every instrument in the wild.

Three-stage build, and each stage's output is consumed by someone:

| Script                       | Does                                          | Output consumed by                                                                                               |
| ---------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `build:lib`                  | `tsc -b tsconfig.build.json`                  | the `./constants` export, and `apps/outreach/astro.config.ts`, which feeds `lib/index.d.ts` to starlight-typedoc |
| `build:dist` (esbuild)       | bundles `lib/index.js` → `dist/index.js`      | the `.` export                                                                                                   |
| `build:dist` (api-extractor) | rolls `lib/index.d.ts` up → `dist/index.d.ts` | the `.` export's types                                                                                           |

So `lib/` is not scratch — deleting it breaks the docs site and the `./constants` subpath.
`FILE_TYPES` is reachable **only** through `@opendatacapture/runtime-core/constants`; `src/index.ts`
does not re-export it.

### `packages/runtime-internal`

Hand-written `.d.ts` beside plain `.js` — there is no build step, so edit both files together.
Exports `evaluateInstrument`, `encodeUnicodeToBase64`, `decodeBase64ToUnicode`,
`removeSubjectIdScope`, consumed by `instrument-interpreter`, `instrument-bundler`,
`serve-instrument` and `subject-utils`.

It also owns the interactive-task trio, `src/interactive/{iframe.html,bootstrap.js,worker.js}`.
`packages/react-core/src/components/InteractiveContent/InteractiveContent.tsx` points an iframe at
`/runtime/v1/@opendatacapture/runtime-internal/interactive/iframe.html`; that page loads
`bootstrap.js` as a classic script, which registers `worker.js` as a service worker to serve the
instrument's `staticAssets` from data URLs. The three files reference each other by **relative
path**, which only resolves because they are copied byte-for-byte (see
[Two kinds of export](#two-kinds-of-export)).

### `packages/runtime-bundler`

Ships TypeScript source directly (`exports: "./src/index.ts"`, `bin` → `src/cli.ts` under tsx). The
CLI reads `runtime.config.js` from the working directory, validates it with `$UserConfigs`, and for
each `include` entry resolves `<pkg>/package.json` through a `createRequire` rooted at the config
file. **An entry in `include` must therefore also be a dependency of the workspace holding the
config.**

esbuild runs with `splitting: true` and `chunkNames: '_chunks/[hash]'`. The output directory for a
package is its name with `__` replaced by `@`; the `./package.json` export is skipped.
`src/plugin.ts` also rewrites non-relative imports inside emitted `.d.ts` files into relative paths,
which is why a vendor wrapper's declarations import a sibling by **package name**
(`import type * as CSS from 'csstype__3.x'`) and the built file ends up with
`"../csstype@3.x/index.d.ts"`.

### `packages/runtime-meta`

Turns a built runtime directory into something serveable. Hand-written `.d.ts` beside plain `.js`,
same as `runtime-internal`.

| Export                               | Does                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `RUNTIME_VERSIONS`                   | currently `['v1']`                                                                         |
| `MANIFEST_FILENAME`                  | `'runtime.json'`                                                                           |
| `generateManifest(baseDir)`          | walks the directory into `{ declarations, html, sources, styles }` of relative paths       |
| `parsePackages(version, manifest)`   | groups those files into packages, with `/runtime/<version>/...` URLs                       |
| `generateMetadata({ rootDir })`      | resolves `@opendatacapture/runtime-v1/package.json` per version and does both of the above |
| `resolveRuntimeAsset(url, metadata)` | URL → `{ content, contentType }` or `null`; also serves `runtime.json` itself              |

`parsePackages` drops any path starting with `_`. npm forbids a leading underscore in a package
name, so `_chunks/` provably cannot collide with a served package — that is what makes the shared
chunks safe to emit into the same tree. `validatePackageName` in
`packages/runtime-bundler/src/utils.ts` rejects the same prefix on the way in.

Consumers: `vite-plugin-runtime`, `packages/serve-instrument/src/server.tsx`, and
`apps/outreach/src/pages/resources/runtime/[version].json.ts`.

### `runtime/v1`

`@opendatacapture/runtime-v1`, published to npm. `exports` is `"./*": "./dist/*"` plus
`"./env": "./env.d.ts"` and `"./package.json"`; `build` is just `pnpm exec runtime-bundler`. Its `devDependencies` are the
41 packages in `runtime.config.js` (plus the bundler itself).

The `v1` is the runtime _generation_, fixed in every import path. The `version` field is the
monorepo release version and moves independently — do not read one as the other.

### `packages/vite-plugin-runtime`

Default-exports an async plugin factory taking `{ rootDir, disabled? }`. In dev it mounts a
`/runtime` middleware backed by `resolveRuntimeAsset`; on `buildStart` it copies each runtime's
`dist` to `dist/runtime/<version>` and writes `runtime.json`; and it adds every runtime JS URL to
`optimizeDeps.exclude`. Used by `apps/web`, `apps/gateway`, `apps/playground` and `storybook`.
`disabled: true` returns `false` instead of a plugin — `gateway` and `playground` pass
`mode === 'test'`, so nothing runtime-dependent works in their test builds.

`apps/api` does not use it — `apps/api/libnest.config.ts` copies `runtime-v1/dist` into
`dist/runtime/v1` in its `build.onComplete` hook instead.

## Three names, three resolvers

The same artifact is addressed three ways. They are not interchangeable.

| Spelling                      | Resolved by                 | Declared in                                                                                                                                                                                           |
| ----------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/runtime/v1/<pkg>`           | the browser, over HTTP      | served by `vite-plugin-runtime` (dev) or the copied `dist/runtime/v1` (prod); type-checked via `paths` in eight `tsconfig.json` files; marked external by `packages/instrument-bundler/src/plugin.ts` |
| `#runtime/v1/*`               | Node subpath imports        | `apps/api/package.json` `imports` **and** `apps/api/tsconfig.json` `paths`                                                                                                                            |
| `@opendatacapture/runtime-v1` | ordinary package resolution | a `dependencies` entry, used to locate `dist` on disk                                                                                                                                                 |

`apps/api/src/instrument-records/export-worker.js` uses two of them in one try/catch — a dynamic
`#runtime/v1/...` import falling back to `@opendatacapture/runtime-v1/...` — because the subpath
import does not resolve the same way from source as it does from the built `dist`.

Instrument source always uses the first form. `packages/instrument-bundler/src/plugin.ts` decides
what happens to it:

| Specifier                                                           | Result                                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `/runtime/v1/foo.css`                                               | rewritten to a CSS `@import` of the same URL, left for the browser |
| `/runtime/v1/react@19.x` (bare package, one optional scope segment) | external `/runtime/v1/react@19.x/index.js`                         |
| anything deeper                                                     | external, `.js` appended if absent                                 |

Server-side instrument evaluation closes the loop in
`apps/api/src/instruments/instruments.module.ts`: `__resolveImport` rejects any specifier that does
not start with `/runtime/`, then rewrites the prefix to `#runtime/` and resolves it through Node.

## `vendor/`

38 workspace packages (`vendor/**/*` in `pnpm-workspace.yaml`), each a thin wrapper re-exporting one
real library — `export * from 'lodash-es'`, `@import 'normalize.css'`, and so on. The wrapper exists
to pin a version and to give it a stable URL.

**Directory `vendor/<name>@<version>`, package name `<name>__<version>`.** A package name cannot
contain `@` outside the scope position, so the name uses `__`; the bundler maps `__` back to `@` for
the output directory, which is what makes the URL `/runtime/v1/react@19.x`. Because the version is
part of the name, majors coexist: react and react-dom at 18 and 19, jspsych at 7 and 8, jquery at
1.12.4 and 3.x, zod at 3.x and a deprecated 3.23.x alias that simply re-exports 3.x.

Adding one: `.agents/docs/playbooks/add-vendor-package.md`.

### Peer pairing

A wrapper declares its intended pairing with a workspace dependency on a sibling wrapper
(`jspsych__8.x`), but pnpm resolves the _wrapped_ package's peers with no knowledge of that
convention — it happily linked every jspsych 1.x plugin against jspsych 8. So a wrapper must declare
**both**:

```jsonc
"dependencies": {
  "@jspsych/plugin-html-button-response": "2.0.0", // the wrapped package
  "jspsych": "8.0.1",                              // the real peer, pinned to the paired version
  "jspsych__8.x": "workspace:*"                    // the sibling wrapper
}
```

Without the middle line the runtime ships two instances of a package that must exist once.
`runtime/v1/test/vendor-pairing.test.ts` guards this: for every `__`-named dependency it checks that
the physical directory the wrapped package's peer resolves to is the one the paired wrapper serves.

### Two kinds of export

The value of an entry in a wrapper's `exports` decides how it is built. See
`packages/runtime-bundler/src/types.ts`.

| Value in `package.json`                                     | Meaning                                                                                                                                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| a bare string — `"./css/jspsych.css": "./src/index.css"`    | **copy verbatim.** A static asset: classic script, stylesheet or HTML. Never bundled, because a classic script cannot carry chunk imports and a relative path inside it must survive |
| an object of conditions — `{ "types": ..., "import": ... }` | **bundle** into the shared module graph, with splitting. `import` wins over `default`; `types` is emitted alongside as `<name>.d.ts`                                                 |

`runtime-internal`'s three `interactive/*` exports are the load-bearing example of the first kind.

## Files that must stay in sync

| Pair                                                                                                                                                                                        | Breaks as                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `apps/api/package.json` `imports["#runtime/v1/*"]` ↔ `apps/api/tsconfig.json` `paths`                                                                                                       | tsc and Node disagree; one of them silently wins                               |
| `runtime/v1/runtime.config.js` `include` ↔ `runtime/v1/package.json` `devDependencies`                                                                                                      | `ResolverError` at build time                                                  |
| A vendor directory name `<name>@<ver>` ↔ its `package.json` `name` `<name>__<ver>`                                                                                                          | wrong output URL; `vendor-pairing.test.ts` cannot find the paired wrapper      |
| A wrapper's sibling-wrapper dependency ↔ its pinned real peer                                                                                                                               | duplicate library instances at runtime; caught by `vendor-pairing.test.ts`     |
| `packages/runtime-core/package.json` `exports` ↔ what its three build stages emit                                                                                                           | a subpath resolves to a file that no longer exists                             |
| The eight `tsconfig.json` files mapping `/runtime/v1/*`                                                                                                                                     | that workspace stops type-checking instrument imports                          |
| `jsxImportSource: '/runtime/v1/react@19.x'` in `packages/instrument-bundler/src/build.ts`, `packages/instrument-library/tsconfig.json` and `apps/playground/src/components/Editor/setup.ts` | the editor or `tsc` type-checks against a different React than the bundle uses |
| `src/index.js` ↔ `src/index.d.ts` in `runtime-internal` and `runtime-meta`                                                                                                                  | hand-written declarations; nothing checks them against the implementation      |
