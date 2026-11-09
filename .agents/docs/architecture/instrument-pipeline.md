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
`packages/instrument-utils/src/guards.ts` tests `Object.hasOwn(instrument, 'internal')`, **not**
`kind`, because only scalar instruments carry `internal: { name, edition }`, which the whole identity
scheme (§3) is built on.

## 1. Source

An instrument is a flat directory whose `index.*` default-exports `defineInstrument(...)` (or
`defineSeriesInstrument`), importing shared libraries by URL, `/runtime/v1/<pkg>`
(`.agents/docs/architecture/runtime-and-vendor.md`). Three places produce it:

| Source                             | Where                                                                     | Bundled by                                              |
| ---------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| Built-in catalog                   | `packages/instrument-library/src/{file,forms,interactive,series}/<NAME>/` | `instrument-bundler` CLI at package build time          |
| Playground examples and user edits | `apps/playground/src/instruments/{examples,templates}/`                   | `bundle()` in the browser, via `esbuild-wasm`           |
| External GitHub repos              | `lib/{file,forms,interactive,series}/*` in the remote repo                | `InstrumentReposService` on the API at import/sync time |

**Repo discovery returns `series` last, and callers must import in that order**
(`discoverInstrumentDirs` in `apps/api/src/instrument-repos/instrument-repos.service.ts`), because
`InstrumentsService.create` rejects a series unless every instrument it references is already stored.
The `lib/` layout it scans is the one `packages/instrument-guidelines/AGENTS.md` tells external authors
to use; change one and you must change the other.

**A series that references another repository still fails to import.** Nothing resolves dependencies
across repositories or retries, so it depends on the order the repos were added. The failure and its
reason land in the repository's activity log (`InstrumentRepoSyncLog`, on the admin Instrument
Repositories page); syncing the repository again once its dependencies are stored imports the series.

## 2. Bundling

`bundle()` in `packages/instrument-bundler` (stages, resolution rules and traps: its `AGENTS.md`)
returns **a JavaScript expression, not a module** — `(async () => { … })()` — so every consumer
evaluates it with `new Function('return ' + bundle)()` rather than `import()`. CSS and `?legacy`
scripts ride along base64-encoded on `content.__injectHead`, which the interactive iframe injects.

The bundle's `GLOBALS` preamble defines `globalThis.__import`, which delegates to
`globalThis.__resolveImport` **when the host defines one** and otherwise imports the specifier
verbatim. That is the one seam letting the same bundle string run in a browser, where `/runtime/v1/...`
is a real URL, and in the API's Node vm, where it is not.

## 3. Storing

`InstrumentsService.create` (`apps/api/src/instruments/instruments.service.ts`):

1. `virtualizationService.eval(bundle)` — libnest's `VirtualizationService`, configured in
   `instruments.module.ts` with `codeGeneration: { strings: false, wasm: false }` and the
   `__resolveImport` described in `runtime-and-vendor.md`.
2. `$AnyInstrument.safeParseAsync` — the Zod perimeter (`packages/schemas/src/instrument/`). A
   failure is a `422`, not a `500`.
3. Derive the id, which is **content-derived, not random**: scalar `hash('<name>-<edition>')`;
   series `'__V2__' + hash(JSON.stringify({ content, seriesGroupId, title }))`. Re-uploading the same
   name and edition throws `ConflictException`, and `InstrumentReposService` regex-parses the id back
   out of that message to re-associate an existing instrument with a repo, so the message format is
   load-bearing.

**Evaluated instances are memoized** in `virtualizationService.context.instruments`, keyed by id, for
the process lifetime. Any code path that removes or replaces an instrument must delete that entry, as
`deleteById` does, or the stale instance shadows any future instrument issued the same id.

## 4. Serving

`GET /v1/instruments/bundle/:id` returns an `InstrumentBundleContainer`
(`packages/schemas/src/instrument/instrument.base.ts`), discriminated on `kind`. For `SERIES` it also
carries `items`, every constituent bundle, in the same response.

## 5. Evaluating in the browser

`InstrumentInterpreter.interpret` (`packages/instrument-interpreter`) calls `evaluateInstrument`
(`packages/runtime-internal`), a bare `new Function`. Validation against `$AnyInstrument` is opt-in
(`validate: true`): the playground (`apps/playground/src/preview/PreviewApp.tsx`) always opts in,
since its bundles never went through the API, and `apps/web` only in dev
(`packages/instrument-interpreter/AGENTS.md`).

`useInterpretedInstrument` (`packages/react-core/src/hooks/`) drives this from React and runs
`translateInstrument` for the current locale, so downstream components see a unilingual instrument
plus a `supportedLanguages` array.

## 6. Rendering

In `packages/react-core/src/components/InstrumentRenderer/`, `InstrumentRenderer` sends `SERIES` to
`SeriesInstrumentRenderer` and everything else to `ScalarInstrumentRenderer` (overview → content →
summary). Both validate the submission against the instrument's own `validationSchema` before calling
`onSubmit`.

**`SeriesInstrumentRenderer` handles only `FORM` and `INTERACTIVE` items.** A `FILE` item falls
through to `.otherwise(() => null)` and renders nothing. `apps/web` and `apps/gateway` use
`InstrumentRenderer`; `apps/playground` and `packages/serve-instrument` mount `ScalarInstrumentRenderer`
directly, so neither can render a series.

## The interactive iframe contract

An `INTERACTIVE` bundle is evaluated **twice**: by the host page (`useInterpretedInstrument`) for its
details and `validationSchema`, and again inside the iframe `InteractiveContent` renders at
`/runtime/v1/@opendatacapture/runtime-internal/interactive/iframe.html`, whose `bootstrap.js` reads it
from the frame's `data-bundle` attribute and calls `content.render`. Only the second touches the DOM.

Two attributes are load-bearing:

- `data-bundle` — `bootstrap.js` throws if it is missing.
- `name="interactive-instrument"` — `SynchronizedTranslator.init` in
  `packages/runtime-core/src/i18n.ts` throws unless `window.frameElement` carries exactly this value.
  Renaming it breaks every multilingual interactive instrument at runtime and nothing catches it
  earlier.

The two sides talk through `CustomEvent`s dispatched on `window.parent.document`, never `postMessage`,
typed in `packages/react-core/src/types.ts`:

| Event             | `detail`              | Dispatched by                                                                           |
| ----------------- | --------------------- | --------------------------------------------------------------------------------------- |
| `done`            | the instrument's data | `bootstrap.js`, as the `done` callback passed to `content.render`                       |
| `changeLanguage`  | `'en' \| 'fr'`        | `SynchronizedTranslator.changeLanguage`                                                 |
| `addNotification` | `RuntimeNotification` | `addNotification` in `packages/runtime-core/src/notifications.ts`                       |
| `changeTheme`     | `'dark' \| 'light'`   | nothing in this repo — the listener exists, but instrument code must dispatch it itself |

`bootstrap.js` also mirrors the parent's `data-mode` attribute onto its own root, injects
`content.meta`, `content.html` and the `__injectHead` assets, and, when `content.staticAssets` is set,
registers `worker.js` as a service worker and waits for a `STATIC_ASSETS_READY` message before
rendering.
