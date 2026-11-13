---
name: working-the-backlog
description: Turn one bounded batch of the open issue backlog into pull requests — tend the operator's open PRs, pick low-difficulty issues and medium-difficulty bugs that share no file with any open PR, wait for a go-ahead, and stop at five PRs in flight. Use only when the user invokes it by name.
disable-model-invocation: true
---

A maintainer reads and merges every pull request, so review is the bottleneck: a PR that conflicts with
another, or that settles a question the maintainers should have settled, costs more review than its issue was
worth.

- **The operator** is whoever invoked this skill: a competent engineer, short of time, assumed to know
  neither this codebase nor its issues, and not assumed to be a maintainer.
- **The maintainers** decide direction and merge. They are reached only through GitHub.
- **Every `gh` call takes `--repo DouglasNeuroInformatics/OpenDataCapture`**; `origin` is the operator's fork.
- **The cap is 5 open PRs authored by the operator**, drafts included.

## 1. Tend the open PRs

```sh
gh pr list --author @me --state open --json number,title,headRefName,labels
```

`.github/workflows/pr-status.yaml` gives every open PR exactly one `Status:` label. Read the labels once,
here: the workflow relabels on a schedule and when CI, Commitlint or PR Body completes, so the label of a PR
you have just acted on is stale. A `Status: Draft` PR is the operator's unfinished work: it holds a slot and
is left alone. Three labels mean the PR needs tending, and each is cleared before any new work:

- **`Status: CI Failing`.** Fix the check on the branch. A failure the PR did not cause is filed instead, as
  `.agents/skills/finishing-changes/SKILL.md` says, and the PR is not cleared.
- **`Status: Needs Rebase`.** Rebase the branch onto `upstream/main` and push with `--force-with-lease`. A
  conflict resolved by hand adds code, so `.agents/skills/finishing-changes/SKILL.md` runs again from its
  first step.
- **`Status: Waiting on Author`.** A reviewer requested changes or left a thread unresolved. Make the change,
  or reply with why not; when it leaves open a decision that belongs to the maintainers (see Decisions), reply
  with the options and the one you recommend. After a reply that pushes nothing, request the review again
  (`gh pr edit <N> --add-reviewer <login>`), since the label moves on a push or a new request and never on a
  reply. A PR where your reply is already the last word is cleared, whatever its label says.

Every push follows "Follow-up pushes" in `.agents/skills/opening-pr/SKILL.md`: a push whose new head the body
does not already name closes the PR.

The batch has as many slots as the cap less your open PRs. It has none when a PR is left that you could not
clear: go to step 6 and name the PR and what blocks it.

## 2. List the candidates

```sh
gh issue list --state open --limit 500 --json number,title,labels,createdAt \
  --search 'no:assignee -label:"Needs Decision" -label:Discussion -label:"Needs Info" -label:Upstream'
```

Keep an issue labelled `Difficulty: Low`, whatever its type, or `Difficulty: Medium` together with `Bug`.
Order by priority label from `Priority: Critical` to `Priority: Low`, oldest first within one priority. Then
drop an issue when:

- **An open PR closes or mentions it**
  (`gh pr list --state open --limit 200 --json number,title,body,closingIssuesReferences,files`; step 3 reads
  `files` from the same output).
- **A comment on it says someone is working on it.**
- **A closed, unmerged PR of yours references it**
  (`gh pr list --author @me --state closed --json number,mergedAt,closingIssuesReferences`), unless a
  maintainer has since asked for another attempt.

## 3. Pick for zero conflicts

A file is **taken** when an open PR changes it, whoever opened that PR and draft or not, or when an issue
already picked will change it.

Walk the candidates in order. Read each issue and the code until you can name its **footprint**: every file
the fix will change, counting the unit tests beside the source and any `testing/src/specs/` file. One of three
things follows:

- **Clear.** No file in the footprint is taken: pick the issue, and its footprint becomes taken.
- **Shares a file with a pick.** Fold it into that pick's PR when both issues are `Difficulty: Low` and the PR
  as a whole still fits that label's description (`gh label list` prints it). The issues need not be related;
  the shared file is the reason. Otherwise skip it.
- **Shares a file with an open PR.** Skip it; it returns when that PR merges.

A pick with the issues folded into it fills one slot. Stop walking when the slots are full. Then read on only
for candidates that concern the same screen, form or module as a pick, and fold those that qualify, since
nothing else can touch them until that PR merges. A slot no candidate fills stays empty: the filter is never
relaxed to fill it.

Reading an issue can end in Decisions or in Issues that need no PR instead of a pick.

## 4. Present the plan and wait

One message to the operator:

- **Each planned PR**: its issue numbers, and one to three sentences on what will be different for a user, an
  administrator or an instrument author. No file names and no implementation.
- **Each question that Decisions gives to the operator.**

