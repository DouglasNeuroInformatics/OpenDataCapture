---
name: opening-pr
description: Open a pull request against DouglasNeuroInformatics/OpenDataCapture, or push a follow-up to one — the body a reviewer reads in seconds, and the adversarial-review block without which `.github/workflows/pr-body.yaml` closes the PR. Use whenever a change is ready for a PR; it refuses a branch whose `pnpm check` is not green or whose review has not run on the current head.
---

The reviewer reads dozens of these a week. The body says what changed in effect terms and what they might
disagree with, and nothing a green CI run already proves. `.github/workflows/pr-body.yaml` reads the body on
every open, edit and push, and closes the PR when the review block is missing, names a commit other than the
head, drops a finding, or when a forbidden section is present.

## Preconditions

`pnpm check` is green on the branch, and `.agents/skills/adversarial-review/SKILL.md` has run on the
branch's content, or on content that differs from it only by fixes to the review's own findings, with every
confirmed finding fixed or declined (`.agents/skills/finishing-changes/SKILL.md` is the order). The stamp
names the head you push, since the review reads the working tree and the commit comes after. Either missing: stop, open nothing, and say which. There is no exception path; a check that cannot
pass is reported to the user, never written into a body.

## Body

Write the body to a file and pass it with `--body-file`:

```markdown
<What a user or operator gets that they did not have before. Closes #N when it closes an issue.>

## Changes

- <one behaviour, in effect terms>

## Decisions

- <a choice a reviewer could reasonably disagree with: the choice, the alternative, and why>

## Risks

- <what could go wrong for an existing deployment, and how it is mitigated or that it is accepted>

Filed: #N, #M

## Adversarial review

Reviewed at commit <full head sha>. pnpm check: green.

### Findings

<the review's reply verbatim: CLEAN, or its numbered lines>

### Fixed

- <n>. <how, in a phrase>

### Declined

- <n>. <what the prosecutor missed, in code terms: a guard upstream, a type that excludes the case, a rule
  quoted out of context>
```

- **The opening paragraph is a ceiling, not a floor.** A one-line change gets one or two sentences; one
  sentence of context is the minimum for anything.
- **Changes lists every behaviour a reviewer must know, however many.** A migration, an environment variable
  or a config change is always one. Effect terms: what now happens, not which file or function changed; the
  diff shows files. Length scales with the diff, and nothing is there for length.
- **Decisions, Risks and `Filed:` are omitted when empty.** With `CLEAN`, so are Fixed and Declined.
- **No Verification, Validation, Notes or Implementation notes section**; the workflow refuses them.
  `pnpm check: green` is the only verification statement. Test names, pass counts and what was not run belong
  nowhere. An observation that is not a Change, a Decision or a Risk is an issue
  (`.agents/skills/opening-issues/SKILL.md`), linked under `Filed:`, or deleted.
- **Every number under Findings appears under exactly one of Fixed or Declined.** A decline reading "out of
  scope" or "pre-existing" carries the issue number it was filed under.

## Open

```sh
git push -u origin HEAD
gh pr create --repo DouglasNeuroInformatics/OpenDataCapture --base main --title "<type(scope): subject>" --body-file <path>
```

The title follows the commit convention in root `AGENTS.md`; `origin` is the fork, so `gh` infers the head.

## Follow-up pushes

A push moves the head, so the stamp goes stale and the workflow closes the PR on the push unless the body
already names the new head. Commit, read `git rev-parse HEAD`, edit the body, and only then push. When the
follow-up adds code, re-run the review and rewrite the block for the new head. When it only addresses
findings, add this as its own line directly after the `Reviewed at commit` line:

```
Follow-up <full new head sha>: addresses findings <n, m>; no new code.
```

```sh
gh pr edit <number> --repo DouglasNeuroInformatics/OpenDataCapture --body-file <path>
git push
```

A PR the workflow closed is reopened with `gh pr reopen <number>` once the body is fixed.
