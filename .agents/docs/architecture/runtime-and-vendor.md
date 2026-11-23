# The runtime, and `vendor/`

Six workspaces have `runtime` in the name and they do different jobs. This file tells them apart and
explains the three unrelated ways `runtime/v1` is spelled in an import; each workspace's `AGENTS.md`
has the detail.

**`runtime/v1/dist` is gitignored, and nothing that imports `/runtime/v1/...` type-checks or runs
until it is built** — `pnpm build`, or `pnpm --filter @opendatacapture/runtime-v1 build`.
`runtime/v1/AGENTS.md` lists how each consumer fails without it.

## The six things

| Workspace                      | Kind        | Job                                                                                                           |
| ------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------- |
| `packages/runtime-core`        | library     | The public API instrument authors import — `defineInstrument`, the `Translator` family, every instrument type |
| `packages/runtime-internal`    | library     | `evaluateInstrument` and the interactive iframe; instruments have no reason to touch it                       |
| `packages/runtime-bundler`     | build tool  | Builds `runtime/v1/dist` from the packages listed in `runtime/v1/runtime.config.js`                           |
| `packages/runtime-meta`        | library     | Maps a built runtime directory onto HTTP URLs                                                                 |
| `runtime/v1`                   | artifact    | The published bundle, `@opendatacapture/runtime-v1`                                                           |
| `packages/vite-plugin-runtime` | Vite plugin | Serves that artifact to `web`, `gateway`, `playground` and `storybook`                                        |

`packages/instrument-bundler` is **not** in this family. It compiles one instrument's source;
`runtime-bundler` compiles the libraries that instrument imports.

The `v1` is the runtime _generation_, fixed in every import path. `runtime/v1`'s `version` field is
the monorepo release version and moves independently — do not read one as the other.

## Three names, three resolvers

The same artifact is addressed three ways. They are not interchangeable.

| Spelling                      | Resolved by                 | Declared in                                                                                                                                                                                                   |
| ----------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/runtime/v1/<pkg>`           | the browser, over HTTP      | served by `vite-plugin-runtime` (dev middleware, or the `dist/runtime/v1` copy it makes at build); type-checked via `paths` in each instrument-importing workspace's `tsconfig.json` (`runtime/v1/AGENTS.md`) |
| `#runtime/v1/*`               | Node subpath imports        | `apps/api/package.json` `imports` **and** `apps/api/tsconfig.json` `paths`; `apps/api/libnest.config.ts` copies `dist` into `dist/runtime/v1` at build                                                        |
| `@opendatacapture/runtime-v1` | ordinary package resolution | a `dependencies` entry, used to locate `dist` on disk                                                                                                                                                         |

Instrument source always uses the first form. `packages/instrument-bundler` marks every
`/runtime/v1/...` specifier external **without checking that it resolves** (rewriting rules: its
`AGENTS.md` §Module resolution), so a package that was never emitted, or a subpath the wrapper's
`exports` does not define, bundles clean and 404s at render. `tsc`'s `paths` catch that for in-repo
instruments; playground and external-repo instruments get no such check.

On the server, `__resolveImport` in `apps/api/src/instruments/instruments.module.ts` rejects any
specifier not starting with `/runtime/`, rewrites the prefix to `#runtime/`, and resolves it through
Node.

## `vendor/`

Wrapper workspaces, each re-exporting one real library at a pinned range so `runtime/v1` can serve
majors side by side (react 18 and 19, jspsych 7 and 8). Directory `vendor/<name>@<range>`, package
name `<name>__<range>`; `runtime-bundler` maps `__` back to `@` for the output directory, which is what
makes the URL `/runtime/v1/react@19.x`. Rules: `vendor/AGENTS.md`. Adding one:
`.agents/docs/playbooks/add-vendor-package.md`.
