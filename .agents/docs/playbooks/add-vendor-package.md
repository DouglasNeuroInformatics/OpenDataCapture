# Add a vendored library for instruments

Makes a library importable from instrument source as `/runtime/v1/<name>@<range>`. The
highest-ceremony task in this repo: **three registration points must all be edited**, and missing the
third produces no error at all.

Read `vendor/AGENTS.md` and `packages/runtime-bundler/AGENTS.md` first; this file is only the order of
operations. Copy an existing wrapper rather than starting empty: `vendor/react@19.x` (CommonJS,
several export keys) or `vendor/@jspsych/plugin-preload@2.x` (scoped name, single export).

## Steps

1. **Create `vendor/<name>@<range>/`.** The `@` appears only in the directory name. Scoped packages
   nest one level: `vendor/@jspsych/plugin-preload@2.x/`. No edit to `pnpm-workspace.yaml` is needed;
   its `packages` list already globs `vendor/**/*`.

2. **Write `vendor/<name>@<range>/package.json`.** `"name"` must be `<name>__<range>` — npm rejects a
   second `@`, and `runtime-bundler` maps `__` back to `@` to form the served path. `"version"` only
   records the wrapped release; it does not appear in any URL. `"exports"` is required and may not be
   empty. The shape of each value decides how it is emitted:

   | Export value                                     | Result                                    |
   | ------------------------------------------------ | ----------------------------------------- |
   | `"./css/x.css": "./src/index.css"` (bare string) | copied byte-for-byte, never bundled       |
   | `"./x": { "types": …, "import": … }` (object)    | joins the shared, code-split module graph |

   `packages/runtime-bundler/src/resolver.ts` reads only the `default`, `import` and `types`
   conditions; `require` and `browser` are silently ignored. Source exports must end in `.css`,
   `.json`, `.js`, `.mjs` or `.html`; `types` must end in `.d.ts` or `.d.mts`. **There is no `.ts`
   loader.** The _export key_, not the source filename, sets the output path, and `"."` becomes
   `index`.

3. **Declare three dependencies, not two** — the wrapped package, the sibling wrapper for each peer,
   **and the real peer pinned to the paired version**. pnpm knows nothing of the `__` convention, so
   without the third entry it resolved `react-dom@18.3.1` against react 19 and every jspsych 1.x
   plugin against jspsych 8 (commit `e31185464`); with splitting that means two `ReactSharedInternals`
   and every hook throwing `Cannot read properties of null`. `vendor/react-dom@18.x/package.json` is
   the model. Wrappers pin a literal version rather than `catalog:`, except `react`/`react-dom` 19,
   which use `catalog:react19` because apps share that exact release.

4. **Copy the upstream `LICENSE`** to `vendor/<name>@<range>/LICENSE`; all 38 wrappers have one.

5. **Write `vendor/<name>@<range>/src/index.js` by hand.** Use `export * from '<pkg>'` only if the
   wrapped package is ESM-native (as in `vendor/jspsych@8.x/src/index.js`). For a CommonJS package,
   list every export by name (`vendor/papaparse@5.x/src/index.js`) — `export *` cannot enumerate CJS
   exports statically and the missing names come out `undefined` with no error.

6. **Write `vendor/<name>@<range>/src/index.d.ts`.** Every non-relative `import` in it must name
   **another wrapper**, never an npm package: `import type * as CSS from 'csstype__3.x'`, not
   `'csstype'`. `dtsPlugin` in `packages/runtime-bundler/src/plugin.ts` rewrites these to relative
   paths in the emitted tree and throws for any specifier it cannot match against the `include` list.
   Each wrapper you import this way must also be in step 3's `dependencies` and in step 8's
   `include`.

7. **Add to `devDependencies` in `runtime/v1/package.json`:** `"<name>__<range>": "workspace:*"`.
   Omitting this is a `ResolverError` at build time.

8. **Add to the `include` array in `runtime/v1/runtime.config.js`:** `'<name>__<range>'`. **Omitting
   this is silent** — the package installs fine and is simply never emitted into `dist/`.

9. **Run `pnpm install` from the repo root and commit `pnpm-lock.yaml`.** CI installs with
   `--frozen-lockfile`.

10. **Only if an app or package imports the library under its real name**, alias it in that
    workspace's `package.json` — `"zod": "workspace:zod__3.x@*"`, see `packages/react-core/package.json`.
    Instruments never need this.

## Verify

```sh
pnpm install
pnpm --filter @opendatacapture/runtime-v1 build   # READ THE OUTPUT — it logs failures and still exits 0
ls runtime/v1/dist/<name>@<range>                 # step 8 was silent if this is missing
pnpm exec vitest --project runtime-v1             # peer pairing
pnpm exec vitest --project runtime-bundler
pnpm lint && pnpm test
```
