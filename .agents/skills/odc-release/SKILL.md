---
name: odc-release
description: Ship a release of Open Data Capture — bump the version, publish the npm packages and the GHCR images, tag it. Use when a merge to main produced no new version, when patching an older line from a release/<major>.<minor> branch, or when a release run logs `Skipping <pkg>@<version> (already published)`.
---

A release is **one version bump merged to `main`**, or bumped on a `release/<major>.<minor>` branch and
dispatched — after that `.github/workflows/release.yaml` builds the images, publishes the npm packages and
creates the GitHub release with no further input. A run is a release only when `v<version>` is not a git tag
yet; any other run from `main` pushes only the `edge` and `sha-<7>` images, and a dispatch from any other ref fails
`configure`. What each tag means and which run moves `latest`:
`.agents/docs/architecture/release-channels.md`. The release body is the new version's
section of `CHANGELOG.md`, which `scripts/increment-version.ts` generates from the commits since the last tag;
the `release` job fails, rather than publishing an empty body, when that section is missing. Which workspaces publish: `.agents/docs/workspace-map.md`; how each artifact is selected: the job
table in `.agents/docs/playbooks/cut-a-release.md`.

The failures here are silent — nothing goes red.

## The silent green: a root-only bump publishes nothing

Every publishable package must carry the root version. Each publishes at **its own** `package.json` version and
the publish step skips a version npm already carries, so a bump that moved the root alone leaves `publish-npm`
green and npm untouched. Nothing compares those files, so **you are the lockstep check**: after the bump, every
row of `scripts/list-publishable.sh` must carry the version in the root `package.json`, which that script never
prints. `Skipping <pkg>@<version> (already published)` is the ordinary output of a re-run of a release that
already published — a symptom only in the first run after a bump. The mechanism, and the command that compares
the two: `.agents/docs/playbooks/cut-a-release.md`.

## `pnpm lint` is the only test the release path runs

The `validate` job runs `pnpm lint` and stops there (`release.yaml:44-59`): the merge is the last moment a test
runs against this code, and after it a red suite ships silently. Get the branch green first with
`.agents/skills/odc-done/SKILL.md`, and — since nothing you run locally builds the Docker images, and `build`
gates both publishes — require `gh run list --workflow=Release --limit 1` green on `main` before you bump. What
CI does and does not gate: `.agents/docs/architecture/testing-strategy.md`.

## `skipped` is the shape of a release that never happened

`publish-npm` and `release` inherit the default `success()` gate over their `needs`, so a `build` that dies takes
both of them down and GitHub reports them **skipped** rather than failed (`release.yaml:60-62,109-112,156-160`).
On a run with no bump the two are skipped by design — `configure`'s `release` output is `false`; read it
before anything else. Otherwise read the cause off the run, not off the missing artifact:

- one leg `failure` and its siblings `cancelled` — `strategy.fail-fast: true` (`release.yaml:63-64`): an image
  that does not build, not a collision.
- the whole run `cancelled` — the per-ref concurrency group with `cancel-in-progress: true`
  (`release.yaml:10-12`): a second merge landed while it was in flight.

Recover by fixing the failing job and re-running the run (`gh run rerun <id>`); the publish step's version guard
makes that safe. Cut another patch only when npm needs a version it has never seen.

Done when the answer to "the merge produced no new version" names the job that owns the missing artifact, quoted
from the run.

## Known drifts to name, not to repair

Machinery oddities, verified and already understood — say so in your reply and carry on. A red `build` is not one
of them; that is a failure to fix.

- Every push to `main` builds and pushes `edge` and `sha-<7>`, release or not, on purpose. The release decision
  reads git tags only, so no registry state can wedge it; do not add a gate that reads GHCR or npm back.
- Nothing enforces the version lockstep; you do, above.

## Pulling a bad release takes `latest` with it

`build` pushes `latest` and the bare version onto **one** manifest, so deleting that GHCR package version deletes
both tags. Delete the two most recent releases and the images have no `latest` at all — every
`docker pull ghcr.io/douglasneuroinformatics/open-data-capture-api:latest` fails until the next release restores it,
and nothing in this repo reports that. Cut the replacement release promptly, or retag a known-good version by hand.
Deleting the GitHub release and its `v<version>` tag is independent of the images and of npm, where a version older
than 72h cannot be unpublished at all — pulling a release means pulling it in three places, and only the images
carry `latest`. **Deleting the `v<version>` tag re-arms the release:** the next push to `main` at that version
publishes it again, because the tag's absence is the whole release decision.

Done when every release-machinery oddity you hit is either in that list or in your reply — the reason for any one
of them is in `.agents/docs/playbooks/cut-a-release.md`.

## The procedure

`.agents/docs/playbooks/cut-a-release.md` — open it before the first command and follow it end to end. It owns
the order of operations, `scripts/increment-version.ts` (no `pnpm` script — run the path), the merge, watching
the run, and the `## Verify` block. That script prompts for the bump and for a `y/N`; with no terminal on stdin
it exits 1 having written nothing, so pass the answers as flags:
`./scripts/increment-version.ts --bump patch --yes`, plus `--commit` to have it make the
`chore: release v<version>` commit too. Hand-editing a version field is how the drift this skill exists to
prevent gets made.

Done when the playbook's `## Verify` block has been run and all three artifacts report the new version. A green
run is not the criterion.
