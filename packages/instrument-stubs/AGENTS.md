# packages/instrument-stubs

Fixture instruments for tests and Storybook, one export per kind (`./file`, `./forms`,
`./interactive`, `./series`). Consumed by `packages/schemas` tests, `packages/react-core` and
`apps/web` stories, and `storybook`. (`packages/instrument-bundler` declares it as a devDependency
but never imports it — its tests use their own fixtures.)

Written in vanilla JavaScript deliberately: the same stubs are bundled by esbuild in the browser and
in Node, and transpilation differences between the two would break that. Do not add a `.ts` file
here.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## The trap

**A stub's factory function must be completely self-contained.** `createInstrumentStub` in
`src/utils.js` builds the bundle with `factory.toString()`, so anything the factory closes over from
module scope is simply absent when the bundle is evaluated and it throws. This is why every stub
does its imports _inside_ the factory:

```js
const { z } = await import('zod/v3');
```

Note the version in that specifier. `src/file.js` and `src/interactive.js` use `zod/v4`;
`src/forms.js` uses both — `zod/v3` in `unilingualFormInstrument`, `zod/v4` in
`bilingualFormInstrument`. Match whichever the stub you are copying uses — a bare `zod` import is an
eslint error repo-wide.

`src/file.js` is the smallest stub showing the whole shape (dynamic zod import, `internal`,
`validationSchema` — `src/series.js` is shorter but has none of those); read it before adding one.

## Types

There is **no `tsconfig.json`** and `lint` is `eslint --fix src` with no `tsc`. Shapes are asserted
with JSDoc `@type` annotations that nothing in this package checks — a wrong stub surfaces as a
failing `packages/schemas` test or a consumer's `tsc` error.

## Tests

None of its own; there is no `vitest.config.ts` here. The stubs _are_ the fixtures for
`packages/schemas/src/instrument/__tests__/*.test.ts`, so changing one changes what those tests
assert.
