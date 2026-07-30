---
name: review-pr
description: Triage pull requests against upstream main — one verdict, action items, and whether it needs the user's eyes. Use when the user asks to review a PR by number, review all the open PRs, or asks whether a PR is worth their time.
---

Triage PRs so the user opens only the ones that need them. The run completes unattended: everything
that can be said on GitHub is posted without asking, and the user is interrupted exactly once — at
the end, for the judgment calls only they can make.

Every reviewed PR ends on one **verdict** with a stated confidence, one document, and an **evidence
ledger** recording what was and was not checked.

Two paths through this skill, and the reviewing itself belongs to neither — a sub-agent per PR
follows [`REVIEW.md`](REVIEW.md):

- **One PR** — `review-pr 1443`, or a PR the user names.
- **All PRs** — every open PR against `main` that is not a draft, not authored by `joshunrau`, and not a dependency bump by a bot.

## Where documents live

Two buckets, and the bucket _is_ the answer to "does this need me?":

```
misc/pr-reviews/
├── action-required/   CLOSE · REQUIRES_HUMAN_REVIEW · MERGE
└── no-action/         REWORK · BLOCKED · PENDING
```

**`action-required/` holds only what the user must personally do** — close it, judge it, merge it.
Work the _author_ owes is never a reason to file a document here; it goes to the author on GitHub.
The user is not a courier.

Three invariants:

- **One document per PR, in exactly one bucket.** Before writing `<N>.md`, delete any existing
  `misc/pr-reviews/*/<N>.md`. When a settled question changes a verdict, `mv` the document to the
  other bucket — never write a second copy.
- **Every PR in the set gets a document**, gate failures included. BLOCKED and PENDING get a stub in
  `no-action/`: number, title, `headRefOid`, the block reason, and whether a comment was posted.
- **No run ends with an unposted action item.** Every `## Action items` entry in every document, in
  either bucket, has reached GitHub by step 7.

## Every posted body carries its commit

Every body this skill posts — review or comment — ends with:

```
Reviewed at commit <headRefOid>.
```

That line is how the skill knows on the next run what it has already said, so it is not optional.

## 1. Collect the set

```sh
gh pr list --state open --base main --limit 100 \
  --json number,title,url,author,isDraft,headRefOid,additions,deletions,changedFiles,mergeable,statusCheckRollup
```

For a single PR use `gh pr view <N> --json <same fields>`. A named PR is reviewed whoever authored it
and whatever its draft state — the exclusions above shape the batch only.

Done when every PR in the set carries its number, `headRefOid`, author, size, mergeability and check
rollup.

## 2. Sweep what is finished

For every `<N>` with a document under either bucket, whether or not it is in this run's set:

```sh
gh pr view <N> --json state --jq .state
```

Delete the document when the state is `MERGED` or `CLOSED`. A merged PR is not a to-do.

This runs before the gate so a stale document can never satisfy the cache check below.

## 3. Gate before spending anything

The **gate** runs on metadata alone. No fetch, no worktree, no install until a PR passes it.

| Gate state                                  | Meaning               | Outcome                                     |
| ------------------------------------------- | --------------------- | ------------------------------------------- |
| Any check `FAILURE`/`ERROR`/`CANCELLED`     | CI is red             | **BLOCKED** — notified in step 4, no review |
| `mergeable: CONFLICTING`                    | conflicts with `main` | **BLOCKED** — notified in step 4, no review |
| Any check `PENDING`/`IN_PROGRESS`           | CI still running      | **PENDING** — stub only, no comment         |
| `statusCheckRollup: []`                     | CI never ran          | Review it; ledger records CI unavailable    |
| Checks `SUCCESS` and `mergeable: MERGEABLE` | green                 | Review it                                   |

`mergeable: UNKNOWN` means GitHub has not computed the merge yet — re-query that PR once before
deciding.

A PR whose `misc/pr-reviews/*/<N>.md` carries a **review verdict** at the current `headRefOid` is
**cached**: skip it, spend nothing. A BLOCKED or PENDING stub never suppresses work, however recent —
CI may have gone green since it was written.

## 4. Notify the blocked

No approval, no draft shown to the user. For each BLOCKED PR, first read back what the PR already
says:

```sh
gh pr view <N> --json reviews,comments --jq '[.reviews[].body, .comments[].body] | join("\n")'
```

If that text already contains the current `headRefOid`, stay silent — the author has already been
told about this exact commit. Otherwise request changes: name the failing check or the conflict, say
what the author should do, say that review resumes once it is green. Facts only — no verdict, no
review content, no findings.

```sh
gh pr review <N> --request-changes --body-file <path>
```

GitHub refuses a review on the user's own PR; fall back to `gh pr comment <N> --body-file <path>`
there — the same fallback applies everywhere this skill posts.

Then write the stub to `no-action/<N>.md` and move on. Blocked PRs never reach the user's attention
beyond a count in the final tally.

