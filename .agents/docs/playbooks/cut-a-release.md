# Cut a release

A release is one version bump merged to `main`, or merged to a `release/<major>` branch and
dispatched (§From a release branch). `.github/workflows/release.yaml` then builds and pushes the
images, publishes the npm packages (from `main` only), and creates the GitHub release, whose body is
the new version's section of `CHANGELOG.md`. What each image tag means and which run moves it is
`.agents/docs/architecture/release-channels.md`; which packages publish is in
`.agents/docs/workspace-map.md`; the `RELEASE_VERSION` build-arg contract is in
`packages/release-info/AGENTS.md`.

**Plan around this:** the root `package.json` version is the release identity (the image tag and the
GitHub tag `v${version}`), but each npm package publishes at **its own** `package.json` version, and
the publish step skips any version npm already has. A bump that moves only the root therefore leaves
`publish-npm` green while publishing nothing. `scripts/increment-version.ts` is the only thing that
keeps the root and every `scripts/list-publishable.sh` package in lockstep; nothing in CI compares
them. Never hand-edit a version field.

## Steps

1. **Get the branch green before you bump.** Nothing after the PR runs a test against this code: the
   release's `validate` job runs `pnpm lint` only. Run `pnpm check`
   (`.agents/skills/finishing-changes/SKILL.md`); root `pnpm test` has no turbo `^build` behind it, so
   run `pnpm build` once first. `pnpm lint` rewrites files, so commit any churn on its own before the
   bump. Also confirm
   `gh run list --workflow=Release --limit 1` is green on `main`: nothing local builds the Docker
   images, and `build` gates both publishes.

2. **Bump from a branch that contains `main`** (`git fetch origin && git merge origin/main`; done when
   `git merge-base --is-ancestor origin/main HEAD` exits 0). The script derives the next version from
   your working tree, so a branch behind `main` computes a version that is already released.

3. **Run `./scripts/increment-version.ts` from the repo root** (no `pnpm` script; Node runs the path).
   It recommends a bump from the commits since the last `v*` tag, strict SemVer (breaking → major,
   `feat` → minor), then prompts for the bump and for a commit. Without a terminal it exits 1 having
   written nothing unless given `--bump <major|minor|patch> --yes`; `--yes` leaves the commit prompt at
   no, so add `--commit` to have it commit too. It rewrites every version field, writes the
   `## <version>` section of `CHANGELOG.md` and regenerates `docs/en/6-changelog/changelog.md`, then
   asserts the lockstep. A commit message the changelog generator cannot parse fails the run
   (`Error: Commit <sha> does not follow the convention …`) and writes nothing: reword that commit.
   The menu offers only the bumps the support policy allows, and `--bump` refuses the rest: major
   alone once a breaking commit is in range, and patch alone on a superseded major, where a breaking
   or `feat` commit fails the run (`release-channels.md` §Release branches). A major bump also
   rewrites `.env.template` and the support table in `docs/en/5-reference/5.10-versioning.md`,
   checking both before it writes any file, and `--commit` takes both. Done when the output ends `✓ All <n> packages report <version>`, or on a major bump
   with the two lines after it.

4. **Confirm the lockstep**, which matters whenever anything bypassed the script:

   ```sh
   node -p "require('./package.json').version" && scripts/list-publishable.sh
   ```

   `list-publishable.sh` never prints the root, so a uniform column alone is exactly what a root-only
   bump looks like. Done when the first line equals the second field of every row. Then read the new
   `CHANGELOG.md` section: it becomes the release body verbatim, and this PR is its only review. It
   lists `feat`, `fix`, `perf` and breaking commits only.

5. **Commit as `chore: release v<version>` and open the PR against the base the script names**,
   `main` or `release/<major>`. The script's own commit
   (`--commit`) takes the version files and both changelogs by explicit pathspec; it does not tag (the
   workflow tags `v${version}` on the GitHub release). `ci.yaml` runs only on a PR to `main` or a
   `release/**` branch, or a manual dispatch, so a PR based on any other branch gets no lint, tests or
   e2e.

6. **Land one release at a time.** One concurrency group spans every ref with
   `cancel-in-progress: false`: a run waits for the one in flight, and GitHub keeps one waiting run,
   so a third cancels it. A cancelled release from `main` is released by the next push, which finds
   its version still untagged; a cancelled branch dispatch has to be dispatched again.

