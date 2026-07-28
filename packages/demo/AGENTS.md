# packages/demo

Hard-coded seed data for a demo instance: `DEMO_GROUPS` and `DEMO_USERS`, one file, `src/index.ts`.
Read by `apps/api/src/demo/demo.service.ts` (reached through `SetupModule` → `SetupService` →
`DemoService`) and by `apps/web/src/components/DemoBanner/DemoBanner.tsx`. Source-only, no build.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## Traps

**The passwords in `DEMO_USERS` are shipped to the browser on purpose.** `DemoBanner` lists the
demo users and passes each password to its one-click login button so a visitor to a public demo can
log in (the password itself is never rendered as text). Nothing here is a secret, and
nothing here may be reused for a real account or copied into a seed path that runs against a real
database.

**`dummyIdPrefix` is not part of the group schema.** `DemoGroup` is `CreateGroupData` plus that
extra key; `DemoService` destructures it off before calling `groupsService.create` and prefixes the
generated research IDs with it. A group whose `settings.idValidationRegex` requires a prefix but
that carries no matching `dummyIdPrefix` seeds subject IDs that fail their own group's validation.
The two are written next to each other in `src/index.ts` so they can be checked together — keep it
that way.

The `"./assets/*"` entry in `package.json` `exports` points at `./src/assets/*`, which does not
exist. It resolves to nothing; do not build on it.

## Tests

None, and there is no `vitest.config.ts` here. This data is exercised indirectly by `apps/api` and
by the Playwright suite in `testing/`.
