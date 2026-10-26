# apps/playground

The in-browser instrument editor at `playground.opendatacapture.org`. Monaco + esbuild-wasm + a live
preview, built by Vite into a static `dist/` that is served by Caddy (see the `Dockerfile`, `Caddyfile` and
the `deploy` script). Nothing on the server side belongs to it; the image carries no Node.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## Top-level await is load-bearing

**`src/pages/IndexPage.tsx`** calls `await initialize({ wasmURL })` from `esbuild-wasm` above the
component. esbuild-wasm throws `Cannot call "initialize" more than once` on a second call, so this
must stay in exactly one module. `src/App.tsx` reaches it through `React.lazy`, which is what puts
the 13 MB `esbuild.wasm` download behind the Suspense fallback. Importing `IndexPage` eagerly, or
adding a second `initialize()`, breaks the app at boot.

It depends on `build.target` and `optimizeDeps.rolldownOptions.transform.target` being `es2022` in
`vite.config.ts`. Lowering either one is how top-level await silently stops compiling.

`build.rolldownOptions.external: ['esbuild']` is also required. `packages/instrument-bundler/src/vendor/esbuild.ts`
picks between `esbuild` and `esbuild-wasm` on `typeof window`; without the external, Vite tries to
pull the Node package into the browser bundle. Background:
`.agents/docs/architecture/runtime-and-vendor.md`.

## Monaco is wired up by hand

**`src/components/Editor/setup.ts` configures Monaco at import time** — workers, compiler options,
themes, prettier as the formatter. `Editor.tsx` pulls it in with a bare `import './setup'` for the
side effect, so it has run before any editor exists.

**`src/components/Editor/MonacoEditor.tsx` is the editor component**, in place of
`@monaco-editor/react`, whose 4.7 types import `monaco-editor/esm/vs/editor/editor.api`, a path the
`exports` map `monaco-editor` 0.56 added no longer resolves. It keeps one model per `path` and never
disposes one: `EditorPane` is keyed by instrument and filename, so every file switch remounts the
editor, and the surviving model is what keeps the file's content and undo history. It restores each
model's cursor and scroll position on the way back. Only `EditorPane` disposes models: all of them,
on an instrument switch or when it unmounts.

**Deep imports go through that `exports` map**, which sends `monaco-editor/<path>` to
`esm/vs/<path>.js`. The language workers come from
`monaco-editor/languages/features/<language>/<language>.worker`; the `esm/vs/language/*` paths the
Monaco docs still show are deprecated re-exports. `SuggestAdapter` comes from
`monaco-editor/languages/features/typescript/tsMode`, an internal module with no types of its own,
declared in `src/typings/monaco-editor.d.ts`. `setup.ts` switches off the built-in completion
provider (`completionItems: false`) and registers a subclass whose only change is quotes as trigger
characters, so string-literal completions open as you type. The TypeScript API is the top-level
`monaco.typescript` namespace; `monaco.languages.typescript` has been an empty `{ deprecated: true }`
since 0.57.

## Running it

`pnpm dev` at the repo root does **not** start the playground — `dev:core` filters to api, gateway and
web. Use `pnpm exec turbo run dev --filter=@opendatacapture/playground`, which builds
`@opendatacapture/runtime-v1` first. Dev server port is `PLAYGROUND_DEV_SERVER_PORT`, default 3750.

**`runtime/v1/dist` must exist.** `@opendatacapture/vite-plugin-runtime` calls `generateMetadata`,
which reads that directory at config time, so a missing build is a startup crash rather than a
degraded experience. `tsc` needs it too: the tsconfig maps `/runtime/v1/*` to `../../runtime/v1/dist/*`,
which is the only reason example instruments importing `/runtime/v1/zod@3.x` type-check.

`build.emptyOutDir` is `false` on purpose. The runtime plugin copies the runtime into
`dist/runtime/<version>` from `buildStart`, and Vite empties the output directory _after_ the Rolldown
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

## The preview runs on a second origin

The editor never evaluates an instrument. `Viewer.tsx` compiles the files and hands the bundle to
`components/Viewer/PreviewFrame.tsx`, an iframe of `preview.html` — a second Vite entry whose app is
`src/preview/PreviewApp.tsx` — and everything crossing between the two is a `postMessage` parsed
against the schemas in `src/preview/protocol.ts`. The frame is served from a **different origin**
than the editor, so instrument code, including code that arrives in a share link, cannot read the
editor's IndexedDB, where the store keeps the API token, or anything else on the editor's origin.

`resolvePreviewOrigin` decides that origin. A hosted playground names it with
`PLAYGROUND_PREVIEW_ORIGIN` (a second hostname serving the same `dist/`), read at runtime rather than
at build time, because one published image serves every deployment: the Caddyfile answers
`/config.json` from the container's environment, `vite.config.ts`'s `playgroundConfig` plugin does
the same for a dev server, and `Viewer.tsx` fetches it once and suspends until it arrives
(`src/preview/config.ts`). A static host with neither must serve that file itself, or the viewer
throws. `docs/en/2-tutorials/2.4-playground-deployment.md` is the operator's side of this. With the
variable empty, a dev server uses the other loopback name — `localhost` pairs with `127.0.0.1` —
which is why `vite.config.ts` binds `server.host` to `127.0.0.1`, so both names answer. **When the
only origin available is the editor's own, the viewer refuses to render** (`PreviewOriginError`)
rather than fall back to same-origin evaluation: a frame on the editor's origin is no isolation at
all.

