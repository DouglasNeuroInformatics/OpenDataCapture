# libstats

Basic statistics for Node.js, written in Rust (NAPI-RS native addon).

**Status in Open Data Capture:** one call site — `apps/api/src/instrument-records/instrument-records.service.ts` uses `linearRegression` to compute per-measure trends for the instrument-record summary endpoint. Node-only: it is a native addon and cannot be bundled into the browser, so don't reach for it from `web`, `gateway`, or `playground`.

## When to reach for this

- Need sum, mean, standard deviation, or a simple linear regression over numeric data in `apps/api` — don't hand-roll the math or add another stats dependency.

## Key exports

- `sum(arr: Float64Array): number`
- `mean(arr: Float64Array): number`
- `std(arr: Float64Array, options?: StdOptions): number` — `options.isPopulation` toggles population vs. sample standard deviation.
- `linearRegression(x: Float64Array, y: Float64Array): LinearRegressionResult` — returns `{ intercept, slope, stdErr }`.

That is the entire API surface. Inputs are `Float64Array`, not plain `number[]` — convert at the call site, as `instrument-records.service.ts` does:

```ts
results[measure] = linearRegression(new Float64Array(xs), new Float64Array(ys));
```

## Minimal usage

```ts
import { mean, std } from '@douglasneuroinformatics/libstats';

const values = Float64Array.from([1, 2, 3, 4]);
const avg = mean(values);
const deviation = std(values, { isPopulation: true });
```

## Reading the source

The only DNP package whose implementation is **not** inspectable from `node_modules` — the published artifact is a compiled per-platform binary (`libstats.darwin-arm64.node` and siblings) plus a thin CJS loader. The NAPI-generated declaration file is the complete contract and is short enough to read in full:

```sh
cat apps/api/node_modules/@douglasneuroinformatics/libstats/index.d.ts
```

The Rust implementation lives only in the upstream repo. No hosted docs site.
