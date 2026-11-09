---
name: adding-dependencies
description: Add, upgrade or replace a third-party npm package in Open Data Capture. Use before touching a dependencies block in any package.json or the catalog in pnpm-workspace.yaml, including when a task seems to need a library the repo does not have.
---

**Ask in-conversation before adding anything**: name the package, what it is for, and what you checked first.
Do not install while waiting. A literal version in a `package.json` installs cleanly and is caught only by the
grep under Verify; a version too new for the release-age gate is rejected at `pnpm install`.

1. **A library that instruments import is not a dependency of this repo.** It goes through `vendor/`, where
   each wrapper pins a literal version on purpose: `.agents/docs/playbooks/add-vendor-package.md`, and none
   of the steps below.
2. **Check what the repo already has.** `.agents/docs/packages/index.md` lists the `@douglasneuroinformatics/*`
   packages this repo consumes; one of them usually covers a utility, crypto, stats, form-typing or UI need.
   Then grep the `catalog:` block of `pnpm-workspace.yaml`: a package already there is added to a workspace
   with `"catalog:"` and needs no question.
3. **Pin the version in the catalog, not the package.** Every version lives once, in the `catalog:` block of
   `pnpm-workspace.yaml`; a `package.json` references `"catalog:"`, never a literal version, so two workspaces
   cannot drift apart.
4. **Pick a version older than `minimumReleaseAge`.** It is 7 days (`pnpm-workspace.yaml`), so a release newer
   than that is rejected at install time. Take the previous release rather than extending
   `minimumReleaseAgeExclude`; that list is for the repo's own `@douglasneuroinformatics/*` packages and
   pins the user has explicitly approved.
5. **Run `pnpm install`** so the lockfile change lands in the same commit as the `package.json` change.

## Verify

```sh
pnpm install --frozen-lockfile      # ERR_PNPM_OUTDATED_LOCKFILE means step 5 was skipped
grep -n '<package>' pnpm-workspace.yaml   # no line means the version was pinned in a package.json, not the catalog
```
