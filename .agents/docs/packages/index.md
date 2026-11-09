# Internal DNP packages

The 11 `@douglasneuroinformatics/*` packages, maintained in separate repos. Use this file to find
which one already does what you need, then read that package's source for the API. This file does
not copy APIs, because copies drift.

| Package                 | Reach for it when you need                                                                                                                                                                                                                              | Used in                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `libjs`                 | array/object/string/date/number helpers, `Result` helpers over neverthrow, Zod coercers for env strings (`$BooleanLike`, `$NumberLike`, `$UrlLike`), `replacer`/`reviver` to round-trip `Date`/`Set`/`Map` through JSON, `formatError`/`serializeError` | api, web, schemas, react-core and most others                    |
| `libcrypto`             | `sha256`, or hybrid public-key encryption (`HybridCrypto`, HPKE), in Node or the browser, instead of calling `crypto.subtle`                                                                                                                            | api, gateway, playground, subject-utils                          |
| `libpasswd`             | password strength score plus EN/FR feedback (`estimatePasswordStrength`, wrapping zxcvbn-ts)                                                                                                                                                            | api, web                                                         |
| `libstats`              | `sum`, `mean`, `std`, `linearRegression`. It is a Rust native addon, so it runs in Node only and never in a browser bundle                                                                                                                              | api                                                              |
| `libui-form-types`      | the `FormTypes` declarative-form types. Instrument code uses runtime-core's `FormInstrument` types, which wrap these                                                                                                                                    | runtime-core, and libui's `Form`                                 |
| `libnest`               | the Nest layer of `apps/api`: bootstrap, config, Prisma models, validation pipes, logging, crypto, virtualization, test doubles (`./testing`). `apps/api/AGENTS.md` covers how the app uses it                                                          | api                                                              |
| `libui`                 | React/Tailwind components, hooks (`useTranslation`, `useNotificationsStore`, …), `cn`, i18n, `CoreProvider`. It has no root export: import `./components`, `./hooks`, `./utils`, `./i18n`, `./providers` or `./tailwind/globals.css`                    | web, gateway, playground, outreach, react-core, serve-instrument |
| `eslint-config`         | the `config()` factory behind the root `eslint.config.js`                                                                                                                                                                                               | root                                                             |
| `prettier-config`       | `createConfig()` behind the root `prettier.config.js`, and the `prettier-pre-commit` bin that `.husky/pre-commit` runs                                                                                                                                  | root                                                             |
| `tsconfig`              | the base that the root `tsconfig.json` extends. It sets `noEmit: true`, so the `tsc` in every `lint` script only typechecks                                                                                                                             | root                                                             |
| `esbuild-plugin-prisma` | `prismaPlugin({ outdir })`, which copies Prisma's query engine next to an esbuild bundle                                                                                                                                                                | gateway's `scripts/build.ts`                                     |

## Reading the source

Resolve a package through a workspace in its "Used in" column. Only `eslint-config`,
`prettier-config` and `tsconfig` are linked at the repo root. For example:
`apps/api/node_modules/@douglasneuroinformatics/libnest/src/index.ts`.

- `libnest`, `libui`, `libcrypto`, `libpasswd`: original TypeScript under `src/`.
- `prettier-config`, `esbuild-plugin-prisma`: JSDoc-typed `.js` under `src/`, plus a hand-written
  `.d.ts`.
- `libjs`, `eslint-config`: `dist/` only, but unbundled and unminified with JSDoc intact, one file
  per module.
- `libui-form-types`, `tsconfig`: the published file is the whole package (`lib/index.d.ts`,
  `tsconfig.json`).
- `libstats`: a native binary, so its `index.d.ts` is the complete API.
