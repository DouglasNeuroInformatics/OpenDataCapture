# packages/runtime-meta

Turns a built runtime directory (`runtime/v1/dist`) into something serveable: a manifest of relative
paths, a per-package view of it, and a URL-to-content resolver. Private, no build step — `exports`
points at `src/index.js` with a hand-written `src/index.d.ts` beside it, under `checkJs`. Consumed by
`vite-plugin-runtime`, `packages/serve-instrument/src/server.tsx`, and
`apps/outreach/src/pages/resources/runtime/[version].json.ts`.

The export-by-export table is in `.agents/docs/architecture/runtime-and-vendor.md#packagesruntime-meta`.

## Traps

**`parsePackages` drops any path whose first segment starts with `_`,** because npm forbids a leading
underscore in a package name and `runtime-bundler` emits shared chunks as `_chunks/[hash]`. That filter
and `chunkNames` in `packages/runtime-bundler/src/bundler.ts` are one decision expressed in two files.
Note the manifest still lists those files, so they are still served — they just belong to no package.

**`generateMetadata` resolves `@opendatacapture/runtime-v1/package.json` through
`module.createRequire(options.rootDir)`, and this package does not depend on it.** Resolution succeeds
or fails according to the _caller's_ `node_modules`, so `rootDir` must be a directory inside the
consuming workspace (callers pass `import.meta.dirname` or the Astro root).

**Nothing checks `src/index.d.ts` against `src/index.js`.** Every function export is annotated
`/** @type {import('.').fn} */` (`RUNTIME_VERSIONS` is the one unannotated export), so a signature
change means editing both. Rewriting the package in
TypeScript would change what `exports` resolves to.

## Tests

`pnpm exec vitest --project runtime-meta`. There is a `vitest.config.ts` here, and tests live in
`test/` (not `src/__tests__/`) — `test/parse-packages.test.ts` is the only one. `generateManifest` and
the plugin behavior around it are covered instead by
`packages/vite-plugin-runtime/src/__tests__/plugin.test.ts`, which mocks `fs`.
