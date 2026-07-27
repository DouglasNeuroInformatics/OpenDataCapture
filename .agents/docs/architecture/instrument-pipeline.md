# Instrument pipeline

TypeScript source → bundle string → stored → evaluated → rendered. Every stage is code the platform
runs, not data it stores, so a mistake anywhere shows up as a runtime failure rather than a type error.

## The four kinds

`kind` is the discriminator on every instrument.

| Kind          | Scalar? | Content                                           | Renders as                             |
| ------------- | ------- | ------------------------------------------------- | -------------------------------------- |
| `FORM`        | yes     | declarative field definitions                     | `FormContent`                          |
| `INTERACTIVE` | yes     | a `render(done)` function                         | `InteractiveContent`, inside an iframe |
| `FILE`        | yes     | file upload config                                | `FileInstrumentContent`                |
| `SERIES`      | **no**  | an ordered list of `{ name, edition }` references | `SeriesInstrumentRenderer`             |

"Scalar" means it produces data of its own. `isScalarInstrument` in
`packages/instrument-utils/src/guards.ts` tests `Object.hasOwn(instrument, 'internal')`, **not** the
`kind` field — only scalar instruments carry `internal: { name, edition }`, which is what the whole
identity scheme is built on.

## 1. Source

An instrument is a **flat directory** — one level, no subdirectories — with an entry named `index`.
`resolveIndexInput` (`packages/instrument-bundler/src/resolve.ts`) tries the extensions in the order
`.tsx`, `.jsx`, `.ts`, `.js` and takes the first hit. The default export is the result of
`defineInstrument` (or `defineSeriesInstrument`) from `@opendatacapture/runtime-core`.

Shared libraries are imported by **URL**, not by package name:

```ts
import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';
import { createRoot } from '/runtime/v1/react-dom@19.x/client.js';
```

These resolve differently on each tier and are covered in
`.agents/docs/architecture/runtime-and-vendor.md`. Sibling files use ordinary relative imports
(`'./styles.css'`, `'./StroopTask.tsx'`).

Three places produce instrument source:

| Source                             | Where                                                                     | Bundled by                                              |
| ---------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| Built-in catalog                   | `packages/instrument-library/src/{file,forms,interactive,series}/<NAME>/` | `instrument-bundler` CLI at package build time          |
| Playground examples and user edits | `apps/playground/src/instruments/{examples,templates}/`                   | `bundle()` in the browser, via `esbuild-wasm`           |
| External GitHub repos              | `lib/forms/*` and `lib/interactive/*` in the remote repo                  | `InstrumentReposService` on the API at import/sync time |

**Repo discovery only scans `lib/forms` and `lib/interactive`** (`discoverInstrumentDirs` in
`apps/api/src/instrument-repos/instrument-repos.service.ts`). A `lib/file` or `lib/series` directory
in an external repo is silently ignored.

## 2. Bundling

`bundle()` in `packages/instrument-bundler/src/bundle.ts` is the only entry point. Four stages:

| Stage              | File            | What it does that you would not guess                                                                                                                                                                                                                                  |
| ------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `preprocess`       | `preprocess.ts` | Rejects any input whose `name` contains `/`. Names are bare filenames, never paths.                                                                                                                                                                                    |
| `build`            | `build.ts`      | esbuild with `format: 'esm'` and **`treeShaking: false`**. Entry is a synthetic stdin module: `import instrument from './<index>'; var __exports = instrument;`. Asserts the metafile reports **exactly 0 exports** and exactly one output file (two if there is CSS). |
| `transformImports` | `transform.ts`  | Rewrites the static imports esbuild left behind (the externals) into `const { … } = await __import('…')`, and `import(` into `__import(`.                                                                                                                              |
| `createBundle`     | `bundle.ts`     | Wraps everything in an async IIFE that returns `__exports`, then runs a second esbuild `transform` — this one with `treeShaking: true` and minification per the `minify` option.                                                                                       |

The two esbuild passes disagree on `treeShaking`, and the assertions in `build.ts` are what keep the
whole scheme honest: the bundle must expose its instrument through the `__exports` variable and
through nothing else. Do not "harmonize" the two settings, and do not relax the export assertion.

The result is **a JavaScript expression, not a module** — `(async () => { … })()`. That is why every
consumer evaluates it with `new Function('return ' + bundle)()` rather than `import()`.

### The import shim

