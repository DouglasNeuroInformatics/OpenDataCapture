# apps/playground

The in-browser instrument editor at `playground.opendatacapture.org`. Monaco + esbuild-wasm + a live
preview, built by Vite into a static `dist/` that is served by a plain file server (see the
`Dockerfile` and the `deploy` script). Nothing on the server side belongs to it.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## Top-level await is load-bearing

Two modules do real work at import time, and both are fragile.

- **`src/pages/IndexPage.tsx`** calls `await initialize({ wasmURL })` from `esbuild-wasm` above the
  component. esbuild-wasm throws `Cannot call "initialize" more than once` on a second call, so this
  must stay in exactly one module. `src/App.tsx` reaches it through `React.lazy`, which is what puts
  the 11 MB `esbuild.wasm` download behind the Suspense fallback. Importing `IndexPage` eagerly, or
  adding a second `initialize()`, breaks the app at boot.
- **`src/components/Editor/setup.ts`** configures Monaco (workers, compiler options, themes, prettier
  as the formatter) inside a top-level `await loader.init()` block. `Editor.tsx` pulls it in with a
  bare `import './setup'` for the side effect.

Both depend on `build.target` and `optimizeDeps.esbuildOptions.target` being `es2022` in
`vite.config.ts`. Lowering either one is how top-level await silently stops compiling.

`rollupOptions.external: ['esbuild']` is also required. `packages/instrument-bundler/src/vendor/esbuild.ts`
picks between `esbuild` and `esbuild-wasm` on `typeof window`; without the external, Vite tries to
pull the Node package into the browser bundle. Background:
`.agents/docs/architecture/runtime-and-vendor.md`.

## Running it

`pnpm dev` at the repo root does **not** start the playground — `dev:core` filters to api, gateway and
web. Use `pnpm exec turbo run dev --filter=@opendatacapture/playground`, which builds
`@opendatacapture/runtime-v1` first. Dev server port is `PLAYGROUND_DEV_SERVER_PORT`, default 3750.

**`runtime/v1/dist` must exist.** `@opendatacapture/vite-plugin-runtime` calls `generateMetadata`,
which reads that directory at config time, so a missing build is a startup crash rather than a
degraded experience. `tsc` needs it too: the tsconfig maps `/runtime/v1/*` to `../../runtime/v1/dist/*`,
which is the only reason example instruments importing `/runtime/v1/zod@3.x` type-check.

`build.emptyOutDir` is `false` on purpose. The runtime plugin copies the runtime into
`dist/runtime/<version>` from `buildStart`, and Vite empties the output directory _after_ the rollup
build finishes. The cost is that `dist/` accumulates stale files — delete it by hand when a build
looks wrong.

## The example catalog is a directory convention

`src/instruments/index.ts` builds `defaultInstruments` from two `import.meta.glob` calls and parses
metadata out of the file path: `<category>/<kind>/<Label>/<name...>`. So
`examples/form/Form-With-Groups/index.ts` becomes category `Examples`, kind `FORM`, label
`Form With Groups`, file `index.ts`. Category and kind are Zod-parsed, so the first directory must
`capitalize` to a member of `$InstrumentCategory` (in practice `examples` or `templates`) and the
second must uppercase to a member of `$InstrumentKind` (`form`, `interactive`, `file`, `series`).
Hyphens in the label directory become spaces.

**Renaming a directory changes the parsed metadata.** `defaultSelectedInstrument` is looked up by
`label === 'Unilingual Form'` with a non-null assertion, and `src/store/index.ts` dereferences it at
module scope, so renaming `templates/form/Unilingual-Form/` crashes the app on load.

These example and template files are real linted, type-checked source, not fixtures — root
`pnpm lint` covers them. Write them the way `packages/instrument-guidelines` says to, and see
`.agents/docs/architecture/instrument-pipeline.md` for how they are bundled.

Supporting a new asset extension touches the two globs in `src/instruments/index.ts`, four functions
in `src/utils/file.ts` (`inferFileType`, `isImageLikeFileExtension`, `isBase64EncodedFileType`,
`getImageMIMEType`), the `accept` map in `src/components/Editor/Editor.tsx`, and the bundler's own
extension handling. Binary assets are held in the store as base64 and converted back to `Uint8Array`
by `editorFileToInput`.

## State and persistence

One Zustand store, slice pattern, `SliceCreator` from `src/store/types.ts` — same shape as `apps/web`,
but persisted to **IndexedDB** via `idb-keyval` under the key `app`, not to `localStorage`.

The custom `merge` in `src/store/index.ts` keeps only instruments whose `category === 'Saved'` from
persisted state; examples and templates always come from the current bundle. Editing an example is
therefore not persisted, and a stale IndexedDB entry can mask an instrument you just added — clear
site data before concluding a change did not work.

`Viewer.tsx` polls `hashFiles(...)` on `settings.refreshInterval` (2000 ms) and rebuilds only when the
hash moves. There is no explicit save-and-compile path.

## Talking to an ODC instance

The playground has no backend and no baked-in API URL, but it is not offline-only: `LoginDialog` and
`UploadBundleDialog` post to a user-supplied `settings.apiBaseUrl` (`/v1/auth/login`,
`/v1/auth/create-instrument-token`, `/v1/instruments`) with a raw `axios` call and a bearer token held
in the store. There is no shared axios instance and no React Query here.

Share links come from `@opendatacapture/playground-url`, which lz-string-compresses file contents into
a query parameter. Its `$EditorFile` requires `content` to be a UTF-8 string, so binary assets do not
survive a share URL.

## Odds and ends

`src/vim/` is a vendored port of CodeMirror's vim bindings to Monaco, top-to-bottom
`/* eslint-disable */`. Do not refactor it; treat it as third-party. `.vscode/Scratch/` is unrelated
junk.

`__GITHUB_REPO_URL__` is the only build-time define, declared in `src/vite-env.d.ts` and supplied from
`process.env.GITHUB_REPO_URL` in `vite.config.ts`.

## Tests

**There is no `apps/playground/vitest.config.ts`, so this app has no unit tests and no `test` script**
— `pnpm exec vitest --project playground` will not match anything. Adding one is
`.agents/docs/playbooks/add-vitest-project.md`, plus mocking anything that touches
esbuild-wasm, Monaco workers or `/runtime/v1`, none of which exist in a test environment.

What coverage there is comes from Storybook: `*.stories.tsx` under `src/components/` are collected
centrally by `storybook/config/main.ts` under the `Playground Components` prefix. End-to-end coverage
lives in `testing/` — see `.agents/docs/architecture/testing-strategy.md`.
