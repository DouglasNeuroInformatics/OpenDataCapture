# Cut a release

A release is one version bump merged to `main`, or pushed to a `release/<major>.<minor>` branch and
dispatched (§From a release branch below). Everything after that is automatic:
`.github/workflows/release.yaml` builds and pushes the container images, publishes the npm packages, and
creates the GitHub release, whose body is the new version's section of `CHANGELOG.md`. Which packages are publishable is in `.agents/docs/workspace-map.md`; what CI
gates is in `.agents/docs/architecture/testing-strategy.md`; the `RELEASE_VERSION` build-arg contract is in
`packages/release-info/AGENTS.md`; what each image tag and npm dist-tag means, and which run moves
`latest`, is in `.agents/docs/architecture/release-channels.md`. This file is only the order of operations.

**Plan around this:** the root `package.json` version _is_ the release identity —
`.github/scripts/release.cjs` reads it and it becomes both the container tag and the GitHub tag
`v${version}` — but every npm package publishes at **its own** `package.json` version, and the publish
step skips any version already on the registry (`release.yaml:145-153`):

```
Skipping @opendatacapture/runtime-v1@<version> (already published)
```

So a bump that touches only the root leaves the packages behind and `publish-npm` reports **success while
publishing nothing**. `scripts/increment-version.ts` rewrites the root plus every path
`scripts/list-publishable.sh` returns in one run, and it is the only thing holding those files in
agreement — nothing in CI compares them, and hand edits have moved the root alone before.

## Steps

1. **Get the branch green before you bump.** `pnpm lint`, `pnpm test` and `pnpm test:e2e` from the repo
   root — nothing after the PR runs a test against this code
   (`.agents/docs/architecture/testing-strategy.md` has the gating). All three need `.env`; root
   `pnpm test` is bare vitest with no turbo `^build` behind it, so `pnpm build` must have run once
   (`.agents/docs/playbooks/run-locally.md`), and the e2e browsers are in
   `.agents/docs/playbooks/add-e2e-test.md`. `pnpm lint` is `tsc && eslint --fix src` per package and
   rewrites files as it checks them: read `git status` after it and land any churn as its own commit,
   before the bump.

2. **Bump from a branch that already contains `main`.** `git fetch origin && git merge origin/main`.
   `increment-version.ts` derives the next version from the root `package.json` in your working tree
   alone, so a branch trailing `main` computes a version that is already released — the run then finds its
   tag and pushes `edge` alone, releasing nothing. Done
   when `git merge-base --is-ancestor origin/main HEAD` exits 0.

3. **Run `./scripts/increment-version.ts` from the repo root.** There is no `pnpm` script for it — invoke
   the path, which Node executes directly; prerequisites for anything under `scripts/` are in
   `.agents/docs/playbooks/run-locally.md`. It first prints `Recommended bump: major|minor|patch`, derived
   by `scripts/changelog.ts` from the commits since the last `v*` tag (a breaking change → major, a `feat` →
   minor, anything else → patch — strict SemVer, so expect `minor` more often than recent releases suggest).
   The choice stays yours: it offers `major`/`minor`/`patch`/`quit` with the recommendation preselected and
   the resulting version beside each, then asks whether to commit the result, then confirms both together.
   `--bump <major|minor|patch>`, `--commit` and `--yes` answer those prompts on the command line; `--bump`
   and `--yes` are **required** when stdin is not a terminal — without them it exits 1 having written
   nothing rather than picking for you. `--yes` leaves the commit prompt at its default of no, so a
   non-interactive run that should also commit needs `--commit`. It then rewrites the root
   `package.json` plus every path `scripts/list-publishable.sh` returns, runs
   `scripts/changelog.ts write <version>`, which inserts a `## <version>` section into `CHANGELOG.md` and
   regenerates `docs/en/6-changelog/changelog.md` from it, and re-reads every version field to assert the
   lockstep of step 4. A commit whose message the generator cannot read fails the run with
   `Error: Commit <sha> does not follow the convention …` and writes nothing — reword that commit before
   you release, so that no change drops silently out of the changelog. Done when its output carries one
   `✓ <file> → <version>` line per package, a `Wrote the <version> section` line, and ends
   `✓ All 6 packages report <version>`.

