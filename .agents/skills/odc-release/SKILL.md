---
name: odc-release
description: Ship a release of Open Data Capture — bump the version, publish the npm packages and the GHCR images, tag it. Use when a merge to main produced no new version, or when a release run logs `Skipping <pkg>@<version> (already published)`.
---

A release is **one version bump merged to `main`** — after that `.github/workflows/release.yaml` builds the
images, publishes the npm packages and creates the GitHub release with no further input. It also fires on
`workflow_dispatch`, which releases again with no bump and no merge. That GitHub release is a tag with an empty
body, and there is no changelog and no changeset, so nothing records what shipped — put that in the PR carrying
the bump. Which workspaces publish: `.agents/docs/workspace-map.md`; how each artifact is selected: the job
table in `.agents/docs/playbooks/cut-a-release.md`.

The failures here are silent — nothing goes red.

## The silent green: a root-only bump publishes nothing

Every publishable package must carry the root version. Each publishes at **its own** `package.json` version and
the publish step skips a version npm already carries, so a bump that moved the root alone leaves `publish-npm`
green and npm untouched. Nothing compares those files, so **you are the lockstep check**: after the bump, every
row of `scripts/list-publishable.sh` must carry the version in the root `package.json`, which that script never
prints. `Skipping <pkg>@<version> (already published)` is the ordinary output of any push that carried no bump —
a symptom only in the run for the commit that was supposed to bump. The mechanism, and the command that compares
the two: `.agents/docs/playbooks/cut-a-release.md`.

## `pnpm lint` is the only test the release path runs

The `validate` job runs `pnpm lint` and stops there (`release.yaml:37-52`): the merge is the last moment a test
runs against this code, and after it a red suite ships silently. Get the branch green first with
`.agents/skills/odc-done/SKILL.md`, and — since nothing you run locally builds the Docker images, and `build`
gates both publishes — require `gh run list --workflow=Release --limit 1` green on `main` before you bump. What
CI does and does not gate: `.agents/docs/architecture/testing-strategy.md`.

## `skipped` is the shape of a release that never happened

`publish-npm` and `release` inherit the default `success()` gate over their `needs`, so a `build` that dies takes
both of them down and GitHub reports them **skipped** rather than failed (`release.yaml:53-56,92-100,140-145`).
Read the cause off the run, not off the missing artifact:

- one leg `failure` and its siblings `cancelled` — `strategy.fail-fast: true` (`release.yaml:57-59`): an image
  that does not build, not a collision.
- the whole run `cancelled` — the per-ref concurrency group with `cancel-in-progress: true`
  (`release.yaml:9-11`): a second merge landed while it was in flight.

Recover by fixing the failing job and re-running the run (`gh run rerun <id>`); the publish step's version guard
makes that safe. Cut another patch only when npm needs a version it has never seen.

Done when the answer to "the merge produced no new version" names the job that owns the missing artifact, quoted
from the run.

## Known drifts to name, not to repair

Machinery oddities, verified and already understood — say so in your reply and carry on. A red `build` is not one
of them; that is a failure to fix.

- Every push to `main` performs a full release — `should_release` is always `'true'`.
- No playground image ships — the matrix filter drops it.
- Nothing enforces the version lockstep; you do, above.

Done when every release-machinery oddity you hit is either in that list or in your reply — the reason for any one
of them is in `.agents/docs/playbooks/cut-a-release.md`.

## The procedure

`.agents/docs/playbooks/cut-a-release.md` — open it before the first command and follow it end to end. It owns
the order of operations, `scripts/increment-version.sh` (no `pnpm` script — run the path), the merge, watching
the run, and the `## Verify` block. That script reads a `select` menu and a `y/N` from stdin; with none it prints
the menu and dies with `newVersion: unbound variable`, exit 1, nothing written, so pipe the answers:
`printf '3\ny\n' | ./scripts/increment-version.sh` (`3` is `patch`). Hand-editing a version field is how the
drift this skill exists to prevent gets made.

Done when the playbook's `## Verify` block has been run and all three artifacts report the new version. A green
run is not the criterion.
