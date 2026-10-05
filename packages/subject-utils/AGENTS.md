# packages/subject-utils

Derives and formats clinical subject identifiers. Four exports: `generateSubjectHash`,
`encodeScopedSubjectId`, `isSubjectWithPersonalInfo`, and `removeSubjectIdScope` (re-exported from
`@opendatacapture/runtime-internal`). Source-only — `exports` is `"./src/index.ts"`, no build step.
Used by `apps/web`, `apps/api` and `packages/react-core`.

## The trap

**`generateSubjectHash` output is the subject's primary key, stored in the database.** It is a SHA-256
of `firstName + lastName + YYYY-MM-DD + sex`, uppercased, hyphens stripped, then transliterated to
ASCII (so `Doé` and `Doe` are the same subject, deliberately). Every step of that normalization is part
of the identity contract: change the order, the date slice, the transliteration, or the fields, and
every existing record becomes unreachable. There is no version tag on the hash and no migration path.
Treat `generateSubjectHash` as frozen.

`parseClinicalSubjectIdentificationData` re-checks types the compiler already guarantees, on purpose —
crashing beats deriving a wrong ID. Leave it in place.

`removeSubjectIdScope` lives in `runtime-internal` rather than here so `apps/api`'s export worker
(which loads it over the `#runtime/v1/...` subpath import) and the browser share one implementation.

## Tests

`pnpm exec vitest --project subject-utils`. There is a `vitest.config.ts` here, and every export is
tested in `src/__tests__/index.test.ts`.