Change no code before the operator's go-ahead, even when there are no questions. The operator may strike a
planned PR. A slot emptied by a strike, or by anything after the go-ahead, stays empty, since a replacement is
work the operator did not approve.

## 5. Work each planned PR

- **One worktree per PR, outside the checkout, on a branch cut from `upstream/main`** after
  `git fetch upstream main`. Copy the checkout's `.env` into the worktree.
- **Parallel work stops at `pnpm check`.** It runs in one worktree at a time: its e2e stage starts servers on
  the ports in `.env` (`testing/playwright.config.ts`), and a second run fails on the occupied ports. When
  sub-agents write the PRs, each brief names its issues, their footprint, the operator's answers and this
  file.
- **One commit per issue**, in a folded PR too, since each `fix`, `feat` or `perf` commit is one changelog
  entry. The body gives every issue its own keyword (`Closes #1. Closes #2.`); GitHub links only the number
  directly after one.
- **A file outside the footprint is checked before it is touched.** Query the open PRs again. Not taken: go
  on, and it joins the footprint. Taken: discard the branch and leave the issue for a later batch.
- **Finish with `.agents/skills/finishing-changes/SKILL.md`**, which ends by opening the PR. An issue whose
  `pnpm check` cannot be brought green gets no PR: discard the branch and say why in the report.
- **Confirm the PR is still open a minute after opening it** (`gh pr view <N> --json state`).
  `.github/workflows/pr-body.yaml` closes a PR whose body it rejects, with a comment saying why.
- **Remove the worktree once the PR is open and keep the branch**; step 1 of a later batch needs it.
- **Merging is the maintainers'.** Another author's PR or branch is never pushed to, even to clear a conflict
  with one of yours.

## 6. Report

One line per item, then stop.

- **PR opened**: its URL and the issues it closes.
- **PR tended**: what was done, or why it could not be cleared.
- **Issue closed**: the evidence.
- **Issue sent to the maintainers, commented on or relabelled**: why, and any label GitHub refused.
- **Issue or PR abandoned or struck, and each empty slot**: why.

## Decisions

A choice a reviewer could disagree with goes under `Decisions` in the PR body
(`.agents/skills/opening-pr/SKILL.md`). Four kinds of choice are never made here:

- **Data and contracts.** A Prisma schema change or migration, a changed API request or response, a changed
  `packages/schemas` shape, a new environment variable, or a change to what instrument authors build against
  (`packages/runtime-core`, `runtime/v1`, `packages/instrument-guidelines`).
- **Access.** A change to who can see or do what: CASL abilities, `@RouteAccess`, group scoping, login or
  sessions. A bug fixed within the existing rules is not one.
- **Two reasonable fixes.** The issue can be resolved in ways its user would experience differently and does
  not say which, or you believe the issue itself is wrong.
- **An outgrown label.** The fix needs a refactor first, spreads into a second workspace, or changes behaviour
  the issue did not ask about.

**The operator decides** a choice of the last two kinds that a competent engineer who has never seen this
codebase could settle well from the question alone. **The maintainers decide** the rest: every choice of the
first two kinds, and whatever turns on how the product is deployed, used or meant to evolve.

**A question to the operator stands alone.** Give, in this order: what this part of the product does and for
whom, what the issue reports, the options and what each means for that person, and the option you recommend
with its reason. Enough detail to decide and no more. An invented issue shows the size:

> **#N, date-range filter.** Clinicians narrow a subject's records to a date range. Choosing one day as both
> start and end returns nothing, because the range stops at the midnight that begins the end date. (a) Make
> the end date inclusive: one day returns that day's records, and every existing range gains its last day.
> (b) Keep it exclusive and refuse a one-day range with a message: existing ranges are unchanged, but a single
> day cannot be selected. I recommend (a): an end date reads as included.

Questions found before step 4 go in its message. A question found after the go-ahead parks that PR; ask all of
those together once the other PRs are open, then finish the parked ones. Record each answer under `Decisions`
in the PR body.

**A decision for the maintainers ends work on the issue.** Discard the branch, comment on the issue with what
you found, the options and the one you recommend, and add `Needs Decision`
(`gh issue edit <N> --add-label "Needs Decision"`), which keeps the issue out of step 2 until they answer.
When GitHub refuses the label, say so in the comment and in the report.

## Issues that need no PR

- **Already fixed.** You can name the merged commit or PR that fixed it: close the issue with that reference.
- **Duplicate.** It duplicates an open issue: close it with `gh issue close <N> --duplicate-of <M>`.
- **Anything softer**, such as a bug you could not reproduce: comment once with what you tried, add
  `Needs Info`, and leave it open.
- **Wrong difficulty.** Correct the label by the rule in `.agents/skills/opening-issues/SKILL.md` and say why
  in a comment; step 2 then decides whether the issue is still a candidate.
