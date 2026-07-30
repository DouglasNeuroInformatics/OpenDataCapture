# packages/vite-plugin-runtime

Makes `runtime/v1/dist` reachable at `/runtime/v1/...` from a Vite app: a dev middleware backed by
`resolveRuntimeAsset`, a `buildStart` copy for production, and an `optimizeDeps.exclude` entry for
every runtime JS URL. Unpublished (no `publishConfig`), source-only `.js` (`exports` is
`"./src/index.js"`). Used by
`apps/web`, `apps/gateway`, `apps/playground` and `storybook`. `apps/api` does **not** use it — see
`.agents/docs/architecture/runtime-and-vendor.md`.

## Traps

**The factory is async and can return `false`.** `plugins: [runtime({ rootDir: import.meta.dirname })]`
works because Vite awaits promises in `plugins`; `disabled: true` resolves to `false` instead of a
plugin. `gateway` and `playground` pass `disabled: mode === 'test'`, which is why nothing
runtime-dependent works in their test builds.

**`buildStart` copies to `path.resolve('dist/runtime/<version>')` — relative to `process.cwd()`, not to
Vite's `build.outDir`.** It only lands correctly when Vite is invoked from the app directory and that
app builds into `dist`.

**There is no `.d.ts` here.** Unlike `runtime-internal` and `runtime-meta`, the types are the JSDoc
annotations on `plugin` in `src/plugin.js`, checked by `checkJs`. The options type is imported from
`@opendatacapture/runtime-meta` (`RuntimeOptions`), not declared locally.

`src/index.js` is one line re-exporting `plugin` as the default. Consumers import the default; the test
imports the named `plugin` from `../plugin`.

## Tests

`pnpm exec vitest --project vite-plugin-runtime`. There is a `vitest.config.ts` here, and
`src/__tests__/plugin.test.ts` is the only test. It mocks `fs` and `module` with `vi.hoisted`, then
drives the returned plugin's `buildStart`, `config` and `configureServer` hooks against a fake runtime
tree — so it also covers `generateManifest` in `packages/runtime-meta`.
