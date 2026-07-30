# vendor

38 workspace packages (matched by `vendor/**/*` in `pnpm-workspace.yaml`), each a thin wrapper around
one npm library. The wrapper exists so `runtime/v1` can serve pinned, side-by-side major versions
from stable `/runtime/v1/<name>@<range>` URLs — the only import form instrument source is allowed to
use. **This one file covers all 38.**

Read the root `AGENTS.md` first. `.agents/docs/architecture/runtime-and-vendor.md` explains how these
fit into the runtime; `.agents/docs/playbooks/add-vendor-package.md` is the full add procedure. This
file is the rules for editing what is already here.

## Nothing in this directory is checked by anything

`vendor/**/*` is in the `ignores` block of the root `eslint.config.js`. No package here has a
`tsconfig.json`, a `vitest.config.ts` or any `scripts`, so `pnpm lint` never visits them and `tsc`
never reads a wrapper's declarations except through a consumer that imports them. The only automated
guards are `runtime/v1/test/vendor-pairing.test.ts` and `react-host-delegation.test.ts` beside it.
Every other rule below is one you have to hold yourself to, and getting it wrong produces a broken
runtime bundle rather than an error.

## Peer pairing

A wrapper declares its intended pairing with a workspace dependency on a sibling wrapper, but pnpm
resolves the _wrapped_ package's peers knowing nothing of the `__` convention — it linked
`react-dom@18.3.1` against react 19 and every jspsych 1.x plugin against jspsych 8 (commit
`e31185464`). So a wrapper needs **three** dependency entries, not two:

```jsonc
"dependencies": {
  "@jspsych/plugin-preload": "2.0.0", // the wrapped package
  "jspsych": "8.0.1",                 // the real peer, pinned to the paired version
  "jspsych__8.x": "workspace:*"       // the sibling wrapper
}
```

Drop the middle line and the runtime ships two copies of a library that must exist once. Verify with
`pnpm exec vitest --project runtime-v1` after any `pnpm install` that touches this directory.

## `src/index.d.ts` may only import other wrappers

`dtsPlugin` in `packages/runtime-bundler/src/plugin.ts` rewrites every non-relative import in an
emitted `.d.ts` to a relative path inside the built tree, and **throws if the specifier resolves to a
package that is not in `runtime.config.js`'s `include` list**. Bare npm names are never in that list,
so `import type * as CSS from 'csstype'` fails the build; `'csstype__3.x'` is correct, and it obliges
the wrapper to depend on `csstype__3.x` too. `vendor/react@19.x/src/index.d.ts` and
`vendor/jspsych@8.x/src/index.d.ts` are the examples to copy.

Two things the plugin does _not_ do:

- **It only visits `import` declarations.** `export … from 'some-pkg'` in a `.d.ts` passes through
  untouched and lands in the output as an unresolvable bare specifier. No wrapper currently does
  this; keep it that way.
- **It leaves relative specifiers alone**, so they must resolve against the _emitted_ filenames, not
  the source ones. Existing files write them either way (`'./index.d.ts'`, `'./client'`).

## `src/index.js` is a hand-written re-export surface

`export * from '<pkg>'` is used only where the source is statically enumerable ESM — the wrappers
around `lodash-es`, `ts-pattern`, `jspsych` and `simple-statistics`, plus the two `zod@3` wrappers,
which re-export another wrapper (`zod__3.x`) and a relative file respectively. Wrappers around a CommonJS package — `react`,
`react-dom`, `papaparse`, `prop-types` — list every export by name, because `export *` cannot
enumerate a CJS module's exports statically and the named imports silently come out `undefined`.
When you bump a wrapped version, diff its exports against that list; nothing else will tell you an
export was added or removed.

## Two wrappers are more than a re-export, and both hinge on one define

A page rendering a form instrument runs **two instances of the react wrapper**: the one the host
application bundles (apps alias `react` to it) and the one served from `/runtime/v1` that the
instrument imports. Elements pass between them, because React tags them with a registered symbol,
but a hook only works through the instance whose dispatcher owns the render.

