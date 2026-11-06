# Release channels

What each GHCR image tag, npm dist-tag and GitHub release means, and which branch moves it. Cutting a
release is `.agents/docs/playbooks/cut-a-release.md`; this file is the model it acts on.

> **`latest` is a tagged release, never a branch head.** Default deployments pull `latest`
> (`RELEASE_CHANNEL=latest` in `.env.template`). Anything that moves `latest` changes what every
> default deployment runs on its next pull, so only a run that also creates a `v*` tag may move it.

## The decision is `planRelease`, and it reads only the repository

`.github/scripts/release.cjs` exports `planRelease({ ref, tags, version })`. `release.yaml`'s
`configure` job calls it with the dispatched or pushed ref, every `v*` git tag and the root
`package.json` version, and every later job acts on its outputs. It never reads GHCR or npm: a deleted
image or package must not be able to wedge the next release (the GHCR lookup it replaced did exactly
that).

**One Release runs at a time, across every ref.** The plan is only as fresh as its tag snapshot, so
`release.yaml` uses one concurrency group with no ref in it. Without it, a `release/2.5` dispatch and a
release from `main` overlap, both see neither tag, both plan `latest`, and the one that finishes last
owns `latest`; or two refs release the same version from different commits. A full re-run plans
again from fresh tags; `gh run rerun --failed` does not, so it is never used on this workflow.

**A release must be the newest of its line.** `planRelease` refuses an untagged version that is lower
than a tag on its own line (`2.5.3` once `v2.5.4` exists), so a late retry cannot move the `2.5` image
tag or the `release-2.5` dist-tag back.

**A re-run never leaves an npm channel behind.** A re-run planned after a newer release can carry another
`npmTag` than the run that published, and trusted publishing cannot move a dist-tag. So
`.github/scripts/publish-npm.cjs` skips a published version only while `npmTag` points at it, and fails
otherwise — the fix is a fresh patch, not a green run with `release-<major>.<minor>` on an older version.

| Output    | Meaning                                                                                    |
| --------- | ------------------------------------------------------------------------------------------ |
| `release` | `v<version>` is not a tag yet, so this run publishes it                                    |
| `latest`  | `release`, and `<version>` is higher than every `v<major>.<minor>.<patch>` tag             |
| `edge`    | the ref is `main`                                                                          |
| `channel` | `<major>.<minor>`                                                                          |
| `npmTag`  | `latest` when `latest`, else `release-<major>.<minor>`; npm rejects a semver-like dist-tag |

## What each run publishes

| Run                                                           | GHCR image tags                                        | npm                          | GitHub release        |
| ------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------- | --------------------- |
| push to `main`, version already tagged                        | `edge`, `sha-<7>`                                      | nothing                      | nothing               |
| push to `main`, new version                                   | `edge`, `sha-<7>`, `<version>`, `<channel>`, `latest`¹ | every package under `npmTag` | `v<version>`, latest¹ |
| dispatch on `release/<major>.<minor>`, new version            | `<version>`, `<channel>`, `latest`¹                    | every package under `npmTag` | `v<version>`, latest¹ |
| dispatch on `release/<major>.<minor>`, version already tagged | — `configure` fails: bump first                        | —                            | —                     |
| any other ref                                                 | — `configure` fails                                    | —                            | —                     |

¹ only when the `latest` output is `true`.

**A release branch's version must sit on its line.** `planRelease` fails `configure` when the
version on `release/2.5` is not `2.5.*`, so a merge from `main` that brought a version bump with it
cannot publish under the wrong channel.

**The GitHub tag goes on the commit the run built.** `Create Release` sets
`target_commitish: ${{ github.sha }}`; without it `softprops/action-gh-release` creates a new tag on
the default branch, which for a release branch is a different commit.

**`edge` builds carry the last version.** `RELEASE_VERSION` must be `<major>.<minor>.<patch>`
(`packages/release-info/AGENTS.md`), so an `edge` image reports the root `package.json` version even
though it is newer code. The `org.opencontainers.image.revision` label is the exact commit.

## Release branches

A release branch is `release/<major>.<minor>`, cut from the commit the line's images were built from,
and released only by `gh workflow run Release --ref release/<major>.<minor>`. A push to it publishes
nothing. Changes land on it through a pull request, which `ci.yaml` gates as it gates one to `main`.

After a release from a branch, merge the branch back into `main`. That carries its `CHANGELOG.md`
section and makes its tag reachable, so `scripts/changelog.ts` on `main` starts the next range at it.

What holds a branch other than these two is hosted configuration: the `release` environment's
deployment-branch policy (`main` and `release/*`), each npm trusted publisher (names `release.yaml`
and the `release` environment), and the `Release tags` ruleset (only admins move or delete a `v*`
tag). GHCR is not covered — any workflow on any branch can push an image with `GITHUB_TOKEN`.

## Base images

**`main` floats; a release branch pins.** On `main` every Dockerfile builds `FROM node:lts-krypton`,
so each `edge` build and each release from `main` picks up the newest Node 24 patch with no commit. A
release branch replaces that line with the exact version, `FROM node:<major>.<minor>.<patch>`, in a
`fix:` commit before its first bump, so a re-run of an old release builds the same runtime. A Node
security release for a maintained line is therefore a `fix:` commit on its branch that moves the pin,
then a patch bump; nothing updates a branch's pin for you.
