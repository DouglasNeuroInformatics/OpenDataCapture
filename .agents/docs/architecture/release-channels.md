# Release channels

What each GHCR image tag, npm publish and GitHub release means, and which run moves it. The policy
these implement, written for deployers, is `docs/en/5-reference/5.10-versioning.md`; cutting a release
is `.agents/docs/playbooks/cut-a-release.md`. This file is the model both act on.

> **A version tag is immutable, and `latest` and `<major>` move only with a release.** Deployments
> pull `<major>` by default (`RELEASE_CHANNEL` in `.env.template`). Anything that re-pushes a released
> tag changes what every one of them runs on its next pull, so only a run that also creates the
> `v<version>` git tag may push `<version>`, `<major>` or `latest`.

## The decision is `planRelease`, and it reads only the repository

`.github/scripts/release.ts` exports `planRelease({ ref, tags, version })`. `release.yaml`'s
`configure` job runs `scripts/plan-release.ts`, which calls it with the pushed or dispatched ref, every
`v*` git tag and the root `package.json` version, and every later job acts on its outputs. It never
reads GHCR or npm: a deleted image or package must not be able to wedge the next release, and the GHCR
lookup an earlier version made did exactly that.

| Output    | Meaning                                                                   |
| --------- | ------------------------------------------------------------------------- |
| `release` | `v<version>` is not a tag yet, so this run publishes it                   |
| `latest`  | `release` on `main`: moves `latest` on GHCR and GitHub, and publishes npm |
| `edge`    | the ref is `main`                                                         |
| `major`   | `<major>` of the version, the image tag every release of that major moves |

**One Release runs at a time, across every ref.** The plan is only as fresh as its tag snapshot, so
`release.yaml` uses one concurrency group with no ref in it and `cancel-in-progress: false`. GitHub
keeps one waiting run per group, so a third run cancels the waiting one. That loses nothing on `main`:
the next push finds the version still untagged and releases it. A full re-run plans again from fresh
tags; `gh run rerun --failed` reuses the stale plan, so it is never used on this workflow.

**A release is the newest of its line.** On `main`, `planRelease` refuses an untagged version below
any tag, so `latest` and npm never move back. On a release branch it refuses one below a tag of the
same major, so a late retry cannot move `<major>` back.

## What each run publishes

| Run                                        | GHCR image tags                                     | npm              | GitHub release              |
| ------------------------------------------ | --------------------------------------------------- | ---------------- | --------------------------- |
| push to `main`, version already tagged     | `edge`, `sha-<7>`                                   | nothing          | nothing                     |
| push to `main`, new version                | `edge`, `sha-<7>`, `<version>`, `<major>`, `latest` | every package    | `v<version>`, marked latest |
| dispatch on `release/<major>`, new version | `<version>`, `<major>`                              | skipped, noticed | `v<version>`, not latest    |
| dispatch on `release/<major>`, otherwise   | — `configure` fails                                 | —                | —                           |
| any other ref                              | — `configure` fails                                 | —                | —                           |

**npm publishes from `main` only, so every npm publish is a `latest` publish.** There is no other
dist-tag. A release from a branch skips `publish-npm`, and `configure` says so in a notice. The
`release` job's `if` lets it run past that skip but not past a failed publish.

**The GitHub tag goes on the commit the run built.** `Create Release` sets
`target_commitish: ${{ github.sha }}`; without it `softprops/action-gh-release` creates a new tag on
the default branch, which for a release branch is a different commit.

**`edge` builds carry the last version.** `RELEASE_VERSION` must be `<major>.<minor>.<patch>`
(`packages/release-info/AGENTS.md`), so an `edge` image reports the root `package.json` version even
though it is newer code. The `org.opencontainers.image.revision` label is the exact commit.

## Release branches

**A release branch is `release/<major>`, and it exists only for a superseded major.** `planRelease`
refuses a dispatch on `release/<major>` until a higher major is tagged, so a branch release can never
plan `latest`, and refuses a version from another major. It is cut from the last release of that
major once the next major ships from `main`, and released only by
`gh workflow run Release --ref release/<major>`. A push to it publishes nothing. Changes land on it by a
pull request, which `ci.yaml` gates as it gates one to `main`.

**A release branch takes fixes only.** `scripts/increment-version.ts` asks `release.ts`'s
`isSupersededMajor` whether the current major is superseded; if it is, it offers and accepts a patch
bump only, and refuses a breaking or `feat` commit in range outright. On `main`, once a breaking
commit is in range, it accepts a major bump only.

After a release from a branch, merge the branch back into `main`. That carries its `CHANGELOG.md`
section and makes its tag reachable, so `scripts/changelog.ts` on `main` starts the next range at it.

**What holds a branch back is hosted configuration, not this file.** The `release` environment allows
deployments from `main` only, each npm trusted publisher names `release.yaml` and that environment,
and the `Release tags` ruleset lets only admins move or delete a `v*` tag. GHCR is not covered: any
workflow on any branch can push an image with `GITHUB_TOKEN`.

## A major bump moves two more files

`increment-version.ts` on a major bump rewrites `RELEASE_CHANNEL` in `.env.template` to the new major,
and edits the table between `<!-- support-table:start -->` and `<!-- support-table:end -->` in
`docs/en/5-reference/5.10-versioning.md`: a row for the new major, and the previous major's superseded
month and end of support, 18 months on (`SUPPORT_WINDOW_MONTHS`). It dates both by the month of the
bump, which is the month the release ships only if the PR merges that month.

## Base images

**`main` floats; a release branch pins.** On `main` every Dockerfile builds `FROM node:lts-krypton`,
so each `edge` build and each release from `main` picks up the newest Node 24 patch with no commit. A
release branch replaces that line with the exact version, `FROM node:<major>.<minor>.<patch>`, in a
`fix:` commit before its first bump, so a re-run of an old release builds the same runtime. A Node
security release for a supported major is therefore a `fix:` commit on its branch that moves the pin,
then a patch bump; nothing updates a branch's pin for you.
