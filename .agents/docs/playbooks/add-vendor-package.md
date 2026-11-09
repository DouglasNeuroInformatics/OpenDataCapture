# Add a vendored library for instruments

Makes a library importable from instrument source as `/runtime/v1/<name>@<range>`. Three
registration points must all be edited, and missing the third (step 8) produces no error at all.

The rules for each file are in `vendor/AGENTS.md` and `packages/runtime-bundler/AGENTS.md`; this
file is only the order of operations. Copy an existing wrapper rather than starting empty:
`vendor/react@19.x` (CommonJS, several export keys) or `vendor/@jspsych/plugin-preload@2.x` (scoped,
single export).

## Steps

1. **Create `vendor/<name>@<range>/`** — scoped packages nest one level,
   `vendor/@scope/<name>@<range>/`. `pnpm-workspace.yaml` already globs it.

2. **Write `package.json`** with `"name": "<name>__<range>"` and a non-empty `exports`. Each export
   key sets a served path (`"."` becomes `index`); a bare-string value is copied verbatim, an object
   value is bundled; only `default`, `import` and `types` conditions are read; there is no `.ts`
   loader.

3. **Declare three dependencies**: the wrapped package, the sibling wrapper for each peer, and the
   real peer pinned to the paired version (`vendor/AGENTS.md` §Peer pairing;
   `vendor/react-dom@18.x/package.json` is the model). Missing the real peer ships two copies of a
   singleton.

4. **Copy the upstream `LICENSE`** into the wrapper.

5. **Write `src/index.js`.** `export * from '<pkg>'` only for ESM; for CommonJS name every export,
   or the missing names are silently `undefined`.

6. **Write `src/index.d.ts`.** A non-relative import must name another wrapper (`'csstype__3.x'`,
   not `'csstype'`), which then also goes in step 3's `dependencies` and step 8's `include`, or the
   runtime build throws.

7. **Add `"<name>__<range>": "workspace:*"` to `runtime/v1/package.json` `devDependencies`.**
   Omitting it is a `ResolverError` at build time.

8. **Add `'<name>__<range>'` to the `include` array in `runtime/v1/runtime.config.js`.** Omitting
   it is **silent**: the package installs and is never emitted into `dist/`.

9. **Run `pnpm install` and commit `pnpm-lock.yaml`**; CI installs with `--frozen-lockfile`.

10. **Only if an app or package imports the library by its real name**, alias it there:
    `"zod": "workspace:zod__3.x@*"` (`packages/react-core/package.json`). Instruments never need this.

## Verify

```sh
pnpm install
pnpm --filter @opendatacapture/runtime-v1 build   # exits 0 on failure; it failed unless it printed `Success!`
ls runtime/v1/dist/<name>@<range>                 # step 8 was skipped if this is missing
pnpm exec vitest --project runtime-v1             # peer pairing
pnpm exec vitest --project runtime-bundler
pnpm lint && pnpm test:coverage
```
