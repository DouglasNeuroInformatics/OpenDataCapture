# packages/release-info

One function, `getReleaseInfo()`, returning the `ReleaseInfo` defined in
`packages/schemas/src/setup/setup.ts`. It is called at **build time**, never at request time — from
`apps/web/vite.config.ts` (into the `__RELEASE__` define), `apps/api/libnest.config.ts`, and
`apps/gateway/scripts/{build,dev}.ts`. Source-only, no build.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## Traps

**It branches on `NODE_ENV` and hard-fails on anything else.** `development` and `test` shell out to
`git rev-parse` for the branch and short commit and read `version` from the repo-root
`package.json`; `production` reads `process.env.RELEASE_VERSION` and never touches git. Any other
value throws.

**The dev/test path needs a git checkout the current user owns.** `.github/workflows/ci.yaml` runs
`git config --global --add safe.directory ...` before installing, specifically for this. In a
container that builds as a different user than owns the checkout, this fails with a git ownership
error surfaced as "Failed to get current git branch".

**`RELEASE_VERSION` must match `/^[0-9]+\.[0-9]+\.[0-9]+$/`** (`$ReleaseVersion`). The api, gateway
and web Dockerfiles take it as a build arg (playground's does not) and the release workflow supplies
it; a missing or `v`-prefixed value fails the build.

The root `package.json` is located as `../../../package.json` relative to `src/`, so this package
only works from its current path inside the workspace.

## Tests

`pnpm exec vitest --project release-info`, in `src/__tests__/index.test.ts`. Only the production
branch actually runs: the development block is written `describe.skipIf(() => process.env.CI)`, and
because a function is always truthy that block is skipped everywhere, not just in CI. Treat the
git-dependent path as untested.
