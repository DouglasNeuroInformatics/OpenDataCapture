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

## Anti-Pattern: Writing for a Less Capable Reader

### The Reader

The agent you are writing for is also highly capable. It knows the domain, its tools, and general good practice, and it does competent work unprompted. What it lacks is what it cannot infer: the user's preferences, the conventions of the project, and each choice that departs from what it would do by default. A skill supplies those and nothing else.

### The Deletion Test

For each line, ask: would that reader produce a worse result with this line deleted? If not, delete it.

Run this test after the three overfitting tests. Their fixes add text, such as a definition or the source of a piece of evidence, and that text is tested too.

The test sets no target length. A long skill whose every line passes is the right length.

### Four Ways a Line Pads

A line can pad in more than one way.

#### 1. Known to the reader

The line tells the reader something it knows or would do anyway.

Tells:

- General good practice for the domain, such as "handle errors" or "write a clear commit message".
- A definition of a term the domain already defines.
- The steps of a routine operation, spelled out one by one.
- An instruction to do what the reader does by default, such as reading a file before editing it.
- A description of the reader's role or expertise, or of how much the skill matters.

Fix: delete the line. When part of it departs from the default, keep that part alone. "Write a clear commit message, prefixed with the job name" becomes "Prefix the commit message with the job name."

#### 2. Over-explained rationale

The line gives a reason the reader already holds, or a reason longer than the work it does.

A reason does work in two cases. It lets the reader decide a case the rule does not cover, or the rule looks wrong without it and the reader might override the rule. Evidence that the noun test keeps is exempt from this test and stays.

Tells:

- A reason that restates the benefit of good practice: "because this saves time", "to ensure quality".
- "This is important because", "the reason for this is".
- A reason attached to every rule in a list.
- A paragraph of reasoning that a clause would carry.

Fix: delete a reason that does neither kind of work. Cut one that does to a clause.

#### 3. Repetition

The line says what another line of the skill already says.

Tells:

- An overview that lists what the sections below it say.
- A summary, recap, or closing checklist that restates the body.
- A rule stated in the body and again under a heading such as "Important" or "Notes".
- An opening paragraph that restates the description.
- An example that shows only what its rule states. An example earns its place by showing something the rule cannot state, such as a format, a tone, or the boundary between two cases. One example for each such thing is enough.

Fix: keep the statement where the reader needs it and delete the others.

#### 4. Defensive padding

The line guards against a mistake the reader is unlikely to make, or pushes harder on a rule than the rule needs.

Tells:

- A list of cases that tries to be exhaustive, where the rule or its reason already covers them.
- A caveat for a situation that the skill's scope makes rare.
- A hedge on a line that is meant as a rule: "generally", "where appropriate", "consider".
- Emphasis in capitals or bold, or words such as "IMPORTANT", "NEVER", and "critical".
- "Be careful", "double-check", or "make sure", with nothing named to check.

Fix: state the rule once, plainly. Keep an edge case only when the reader would get it wrong without the line.

### Examples

All excerpts come from the same fictional skill, `triage-ci-failures`.

#### Known to the reader

Before:

```markdown
Start by reading the job's log carefully to understand what failed. Look for error messages and stack traces. Once you understand the failure, check whether the test is in the quarantine file before investigating further.
```

The reader reads the log and finds the error unprompted. The quarantine check is the one step it could not guess.

After:

```markdown
Check the quarantine file before investigating a failure.
```

#### Over-explained rationale

Before:

```markdown
File one issue per failing job. This matters because well-scoped issues are easier to track and resolve.

Do not rerun a deploy job. The reason for this is that deploy jobs are not like test jobs: when a deploy job runs a second time it carries out the deployment again, which can cause problems in the target environment.
```

The reader already holds the first reason. The second settles cases the rule does not name, such as a job that publishes a package, so it stays, cut to a clause.

After:

```markdown
File one issue per failing job.

Do not rerun a deploy job, since a rerun repeats its side effects.
```

#### Repetition

Before:

```markdown
Title each issue with the classification and the job name.

For example, if the `lint` job failed and you classified the failure as flaky, the title names the classification, flaky, and the job, `lint`.
```

The example shows only what the rule states. What the rule cannot state is the format, so the example that stays is the format.

After:

```markdown
Title each issue with the classification and the job name, as in `[flaky] lint`.
```

#### Defensive padding

Before:

```markdown
**IMPORTANT:** NEVER close a failure without a classification. Generally, be very careful with timeouts, which may be caused by slow runners, network issues, resource limits, deadlocks, or other factors.
```

The emphasis adds nothing to a rule that is stated plainly. "Be very careful" names nothing to do, and the reader could produce the list of causes itself.

After:

```markdown
Classify every failure before closing it.
```

## Verifying

Have a subagent verify the skill. Give it the skill under review and this skill, and tell it to assume it holds only the skill under review and the files committed in the repo. It makes two reports, the second once the first is empty:

1. **Overfitting.** Each line that fails one of the three overfitting tests, with the tests it failed. Fix the lines and repeat until it reports none.
2. **Padding.** Each line it would delete under the deletion test, with the ways the line pads. Accept or reject each candidate yourself, in one round. A verifier asked for lines to delete finds some in any skill, so do not re-run it to reach an empty report.