`createBundle` prepends a `GLOBALS` preamble defining `globalThis.__import`, which delegates to
`globalThis.__resolveImport` **when the host defines one** and otherwise imports the specifier
verbatim. This is the single seam that lets one bundle string run in a browser (where
`/runtime/v1/...` is a real URL) and in a Node vm (where it is not).

The same preamble shadows `document`, `self` and `window` with throwing proxies when the host has no
real ones, and `plugin.ts` prepends `globalThis.__ODC_BUNDLER_ERROR_CONTEXT = "<filename>"` to every
JS/TS input. So touching the DOM at module top level fails with the offending filename in the
message, instead of a bare `document is not defined` from an unknown file.

### Import rewriting rules in `plugin.ts`

| Import                                        | Outcome                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| CSS `@import` (`kind: 'import-rule'`)         | external, untouched                                                                                     |
| dynamic `import(...)`                         | external if the specifier starts with `/`, `http://` or `https://`; otherwise a build error             |
| `/runtime/v1/**.css`                          | loaded into the CSS bundle                                                                              |
| `/runtime/v1/pkg` or `/runtime/v1/@scope/pkg` | external, `/index.js` appended                                                                          |
| any other `/runtime/v1/...`                   | external, `.js` appended unless already present                                                         |
| `<file>?raw`                                  | inlined as text                                                                                         |
| `<file>?legacy`                               | collected into `legacyScripts`, emitted as an empty module                                              |
| anything else                                 | resolved against the flat input list; unresolvable names are a build error listing every input filename |

CSS and `?legacy` scripts do not end up in the JS. `createBundle` base64-encodes them onto a frozen
`content.__injectHead` property (`{ scripts, style }`) which the interactive iframe reads at runtime.

## 3. Storing

`InstrumentsService.create` (`apps/api/src/instruments/instruments.service.ts`):

1. `virtualizationService.eval(bundle)` — libnest's `VirtualizationService`, configured in
   `instruments.module.ts` with `codeGeneration: { strings: false, wasm: false }` and a context
   `__resolveImport` that rewrites a leading `/runtime/` to `#runtime/` and calls
   `import.meta.resolve`. Anything not starting with `/runtime/` throws.
2. `$AnyInstrument.safeParseAsync` — the Zod perimeter (`packages/schemas/src/instrument/`). A
   failure is a `422`, not a `500`.
3. Derive the id, which is **content-derived, not random**:
   - scalar: `cryptoService.hash('<name>-<edition>')`
   - series: `'__V2__' + hash(JSON.stringify({ content, seriesGroupId, title }))`

   Re-uploading the same name and edition therefore collides and throws `ConflictException`.
   `InstrumentReposService.importInstrumentFromDir` deliberately parses the id back out of that
   conflict message to re-associate an already-present instrument with the repo.

4. Persist. `Instrument.bundle` is a plain `String` column in `apps/api/prisma/schema.prisma`.

`#runtime/v1/*` is declared in `apps/api/package.json` and mirrored in `apps/api/tsconfig.json`; both
must agree. The `build.onComplete` hook in `apps/api/libnest.config.ts` copies
`@opendatacapture/runtime-v1/dist` into `dist/runtime/v1` at build time; without it the resolution
fails in production.

**Evaluated instances are memoized** in `virtualizationService.context.instruments`, keyed by id, for
the process lifetime. Any code path that removes or replaces an instrument must delete that entry —
`deleteById` does. Forgetting it means a deleted instrument stays resident and shadows any future
instrument issued the same id.

## 4. Serving

`GET /v1/instruments/bundle/:id` returns an `InstrumentBundleContainer`
(`packages/schemas/src/instrument/instrument.base.ts`), discriminated on `kind`. For `SERIES` the
container additionally carries `items: ScalarInstrumentBundleContainer[]`, so the client receives the
series bundle **and** every constituent bundle in one response.

## 5. Evaluating in the browser

`evaluateInstrument` in `packages/runtime-internal/src/index.js` is the whole implementation:

```js
return await new Function(`return ${bundle}`)();
```

It performs no validation, and its docstring is explicit that only trusted input may reach it.
`InstrumentInterpreter.interpret` (`packages/instrument-interpreter/src/index.ts`) wraps it and
re-validates against the Zod schemas only when `validate: true` is passed. It defaults to off; the
playground is the one caller that opts in (`apps/playground/src/components/Viewer/Viewer.tsx`), since
its bundles have never been through the API's `$AnyInstrument` check.

