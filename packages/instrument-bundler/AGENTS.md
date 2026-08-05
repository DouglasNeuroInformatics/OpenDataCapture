# packages/instrument-bundler

Compiles a set of instrument source files into a single self-contained bundle **string**. Consumed by
`apps/api` (`instruments`, `instrument-repos`), `apps/playground` (in the browser), `packages/serve-instrument`,
`packages/react-core` (error fallback), and `packages/instrument-library`, whose `build` script runs
`src/cli.ts` through `tsx`.

Read the root `AGENTS.md` first. Background on where this sits in the wider flow:
`.agents/docs/architecture/instrument-pipeline.md`.

`src/bundle.ts` is the whole public entry: `preprocess` → `build` → `transformImports` → `createBundle`.

## Traps

**Instrument directories are flat.** `preprocess` rejects any input whose `name` contains `/`, and
`resolveInput` only accepts a path of the form `./name.ext`. Supporting nested files means changing
both, plus the plugin's `?raw`/`?legacy` regexes.

**The entry point is synthetic.** `build.ts` feeds esbuild a `stdin` of
`import instrument from './<index>'; var __exports = instrument;`, so an instrument must have a
**default export** — a named export is invisible to the bundle. `resolveIndexInput` picks the first of
`index.tsx`, `index.jsx`, `index.ts`, `index.js`.

**`treeShaking` is `false` in `build.ts` and `true` in `createBundle`, on purpose.** The synthetic
entry declares `__exports` but exports nothing, so tree shaking during the build would delete the
entire program. It becomes safe only after `createBundle` wraps the code in an IIFE that returns
`__exports`. Do not "fix" the asymmetry.

**`parseBuildResult` asserts the output has exactly 0 exports** because `createBundle` textually
splices `output.js` into an async IIFE, where a surviving `export` statement is a syntax error. Same
reason `transformImports` must run first: it rewrites the remaining static imports (the external
`/runtime/v1/*` ones) into `await __import(...)`.

**`jsxImportSource` is derived, not fixed.** `resolveJsxImportSource` in `src/build.ts` scans the
inputs for a `/runtime/v1/react@<major>` import and compiles JSX against that react, defaulting to
`react@19.x` when the source imports none — the form case, where a block may hold JSX but may not
import react at all. This matters because elements built by one major are not renderable by another:
React 19's JSX runtime stamps `Symbol.for('react.transitional.element')` and React 18's reconciler
only accepts `Symbol.for('react.element')`, so a react-18 instrument whose JSX came from react 19
fails at render with nothing pointing at the cause. Importing two majors in one instrument is a build
error rather than a guess.

**The type-check and editor copies are still pinned to 19** — `packages/instrument-library/tsconfig.json`
and `apps/playground/src/components/Editor/setup.ts` (the Monaco config). A react-18 instrument
therefore bundles against react 18 and type-checks against react 19's JSX types. Nothing enforces
agreement between the three.

**Every js/jsx/ts/tsx input is prefixed with a line** (`plugin.ts`):
`globalThis.__ODC_BUNDLER_ERROR_CONTEXT = "<input.name>";`. The `document` / `self` / `window` Proxies in
the `GLOBALS` preamble of `bundle.ts` read that variable, so a bundle evaluated outside a browser (the
API evaluates bundles server-side) fails with a message naming the file that touched the DOM at module
scope, instead of a bare `document is not defined`. Two consequences: removing the prefix silently
degrades every such error, and **esbuild error locations are one line ahead of the author's source** —
`packages/react-core/src/components/InstrumentErrorFallback/CodeErrorBlock.tsx` works around this by
matching `location.lineText` rather
than trusting `location.line`.

**Never `import 'esbuild'` directly.** `src/vendor/esbuild.ts` switches between `esbuild` and
`esbuild-wasm` on `typeof window === 'undefined'` — that is what lets the playground bundle in the
browser. Tests also spy on this module (`vi.spyOn(esbuild, 'build')`).

**That switch must initialize its exports in the declaration itself.** `package.json` declares
`sideEffects: ['**/cli.ts']`, so every other file here is advertised as side-effect free and a
bundler may delete any standalone top-level statement. Writing the switch as an `if`/`else` that
assigns to a hoisted `var` puts the initialization in such a statement: `apps/api`'s production
bundle dropped the entire module and every instrument import failed with
`ReferenceError: build is not defined` — a failure that only appears in a bundled build, never under
`pnpm dev`. `src/__tests__/vendor.test.ts` bundles the module with tree shaking to guard this.

**`src/parse.ts` is vendored** from `parse-imports` (Apache-2.0, adapted to TypeScript and to run in a
browser). Treat it as third-party: fix it upstream-style or not at all.

## Module resolution

`plugin.ts` is the only resolver. Everything not matched below is looked up by filename in `inputs`.

| Specifier                                               | Handling                                                                                      |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `/runtime/v1/<pkg>` (bare package, incl. `@scope/name`) | external, `/index.js` appended                                                                |
| `/runtime/v1/...` (anything else)                       | external, `.js` appended if missing                                                           |
| `/runtime/v1/*.css`                                     | inlined as an `@import` into the CSS output                                                   |
| `import()`                                              | must be an http import (`/`, `http://`, `https://`); relative dynamic import is a build error |
| CSS `@import`                                           | left external                                                                                 |

Static assets come from `inferLoader` (`src/utils.ts`) and `BUNDLER_FILE_EXT_REGEX`: `.css`, `.html`
(text), `.json`, `.js/.jsx/.ts/.tsx`, and `.jpeg/.jpg/.png/.svg/.webp/.mp3/.mp4` (dataurl). Any other
extension throws. Two query suffixes bypass the loader table: `?raw` yields the file as text, and
`?legacy` emits nothing but collects the source into `BuildOutput.legacyScripts`, which `createBundle`
base64-encodes onto `content.__injectHead.scripts` (CSS lands on `.style` the same way) for
`packages/runtime-internal/src/interactive/bootstrap.js` to inject. Adding an extension or a suffix
means touching `utils.ts`, `types.ts`, `plugin.ts` and `runtime/v1/env.d.ts` together.

See `.agents/docs/architecture/runtime-and-vendor.md` for what `/runtime/v1/*` resolves to at runtime.

## Tests

`pnpm exec vitest --project instrument-bundler`.

`src/__tests__/repositories/` holds **real instruments written the way an author would write them** —
one directory per fixture (`form`, `interactive`), loaded from disk by `repositories/index.ts` into
`BundlerInput[]`. `src/__tests__/build.test.ts` exercises the `interactive` fixture (one of its tests
runs the real esbuild; the others spy on it). A new bundler capability gets a fixture that exercises
it end to end, not a synthetic source string; unit tests over hand-written strings are for the pure
helpers (`transform`, `resolve`, `utils`, `preprocess`, `parse`, `schemas`).

Fixtures are type-checked by `pnpm lint` — `tsconfig.json` includes `src/**/*` and maps
`/runtime/v1/*` to `../../runtime/v1/dist/*`, so `runtime/v1` must be built for `tsc` to pass.

`vitest.config.ts` declares an alias `'/runtime/v1' -> ./runtime/v1/dist` **relative to this package**,
a directory that does not exist. Nothing in the suite resolves that specifier through vite (fixtures
are read as text and handed to esbuild, which marks those imports external), and all tests pass. Treat
it as dead config; do not build anything on top of it.

There is no `build` script here — `package.json` exports `./src/index.ts` directly.