So `vendor/react@19.x/src/index.js` does not re-export `react` directly. The bundled copy publishes
the wrapped package on `globalThis.__ODC_HOST_REACT`; the served copy re-exports whatever it finds
there, falling back to its own when nothing is registered — the interactive case, where the
instrument owns an iframe of its own. A host React of a different major throws instead of silently
mixing the two. `vendor/react-dom@19.x/src/client.js` refuses the opposite direction: the served copy
throws from `createRoot`/`hydrateRoot` when a host React is present, since mounting a root inside
someone else's tree is never what an author meant.

The two copies tell themselves apart by `__ODC_RUNTIME_BUILD__`, which `packages/runtime-bundler`
defines and no app build does — hence `typeof __ODC_RUNTIME_BUILD__`, never a bare reference. **The
guard is on the call, not the import**, because every instrument bundle is evaluated once in the host
page to read its definition, interactive ones included; only the mount is exclusive to the iframe.
`runtime/v1/test/react-host-delegation.test.ts` covers all of it, against the built output.

Editing any wrapper an app also bundles needs **two** caches cleared before the change is visible:
`pnpm --filter @opendatacapture/runtime-v1 build` for the served copy, and `node_modules/.vite` in
the app for the bundled one. Vite keys its prebundle on the lockfile, not on a linked package's
contents, so a running dev server serves the old wrapper indefinitely — which looks exactly like the
change not working.

## `vendor/react@19.x` _is_ this repo's React type definition

Root `package.json` `pnpm.overrides` sets `"@types/react": "-"` and `"@types/react-dom": "-"`, which
deletes them from every install. Apps alias `react` to the wrapper
(`"react": "workspace:react__19.x@*"`), so these hand-maintained declarations are what every
component in `apps/web`, `apps/gateway` and `packages/react-core` type-checks against (storybook
depends on the real `react` from the catalog and type-checks only its own config).
Editing them changes types repo-wide, and no upstream package will correct a mistake.

## Naming, exports, and the three registration points

Directory `vendor/<name>@<range>`; `package.json` `"name": "<name>__<range>"`, because npm forbids a
second `@`. `runtime-bundler` maps `__` back to `@` for the output directory, which is where the URL
comes from — the `version` field plays no part in it and only records the wrapped release.

`Resolver` (`packages/runtime-bundler/src/resolver.ts`) reads **only** the `default`, `import` and
`types` export conditions; a `require` or `browser` condition is silently ignored. `exports` is
required and may not be empty. See `packages/runtime-bundler/AGENTS.md` for what a bare-string export
value means versus an object one.

Adding a package means three edits plus `pnpm install`:

| File                                        | Entry                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| `vendor/<name>@<range>/`                    | `package.json`, `src/`, and the upstream `LICENSE` copied in (all 38 have one) |
| `runtime/v1/package.json` `devDependencies` | `"<name>__<range>": "workspace:*"`                                             |
| `runtime/v1/runtime.config.js` `include`    | `'<name>__<range>'`                                                            |

An `include` entry without the matching `devDependency` is a `ResolverError` at build time. The
reverse is silent — the package is installed and never served. Consumers outside `runtime/v1` alias
the wrapper under the real name (`"zod": "workspace:zod__3.x@*"`); no `tsconfig.json` edit is needed
because they map `/runtime/v1/*` with a wildcard.

## Tests

There is no `vitest.config.ts` here, and the root `vitest.config.ts` `projects` globs cover only
`apps/*`, `packages/*` and `runtime/*` — a test file placed in this directory would never run. The
coverage that applies is the two files in `runtime/v1/test/`, run with
`pnpm exec vitest --project runtime-v1`. `vendor-pairing.test.ts`
walks every wrapper, and for each `__`-named dependency checks that the physical directory the
wrapped package's peer resolves to is the same one the paired wrapper serves.
`react-host-delegation.test.ts` covers the react and react-dom wrappers described above. Both read
what is on disk — the first real `node_modules`, the second `runtime/v1/dist` — so build before
trusting a pass.
