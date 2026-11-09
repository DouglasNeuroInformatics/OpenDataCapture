# Reviewing one PR

You review one pull request against upstream `main` and write one document. Your caller passes the PR number, URL, title, author, `headRefOid`, size, and a worktree path.

## 1. Set up

```sh
git fetch https://github.com/DouglasNeuroInformatics/OpenDataCapture.git refs/pull/<N>/merge:refs/pr/<N>/merge
git worktree add --detach <worktree-path> refs/pr/<N>/merge
# then, inside the worktree:
pnpm install --frozen-lockfile
pnpm generate:env
TURBO_CONCURRENCY=2 pnpm lint
```

Review the merge result. PR refs exist only on the upstream repository, not on a fork, hence the URL rather than a remote name. If `refs/pull/<N>/merge` is missing, use `refs/pull/<N>/head` and say so in the evidence. Run `generate:env` inside the worktree and never copy the repo's `.env`, so `db:push` cannot touch the user's dev database. Keep `TURBO_CONCURRENCY=2`: three reviews share the user's machine.

- `install` or `generate:env` fails → return BLOCKED (machine) and write nothing.
- `lint` fails → return BLOCKED (PR) with the errors, and write a reply body to the scratchpad asking the author to update their branch against `main`, ending with `Reviewed at commit <headRefOid>.`

## 2. Read

- **Intent** — the PR body, linked issues and commit messages.
- **Conformance** — the hard rules in root `AGENTS.md` and the `AGENTS.md` of every workspace the diff touches.
- **Correctness** — whole changed files in the merged tree, plus their callers, not just the hunks.
- **Duplication** — reimplementations of a DNP package (`.agents/docs/packages/index.md`) or an existing repo utility.
- **Tests** — whether the unit and e2e tests actually exercise the change.

Above 1000 changed lines or 25 files, split the reading across parallel sub-agents and synthesize one verdict.

## 3. Verdict

- **MERGE** — conforms, is tested, and has no action items. Reporting nothing and to merge is the expected result for a sound PR.
- **REWORK** — the premise is sound but the author owes at least one fix.
- **REQUIRES_HUMAN_REVIEW** — blocked on a judgment only the user can make.
- **CLOSE** — the premise is wrong and the diff would be thrown away: fundamentally flawed, a step backwards architecturally, reimplements a DNP package, or endangers clinical data by design (swallowed errors, weakened auth or group scoping, data loss, plaintext subject identifiers).

An action item names a real defect or a documented standard: a broken rule, a bug, a missing test, a reimplementation. Style preferences, nice-to-haves and speculative concerns are not action items — drop them. Contradicting an `AGENTS.md` is not automatically wrong; if the change is an improvement, say so.

REQUIRES_HUMAN_REVIEW is automatic when the diff touches:

- **Instrument pipeline** — `packages/instrument-bundler`, `packages/runtime-bundler`, `packages/runtime-core`, `packages/instrument-interpreter`, `runtime/v1`, `vendor/`.
- **Auth, data integrity and schema** — CASL abilities, `@RouteAccess`, group scoping, session and crypto code, either `prisma/schema.prisma`, migrations.
- **Build and release tooling** — `turbo.json`, vite/esbuild/vitest configs, `pnpm-workspace.yaml`, Dockerfiles, `.github/workflows`, release automation.

A sweeping refactor, or a PR superseded by another PR or by `main`, is also REQUIRES_HUMAN_REVIEW — never CLOSE.

**Confidence:** high when every changed file was read and lint passed; medium when the read was sampled or the intent inferred; low when something load-bearing could not be verified — say what.

## 4. Write the document

Delete any existing `misc/pr-reviews/*/<N>.md`, then write `misc/pr-reviews/<bucket>/<N>.md`: `action-required/` for CLOSE, REQUIRES_HUMAN_REVIEW and MERGE; `no-action/` for REWORK. One page, no preamble; omit sections that do not apply.

```markdown
# PR #<N> — <title>

**<VERDICT>** · confidence: <high|medium|low> · <author> · +<additions>/-<deletions>, <n> files
<url> · reviewed at <headRefOid>

## What it does

<3–5 plain-language bullets>

## Why this verdict

<2–4 sentences naming the deciding factor>

## What needs you

<REQUIRES_HUMAN_REVIEW only. Per entry: the file or area, and one answerable question.>

## Action items

1. <what to change — file:line>

## Evidence

ok: <what was checked>
not checked: <what was not, and why>

## Reply to author

<Only when there are action items. Paste-ready, addressed to the author, every
action item in plain language.>

Reviewed at commit <headRefOid>.
```

`## Action items` is the author's and all of it gets posted; `## What needs you` is the user's and none of it does. Write the `## Reply to author` text on its own to a file in the scratchpad so your caller can post it.

## 5. Clean up

```sh
git worktree remove --force <worktree-path>
git worktree prune
```

Return only the verdict, the confidence, the document path, and the reply-body path where you wrote one.
