# Add a vitest project

Give a workspace a unit-test tier it does not have yet. What is tested where lives in
`.agents/docs/architecture/testing-strategy.md`. This file is only the ordering that matters.

**Plan around this:** root `vitest.config.ts` collects only `apps/*/vitest.config.ts`,
`packages/*/vitest.config.ts` and `runtime/*/vitest.config.ts`. A workspace without one contributes no
project, so its test files are collected by nothing and CI stays green. The loud version is a
`--project` filter matching no `name`: `Error: No projects matched the filter "<name>"`.

## Steps

1. **Confirm the package has no project**: it is absent from `pnpm exec vitest list --filesOnly`, which
   prefixes every collected file with `[<project>]`. The package must sit directly under `apps/`,
   `packages/` or `runtime/`; a config in `storybook/` or `testing/` never runs.

2. **Copy `packages/schemas/vitest.config.ts`.** Every project is this file with a different `name`:

   ```ts
   import { defineProject, mergeConfig } from 'vitest/config';

   import { baseConfig } from '../../vitest.config';

   export default mergeConfig(
     baseConfig,
     defineProject({
       test: {
         name: 'schemas',
         root: import.meta.dirname
       }
     })
   );
   ```

   `mergeConfig(baseConfig, …)` inherits the root `include` glob and `watch: false`;
   `root: import.meta.dirname` scopes that glob to this package. Merge the named `baseConfig`, never the
   root's default export: its `projects` field is read as a nested project set and every run fails
   with `Error: No projects were found in "<pkg>/vitest.config.ts"`. `defineConfig` belongs to the root
   config alone.

3. **Name the project after the directory**, kebab-case, no `@opendatacapture/` scope. `runtime/v1`
   is the one exception: `runtime-v1`.

4. **Choose the environment.** Node is the default. A test that renders React needs
   `environment: 'happy-dom'` (model: `apps/web/vitest.config.ts`) and a `"happy-dom": "catalog:"`
   devDependency — ask first per the root rule, then `pnpm install`. Redeclare under `resolve.alias`
   any alias the source imports; `vite.config.ts` is not loaded during tests.

5. **Add `vitest.config.ts` to the package's `tsconfig.json` `include`.** Package eslint runs on `src`
   only, so `tsc` is the config's only check. Tests in `test/` rather than `src/` need `test/**/*.ts`
   there too (`packages/runtime-bundler`), or nothing type-checks them.

6. **Add the `test` script**: `"vitest"` under `packages/` and `runtime/`,
   `"env-cmd -f ../../.env vitest"` for an app. Root `pnpm test` ignores it and runs the projects
   directly.

7. **Place the test file** in a `__tests__/` folder beside its subject (root `AGENTS.md` §Tests).
   Reach for a project-level `include` only for a file outside the inherited glob; `mergeConfig`
   concatenates arrays, so it adds to the root glob rather than replacing it.

8. **Prove the file is collected, then that it can fail.** If the package imports
   `instrument-library`, `runtime-core` or `runtime/v1`, run `pnpm build` first — those resolve only
   from build output (`.agents/docs/workspace-map.md`) and `pnpm test` builds nothing.
   `pnpm exec vitest list --filesOnly --project <name>` must list your file and no path outside the
   package (one means `root` is missing). Then invert an assertion and watch it go red.

9. **Record the new tier**: `testing-strategy.md`'s Vitest projects table, the count above it and its
   "Everything else has no unit tests" list; the `Vitest project` column in
   `.agents/docs/workspace-map.md`; and the package's own `AGENTS.md` `## Tests`. Then search for any
   other doc still saying the package has no unit tests:
   `grep -rn '<pkg>' --include=AGENTS.md . ; grep -rn '<pkg>' .agents`.

## Verify

```sh
pnpm exec vitest list --filesOnly --project <name>   # your file, prefixed [<name>], nothing from outside
pnpm exec vitest --project <name>
pnpm lint                                            # from the root; tsc now checks vitest.config.ts
pnpm test                                            # the repo-wide file count rises by yours
```

Run `pnpm lint` from the root: a package-scoped `lint` skips turbo's `^build` ordering and fails on
unbuilt dependencies rather than on your config.
