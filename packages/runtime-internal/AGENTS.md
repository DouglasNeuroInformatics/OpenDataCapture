# packages/runtime-internal

Four small helpers (`evaluateInstrument`, `encodeUnicodeToBase64`, `decodeBase64ToUnicode`,
`removeSubjectIdScope`) plus the interactive-task trio `src/interactive/{iframe.html,bootstrap.js,worker.js}`.
Private, and **there is no build step** — `exports` points straight at `src/`, with a hand-written
`src/index.d.ts` beside plain `src/index.js`. Consumed by `instrument-bundler`,
`instrument-interpreter`, `react-core`, `serve-instrument`, `subject-utils`, and included in
`runtime/v1/runtime.config.js` so it is also served under `/runtime/v1/...`.

## Traps

**`evaluateInstrument` is `new Function()`.** Its JSDoc in `src/index.d.ts` carries an all-caps
trusted-input-only warning; that warning is the API contract. Do not widen the set of callers without
being certain the bundle came from a trusted author.

**The three `interactive/*` entries in `package.json` `exports` are bare strings on purpose.** A bare
string means `runtime-bundler` copies the file byte-for-byte; a conditional object would bundle it and
inject ESM chunk imports, which a classic `<script>` (`iframe.html` loads `bootstrap.js` that way) and
a service worker (`worker.js`) cannot execute. The three files also reference each other by relative
path, which only survives verbatim copying. See
`.agents/docs/architecture/runtime-and-vendor.md#two-kinds-of-export`.

**Nothing checks `src/index.d.ts` against `src/index.js`.** The `.js` annotates each export with
`/** @type {import('./index.d.ts').fn} */`, so a signature change means editing both files.

The served path `/runtime/v1/@opendatacapture/runtime-internal/interactive` is hard-coded twice: as the
iframe `src` in `packages/react-core/src/components/InteractiveContent/InteractiveContent.tsx`, and as
the prefix `worker.js` strips off incoming request pathnames. Moving the package renames that URL.

## Tests

None here — no `vitest.config.ts` and no `test` script. The copy-verbatim guarantee this package
depends on is covered upstream by the `classic-script` fixture in
`packages/runtime-bundler/test/e2e.test.ts`.
