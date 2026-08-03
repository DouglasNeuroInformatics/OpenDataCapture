# Add a vitest project

Give a workspace a unit-test tier it does not have yet. What is tested where lives in
`.agents/docs/architecture/testing-strategy.md`; read it first. This file is only the ordering that
matters.

**Plan around this:** the failure this playbook prevents is silent. Root `vitest.config.ts` declares
`projects: ['apps/*/vitest.config.ts', 'packages/*/vitest.config.ts', 'runtime/*/vitest.config.ts']`,
so a workspace with no `vitest.config.ts` of its own contributes no project. A test file added to
`packages/react-core` today is collected by nothing, reported by nothing, and passes CI green — the
run never mentions it, and there is no error to search for.

The opposite mistake is loud. Once a project exists, a `--project` filter that matches no `name` stops
the run dead:

```
Error: No projects matched the filter "react-core".
```

That error means the config is absent or its `name` differs from what you typed. Green with no mention
of your file means the config is absent.

## Steps

1. **Confirm the package really has no project.** `pnpm exec vitest list --filesOnly` prints every
   collected file in the repo, each prefixed with its project name; the table in
   `.agents/docs/architecture/testing-strategy.md` says the same thing in prose. The package must also
   sit directly under one of those three roots — a `vitest.config.ts` in `storybook/` or `testing/`
   never runs, pnpm workspace or not (`.agents/docs/workspace-map.md`).

2. **Copy `packages/schemas/vitest.config.ts`.** It is the whole pattern, and every other project is
   this file with a different `name`:

   ```ts
   import { defineProject, mergeConfig } from 'vitest/config';

   import baseConfig from '../../vitest.config';

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

   Both halves are load-bearing. `mergeConfig(baseConfig, …)` is what inherits the root `include`
   globs and `watch: false`; `root: import.meta.dirname` is what scopes those globs to this package
   rather than the repo. Every project file uses `defineProject` — `defineConfig` belongs to the root
   config alone.

3. **Name the project after the directory.** The `name` field is the string `--project` takes, and it
   is the directory basename everywhere except `runtime/v1`, whose project is `runtime-v1` because
   `v1` names nothing on its own. Kebab-case, no `@opendatacapture/` scope.

4. **Choose the environment.** Node is the default and needs no key. A test that renders React needs
   `environment: 'happy-dom'`, for which `apps/web/vitest.config.ts` is the model. Carry any alias
   the package's source imports through into this file under `resolve.alias` — `vite.config.ts` is
   not loaded during tests (`apps/web/AGENTS.md`).

   `happy-dom` is pinned in the `catalog:` block of `pnpm-workspace.yaml`, so the devDependency is
   `"happy-dom": "catalog:"` — confirm the addition in-conversation per the root rule, then run
   `pnpm install`. pnpm links dependencies per package, so an uninstalled catalog entry fails when the
   environment loads, not at type-check. The DOM caveats it brings are in `apps/web/AGENTS.md` and
   `.agents/docs/architecture/testing-strategy.md`; read them before the first assertion.

5. **Add `vitest.config.ts` to the package's `tsconfig.json` `include` array.** `eslint.config.js`
   ignores `vitest.config.ts` globally, so `tsc` is the only thing that ever checks it — and only if
   the tsconfig names it. Every package with a `lint` script does this; the exceptions are in
   `.agents/docs/architecture/testing-strategy.md`.

   If the tests will live in `test/` rather than `src/`, add `test/**/*.ts` to `include` too, as
   `packages/runtime-bundler` and `packages/runtime-meta` do — a `test/` directory outside the
   tsconfig `include` is type-checked by nothing.

6. **Add the `test` script, and do not rely on it.** `"test": "vitest"` under `packages/` and
   `runtime/`, `"test": "env-cmd -f ../../.env vitest"` for an app, matching every project that
   already exists. Running it does not work today: `mergeConfig` inherits the root `test.projects`
   globs along with everything else, and started from inside the package they re-resolve against that
   directory and match nothing —

   ```
   Error: No projects were found. Make sure your configuration is correct. The projects definition: […]
   ```

   Scope a run from the repo root instead: `pnpm exec vitest --project <name>`. Root `pnpm test` runs
   the projects directly and never reads this script; `vitest` is a root devDependency, so the package
   declares nothing.

7. **Place the test file inside the inherited globs.** Those are
   `**/*.{test,spec}.?(c|m)[jt]s?(x)` and `**/*/test.?(c|m)[jt]s?(x)`, both relative to the package
   `root`; the house convention is `src/__tests__/<subject>.test.ts`. Only reach for a project-level
   `include` when a file must live outside them — `mergeConfig` concatenates arrays, so a project
   `include` _adds_ to the root globs rather than replacing them. `apps/api` is the proof: its own
   `include` is `['src/**/*.spec.ts', 'test/**/*.test.ts']`, and
   `src/auth/__tests__/ability.utils.test.ts` matches neither, yet is collected.

8. **Prove the file is collected, then prove it can fail.** If the package imports
   `instrument-library`, `runtime-core` or `runtime/v1`, run `pnpm build` once first — those three
   resolve only from `dist`/`lib` (`.agents/docs/workspace-map.md`), and `pnpm test` builds nothing.

   ```sh
   pnpm exec vitest list --filesOnly --project <name>
   ```

   Every line must read `[<name>] <path>`, your file must be among them, and no path may point
   outside the package — a path from elsewhere in the repo means `root` is missing from step 2. Then
   invert one assertion and watch it go red before restoring it
   (`.agents/skills/odc-testing/SKILL.md`).

9. **Record the new tier in every doc that tracks it.** The set that moves together is one row in
   `.agents/skills/odc-agent-docs/SKILL.md`. Other files also assert your package has no project —
   `packages/instrument-interpreter/AGENTS.md` says it of `react-core` — and none of them contains the
   new project name, so search by the package name instead:
   `grep -rn '<pkg>' --include=AGENTS.md . ; grep -rn '<pkg>' .agents`.

## Verify

```sh
pnpm exec vitest list --filesOnly --project <name>   # your file, prefixed [<name>], nothing from outside
pnpm exec vitest --project <name>                    # green, with the file count you expect
pnpm lint                                            # from the root; tsc now type-checks vitest.config.ts
pnpm test                                            # from the root: the repo-wide file count rises by yours
```

Run `pnpm lint` from the root, with a clean tree: it rewrites files as it checks them
(`.agents/docs/architecture/testing-strategy.md`), and a package-scoped `lint` skips turbo's `^build`
ordering, failing on unbuilt dependencies rather than on your config. `No projects matched the filter`
from either `vitest` command means the `name` you passed is not the `name` in the config; a root
`pnpm test` whose file count is unchanged means the config is not where the globs look — check that
the package sits directly under `apps/`, `packages/` or `runtime/`.
