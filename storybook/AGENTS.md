# storybook

A standalone pnpm workspace (`@opendatacapture/storybook`), not a `.storybook` folder inside an app.
It hosts the single Storybook instance for three _other_ packages — the `*.stories.tsx` files stay
colocated with their components in `packages/react-core`, `apps/playground` and `apps/web`.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## Stories are discovered from a fixed list, not by colocation

`config/main.ts` enumerates exactly three directories. A story written anywhere else is silently not
picked up — no warning, it simply never appears in the sidebar.

| Scanned directory                    | `titlePrefix`           |
| ------------------------------------ | ----------------------- |
| `packages/react-core/src/components` | `React Core`            |
| `apps/playground/src/components`     | `Playground Components` |
| `apps/web/src`                       | `Web`                   |

Note the asymmetry: `apps/web` is scanned from `src`, the other two only from `src/components`.
`apps/gateway` and every other package are not scanned at all. Covering a new location means adding
an entry to the `stories` array.

## The `@` alias resolves by importer, and only for two apps

`vite.config.js` replaces the usual static alias with a `customResolver` that maps `@` to
`apps/playground/src` or `apps/web/src` depending on which file did the importing, and returns
`null` for everything else. **A `packages/react-core` story that imports `@/…` will fail to
resolve** — react-core has no `@` alias of its own, so import relatively or by package name there.

## Writing a story

`packages/react-core/src/components/CopyButton/CopyButton.stories.tsx` is the minimal shape; read it
before writing one. Two things are easy to get wrong:

- Types come from **`@storybook/react-vite`**, not `@storybook/react`.
- The default export is the `Meta`. `import/no-default-export` is enforced across
  `*/components/**`, but `eslint.config.js` exempts `**/*.stories.tsx` — this is the one place in
  those directories where a default export is correct.

Theme switching is `withThemeByDataAttribute` on `data-mode`, matching `apps/web`.

## Running it

`pnpm --filter @opendatacapture/storybook storybook` (port 6006). It is not part of `pnpm dev`. Two
prerequisites a fresh clone does not have:

- **A repo-root `.env`** — the script is wrapped in `env-cmd -f ../.env`. Run `pnpm generate:env`.
- **`runtime/v1/dist` built.** `vite.config.js` installs `@opendatacapture/vite-plugin-runtime`,
  which reads `@opendatacapture/runtime-v1/dist` while resolving the Vite config and then serves it
  under `/runtime`. If that directory does not exist the dev server throws before it starts. `pnpm
build` produces it. Background: `.agents/docs/architecture/runtime-and-vendor.md`.

`config/preview.ts` runs `await esbuild.initialize(...)` at module scope and imports
`apps/web/src/services/i18n` for its side effect, so **every** story — including react-core ones —
boots with web's i18n resources and a live `esbuild-wasm`. That is what lets the
`InstrumentRenderer` stories bundle and execute real instruments from
`@opendatacapture/instrument-stubs`.

## No tests, no build

There is no `vitest.config.ts` and no `build` script here, so `pnpm test` and `pnpm build` do not
cover this workspace and neither does CI. `lint` is `tsc && eslint --fix config vite.config.js`, and
`tsconfig.json` includes only `config/*` and `vite.config.js` — **stories are type-checked by their
owning package, never by this one.**