`packages/react-core/src/hooks/useInterpretedInstrument.ts` drives this from React and additionally
runs `translateInstrument` for the current locale, so components downstream see a unilingual
instrument plus a `supportedLanguages` array.

On the browser side the `/runtime/v1/...` URLs are served by `packages/vite-plugin-runtime` — dev
middleware on `/runtime`, and a copy into `dist/runtime/<version>` at build.

## 6. Rendering

`packages/react-core/src/components/InstrumentRenderer/` — read `ScalarInstrumentRenderer.tsx` before
changing any of this. `InstrumentRenderer` splits `SERIES` off to `SeriesInstrumentRenderer` and
sends everything else to `ScalarInstrumentRenderer`, which is a three-step index (overview → content
→ summary) with a `ts-pattern` match on `{ index, instrument }`.

Both renderers validate the submission against the instrument's own `validationSchema` before calling
`onSubmit`, and show a notification instead of submitting on failure.

**`SeriesInstrumentRenderer` handles only `FORM` and `INTERACTIVE` items.** A `FILE` item inside a
series falls through to `.otherwise(() => null)` and renders nothing.

`apps/web` and `apps/gateway` use `InstrumentRenderer`. `apps/playground` and
`packages/serve-instrument` mount `ScalarInstrumentRenderer` directly — neither can render a series.

## The interactive iframe contract

An `INTERACTIVE` bundle is evaluated **twice**. The host page evaluates it via
`useInterpretedInstrument` to read the details, flags and `validationSchema`; separately,
`InteractiveContent` renders an iframe at
`/runtime/v1/@opendatacapture/runtime-internal/interactive/iframe.html`, whose `bootstrap.js` reads
the bundle out of the **`data-bundle` attribute on the frame element**, evaluates it again, and calls
`content.render`. Only the second evaluation touches the DOM.

Two attributes are load-bearing:

- `data-bundle` — `bootstrap.js` throws if it is missing.
- `name="interactive-instrument"` — `SynchronizedTranslator.init` in
  `packages/runtime-core/src/i18n.ts` throws unless `window.frameElement` carries exactly this value.
  Renaming it breaks every multilingual interactive instrument at runtime and nothing catches it
  earlier.

Communication across the boundary is `CustomEvent`s dispatched on `window.parent.document` and
listened for on `document` in `InteractiveContent.tsx`. There is no `postMessage`.

| Event             | `detail`              | Dispatched by                                                                           |
| ----------------- | --------------------- | --------------------------------------------------------------------------------------- |
| `done`            | the instrument's data | `bootstrap.js`, as the `done` callback passed to `content.render`                       |
| `changeLanguage`  | `'en' \| 'fr'`        | `SynchronizedTranslator.changeLanguage`                                                 |
| `addNotification` | `RuntimeNotification` | `addNotification` in `packages/runtime-core/src/notifications.ts`                       |
| `changeTheme`     | `'dark' \| 'light'`   | nothing in this repo — the listener exists, but instrument code must dispatch it itself |

The event names and payloads are declared by augmenting `GlobalEventHandlersEventMap` in
`packages/react-core/src/types.ts`; adding an event means adding it there too or the listener will
not type-check.

`bootstrap.js` also mirrors the parent's `data-mode` attribute onto its own root and keeps it in sync
with a `MutationObserver`, injects `content.meta`, `content.html` and the base64 `__injectHead`
style/scripts, and — when `content.staticAssets` is set — registers `worker.js` as a service worker
and waits for a `STATIC_ASSETS_READY` message before rendering.

## `packages/instrument-guidelines/AGENTS.md` is not repo convention

That file is the **content of a published npm package** (`@opendatacapture/instrument-guidelines`,
`publishConfig.access: public`, released by the `publish-npm` job in `.github/workflows/release.yaml`
via `scripts/list-publishable.sh`). Its `bin/cli.mjs` symlinks or copies it into an external
instrument repository so an agent working _there_ can read it.

Editing it changes a published package that third parties consume. It describes how to author an
instrument in a standalone repo; it says nothing about working in this monorepo, and none of its
rules apply to code outside an instrument directory. Its instruction to place instruments in
`lib/forms` and `lib/interactive` is coupled to `discoverInstrumentDirs` on the API — change one and
you must change the other.
