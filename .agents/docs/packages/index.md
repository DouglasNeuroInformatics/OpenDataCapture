# Internal DNP packages

Open Data Capture depends on 11 `@douglasneuroinformatics/*` packages, maintained in separate repos and consumed from npm. Consult this before adding a third-party dependency or writing utility/crypto/stats/form-typing/UI code from scratch — one of these may already solve it.

Versions are pinned in the `catalog:` block of `pnpm-workspace.yaml`, except the three root-level dev tools, which are versioned directly in the root `package.json`.

### Config & build tooling

| Package               | Purpose                                               | Consumed by                     | Docs                                                 |
| --------------------- | ----------------------------------------------------- | ------------------------------- | ---------------------------------------------------- |
| eslint-config         | ESLint flat-config factory for DNP TS/JS projects     | `eslint.config.js` (root)       | [eslint-config.md](eslint-config.md)                 |
| prettier-config       | Prettier config factory + pre-commit binary           | `prettier.config.js` (root)     | [prettier-config.md](prettier-config.md)             |
| tsconfig              | Shared `tsconfig.json` base                           | `tsconfig.base.json` (root)     | [tsconfig.md](tsconfig.md)                           |
| esbuild-plugin-prisma | Copies the Prisma query engine into an esbuild outdir | `apps/gateway/scripts/build.ts` | [esbuild-plugin-prisma.md](esbuild-plugin-prisma.md) |

### Utilities & single-purpose libraries

| Package          | Purpose                                                      | Used here?                                            | Docs                                       |
| ---------------- | ------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------ |
| libjs            | Utility functions/types (arrays, dates, zod schemas, etc.)   | yes — the most broadly depended-on DNP package here   | [libjs.md](libjs.md)                       |
| libcrypto        | Web Crypto API wrappers (hashing, hybrid encryption)         | yes — `api`, `gateway`, `playground`, `subject-utils` | [libcrypto.md](libcrypto.md)               |
| libpasswd        | Password strength estimation (zxcvbn wrapper)                | yes — `api` and `web`, password forms only            | [libpasswd.md](libpasswd.md)               |
| libstats         | Basic stats in Rust/NAPI (sum, mean, std, linear regression) | yes — one call site in `api`                          | [libstats.md](libstats.md)                 |
| libui-form-types | Type-only declarative form schema (`FormTypes`)              | yes — direct dependency of `packages/runtime-core`    | [libui-form-types.md](libui-form-types.md) |

### Framework/UI (heavily used)

| Package | Purpose                                                                                 | Used here?                                            | Docs                     |
| ------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------ |
| libnest | NestJS decorators/pipes/modules (config, prisma, mail, logging, crypto, virtualization) | yes — heavy, `api` only                               | [libnest.md](libnest.md) |
| libui   | React/Tailwind UI components, hooks, providers                                          | yes — heavy, every frontend surface plus `react-core` | [libui.md](libui.md)     |

## Reading the source

These docs are hand-written snapshots and are **not** auto-synced with upstream. Treat them as a map, not an API reference: when you need an exact signature or a complete export list, read the installed package.

Every one of these packages is inspectable from `node_modules` — there is no need to clone a sibling repo. Fidelity varies:

| Fidelity                                   | Packages                                     | What you get                                                                  |
| ------------------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------------- |
| Original TypeScript source (`src/`)        | `libnest`, `libui`, `libcrypto`, `libpasswd` | Full `.ts`/`.tsx` sources — these publish `src` alongside `dist`              |
| Original JavaScript source (`src/`, JSDoc) | `prettier-config`, `esbuild-plugin-prisma`   | Authored JSDoc-typed `.js` plus hand-written `.d.ts`                          |
| Compiled but unbundled and unminified      | `libjs`, `eslint-config`                     | Readable per-module `.js` with JSDoc intact, plus `.d.ts` and `.d.ts.map`     |
| The published file _is_ the source         | `libui-form-types`, `tsconfig`               | `lib/index.d.ts` / `tsconfig.json` — type-only and config-only packages       |
| Opaque                                     | `libstats`                                   | Native `.node` binary; only the NAPI-generated `index.d.ts` describes the API |

Because this is a pnpm workspace, resolve a package through a workspace that depends on it, not through the repo root. Only `eslint-config`, `prettier-config`, and `tsconfig` are linked at the root:

```sh
# root-level dev tooling
ls node_modules/@douglasneuroinformatics/eslint-config/dist

# workspace-scoped dependencies
ls apps/api/node_modules/@douglasneuroinformatics/libnest/src
ls apps/web/node_modules/@douglasneuroinformatics/libui/src/components
ls packages/runtime-core/node_modules/@douglasneuroinformatics/libui-form-types/lib
```

Each package's doc gives its own read-the-source path. Export lists for the larger packages (`libnest`, `libui`) are illustrative, not exhaustive — check the source or the hosted docs before concluding something doesn't exist.
