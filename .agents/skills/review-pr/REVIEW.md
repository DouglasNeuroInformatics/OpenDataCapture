# Reviewing one PR

You are reviewing a single pull request against upstream `main` and writing one document. Your caller passed you the PR number, URL, title, author, `headRefOid`, size, and the worktree path to use.

## 1. Stand up the worktree

The PR has already passed the gate — CI is not red and it does not conflict.

```sh
git fetch origin refs/pull/<N>/merge:refs/pr/<N>/merge   # falls back below if absent
git worktree add --detach <worktree-path> refs/pr/<N>/merge
```

Review the **merge result**, which is what would actually land. If `refs/pull/<N>/merge` does not exist, fetch `refs/pull/<N>/head` instead, and record "reviewed the PR head, not the merge result" as a finding — it means GitHub could not compute the merge.

Then, from inside the worktree:

```sh
pnpm install --frozen-lockfile
pnpm generate:env    # inside the worktree — it derives paths from its own location
pnpm lint
```

Run `generate:env` in the worktree and never copy the repo's `.env`: `turbo lint` depends on `db:push`, and a worktree-local `.env` keeps the gateway's sqlite file local instead of writing to the user's dev database.

`install` or `generate:env` failing is a broken machine — stop, report it as BLOCKED (machine), write no document. `lint` failing is the PR's problem — stop, report BLOCKED (PR) with the errors, and draft a comment asking the author to update their branch against `main`.

## 2. Read

Six passes. Above **1000 changed lines or 25 files**, spawn parallel readers over the same worktree — one for conformance, one for correctness, one for tests — and synthesize their findings into your own single verdict. At or below it, do all six yourself.

1. **Intent** — the PR body, its linked issues, and the commit messages. What was this meant to do?
2. **Conformance** — the hard rules in `CLAUDE.md`, then the `AGENTS.md` of every workspace the diff touches. A rule the diff breaks is a finding; a rule it breaks _for a good reason_ is a finding that says so.
3. **Correctness** — read whole changed files in the merged tree, follow their imports and their callers. You have the entire repo checked out; use it. Diff hunks alone hide the bug that lives in what calls them.
4. **Duplication** — `.agents/docs/packages/index.md` lists the 11 `@douglasneuroinformatics/*` packages, and the repo has its own utilities. Code that reimplements one of them is a finding, and reimplementing a whole DNP package is a CLOSE.
5. **Tests** — `CLAUDE.md` requires a unit test _and_ an e2e test in `testing/` for every change. Judge whether the tests actually exercise the new behaviour rather than counting files.
6. **Escalation** — does the diff touch any escalation path below?

## 3. Verdict

One verdict, with confidence.

- **CLOSE** — the premise is wrong; no amount of fixing the code rescues it. The diff would have to be thrown away. Grounds: fundamentally flawed; a step backwards from the current architecture; reimplements a DNP package; endangers clinical data by design (silently swallowed errors, weakened auth or group scoping, data-loss paths, plaintext subject identifiers); or the whole PR is a hack that belongs elsewhere — direct DOM manipulation in React for something `libui` should own, and that hack _is_ the PR.
- **REWORK** — the premise is sound, the execution is not. Action items go to the author; the user need not open it.
- **REQUIRES_HUMAN_REVIEW** — blocked on a judgment only the user can make.
- **MERGE** — conforms, is tested, and nothing needs the user.

Judgment, not a checklist. Contradicting a documented `AGENTS.md` is **not** automatically wrong — if the change is an improvement, say so and let the verdict follow the merit. Conversely a clean-looking diff on an escalation path is still REQUIRES_HUMAN_REVIEW.

**REQUIRES_HUMAN_REVIEW is automatic** when the diff touches:

- **Instrument pipeline** — `packages/instrument-bundler`, `packages/runtime-bundler`, `packages/runtime-core`, `packages/instrument-interpreter`, `runtime/v1`, `vendor/`.
- **Auth, data integrity and schema** — CASL abilities, `@RouteAccess`, group scoping, session and crypto code, `apps/api/prisma/schema.prisma`, `apps/gateway/prisma/schema.prisma`, migrations.
- **Build and release tooling** — `turbo.json`, vite/esbuild/vitest configs, `pnpm-workspace.yaml`, Dockerfiles, `.github/workflows`, release automation.

Two more reach REQUIRES_HUMAN_REVIEW rather than CLOSE, because the user may already have agreed to them off-ticket: a sweeping refactor or rewrite, and a PR superseded by another open PR or by `main`. Flag either; never close on it.

**Confidence:**

- **high** — every changed file read in the merged tree, lint clean, conformance checked against the relevant `AGENTS.md`, and the intent is clear.
- **medium** — the read was sampled rather than complete, or the subsystem is one you had to learn from scratch, or the intent had to be inferred.
- **low** — something load-bearing could not be verified. Say what, in the ledger.

## 4. Size the work

Any verdict carrying action items also names the Claude model that should do them, sized to the scope of the whole action-item set rather than the largest single item. **Overestimate**: torn between two tiers, name the stronger one — a model too large costs tokens, a model too small costs a wrong change to clinical software.

- **Sonnet 5** — mechanical and local: work confined to one or two files, fully specified by the action items, mirroring a pattern already in the repo. Adding missing translation keys, a test modelled on an existing one, a rename.
- **Opus 5** — the default: multi-file or cross-workspace work, anything needing repo judgment, and any set where an item is phrased as a question rather than an instruction.
- **Fable 5** — the strongest model, for work that spans several aspects of the system at once and has to hold all of them in mind. **Anything on an escalation path takes Fable 5**, so every automatic REQUIRES_HUMAN_REVIEW carries it: the instrument pipeline, auth and data integrity and schema, build and release tooling.

Name the family, not a dated release — whoever runs the work uses the latest model in that family at the time, and reads `Opus 5` as its successor once one exists.

## 5. Write the document

To `misc/pr-reviews/<N>.md`. One page. The user is busy: no preamble, no restating the diff.

```markdown
# PR #<N> — <title>

**<VERDICT>** · confidence: <high|medium|low> · <author> · +<additions>/-<deletions>, <n> files
<url> · reviewed at <headRefOid>

## What it does

<3–5 bullets, plain language, what changes for a user or a developer>

## Why this verdict

<2–4 sentences. Name the deciding factor.>

## What needs you

<REQUIRES_HUMAN_REVIEW only. One entry per thing, each: the file or area,
the exact question to answer, and why it cannot be settled without the user.>

## Action items

1. [author] <what to change — file:line>
2. [you] <what only the user can decide>

**Suggested model:** <Fable 5 | Sonnet 5 | Opus 5> — <one clause on why this scope needs it>

## Evidence

ok: <what was checked — lint, files read, rules applied>
not checked: <what was not, and why>

## Reply to author

<CLOSE and REWORK only. Paste-ready, addressed to the author, action items in
plain language, no internal reasoning, no verdict jargon.>
```

Omit a section that does not apply rather than writing "n/a". An action item without a file path is not an action item — make it locatable.

## 6. Clean up

```sh
git worktree remove --force <worktree-path>
git worktree prune
```

Return only the verdict, the confidence, and the document path.
