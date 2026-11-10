---
name: adversarial-review
description: Review the current branch against upstream main before a pull request is opened, or before a follow-up that adds code is pushed to one — a prosecutor sub-agent finds defects, a defence sub-agent tries to refute each, and only confirmed findings come back to the caller. Runs only after `pnpm check` is green; changes no code.
---

Two `general-purpose` sub-agents in sequence: the prosecutor finds, the defence refutes, and the caller sees
only what survives, because the caller acts on every line it is given and has no human to filter for it.
`pnpm check` has already passed when this runs, so neither agent runs lint, tsc or a test, and anything those
would report is not a finding.

## 1. Select the diff

```sh
git fetch upstream main
BASE=$(git merge-base upstream/main HEAD)
git diff --name-only --diff-filter=d "$BASE"
git ls-files --others --exclude-standard
```

`origin` is the fork (`CONTRIBUTING.md`), so a base taken from it reviews against a stale main and misses
what upstream has changed underneath. A clone without the `upstream` remote adds it first:
`git remote add upstream https://github.com/DouglasNeuroInformatics/OpenDataCapture.git`.
Keep only `.ts`, `.tsx`, `.js`, `.jsx`, `.css` and `.prisma` files, and drop `apps/web/src/route-tree.ts`,
`testing/src/generated/` and `*.stories.*`. An empty list ends the review: reply `CLEAN`.

## 2. Prosecute

Spawn one sub-agent:

> Follow `.agents/skills/adversarial-review/references/prosecutor.md`. Base: `<BASE>`. Files: `<the list>`.

## 3. Defend

When the prosecutor returned anything but `NONE`, spawn one sub-agent with its output verbatim:

> Follow `.agents/skills/adversarial-review/references/defence.md`. Base: `<BASE>`. Findings: `<the output>`.

## 4. Report

Reply with the `CONFIRMED` findings only, worst first, one line each under the prosecutor's number, and
nothing else:

```
<n>. <path>:<line> — <claim> — <fix>
```

`CLEAN` when nothing survived. A refuted finding is not mentioned.
