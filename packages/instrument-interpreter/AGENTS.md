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

`InstrumentInterpreterOptions` (and its `transformBundle` member) is exported but referenced
nowhere — not by the class, not by any consumer. It is dead; do not build on it.

## Tests

None, and there is no `vitest.config.ts` here. Neither is there one in `packages/react-core`, so
`interpret()` has no unit coverage anywhere in the repo — behaviour changes must be checked through
the Playwright suite in `testing/`.
