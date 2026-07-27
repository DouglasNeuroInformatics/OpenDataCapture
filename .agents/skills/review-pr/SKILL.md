---
name: review-pr
description: Triage pull requests against upstream main — one verdict, action items, and whether it needs the user's eyes. Use when the user asks to review a PR by number, review all the open PRs, or asks whether a PR is worth their time.
---

Triage PRs so the user opens only the ones that need them. Every reviewed PR ends on one **verdict** with a stated confidence, one document under `misc/pr-reviews/`, and an **evidence ledger** recording what was and was not checked.

Two paths through this skill, and the reviewing itself belongs to neither — a sub-agent per PR follows [`REVIEW.md`](REVIEW.md):

- **One PR** — `review-pr 1443`, or a PR the user names.
- **All PRs** — every open PR against `main` that is not a draft, not authored by `joshunrau`, and not a bot or dependency bump.

## 1. Collect the set

```sh
gh pr list --state open --base main --limit 100 \
  --json number,title,url,author,isDraft,headRefOid,additions,deletions,changedFiles,mergeable,statusCheckRollup
```

For a single PR use `gh pr view <N> --json <same fields>`. A named PR is reviewed whoever authored it and whatever its draft state — the exclusions above shape the batch only.

Done when every PR in the set carries its number, `headRefOid`, author, size, mergeability and check rollup.

## 2. Gate before spending anything

The **gate** runs on that metadata alone. No fetch, no worktree, no install until a PR passes it.

| Gate state                                  | Meaning               | Outcome                                      |
| ------------------------------------------- | --------------------- | -------------------------------------------- |
| Any check `FAILURE`/`ERROR`/`CANCELLED`     | CI is red             | **BLOCKED** — comment drafted, no review     |
| `mergeable: CONFLICTING`                    | conflicts with `main` | **BLOCKED** — comment drafted, no review     |
| Any check `PENDING`/`IN_PROGRESS`           | CI still running      | **PENDING** — indexed, no comment, no review |
| `statusCheckRollup: []`                     | CI never ran          | Review it; ledger records CI unavailable     |
| Checks `SUCCESS` and `mergeable: MERGEABLE` | green                 | Review it                                    |

`mergeable: UNKNOWN` means GitHub has not computed the merge yet — re-query that PR once before deciding.

A PR whose `misc/pr-reviews/<N>.md` already records the current `headRefOid` is **cached**: skip it, index it as reviewed, spend nothing.

## 3. One approval, then post

Draft one comment per BLOCKED PR: name the failing check or the conflict, say what the author should do, say that review resumes once it is green. Facts only — no verdict, no review content, no findings. Where the same failure was already reported for this same `headRefOid`, say so in the draft so the user can decline it.

Print every draft in full, then ask the user once — post all, post none, or post a named subset — and wait. Post with `gh pr comment <N> --body-file <path>`.

Done when every drafted comment is either posted or recorded in the index as `blocked, not notified`.

## 4. Review, two at a time

Spawn one `general-purpose` sub-agent per surviving PR, at most two in flight. Each prompt carries: the PR number, URL, title, author, `headRefOid`, size, the worktree path to use under the scratchpad directory, and this instruction —

> Read `.agents/skills/review-pr/REVIEW.md` and follow it exactly for this PR. Return only the verdict, confidence, the suggested model where there are action items, and the path of the document you wrote.

Setup failing inside a worktree splits two ways, and the split matters:

- **`pnpm install` or `pnpm generate:env` fails** → BLOCKED (machine). No comment; the machine is broken, not the PR. Report it to the user directly.
- **`pnpm lint` fails** → BLOCKED (PR). The merge result does not typecheck against current `main`. Draft a comment asking the author to update the branch, and add it to a second approval prompt at the end of the run.

As each **REWORK** document lands, post its `## Reply to author` section straight to the PR with `gh pr comment <N> --body-file <path>` — no approval, no relaying. REWORK is the verdict that costs the user nothing, so the author hears it immediately and the user never sees it again.

A **CLOSE** reply is never posted. Closing is the user's call, and the drafted reply waits in the document for them to send when they make it.

## 5. Aggregate

Write `misc/pr-reviews/INDEX.md` — every PR in the set, one line each, ordered by what it costs the user: `CLOSE`, `REQUIRES_HUMAN_REVIEW`, `REWORK`, `MERGE`, `BLOCKED`, `PENDING`. Each line: number, title, verdict, confidence, one-clause reason, suggested model where there are action items, link to its document.

Then ask for approval on any late blocked-PR comments from step 4.

## 6. Respond, once every sub-agent is done

Say nothing about action items while reviews are still running — a partial list reads as the whole list. Wait for every sub-agent to return, then reply with two things and nothing else.

**One or two sentences of tally.** "Reviewed all 10. Three need you, one should be closed, four went back to their authors, two are blocked on red CI."

**Then the action items**, one line each, only for PRs that need the user:

- `CLOSE` → close #N — one clause on why; the reply to send is in its document.
- `REQUIRES_HUMAN_REVIEW` → review #N — name the part that needs them, and the document path.
- `MERGE` → merge #N.

`REWORK` PRs produce no action item; their replies are already posted.

`BLOCKED` and `PENDING` produce none either. They are gate outcomes from step 2 — those PRs never reached a sub-agent — plus any late block from step 4, so the tally accounts for them: it explains why a set of ten yielded eight reviews.

End with the index path. The documents hold the reasoning; do not repeat it in the terminal.
