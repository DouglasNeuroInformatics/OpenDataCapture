# runtime/v1

`@opendatacapture/runtime-v1` — the catalog of libraries an instrument is allowed to import. Eleven
workspaces depend on it (`api`, `web`, `gateway`, `playground`, `outreach`, `storybook`,
`instrument-bundler`, `instrument-library`, `react-core`, `serve-instrument`,
`vite-plugin-runtime`), and it is one of the five packages published to npm.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## `dist/` is generated and gitignored

**There is no `src/` here.** Everything the package contains is produced by
`pnpm --filter @opendatacapture/runtime-v1 build`, which is `pnpm exec runtime-bundler` reading
`runtime.config.js`. Until that has run, a fresh checkout is broken in ways whose error messages do
not mention this directory:

| Consumer                                                                                                                      | Failure when `dist/` is missing                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/vite-plugin-runtime`                                                                                                | `generateMetadata` in `packages/runtime-meta/src/index.js` calls `generateManifest`, whose `resolveDir` runs `readdir` on it → ENOENT while the Vite config is being resolved (the plugin factory awaits it) |
| `apps/api`                                                                                                                    | the `#runtime/v1/*` subpath import declared in `apps/api/package.json` resolves to nothing                                                                                                                   |
| `instrument-bundler`, `instrument-library`, `playground`, `schemas`, `react-core`, `serve-instrument`, `gateway`, `storybook` | their tsconfig `paths` map `/runtime/v1/*` → `../../runtime/v1/dist/*`, so every instrument import is an unresolved module                                                                                   |

Turbo covers this for `build` and `lint` (both depend on `^build`) but not for a bare `tsc` or
`vitest` run. The build `rm -rf`s `outdir` before writing, so nothing hand-placed in `dist/` survives.

## Adding a library to the runtime

**Two files must agree, and each one alone fails differently.**

- `package.json` `devDependencies` — the bundler resolves included ids with `createRequire` rooted at
  this directory, so a package missing here is a resolver error. `runtime-bundler` logs that and
  still exits 0, so read the build output rather than trusting the exit code.
- `runtime.config.js` `include` — a package in `devDependencies` but missing here is silently absent
  from `dist/`.

The dependency itself is a wrapper directory `vendor/<name>@<range>` whose `package.json` `name` is
`<name>__<range>` (npm rejects a second `@`), and whose `exports` map decides the emitted layout.
Export-shape rules and the `.d.ts` import constraint are in `packages/runtime-bundler/AGENTS.md`;
`.agents/docs/architecture/runtime-and-vendor.md` has the full picture.

## The type surface

`env.d.ts` and `global.d.ts` are the only hand-written TypeScript here, and both are shipped via
`files`. The rest of the exports map is `"./*": "./dist/*"`, so a consumer imports
`@opendatacapture/runtime-v1/<path inside dist>`, never `.../dist/<path>`.

- `env.d.ts` is exported as `@opendatacapture/runtime-v1/env` and reached through the tsconfig
  `types` array of `packages/instrument-bundler`, `packages/instrument-library` and
  `apps/playground`. It declares the ambient modules (`*.css`, `*.png`, `*?raw`, `*?legacy`, …) that
  instrument source depends on.
- `global.d.ts` declares `OpenDataCaptureContext.isRepo` as
  `typeof import('../../package.json') extends { __isODCRepo: NonNullable<unknown> } ? true : false`.
  `packages/runtime-core/src/define.ts` merges that interface into `declare global` and uses it to
  require `details.license` **only for instruments authored inside this repo**. It reaches the
  interface two ways — the `/// <reference>` at the top of `env.d.ts`, and its own
  `/// <reference types="../../../runtime/v1/global.d.ts" />`. Moving or renaming either file drops
  the license requirement silently instead of erroring.

## Housekeeping

`version` is bumped repo-wide by `scripts/increment-version.sh`; the release workflow publishes any
package with a `publishConfig` whose version is not yet on npm. Do not hand-edit it.

There is **no `lint` or `format` script here**, so `pnpm lint` never type-checks this directory.
`tsconfig.json` still lists `build.ts` and `src/**/*`, neither of which exists, and
`eslint.config.js` ignores both `runtime/v1/src/**/*.d.ts` and all of `vendor/`.

## Tests

`pnpm exec vitest --project runtime-v1`. One file, `test/vendor-pairing.test.ts`, and it is the only
automated coverage `vendor/` has.

It walks every wrapper under `vendor/` and asserts that a wrapped package's peer (say `react-dom`'s
`react`) resolves to the same physical directory the paired wrapper (`react__19.x`) serves. A
failure means pnpm produced two copies of something that must be a singleton; the fix belongs in the
wrapper's `dependencies`, not here. It reads real `node_modules`, so it is only meaningful after
`pnpm install`.
