# packages/instrument-interpreter

One class, `InstrumentInterpreter`, that turns a bundle string into a live instrument object.
Consumed by `packages/react-core` (`useInterpretedInstrument`) and `apps/web`
(`useInstrumentInterpreter`, `useInstrument`). Source-only — the `.` export is `src/index.ts` and
there is no build.

Read the root `AGENTS.md` first for the rules that apply everywhere. For where this sits in the
larger flow, see `.agents/docs/architecture/instrument-pipeline.md`.

## Traps

**`interpret()` executes the bundle.** It delegates to `evaluateInstrument` from
`@opendatacapture/runtime-internal`, which runs arbitrary JavaScript in the caller's context and
performs no validation of its own. Only pass a bundle that came from the API or from the local
playground.

**`validate` defaults to `false`.** With no options, the evaluated value is cast to
`SomeInstrument<TKind>` and returned unchecked — nothing parses it against `$AnyInstrument` or its
kind-specific schema. `apps/web/src/hooks/useInstrument.ts` opts in only when
`import.meta.env.DEV`, so in a production build nothing has verified the shape. Never assume an
interpreted instrument has been validated.

**`instrument.id = options?.id` runs unconditionally**, so omitting `id` sets it to `undefined`
rather than leaving whatever the bundle produced.

**Only an interactive instrument may import React.** `interpret()` rejects a bundle of any other
kind that imports `/runtime/v1/react@*` or `/runtime/v1/react-dom@*`. A form renders inside the host
application's own React tree, where a hook called through the served copy reaches the wrong
dispatcher; making the served copy defer to the application's copy instead would tie an already
stored instrument to whichever React that application ships. `src/imports.ts` matches the served
specifier in the bundle text and exempts the JSX runtime, which is what a block's JSX compiles to —
so a block still renders JSX, it just cannot hold state. What a block needs is passed to its
`render` function as `context` (`packages/instrument-guidelines/AGENTS.md`).

`InstrumentInterpreterOptions` (and its `transformBundle` member) is exported but referenced
nowhere — not by the class, not by any consumer. It is dead; do not build on it.

## Tests

`pnpm exec vitest --project instrument-interpreter`.

`src/__tests__/index.test.ts` drives `interpret()` over hand-written bundles — a bundle is an async
IIFE that resolves to the instrument, so a fixture is one that returns a plain object — and
`src/__tests__/imports.test.ts` covers `findReactImport` against the specifiers a built bundle
actually carries. There is still no project in `packages/react-core`, so `useInterpretedInstrument`
is covered only by the Playwright suite in `testing/`.
