# libjs

A collection of utility functions and types for Node.js and the browser.

**Status in Open Data Capture:** the most widely spread DNP package here — imported in ~40 files across `apps/api`, `apps/web`, `apps/playground`, `packages/demo`, `packages/instrument-utils`, `packages/react-core`, `packages/runtime-bundler`, `packages/schemas`, `packages/serve-instrument`, and `testing`. (`packages/instrument-stubs` and `packages/vite-plugin-runtime` also declare it, with no current imports.)

Single root export; there are no subpaths.

## When to reach for this

- Need a generic array/object/string/date helper (uniqueness checks, deep freeze, byte/duration formatting, range utilities) — check here before writing one or adding a micro-dependency for it.
- Need a Zod schema for coercing env-style string values (`$BooleanLike`, `$NumberLike`, `$UrlLike`) instead of writing custom coercion.
- Need to serialize an `Error` for logging or transport (`formatError`, `serializeError`) instead of a one-off `JSON.stringify` workaround.
- Need to round-trip non-JSON-native values (`Date`, `Set`, `Map`) through JSON — use the `replacer`/`reviver` pair rather than ad hoc encoding.

## Modules

Everything is re-exported from the root, but the source is organized per domain: `array`, `datetime`, `exception`, `http`, `json`, `number`, `object`, `random`, `range`, `result`, `string`, `types`, `zod`.

## Exports used in this repo

Illustrative of the surface, not exhaustive:

| Export                                                             | Used at                                                                 |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `$BooleanLike`, `$NumberLike`, `$UrlLike`, `$Uint8ArrayLike`       | `apps/api/src/core/schemas/env.schema.ts`, `apps/web/src/config.ts`     |
| `replacer`, `reviver`                                              | `apps/api/src/instrument-records/instrument-records.service.ts`         |
| `deepFreeze`                                                       | `packages/demo/src/index.ts`, `apps/web/src/config.ts`                  |
| `isUnique`, `isZodType`                                            | `packages/schemas/src/instrument/instrument.base.ts`                    |
| `isNumberLike`, `isObjectLike`, `isPlainObject`, `parseNumber`     | `apps/web/src/utils/upload.ts`                                          |
| `formatError`                                                      | `packages/serve-instrument/src/server.tsx`                              |
| `formatByteSize`                                                   | `apps/playground/src/components/Header/*`                               |
| `asyncResultify`                                                   | `apps/playground/src/components/Header/ActionsDropdown/LoginDialog.tsx` |
| `toBasicISOString`, `toLowerCase`, `toUpperCase`                   | `apps/web/src/components/Sidebar/Sidebar.tsx`, `LineGraph.tsx`          |
| `camelToSnakeCase`, `snakeToCamelCase`                             | various                                                                 |
| `parseDuration`, `randomValue`, `isAllUndefined`, `serializeError` | various                                                                 |

## Minimal usage

```ts
import { deepFreeze } from '@douglasneuroinformatics/libjs';

const config = deepFreeze({ retries: 3 });
```

## Reading the source

Published as `dist` only — no `src` — but the output is unbundled, unminified, one file per module, with JSDoc comments preserved. Reading it is the fastest way to get the full export list:

```sh
ls  apps/api/node_modules/@douglasneuroinformatics/libjs/dist        # array, datetime, zod, ...
cat apps/api/node_modules/@douglasneuroinformatics/libjs/dist/index.d.ts
cat apps/api/node_modules/@douglasneuroinformatics/libjs/dist/zod.d.ts
```

Any workspace that depends on `libjs` works as an entry point; `apps/api` is used above only as an example.

## Docs

https://douglasneuroinformatics.github.io/libjs
