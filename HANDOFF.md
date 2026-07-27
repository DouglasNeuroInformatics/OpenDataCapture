# Handoff: agent documentation + guardrails

**Branch:** `agents` · **Base at time of writing:** `1eabe6c00`
**State:** all changes are **uncommitted** in the working tree (21 modified, 1 deleted, 73 untracked
including this file).

The approved plan is at `~/.claude/plans/i-want-you-to-twinkling-owl.md`. This document covers what
actually happened, what to review, and what was deliberately left undone. It does not restate the
plan or the diff — read those directly.

---

## What was asked

Three requests, in order:

1. Document the codebase so agents (Claude, OpenAI, Cursor) stop making structural mistakes — the
   trigger case being tests written into `apps/web/src/routes/`. Support both the AGENTS and CLAUDE
   conventions. Correctness over token cost.
2. Add lint rules to make the common mistakes fail rather than merely be documented.
3. Fix all `jsx-no-literals` warnings, sync `approvedLicenseIds`, fix the `turbo.json` path.

## Where the work lives

| Category        | Count                | Notes                                                                                                                        |
| --------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`     | 31 on disk           | root (rewritten as a router) + 29 new per-area + `packages/instrument-guidelines` (pre-existing, untouched)                  |
| `CLAUDE.md`     | 30 (29 new + root)   | **symlinks** to the sibling `AGENTS.md` — including the root, converted from its old `@AGENTS.md` import form during review. |
| `.agents/docs/` | 13 new               | `workspace-map.md`, `architecture/` ×4, `playbooks/` ×8                                                                      |
| Source / config | 21 modified, 1 moved | lint rules, translations, and the three fixes from request 3                                                                 |

Start at `AGENTS.md` (root) — it routes to everything else.

## Verification state

All green as of handoff, run from the repo root:

```sh
pnpm lint      # 33/33 tasks. This is also the type-check (tsc && eslint --fix per package).
pnpm test      # 48 files, 334 passed, 1 skipped
pnpm --filter @opendatacapture/web build   # no "does not export a Route" generator warning
pnpm exec prettier --check "**/AGENTS.md" ".agents/docs/**/*.md"
```

**`pnpm test:e2e` has NOT been run.** It needs `playwright install chromium firefox` and was out of
scope for a docs-and-lint change, but nothing here should affect it. Worth running before merge.

`pnpm lint` mutates files (`eslint --fix`), so run it before diffing.

---

## Review priorities

In descending order of "how bad is it if this is wrong".

### 1. Factual accuracy of the generated docs

27 of the 29 per-area `AGENTS.md` files and all 13 `.agents/docs` files were written by subagents.
Each was instructed to verify every claim against source and to report what it could not verify, and
each returned a correction list — several of which corrected the briefing I gave them. **But they
were not independently re-verified end to end.** Spot-checking is the highest-value review action.

I hand-wrote and personally verified `AGENTS.md` (root), `apps/web/AGENTS.md` and
`apps/api/AGENTS.md`. Within those I confirmed at source: `accessibleQuery(undefined, …)` returns
`{}`; the guard's `[].every(...)` semantics; exactly three `@RouteAccess('public')` routes and one
`@RouteAccess([])`; and that `AuditLog`, `InstrumentRecordFile` and `SetupState` appear in neither
subject enum.

I also caught and fixed a wrong claim in a generated file (`packages/licenses/AGENTS.md` said two
licenses had drifted; it was three), which is the failure mode to look for.

A path-reference checker was used during verification but lives in an ephemeral scratchpad and is
**not committed**. It parses backticked tokens rooted at a known top-level directory out of every
agent doc and asserts they exist on disk. Six references remain unresolved **by design** — they
document things that deliberately do not exist (`apps/gateway/vitest.config.ts`,
`apps/playground/vitest.config.ts`, `packages/react-core/vitest.config.ts`,
`packages/instrument-bundler/runtime/v1/dist`) or are not paths. Consider committing a version of
that checker if you want it enforced.

### 2. The two translation judgment calls

Both are in the diff and both are reversible.

- **`NULL` → `NUL` (French)** in `apps/web/src/routes/_app/datahub/index.tsx`, four call sites. The
  linter only flagged the two filter checkboxes; the two table `cell` renderers (near lines 393 and 417) return the string from a function, so they are invisible to the rule. Translating only the
  flagged pair would have made the dropdown disagree with the column, so all four were changed
  together. If `NULL` should stay an untranslated technical token, revert all four.
- **`S.O.` for `N/A`** in `apps/web/src/routes/_app/upload/$instrumentId.tsx`. Note the
  `Select.Item value="N/A"` is data and was deliberately left alone; only the label changed.

French follows the existing repo convention of a space before a colon (`"Période : Toujours"`), so
`Min:` renders as `Min :`.

### 3. `apps/web/src/routes/_app/index.tsx`

Renders `<div>Index</div>` at `/` for any authenticated user, with no redirect to `/dashboard`. It
was translated to clear the lint error, but it reads like an unfinished stub rather than intended
copy. **Probably wants a product decision, not a translation.**

---

## Deliberate decisions worth knowing

- **`react/jsx-no-literals` is now `error`**, with punctuation and proper nouns allowlisted in
  `eslint.config.js` and `*.stories.tsx` exempt. Strings that are genuinely not copy (stack-frame
  syntax in `packages/react-core/src/components/InstrumentErrorFallback/StackTrace.tsx`) were moved
  into named variables outside the JSX with a comment, rather than added to the allowlist.
- **One planned lint rule was dropped.** A `no-restricted-syntax` selector banning `import type` for
  `$`-prefixed schemas produced a 100% false-positive rate: both files it flagged used the
  type-imported schema as a _return_ type, not a `@Body()` parameter. No single esquery selector can
  correlate an import with a parameter decorator. The hazard is real and is documented in
  `apps/api/AGENTS.md` and `.agents/docs/playbooks/add-api-endpoint.md` instead.
- **`@RouteAccess` enforcement was kept**, but only after probing it with a synthetic unguarded
  handler to confirm it fires rather than silently matching nothing. If you touch that selector,
  re-run that probe.
- **`apps/web/src/services/zod.ts` was NOT migrated to v4.** The initial hypothesis that its v3 error
  map was dead code was wrong: `FormContent` passes `instrument.validationSchema` straight to libui's
  `Form`, and most instruments are authored against `/runtime/v1/zod@3.x` (4 in the library, 15
  playground examples). The map is live. The import was made explicitly `zod/v3` with a comment.
  **Open question:** v4-authored instruments still get no localized required-field message. Fixing
  that means adding a parallel `z.config({ customError })` for v4 — a behaviour change, not done.
- **No `blog/AGENTS.md`.** `apps/outreach/src/content/blog` symlinks to `/blog`, so the Astro `blog`
  collection loads every `.md` there and validates it against the post schema. Adding one broke
  `astro check` with `InvalidContentEntryDataError`; it was removed and its content became
  `.agents/docs/playbooks/add-blog-post.md`. The reason is recorded in `apps/outreach/AGENTS.md` so
  nobody re-adds it. `/docs` is unaffected — its symlinks point at `/docs/en` and `/docs/fr`.
- **`packages/instrument-guidelines/AGENTS.md` was not touched.** It is a published npm artifact
  installed into external instrument repos, not repo conventions. Flagged as such in the root file.
- **`approvedLicenseIds`** was converted to `Record<ApprovedLicense, true>` rather than having three
  strings appended, so divergence is now a type error. This also dropped two `as any` casts. All 14
  approved ids were confirmed present in the `licenses` map, so `CC-BY-4.0`, `FREE-NOS` and
  `PUBLIC-DOMAIN` will appear under "Approved" for the first time — **a visible docs-site change**.

## Open items, not done

1. **`gateway#build` in `turbo.json` is dead config.** Confirmed via
   `pnpm exec turbo run build --dry=json`: it does not match the package name, so
   `@opendatacapture/gateway#build` resolves to the generic `build` definition and its declared
   `db:push` dependency never applies. Renaming the key to `@opendatacapture/gateway#build` fixes it,
   but makes gateway builds depend on a `cache: false` task requiring `GATEWAY_DATABASE_URL`, which
   could affect CI. Left for a decision.
2. **v4 instrument localization gap** — see the `zod.ts` note above.
3. **`pnpm test:e2e` not run.**
4. **No CI check for cross-file sync pairs.** Explicitly out of scope per the plan; the pairs
   (`#runtime/v1` in `tsconfig.json` ↔ `package.json`, `instrument-library` ↔ `demo.service.ts`) are
   covered by playbook checklists only. Vendor peer pairing is already guarded by
   `runtime/v1/test/vendor-pairing.test.ts`.
5. **`accessibleQuery` omission remains unenforceable by static analysis.** It is the one
   highest-severity rule in the repo that relies on documentation alone. Called out in three places.

## Suggested skills

- `code-review` — for reviewing this diff against the repo's documented standards.
- `grilling` / `grill-me` — to stress-test the two translation judgment calls and the
  `gateway#build` decision before acting on them.
- `systematic-debugging` — only if `pnpm test:e2e` fails; nothing here should affect it.

## Picking up

```sh
git status                 # everything is uncommitted
pnpm lint && pnpm test     # confirm the baseline still passes
```

Read `AGENTS.md` first. If you change any source file, the root file now requires you to re-read the
`AGENTS.md` of every package you touched and confirm your change does not contradict it — that rule
applies to this handoff's reviewer too.
