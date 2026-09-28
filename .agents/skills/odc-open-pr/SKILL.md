---
name: odc-open-pr
description: Open a pull request against main for the current branch. Use when asked to open, create or raise a PR, and when a skill or sub-agent hands off its finished branch to be filed. Covers the body's required attribution block; reviewing an already-open PR is review-pr's job.
---

`.agents/skills/odc-done/SKILL.md` runs first — a PR is opened on a branch that already passed it.

Never open a PR from `main`; branch first, then push to `origin` with `-u`.

**The base is upstream `main`**, not the fork's — `origin` is `joshunrau/OpenDataCapture`, `upstream`
is `DouglasNeuroInformatics/OpenDataCapture`. Target anything else only when the user says so:

```sh
git fetch upstream
gh pr create --repo DouglasNeuroInformatics/OpenDataCapture --base main
```

## Attribution block

Every PR body ends with one `Co-Authored-By: ` line per distinct model across the branch's commits,
and nothing else after them. No "Generated with" line, no tool credit.

Read the models off the commits rather than from memory — a branch can carry commits from several
models, and a hand-written commit carries none. `.agents/skills/odc-commit/SKILL.md` is where those
trailers come from:

```sh
git log --format='%(trailers:key=Co-authored-by,valueonly)' upstream/main..HEAD | sed '/^$/d' | sort -u
```

Paste that output verbatim, one `Co-Authored-By: ` line per result, in the order printed. An empty
result means the branch is entirely the user's — then the body carries no attribution at all.

These lines are for the user reading the PR: GitHub credits co-authors only from commit trailers, so
duplicating them here changes no attribution and must not be moved or dropped for that reason.

**Never put the `claude.ai` session URL in the body.** It resolves for nobody but the user.

## Body

Above the attribution block: what changed and why, then how it was verified — name the unit test and
the `testing/` e2e spec, and carry forward every exception `odc-done` step 8 raised. Keep it short
enough to read in one screen.

Title follows Conventional Commits, same rules as the commit subject (root `AGENTS.md`).