4. **Confirm the lockstep before you commit.**

   ```sh
   node -p "require('./package.json').version" && scripts/list-publishable.sh
   ```

   `list-publishable.sh` never prints the root, so a uniform version column proves nothing on its own —
   that is exactly what a root-only bump looks like. Done when the root version on the first line equals
   the second tab-separated field of every row below it. Nothing in CI enforces that equality;
   `increment-version.ts` asserts it for its own run, which is exactly why this check matters when
   anything bypassed the script.

   Then read the new `## <version>` section of `CHANGELOG.md`. It becomes the GitHub release body
   verbatim, and this PR is the only review it gets. It lists `feat`, `fix`, `perf` and breaking commits
   only; a `chore`-only range renders as `This release contains no user-facing changes.`

5. **Commit the version files and both changelog files in one commit, `chore: release v<version>`, and open
   the PR with `main` as its base.** The script offers to make exactly that commit — the six
   `package.json` files and both changelogs, by explicit pathspec, so anything else already staged stays out
   of it, and `--commit` answers that prompt up front. It commits only; the tag is the release workflow's
   (`v${version}`, on the GitHub release). Saying yes skips the step-4 read of `CHANGELOG.md`, which is the
   only review that section gets before it becomes the release body, so read the commit afterwards.
   A PR against any base but `main` or `release/**` runs no lint, no unit tests and no e2e — silently
   (`.agents/docs/architecture/testing-strategy.md` §What CI gates). In-repo work branches on
   origin and merges into `main`; `CONTRIBUTING.md` describes a fork path, which addresses outside
   contributors. There is no changeset: `CHANGELOG.md` is the record, and the GitHub release body is a copy
   of its new section.

6. **Land one release at a time.** The workflow's concurrency group is per-workflow-per-ref with
   `cancel-in-progress: true` (`release.yaml:10-12`), so a second merge cancels the release in flight. A
   `build` that is cancelled or fails leaves `publish-npm` and `release` reported as **skipped** rather
   than failed — `.agents/skills/odc-release/SKILL.md` reads that job tree; runs `30389796062` and
   `30378779338` show that tree.

7. **Watch the run:** `gh run watch`, or `gh run list --workflow=Release --limit 1` for its id.

   | Job           | What it does                                                                                                                                                                              | Skips when                                                                                                                                              |
   | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `configure`   | derives the build matrix from `docker compose config` through the jq filter described below; runs `release.cjs` for the release plan                                                      | never; **fails** on a ref that is neither `main` nor `release/<major>.<minor>`, and on a release branch whose version is already tagged or off its line |
   | `validate`    | `pnpm lint`                                                                                                                                                                               | never                                                                                                                                                   |
   | `build`       | buildx `linux/amd64,linux/arm64` per matrix leg, pushing the tags the plan enables, with `RELEASE_VERSION` as a build arg                                                                 | never                                                                                                                                                   |
   | `publish-npm` | turbo-builds each publishable package and its closure, then publishes each version not already on npm under the plan's `npmTag`, over OIDC (no `NPM_TOKEN`), in the `release` environment | `release` is `false` — the version is already tagged                                                                                                    |
   | `release`     | extracts the `## ${version}` section of `CHANGELOG.md` (`scripts/changelog.ts section`) and creates the GitHub release tagged `v${version}` on the built commit, with it as the body      | `release` is `false`, or any of its `needs` skipped or failed                                                                                           |

   `release` **fails** — not skips — with `CHANGELOG.md has no section for <version>` when the bump
   bypassed `increment-version.ts`. That is deliberate: an empty body would look like every release
   before the changelog existed and would hide the bypass.

   **Only `main` and `release/*` publish.** `release.cjs` fails `configure` on a dispatch from any
   other ref, but the dispatched ref supplies its own copy of the workflow, so that check stops
   accidents only. The hosted configuration that holds against a branch is listed in
   `.agents/docs/architecture/release-channels.md` §Release branches, and it must stay in place. The
   `Release tags` ruleset cannot restrict tag creation: `Create Release` makes the tag with
   `GITHUB_TOKEN`, and GitHub refuses the Actions app as a repository ruleset bypass actor.

   **Four images ship: api, gateway, web and playground.** The filter keeps only compose services
   declaring **both** `build` and `image`, so a new image is a compose service with both keys and
   nothing in the workflow. `scripts/publish.sh` is not a substitute: it `docker push`es the local
   `:latest` tag of all four images, builds nothing and pushes no version tag, so it replaces the
   CI-published `latest` tags with whatever is in your daemon. It is wired to no workflow.

   **The `v` belongs to GitHub only.** Image tags are pushed bare (`type=raw,value=${version}`); the
   leading `v` appears on the GitHub tag alone, and `RELEASE_VERSION` cannot carry one
   (`packages/release-info/AGENTS.md`).

