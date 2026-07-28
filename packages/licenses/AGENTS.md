# packages/licenses

A `Map` from license identifier (the full SPDX list plus six custom `*-NOS` / `PUBLIC-DOMAIN` /
`UNLICENSED` entries) to `{ name, reference, isOpenSource, isCopyleft? }`. `packages/schemas` builds
`$LicenseIdentifier` from it, `packages/runtime-core` types `defineInstrument`'s license field from
`ApprovedLicense`, and `apps/web`, `apps/outreach` and `runtime/v1` all consume it. Private,
source-only, no build.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## The trap

**`src/index.js` and `src/index.d.ts` are two hand-written files that must agree.** The data is
plain JavaScript; the `LicenseIdentifier` union, the `License` type and the `ApprovedLicense`
subset are declared separately by hand. Nothing derives one from the other and nothing checks them
against each other:

- an entry in `.js` with no member in `.d.ts` is invisible to every consumer's types;
- a member in `.d.ts` with no entry in `.js` type-checks fine and then fails
  `licenses.has(...)` at runtime inside `$LicenseIdentifier`.

Adding or removing a license means editing both, in the same commit.

`ApprovedLicense` also drives the docs site: `apps/outreach/src/components/docs/Licenses.astro`
keys a `Record<ApprovedLicense, true>` on the union, so adding a member to the type without listing
it there is a compile error rather than a silently missing row (which is how `CC-BY-4.0`, `FREE-NOS`
and `PUBLIC-DOMAIN` once fell off the page). Keep it a `Record` keyed on the union — do not flatten
it back into a hand-written array.

This package is listed in `runtime/v1/runtime.config.js` `include`, so it is bundled into the
published instrument runtime and instrument authors can import it. An export added here widens that
public surface — see `.agents/docs/architecture/runtime-and-vendor.md`.

## Tests

None, and there is no `vitest.config.ts` here.
