---
name: odc-instruments
description: Work on instruments and the runtime they import — adding a built-in instrument, vendoring a library under vendor/, or changing instrument-bundler, runtime-bundler, runtime-core, runtime-internal, runtime-meta, instrument-interpreter, vite-plugin-runtime, instrument-library or runtime/v1. Use also when an instrument builds but never appears, an import of /runtime/v1/… does not resolve, or a build logs ResolverError.
---

Everything in this area is a **published contract**. `packages/runtime-core` is the API instrument authors
import, and `runtime/v1` is the library catalog their bundles fetch by URL at runtime — changing an exported
type changes every instrument in the wild, including instruments in repositories this monorepo never sees.

**Name the blast radius in your reply before the first edit.** Most of the paths below sit on `review-pr`'s
automatic `REQUIRES_HUMAN_REVIEW` list — check yours against the roster in
`.agents/skills/review-pr/REVIEW.md`. This is the area where a clean-looking diff still goes to the user.

## Which workspace owns the change

The names collide far more than the jobs do.

| The change                                                                     | Workspace                         |
| ------------------------------------------------------------------------------ | --------------------------------- |
| The API authors write — `defineInstrument`, instrument types, `Translator`     | `packages/runtime-core`           |
| Which libraries an instrument may import, and at which major version           | `vendor/` **and** `runtime/v1`    |
| One author's own source becoming a bundle string                               | `packages/instrument-bundler`     |
| The libraries that source imports, built into `runtime/v1/dist`                | `packages/runtime-bundler`        |
| The interactive iframe, its bootstrap and service worker, `evaluateInstrument` | `packages/runtime-internal`       |
| A built runtime directory mapped onto HTTP URLs                                | `packages/runtime-meta`           |
| Serving `/runtime/v1/...` to a Vite app                                        | `packages/vite-plugin-runtime`    |
| Re-validating an evaluated bundle before it renders                            | `packages/instrument-interpreter` |
| Validating an instrument definition at the API perimeter                       | `packages/schemas`                |
| A built-in instrument itself                                                   | `packages/instrument-library`     |

**Only `runtime/v1/dist` is generated, and there is no `src/`.** Changing what the runtime serves means
editing `runtime/v1/runtime.config.js` or a wrapper under `vendor/`; `Bundler.bundle()` removes the outdir
before writing (`packages/runtime-bundler/src/bundler.ts`), so anything placed in `dist/` by hand is gone on
the next build.

**A new field kind or variant in `runtime-core` lands in two more packages, and only one of them errors.**
The `ts-pattern` matches in `packages/instrument-utils/src/translate.ts` end in `.exhaustive()`, so `pnpm lint`
there stays red until the new case is handled. `packages/schemas/src/instrument/instrument.form.ts` hand-lists
the same kinds twice — in `$StaticFieldKind` and in the `kind`-discriminated union — and its
`satisfies z.ZodType<…>` does not catch an omitted member, so a kind missing there type-checks clean and
surfaces as a 422 from `InstrumentsService.create` the first time someone uploads the instrument.

## Where it fails silently

**A failed runtime build exits 0.** `runtime-bundler`'s CLI logs what `bundle()` threw and carries on
(`packages/runtime-bundler/AGENTS.md`), so a broken runtime does not fail CI on its own. Read the build
output: a run that never printed `Success!` failed.

**Adding a library needs two files to agree, and only one direction errors.** An entry in
`runtime/v1/runtime.config.js`'s `include` without the matching `runtime/v1/package.json` devDependency is a
build-time `ResolverError`. The reverse is silent — the package installs and is never emitted — so confirm the
emitted directory exists under `runtime/v1/dist` before believing the build.

**A built instrument is not a loaded one.** The built-in catalog takes one hand-written default import and one
`create` call per instrument in `apps/api/src/demo/demo.service.ts` (`.agents/docs/playbooks/add-instrument.md`
is where that step lives); `src/interactive/DNP_STROOP_TASK` is the standing proof — it builds, `pnpm run available`
lists it, and it is in no demo instance. For an external repository, discovery scans only `lib/forms` and
`lib/interactive` (`.agents/docs/architecture/instrument-pipeline.md`), so a `lib/file` or `lib/series`
directory is skipped silently.

**`/runtime/v1/zod@3.x` is the Zod v3 API.** `vendor/zod@3.x`'s `.` export re-exports `zod/v3`; the v4 API is a
separate subpath, `/runtime/v1/zod@3.x/v4`. The repo-wide `no-restricted-imports` ban on bare `zod`
(`eslint.config.js`) matches the bare specifier only and never sees a `/runtime/v1/...` URL, so in instrument
source the subpath is yours to choose deliberately.

## Writing a `/runtime/v1/...` import

Instrument source always writes `/runtime/v1/<pkg>`, never a package name. Two other spellings address the
same artifact and are not interchangeable with it — `#runtime/v1/*` in `apps/api`, `@opendatacapture/runtime-v1`
for tooling that needs `dist` on disk. Full resolution rules, the `tsconfig` `paths` that type-check the first
form, and the files that must stay in sync: `.agents/docs/architecture/runtime-and-vendor.md`.

`instrument-bundler` marks any path starting with `/runtime/v1/` external without checking that it resolves
(`packages/instrument-bundler/src/plugin.ts`), so a package that was never emitted, or a subpath the wrapper's
`exports` does not define, bundles clean and 404s at render. In-repo instruments are caught by `tsc` through
those `paths`; playground and external-repo instruments are not. All three spellings bottom out in
`runtime/v1/dist`, which is gitignored — on a cold checkout an unresolvable import means `pnpm build` has not
run yet (`.agents/skills/odc-run-locally/SKILL.md`).

## Where the procedure lives

| Doing this                               | Open before you start                                                                        |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| Adding a built-in instrument             | `.agents/docs/playbooks/add-instrument.md`                                                   |
| Vendoring a library                      | `.agents/docs/playbooks/add-vendor-package.md` — three registration points, the third silent |
| Following a bundle from source to screen | `.agents/docs/architecture/instrument-pipeline.md`                                           |
| Telling the runtime workspaces apart     | `.agents/docs/architecture/runtime-and-vendor.md`                                            |
| Authoring the instrument definition      | `packages/instrument-guidelines/AGENTS.md`                                                   |

The guidelines package's rules about the definition object apply to a built-in instrument; its file layout does
not. A built-in is one flat directory, `packages/instrument-library/src/<kind-dir>/<NAME>/`, where a
subdirectory fails the build with `Cannot infer loader` (`.agents/docs/playbooks/add-instrument.md`).

## Done when

- Your reply named the surface and what an already-published instrument does differently after the change —
  stated before the first edit, and restated at the end against what actually changed.
- The runtime build printed `Success!`, and any package you added has its own directory under `runtime/v1/dist`.
- A field kind or variant that moved is handled in `packages/instrument-utils` (`pnpm lint` green there) **and**
  listed in `packages/schemas/src/instrument/` — nothing checks the second for you.
- A new built-in instrument renders in a demo instance —
  `pnpm --filter @opendatacapture/instrument-library run available` listing it proves only that it built.
