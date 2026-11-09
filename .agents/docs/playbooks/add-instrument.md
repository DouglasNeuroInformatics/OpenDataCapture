# Add a built-in instrument

Adding a directory under `packages/instrument-library/src` builds a bundle that **nothing loads**.
Step 4 is the one that puts it in a demo instance, and skipping it fails silently.

Conventions live in `packages/instrument-library/AGENTS.md`. The definition-object rules are in
`packages/instrument-guidelines/AGENTS.md`; its `lib/` file layout does not apply here.

## Checklist

1. **Create `packages/instrument-library/src/<kind-dir>/<NAME>/`**, `<NAME>` in
   `SCREAMING_SNAKE_CASE` with a `DNP_` prefix for DNP-authored instruments. Make it equal
   `internal.name`, which the API hashes into the instrument ID; nothing enforces the match. Copy
   the example for your kind:

   | `kind`          | Directory                  | Copy                                       |
   | --------------- | -------------------------- | ------------------------------------------ |
   | `'FORM'`        | `src/forms/` (plural)      | `DNP_HAPPINESS_QUESTIONNAIRE`              |
   | `'INTERACTIVE'` | `src/interactive/`         | `DNP_BREAKOUT_TASK`                        |
   | `'SERIES'`      | `src/series/`              | `DNP_HAPPINESS_QUESTIONNAIRE_WITH_CONSENT` |
   | `'FILE'`        | `src/file/` (**singular**) | `MRI_SCAN_SESSION`                         |

2. **Default-export `defineInstrument(...)` from `index.ts`** (`index.tsx` for JSX;
   `defineSeriesInstrument` for a series), keeping the directory flat and relative imports
   extension-qualified (§Authoring rules in the package `AGENTS.md`). Import everything from
   `/runtime/v1/...`, never a package name:

   ```ts
   import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
   import { z } from '/runtime/v1/zod@3.x/v4'; // omit `/v4` for the Zod v3 API
   ```

   The type enforces the required fields; `packages/runtime-core/AGENTS.md` §`defineInstrument`
   covers `language`, `__runtimeVersion` and the in-repo `details.license` narrowing; the catalog
   mostly uses `'Apache-2.0'`.

3. **For a series, every item must already exist.** `content.items` are `{ name, edition }` pairs
   matching other instruments' `internal`; `validateSeriesInstrument` in
   `apps/api/src/instruments/instruments.service.ts` rejects a series with a missing item or fewer
   than two.

4. **Import it in `apps/api/src/demo/demo.service.ts` and `create` it in `init`.** There is no
   registry; this file holds one hand-written import per instrument:

   ```ts
   import myNewForm from '@opendatacapture/instrument-library/forms/MY_NEW_FORM.js';
   // in init:
   await this.instrumentsService.create({ bundle: myNewForm });
   ```

   **Order in `init` is load-bearing**: a series is created after every instrument it references.

5. **Add a unit test** in the top-level `packages/instrument-library/src/__tests__/<NAME>.test.ts`
   (one inside the instrument directory breaks the build), **and an e2e test** per
   `.agents/docs/playbooks/add-e2e-test.md`.

## Verify

```sh
pnpm exec turbo run build --filter=@opendatacapture/instrument-library  # builds runtime/v1 first
pnpm --filter @opendatacapture/instrument-library run available         # reads dist, not src
pnpm lint
pnpm test:coverage
pnpm test:e2e
```

`available` listing your title under the right kind proves only that it built; it reaches a demo
instance only through step 4. `pnpm lint` (`tsc`) needs `runtime/v1/dist`, which is why the build
comes first.