## 5. Review, two at a time

Spawn one `general-purpose` sub-agent per surviving PR, at most two in flight. Each prompt carries:
the PR number, URL, title, author, `headRefOid`, size, the worktree path to use under the scratchpad
directory, and this instruction —

> Read `.agents/skills/review-pr/REVIEW.md` and follow it exactly for this PR. Return only the
> verdict, confidence, the document path, and the reply-body path where there is one.

Setup failing inside a worktree splits two ways, and the split matters:

- **`pnpm install` or `pnpm generate:env` fails** → BLOCKED (machine). Post nothing; the machine is
  broken, not the PR. Report it to the user directly.
- **`pnpm lint` fails** → BLOCKED (PR). The merge result does not typecheck against current `main`.
  Request changes asking the author to update their branch, subject to the same `headRefOid` guard as
  step 4, and write the stub.

**Action items belong to the author, so they go to the author.** Never carry one back to the user to
relay — that is the user doing the reviewer's errand. As each document lands, post its reply body
immediately: no approval, no waiting for the other reviews.

| Verdict             | Posted                                              |
| ------------------- | --------------------------------------------------- |
| `REWORK`            | request changes                                     |
| `CLOSE`             | request changes — but never `gh pr close`           |
| `BLOCKED (PR)`      | request changes — lint fails against current `main` |
| `MERGE`             | nothing — a MERGE has nothing left to say           |
| `BLOCKED (machine)` | nothing — reported to the user directly             |

**A PR with an outstanding action item is never MERGE.** One action item is one round trip, so the
verdict is REWORK and the review requests changes. There is no "merge it, and by the way fix these
five things" — that hands the user a decision the author has not finished earning, and it buries the
items in a comment on a PR nobody will reopen. The corollary binds the other way too: if the only
thing standing between a PR and MERGE is a list of remarks that name no real defect and no documented
standard, the remarks were never action items and should not have been written.

`REQUIRES_HUMAN_REVIEW` is the one verdict that waits, and only until step 6: its questions may
change its action items, so posting now risks a second review that contradicts the first. It is
posted there, minutes later, and never left for the user to pass on.

Closing a PR is the user's call, so **`gh pr close` is never run** — CLOSE posts its reply and
nothing more.

## 6. Settle the questions in one sitting

Every finding is one of two kinds, and only one of them is the user's:

- **Obvious** — a rule broken, a bug, a missing test, a reimplementation of something that already
  exists. The fix is not in doubt. It went to the author in step 5; never ask.
- **Toss-up** — two defensible options where the choice belongs to the user, not the reviewer. These
  wait under `## What needs you`.

Once every sub-agent has returned, put **all** the toss-ups to the user in one message, grouped by
PR, each with a recommended answer. One interruption for the whole run.

Then fold each answer back where it belongs: record it in that PR's document, revise its action items
if the answer changed them, revise the verdict if the answer changed that, and `mv` the document if
the bucket changed.

**Then post every `REQUIRES_HUMAN_REVIEW` PR that has action items** — per its settled verdict in the
step 5 table, and as a request for changes if it is still REQUIRES_HUMAN_REVIEW, since outstanding
action items are what a changes-requested review is for. Write that reply body yourself, carrying the
same model line and `Reviewed at commit` line every other posted body carries. An answer the user
declined to give does not hold the author's items back.

An answer that clears every question on a REQUIRES_HUMAN_REVIEW PR does not make it MERGE — its
action items still do. Settling the questions moves it to REWORK, and the document to `no-action/`,
unless the answer left it with nothing outstanding at all.

Done when no document has an unanswered `## What needs you` entry that the user could have settled in
a sentence, and no document has an `## Action items` entry that has not reached GitHub. What remains
is what genuinely needs them in the code.

## 7. Respond

Say nothing about action items while reviews are still running — a partial list reads as the whole
list. Every sub-agent has returned and every toss-up is settled by now; reply with two things and
nothing else.

**One or two sentences of tally.** "Reviewed all 10. Three need you, one should be closed, four went
back to their authors, two are blocked on red CI."

**Then one line per PR in `action-required/`, and each line names something only the user can do:**

- `CLOSE` → close #N — one clause on why; the reply is already posted.
- `REQUIRES_HUMAN_REVIEW` → review #N — name the part that needs them, and the document path.
- `MERGE` → merge #N — nothing is outstanding, which is what the verdict means.

Never list what the author has to fix. Those items are on GitHub; repeating them here turns the reply
into a second inbox for work that is not the user's.

Nothing in `no-action/` gets a line. REWORK replies are posted; blocked and pending PRs never reached
a sub-agent — the tally's count is the whole of what the user hears about them, and it is what
explains why a set of ten yielded eight reviews.

End with the `misc/pr-reviews/action-required/` path. The documents hold the reasoning; do not repeat
it in the terminal.