8. **Expect an `edge` build on every push to `main`, and a release only after a bump.** Without a
   bump, `v<version>` is already a tag, so the run pushes `edge` and `sha-<7>` and skips
   `publish-npm` and `release`. The decision reads git tags, never GHCR or npm — do not reintroduce a
   gate that depends on registry state; `.agents/docs/architecture/release-channels.md` says why.

9. **Confirm all three artifacts carry the new version** — the images, the npm packages, the GitHub
   release. Done when the `## Verify` block below is clean for each.

10. **If npm did not move, cut another patch.** A `Skipping` line for every package means the bump
    bypassed `scripts/increment-version.ts`; so does a red `release` job reporting no changelog section.
    Run the script properly, commit, merge again — re-running a version the registry already has
    publishes nothing, so the fix is always forward.

## From a release branch

A patch to a line `main` has moved past. The decision rules are in
`.agents/docs/architecture/release-channels.md`; these are only the steps.

1. **Cut `release/<major>.<minor>` from the commit the line's images were built from**, and push it.
   The images' `org.opencontainers.image.revision` label names that commit; the `v*` tag may be older.
   **A commit older than release-branch support (#1822) carries the old machinery**: its `configure`
   refuses any ref but `main`, and its `ci.yaml` gates no PR to the branch. Make the branch's first
   commit, pushed directly, `git checkout origin/main -- .github/workflows/release.yaml
.github/workflows/ci.yaml .github/scripts/release.cjs`; no later step works without it.
2. **Pin the base image on the branch.** Replace `FROM node:lts-krypton` in every Dockerfile with the
   exact version, as a `fix:` commit; the floating tag on a branch would rebuild an old release on
   whatever Node is newest. To find the version, run `docker run --rm node:lts-krypton node --version`
   on the day you cut it. `.agents/docs/architecture/release-channels.md` §Base images says why.
3. **Land each fix on `main` first, then take it onto the branch by a PR against the branch.**
   `ci.yaml` gates that PR as it gates one to `main`.
4. **Bump on the branch with `./scripts/increment-version.ts --bump patch`**, steps 3–5 above, but the
   PR's base is the branch. `git describe` on the branch finds the line's last tag, so the changelog
   range is the branch's own commits.
5. **Dispatch: `gh workflow run Release --ref release/<major>.<minor>`.** The dispatched ref supplies
   the workflow, so this needs the machinery from step 1. A push to the branch releases nothing. `configure` fails if the version is already tagged or is not on the branch's line.
6. **Merge the branch back into `main`.** That carries the `CHANGELOG.md` section and makes the tag
   reachable, so the next range on `main` starts after it. Keep `main`'s version fields on a conflict
   when `main` is ahead, and keep `main`'s floating `FROM node:lts-krypton` lines.

## Verify

```sh
node -p "require('./package.json').version" && scripts/list-publishable.sh  # root first, then that same version on every row
gh run list --workflow=Release --limit 1                                    # the run for your merge commit
gh run view <run-id> --json jobs -q '.jobs[]|"\(.name)\t\(.conclusion)"'    # every build leg, publish-npm and release: success
gh run view <run-id> --log | grep -E 'Publishing|Skipping'
npm view @opendatacapture/runtime-v1@<version> version                     # the version you just cut
pnpm exec tsx scripts/changelog.ts section <version>                        # the section the release body was cut from; exit 1 if absent
gh release view v<version> --json tagName,isLatest                          # tagged with the leading v; isLatest per the plan
git ls-remote origin "refs/tags/v<version>"                                 # the sha the run built, not main's head when cut from a branch
npm dist-tag ls @opendatacapture/runtime-v1                                 # latest, or release-<major>.<minor>, on <version>
```

`Publishing <name>@<version>` for every package is the first run after a bump. `Skipping <name>@<version>
(already published)` is the **correct** output when re-running a release that already published — that
version guard is what makes a re-run safe — and is a defect only on the first run after a bump.

The images have no read-only command of their own:
`gh api /orgs/DouglasNeuroinformatics/packages/container/open-data-capture-api/versions` answers
`403 … read:packages scope` on a token without that scope, which is the token and not a missing image. The
`build` conclusions in the job list above are the check.

Independent of any one release: each app Dockerfile installs its own global `turbo@<version>` for the
image build, separate from the root `turbo` devDependency — move all four pins together so the images
build on one turbo.
