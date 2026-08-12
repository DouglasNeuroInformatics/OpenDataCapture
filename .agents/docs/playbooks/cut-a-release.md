# Cut a release

A release is one version bump merged to `main`. Everything after the merge is automatic:
`.github/workflows/release.yaml` builds and pushes the container images, publishes the npm packages, and
creates the GitHub release. Which packages are publishable is in `.agents/docs/workspace-map.md`; what CI
gates is in `.agents/docs/architecture/testing-strategy.md`; the `RELEASE_VERSION` build-arg contract is in
`packages/release-info/AGENTS.md`. This file is only the order of operations.

**Plan around this:** the root `package.json` version _is_ the release identity —
`.github/scripts/release.cjs` reads it and it becomes both the container tag and the GitHub tag
`v${version}` — but every npm package publishes at **its own** `package.json` version, and the publish
step skips any version already on the registry (`release.yaml:132-139`):

```
Skipping @opendatacapture/runtime-v1@<version> (already published)
```

So a bump that touches only the root leaves the packages behind and `publish-npm` reports **success while
publishing nothing**. `scripts/increment-version.sh` rewrites the root plus every path
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
   `increment-version.sh` derives the next version from the root `package.json` in your working tree
   alone, so a branch trailing `main` computes a version that is already released — the run then re-pushes
   the same image tags, updates the same GitHub release, and prints `Skipping` for every package. Done
   when `git merge-base --is-ancestor origin/main HEAD` exits 0.

3. **Run `./scripts/increment-version.sh` from the repo root.** There is no `pnpm` script for it — invoke
   the path; prerequisites for anything under `scripts/` are in `.agents/docs/playbooks/run-locally.md`.
   Its `select` prompt offers `major`/`minor`/`patch`/`quit`, then a `y/N` confirmation, then it rewrites
   the root `package.json` plus every path `scripts/list-publishable.sh` returns. Done when its output
   carries one `Updated …` line per file and ends `Done! All packages set to <version>`.

4. **Confirm the lockstep before you commit.**

   ```sh
   node -p "require('./package.json').version" && scripts/list-publishable.sh
   ```

   `list-publishable.sh` never prints the root, so a uniform version column proves nothing on its own —
   that is exactly what a root-only bump looks like. Done when the root version on the first line equals
   the second tab-separated field of every row below it. No check enforces that equality.

5. **Commit the version files in one commit and open the PR with `main` as its base.** `ci.yaml` fires on
   `pull_request` to `main` and on `workflow_dispatch`, never on a push, so a PR based on `dev` or any
   other branch runs no lint, no unit tests and no e2e — silently. In-repo work branches on origin and
   merges into `main`; `CONTRIBUTING.md` describes a fork path, which addresses outside contributors.
   There is no changeset and no changelog file: the generated GitHub release is the whole record.

6. **Land one release at a time.** The workflow's concurrency group is per-workflow-per-ref with
   `cancel-in-progress: true` (`release.yaml:9-11`), so a second merge cancels the release in flight. A
   `build` that is cancelled or fails leaves `publish-npm` and `release` reported as **skipped** rather
   than failed — `.agents/skills/odc-release/SKILL.md` reads that job tree; runs `30389796062` and
   `30378779338` show that tree.

7. **Watch the run:** `gh run watch`, or `gh run list --workflow=Release --limit 1` for its id.

   | Job           | What it does                                                                                                                                       | Skips when                                                   |
   | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
   | `configure`   | derives the build matrix from `docker compose config` through the jq filter described below; runs `release.cjs` for `version` and `should_release` | never                                                        |
   | `validate`    | `pnpm lint`                                                                                                                                        | never                                                        |
   | `build`       | buildx `linux/amd64,linux/arm64` per matrix leg, pushing `latest` and the bare version, with `RELEASE_VERSION` as a build arg                      | never — guards on `should_release`, which is always `'true'` |
   | `publish-npm` | turbo-builds each publishable package and its closure, then publishes each version not already on npm, over OIDC (no `NPM_TOKEN`)                  | never — same guard                                           |
   | `release`     | creates the GitHub release tagged `v${version}`                                                                                                    | any of its `needs` skipped or failed                         |

   **No playground image ships.** The filter keeps only compose services declaring **both** `build` and
   `image`, and `playground` declares no `image:` key. `scripts/publish.sh` is not the way to add it back:
   it `docker push`es the local `:latest` tag of all four images, builds nothing and pushes no version
   tag, so it replaces the three CI-published `latest` tags with whatever is in your daemon. It is wired
   to no workflow.

   **The `v` belongs to GitHub only.** Image tags are pushed bare (`type=raw,value=${version}`); the
   leading `v` appears on the GitHub tag alone, and `RELEASE_VERSION` cannot carry one
   (`packages/release-info/AGENTS.md`).

8. **Expect a full build even when nothing changed.** `release.cjs` reads the root `package.json`
   version and sets `should_release` to `'true'` unconditionally — by design, and it reads nothing
   outside the repository to decide. Pushing without a bump re-pushes the same image tags and updates
   the existing GitHub release in place rather than skipping. That is the intended behaviour, not a
   finding.

   It used to ask GHCR which version carried the `latest` tag and skip when that matched. The
   comparison never fired — the regex required a leading `v` and `build` pushes bare tags — while the
   lookup threw `Failed to find package '<name>' with tag 'latest'` and failed `configure` outright
   whenever no image carried `latest`. Deleting a bad release does exactly that: `build` pushes
   `latest` and the version onto one manifest, so removing that version removes both tags. Do not
   reintroduce a gate that depends on registry state — a deleted release must never be able to wedge
   the next one.

9. **Confirm all three artifacts carry the new version** — the images, the npm packages, the GitHub
   release. Done when the `## Verify` block below is clean for each.

10. **If npm did not move, cut another patch.** A `Skipping` line for every package means the bump
    bypassed `scripts/increment-version.sh`. Run the script properly, commit, merge again — re-running a
    version the registry already has publishes nothing, so the fix is always forward.

## Verify

```sh
node -p "require('./package.json').version" && scripts/list-publishable.sh  # root first, then that same version on every row
gh run list --workflow=Release --limit 1                                    # the run for your merge commit
gh run view <run-id> --json jobs -q '.jobs[]|"\(.name)\t\(.conclusion)"'    # every build leg, publish-npm and release: success
gh run view <run-id> --log | grep -E 'Publishing|Skipping'
npm view @opendatacapture/runtime-v1 version                                # the version you just cut
gh release view v<version>                                                  # exists, tagged with the leading v
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