The iframe keeps `sandbox` **with** `allow-same-origin`, and that is safe only because the origin
differs. It is what lets the preview use its own storage, service workers and nested same-origin
frames — `InteractiveContent` in react-core renders an interactive instrument in an inner iframe
that reads `parent.document`, and instruments with `staticAssets` register a service worker, neither
of which an opaque (`allow-same-origin`-less) sandbox permits. libui's `useTheme` also reads
`localStorage` on first render, which throws in an opaque origin.

The frame's stylesheet is `src/preview/preview.css`, not react-core's `globals.css` directly: it
collapses every Tailwind breakpoint to `1px`, so the preview always renders an instrument's desktop
layout. Tailwind's `sm:`/`md:` variants are viewport media queries, and the frame's viewport is the
split-view panel, about 400 px wide; without the override the same instrument shows its phone layout
there, with the summary's copy, download and print actions hidden — which is not what the editor
page's own width used to produce.

## Talking to an ODC instance

The playground has no backend and no baked-in API URL, but it is not offline-only: `LoginDialog` and
`UploadBundleDialog` post to a user-supplied `settings.apiBaseUrl` (`/v1/auth/login`,
`/v1/auth/create-instrument-token`, `/v1/instruments`) with a raw `axios` call and a bearer token held
in the store. There is no shared axios instance and no React Query here.

The token `/v1/auth/create-instrument-token` mints is scoped to `manage Instrument`, which is what
`POST /v1/instruments` requires — the two actions must stay in step, and this dialog is that route's
only caller, so tightening it silently breaks upload here and nowhere else (#1392). It is scoped no
narrower because a bundle is evaluated server-side: whoever may create an instrument can already run
code on the API. The API accepts that token only on `POST /v1/instruments` (the route carries
`@AcceptsInstrumentToken()`), so it cannot mint its own successor or reach anything else; a new call
here made with it will be refused unless its route is marked the same way.
`testing/src/specs/authorization.spec.ts` pins the contract.

Upload is gated on monaco's own diagnostics: `useEditorErrorSync` writes every error-severity marker
owned by the `typescript` or `javascript` language into `editorErrors`, and `UploadBundleDialog`
refuses to post while that list is non-empty. The transpiler state is not that gate — esbuild strips
types without checking them, so an instrument that fails `tsc` still reaches `status: 'built'`. The
hook asks for markers file by file, because monaco also holds models for the runtime declarations,
`globals.d.ts` and files the user has deleted (`deleteFile` never disposes a model), none of which
should block an upload.

Share links come from `@opendatacapture/playground-url`, which lz-string-compresses file contents into
the URL fragment. A link that differs only in its fragment does not reload the page, so `IndexPage`
reads the URL through `useLocationHref`, which re-renders on `hashchange`; reading `location.href`
directly means pasting a second share link into an open tab does nothing. Its `$EditorFile` requires
`content` to be a UTF-8 string, so binary assets do not survive a share URL.

## Odds and ends

`.vscode/Scratch/` is unrelated junk.

The editor/preview split in `src/components/MainContent/MainContent.tsx` gives every
`react-resizable-panels` size as a percentage string. Version 4 reads a bare number as pixels, so
`defaultSize={66}` still type-checks and renders, at the wrong size; the split test in
`testing/src/specs/playground.spec.ts` measures the panes to catch it.

`__APP_VERSION__` and `__GITHUB_REPO_URL__` are the build-time defines, declared in
`src/vite-env.d.ts` and supplied in `vite.config.ts`; `GITHUB_REPO_URL` must be listed under the
`build` task's `env` in `turbo.json` or turbo's strict env mode hides it from the build. Anything
that differs between deployments belongs in `/config.json` instead.

## Tests

`pnpm exec vitest --project playground`, from the repo root. The project runs in node, with no DOM,
and covers only what is pure — `src/preview/__tests__/protocol.test.ts` pins the message schemas,
error serialization and `resolvePreviewOrigin`, and `config.test.ts` the `/config.json` contract. A
component that renders on a server can still be pinned through `react-dom/server`'s
`renderToStaticMarkup`, as `src/components/Resizable/__tests__/` does for the attributes its classes
key on. A component test that needs a DOM opts in per file with a `// @vitest-environment happy-dom`
docblock on its first line and renders with `@testing-library/react`;
`src/components/Editor/__tests__/MonacoEditor.test.tsx` does, against a mocked `monaco-editor`,
because Monaco itself does not run under happy-dom. Anything that touches esbuild-wasm, Monaco
workers or `/runtime/v1` has no test environment here; the frame itself, the origin split, the runtime config, the message bridge and the resizable
editor/preview split are exercised for real by `testing/src/specs/playground.spec.ts`, which
Playwright runs against this app's dev server.

Storybook collects `*.stories.tsx` under `src/components/` centrally through
`storybook/config/main.ts` under the `Playground Components` prefix. See
`.agents/docs/architecture/testing-strategy.md` for the tier-by-tier picture.
