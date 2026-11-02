---
name: review-pr
description: Triage pull requests against upstream main — one verdict, action items, and whether it needs the user's eyes. Use when the user asks to review a PR by number, review all the open PRs, or asks whether a PR is worth their time.
---

Triage PRs so the user opens only the ones that need them. The run completes unattended: everything
for authors is posted without asking, and the user is interrupted once, at the end.

The set is either one PR the user names (reviewed whatever its author or draft state), or every open
PR against `main` that is not a draft, not authored by `joshunrau`, and not a bot dependency bump.
A sub-agent per PR does the reviewing by following [`REVIEW.md`](REVIEW.md).

## Documents

```
misc/pr-reviews/
├── action-required/   CLOSE · REQUIRES_HUMAN_REVIEW · MERGE
└── no-action/         REWORK · BLOCKED · PENDING
```

`action-required/` holds only what the user must personally do. Every PR in the set gets exactly one
document; BLOCKED and PENDING get a stub (number, title, `headRefOid`, reason, whether a comment was
posted). When a verdict changes, `mv` the document rather than writing a second copy.

Every body this skill posts ends with `Reviewed at commit <headRefOid>.` — that is how the next run
knows what it has already said.

## 1. Collect

```sh
gh pr list --state open --base main --limit 100 \
  --json number,title,url,author,isDraft,headRefOid,additions,deletions,changedFiles,mergeable,statusCheckRollup
```

For a single PR use `gh pr view <N> --json <same fields>`.

## 2. Sweep

For every existing document, run `gh pr view <N> --json state --jq .state` and delete the document
if the PR is `MERGED` or `CLOSED`.

## 3. Gate

On metadata alone, before any fetch or worktree:

| State                                       | Outcome                        |
| ------------------------------------------- | ------------------------------ |
| Any check `FAILURE`/`ERROR`/`CANCELLED`     | **BLOCKED** — notify in step 4 |
| `mergeable: CONFLICTING`                    | **BLOCKED** — notify in step 4 |
| Any check `PENDING`/`IN_PROGRESS`           | **PENDING** — stub, no comment |
| `statusCheckRollup: []`                     | review; note CI unavailable    |
| Checks `SUCCESS` and `mergeable: MERGEABLE` | review                         |

Re-query `mergeable: UNKNOWN` once. Skip a PR whose document already holds a review verdict at the
current `headRefOid`; a BLOCKED or PENDING stub never counts.

## 4. Notify the blocked

Read the PR's existing reviews and comments
(`gh pr view <N> --json reviews,comments --jq '[.reviews[].body, .comments[].body] | join("\n")'`).
If they already contain the current `headRefOid`, stay silent. Otherwise request changes naming the
failing check or the conflict and what to do — facts only, no review content:

```sh
gh pr review <N> --request-changes --body-file <path>
```

GitHub refuses reviews on the user's own PRs; fall back to `gh pr comment <N> --body-file <path>`
wherever this skill posts. Then write the stub.

## 5. Review, three at a time

Spawn one `general-purpose` sub-agent per surviving PR, at most three in flight, passing the PR
number, URL, title, author, `headRefOid`, size, a worktree path under the scratchpad, and:

> Read `.agents/skills/review-pr/REVIEW.md` and follow it exactly for this PR. Return only the
> verdict, confidence, the document path, and the reply-body path where there is one.

As each returns, post its reply body immediately:

| Verdict             | Posted                                        |
| ------------------- | --------------------------------------------- |
| `REWORK`            | request changes                               |
| `CLOSE`             | request changes — never run `gh pr close`     |
| `BLOCKED (PR)`      | request changes, with the step 4 commit guard |
| `MERGE`             | nothing                                       |
| `BLOCKED (machine)` | nothing — report it to the user               |

`REQUIRES_HUMAN_REVIEW` waits for step 6, since the user's answers may change its action items.

## 6. Settle the questions

Once every sub-agent has returned, put all `## What needs you` questions to the user in one message,
grouped by PR, each with a recommended answer. Fold each answer into its document, revising action
items, verdict and bucket as needed. Then post every REQUIRES_HUMAN_REVIEW PR that has action items,
per the step 5 table (request changes if it is still REQUIRES_HUMAN_REVIEW).

## 7. Respond

One or two sentences of tally — "Reviewed all 10. Three need you, one should be closed, four went
back to their authors, two are blocked on red CI." — then one line per `action-required/` document:

- `CLOSE` → close #N, with one clause on why.
- `REQUIRES_HUMAN_REVIEW` → review #N, naming the part that needs them and the document path.
- `MERGE` → merge #N.

Never list author action items; they are on GitHub. End with the `misc/pr-reviews/action-required/`
path.