7. **Watch the run:** `gh run watch`, or `gh run list --workflow=Release --limit 1` for its id.

   | Job           | Does                                                                                                                     | Does not run when                                                                                       |
   | ------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
   | `configure`   | derives the image matrix from `docker compose config`; `release.ts` plans the run from the root version and the git tags | never; **fails** on any ref but `main` and `release/<major>`, and on a branch dispatch the plan refuses |
   | `validate`    | `pnpm lint`                                                                                                              | never                                                                                                   |
   | `build`       | buildx `linux/amd64,linux/arm64` per image, pushing the tags the plan enables onto one manifest                          | `configure` or `validate` failed                                                                        |
   | `publish-npm` | builds each publishable package and publishes each version npm lacks, over OIDC in the `release` environment             | `build` did not succeed, or the plan's `latest` is `false` (no release, or a release from a branch)     |
   | `release`     | creates the GitHub release `v${version}` on the built commit from `scripts/changelog.ts section`                         | the plan's `release` is `false`, `build` did not succeed, or `publish-npm` ran and failed               |

   A `build` that fails or is cancelled shows `publish-npm` and `release` as **skipped**, not failed.
   On a push with no bump both are skipped by design; read `configure`'s `release` output first.
   Otherwise read the cause off the run: one `build` leg `failure` with its siblings `cancelled` is
   `fail-fast` on an image that does not build; the whole run `cancelled` before it started is a
   third run arriving while it waited (step 6).
   `release` **fails** with `CHANGELOG.md has no section for <version>` when the bump bypassed the
   script, deliberately, rather than publishing an empty body.

   **Images:** every compose service in `docker-compose.yaml` with both `build` and `image` ships
   (today api, gateway, web and playground), so a new image needs nothing in the workflow. Version
   tags are bare; the `v` is on the GitHub tag only. `scripts/publish.sh` is wired to nothing and is not a
   substitute: it pushes your daemon's local `:latest` of all four over the CI-published ones.

   **`release.ts` refusing other refs stops accidents only**, since a dispatched ref supplies its
   own workflow. The hosted configuration that does the enforcing is listed in
   `release-channels.md` §Release branches and must stay. The `Release tags` ruleset cannot restrict
   tag creation, because GitHub refuses the Actions app as a bypass actor.

8. **Expect an `edge` build on every push to `main`, and a release only after a bump.** Without a
   bump `v<version>` is already a tag, so the run pushes `edge` and `sha-<7>` and skips `publish-npm`
   and `release`. The decision reads git tags, never GHCR or npm; do not add a gate that reads a
   registry back, or a deleted release can wedge the next one.

9. **Confirm all three artifacts carry the new version** with `## Verify`.

## Recover

- **`build` failed or was cancelled:** fix it and `gh run rerun <run-id>`, the whole run. The publish
  step's version guard makes a re-run safe. Never `--failed`: it skips `configure` and reuses a plan
  whose tag snapshot may be stale.
- **npm printed `Skipping` for every package on the first run after a bump, or `release` reported no
  changelog section:** the bump bypassed the script. Run it properly and merge another patch; npm
  never re-publishes a version it has.
- **Pulling a bad release** means three independent places. Deleting the image version also deletes
  `<major>` and `latest`, which sit on the same manifest, so every pull of either fails until you cut
  the replacement or retag a known-good version by hand. Deleting the `v<version>` tag re-arms the
  release: the next push to `main` at that version publishes it again. Deleting the GitHub release and its `v` tag
  touches neither images nor npm, and npm generally refuses to unpublish a version older than 72h.

## From a release branch

A fix for a superseded major. The rules are `release-channels.md` §Release branches; these are only
the steps.

1. **Cut `release/<major>` from the last `v<major>.*` tag, once the next major has shipped**, and push
   it. `configure` refuses a dispatch on it before then.
2. **Pin the base image on the branch.** Replace `FROM node:lts-krypton` in every Dockerfile with the
   exact version, as a `fix:` commit; the floating tag would rebuild an old release on whatever Node
   is newest. Find it with `docker run --rm node:lts-krypton node --version` on the day you cut it.
3. **Land each fix on `main` first, then take it onto the branch by a PR against the branch.** The
   PR states which category of `docs/en/5-reference/5.10-versioning.md` §What each version receives
   the fix falls under; anything else does not go onto the branch.
4. **Bump on the branch**, steps 3–5 above. `git describe` finds the major's last tag, so the
   changelog range is the branch's own commits, and the script names the branch as the PR's base.
5. **Dispatch: `gh workflow run Release --ref release/<major>`.** `configure` fails if the version is
   already tagged or is not on the branch's major. npm is skipped, with a notice.
6. **Merge the branch back into `main`.** That carries the `CHANGELOG.md` section and makes the tag
   reachable, so the next range on `main` starts after it. Keep `main`'s version fields, support
   table and floating `FROM node:lts-krypton` lines on a conflict.

## Verify

```sh
node -p "require('./package.json').version" && scripts/list-publishable.sh  # root first, then that same version on every row
gh run list --workflow=Release --limit 1                                    # the run for your merge commit
gh run view <run-id> --json jobs -q '.jobs[]|"\(.name)\t\(.conclusion)"'    # every build leg, publish-npm and release: success (publish-npm skipped from a branch)
gh run view <run-id> --log | grep -E 'Publishing|Skipping'                  # Publishing <name>@<version> for every package
npm view @opendatacapture/runtime-v1 version                                # the version you just cut, on a release from main
pnpm exec tsx scripts/changelog.ts section <version>                        # the release body's source; exit 1 if absent
gh release view v<version> --json tagName,isLatest                          # tagged with the leading v; isLatest true from main, false from a branch
git ls-remote origin "refs/tags/v<version>"                                 # the sha the run built
```

The images have no read-only check: `gh api /orgs/DouglasNeuroinformatics/packages/container/...`
answers `403 … read:packages scope` on a token without that scope. The `build` conclusions are the
check.

Each app Dockerfile pins its own global `turbo@<version>`, separate from the root devDependency; move
all four pins together.
