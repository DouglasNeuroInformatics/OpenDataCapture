---
name: writing-skills-for-agents
description: Draft or edit skills for Claude or other agents. Use for drafting, editing, reviewing, or editing any skills.
---

# Writing Skills for Agents

## Skill Structure

```
skill-name/
├── SKILL.md           # Main instructions (required)
├── references/        # Detailed docs (if needed)
└── scripts/           # Utility scripts (if needed)
    └── helper.js
```

## When to Add References

Add reference documents when:

- SKILL.md exceeds 200 lines

## When to Add Scripts

Add utility scripts when:

- Operation is deterministic (validation, formatting)
- Same code would be generated repeatedly
- Errors need explicit handling

Scripts save tokens and improve reliability vs generated code

## Anti-Pattern: Overfitting to the Case That Just Happened

### The Golden Rule

Write for an agent that has no memory of the session that produced the skill, holds only the files committed in the repo, and is working on an input maximally dissimilar to the one you just handled while still within the skill's scope. Every line must be understandable to that agent and useful to it.

You usually write or edit a skill right after working one specific case: a bug, a document, a script, a workflow. Call it the _source case_. The reader will never see the source case, so every line has to hold across the skill's whole scope.

The description sets the scope. Before testing a line, read the description and find the input furthest from the source case that it still covers. A skill for "debugging Node.js applications" can name JavaScript debugging techniques; a skill for "systematic debugging" cannot.

### Three Ways a Line Fails

Check each line against all three, in this order. A line can fail more than one.

#### 1. Dangling references

The reader cannot resolve a name. Every path, name, and term in the skill must resolve to one of three places: a file committed in the repo, a definition in the skill itself, or general knowledge of the domain.

Tells:

- Paths under a temp, scratch, home, or download directory.
- Files the session wrote but never committed, such as a notes file in the working directory.
- "As discussed", "as agreed", "the earlier approach", or any phrase pointing at a conversation.
- Roles, nicknames, or labels coined during the session and used without definition.
- Ids, keys, or row numbers from a local database or spreadsheet.
- Skill-local conventions, such as a priority scale, that the skill never defines.

Fix: commit the file, define the term in the skill, or delete the reference.

#### 2. Run reports

The line records what happened instead of telling the reader what to do. Dates, counts, "results", which inputs were processed and what broke: these are log entries. Past tense on its own is fine; a past observation can back an instruction (see evidence, below).

Fix: extract the instruction the report implies and write it as an instruction. Delete the rest.

#### 3. Details from the source case

The line names something from the source case that the dissimilar input does not contain. Run the **noun test**: for each noun in the line, check that it refers to something in the dissimilar input. Then sort each noun that fails:

- **Data** the reader would act on directly (a URL, selector, id, email pattern, page count, or flag value): delete it, or move it to the store the skill's data already lives in, such as a database, a data file, or a tracker.
- **Evidence** that supports a rule: keep it, and say that it is one observation and what produced it, so the reader can weigh it.
- **The subject of the instruction**: write the role it played in the source case instead. "`checkout.spec.ts` flakes under parallel runs" becomes "a test that flakes under parallel runs".

### Examples

All excerpts come from a fictional skill, `triage-ci-failures`: "Triage failing CI jobs in a repo, separate flaky failures from real ones, and file or fix each."

#### Dangling references

Before:

```markdown
Mark timeouts P2, as agreed. Notes from the last triage are in `ci-notes.md`.
```

"As agreed" points at a conversation, `ci-notes.md` was never committed, and P2 means something different on every team, so the skill has to define it.

After:

```markdown
Priority: P1 blocks merges, P2 fails on rerun, P3 fails once and passes on rerun. Mark timeouts P2.
```

#### Run reports

Before:

```markdown
**Triage run (Sep 2026)**

14 failures: 9 flaky, 3 real, 2 unresolved. `payments-e2e` timed out on both reruns, so it was left open.
```

The section records one run. Its only instruction is what to do with a job that times out twice, and `payments-e2e` becomes the role it played.

After:

```markdown
A job that times out on every rerun is not flaky. Leave it open and assign it.
```

#### Details from the source case: data

Before:

```markdown
Known flaky: `checkout.spec.ts:88`, `auth-refresh.spec.ts`. The `db-migrate` job needs `RETRY=3`.
```

Each test name, job name, and flag value fails the noun test, and the reader would act on each directly, so all of it is data.

After: deleted. The flaky list belongs in a quarantine file or the issue tracker, where it is maintained.

#### Details from the source case: evidence

Before:

```markdown
Rerun once before triaging. Retrying cut false failures from 31 to 12.
```

The numbers support the rule and are not something the reader acts on, so they are evidence. What is missing is their source.

After:

```markdown
Rerun once before triaging. In one week of runs, a single rerun cut false failures from 31 to 12.
```

## Verifying

Have a subagent verify the skill. Give it the skill under review and this skill, tell it to assume only the committed files, and have it apply the three tests to every line. It reports each failing line with the tests it failed. Done when it reports none.
