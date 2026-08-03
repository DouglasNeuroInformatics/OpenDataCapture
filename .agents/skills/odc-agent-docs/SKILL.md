---
name: odc-agent-docs
description: Write or correct this repo's agent documentation — a workspace AGENTS.md (or its CLAUDE.md symlink), a playbook under .agents/docs/playbooks, an architecture doc, or the workspace map. Use when a documented rule is wrong or missing, when a change contradicts an AGENTS.md, or when another skill needs the house format for these files. Architectural decisions land in .agents/docs/architecture (no ADR flow here); investigating the outside world is research's job.
---

No tool will tell you a fact landed in the wrong file — `.agents/` is neither shipped nor linted
(`.agents/docs/workspace-map.md`). A true sentence in the wrong document is silently correct, and the
second copy is the one that goes stale: correct one, miss the other, and the repo now says two things.

**Every fact has one home.** Find it before you write it.

## Find the home before you write

Grep for the fact, not for the file — a distinctive token from it, across docs and code:

```sh
grep -rn "accessibleQuery(undefined" --exclude-dir=node_modules .
```

| Hits        | What it means                | What you do                                                                     |
| ----------- | ---------------------------- | ------------------------------------------------------------------------------- |
| none        | the fact is new              | place it by the table below                                                     |
| one         | that file is the home        | point at it by path — a second statement is the failure, not the service        |
| two or more | you have found a duplication | pick the home, cut the others to a one-line pointer, land it in the same change |

Collapsing them is part of the change that found them, not a follow-up.

## Where a fact belongs

| The fact is                                                        | Home                                                                       |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| a rule that binds every directory                                  | root `AGENTS.md`                                                           |
| a convention or invariant of one workspace                         | that workspace's `AGENTS.md`                                               |
| an ordered procedure where a skipped step fails silently           | `.agents/docs/playbooks/<verb>-<rest>.md` — verb first, kebab-case         |
| structure spanning workspaces — a pipeline, a permission model     | `.agents/docs/architecture/<topic>.md`                                     |
| what a workspace is, what it builds, who depends on it             | `.agents/docs/workspace-map.md`                                            |
| the API or local status of a consumed `@douglasneuroinformatics/*` | `.agents/docs/packages/<name>.md`                                          |
| agent behaviour with a trigger of its own                          | a skill — `.agents/skills/writing-great-skills/SKILL.md` decides its shape |

**A playbook ends in a `## Verify` block.** If you cannot write the commands that show the work
landed, what you have is reference, and it belongs in an `AGENTS.md` or an architecture doc. The
corollary: a playbook carries the order of operations and points outward for every rule.

## House format — playbook

`add-web-route.md` is the template; read it before writing a new one.

- **Title, then where the conventions live** — "Conventions live in `apps/web/AGENTS.md`; read it
  first. This file is only the ordering that matters." Line 3 says what the file is not.
- **The expected failure, before step 1.** Say what a correct run looks like when it looks broken, or
  which single step is the one that fails silently — `add-instrument.md` names step 6 in its second
  sentence.
- **Numbered steps, each opening in bold with the action**, and each carrying the consequence of
  skipping it. Tables inside a step where the step is a choice between shapes.
- **Name the file to copy.** Every playbook points at a canonical example by path — `logs.tsx`,
  `vendor/react@19.x`, `apps/api/src/groups/`. `add-vendor-package.md` writes it as "Copy an existing
  wrapper rather than starting empty".
- **Close on `## Verify`:** a fenced `sh` block of real commands, plus a line on what a given failure
  means — `add-web-route.md` says a TS2345 there means only that the route tree is not regenerated
  yet.

The list heading is the one unfixed part: `## Steps`, `## Checklist` and going straight into the
numbered list are all in use — match the playbook nearest your topic. `## Traps` before `## Verify`
is optional and holds what no step owns (`add-blog-post.md`).

## House format — AGENTS.md

- **Title is the workspace path** — `# apps/web`, `# packages/licenses`.
- **Identity paragraph, a few lines:** what it is, who consumes it, whether it builds.
- **Stakes in a blockquote** where getting it wrong is expensive, as `apps/api` and
  `packages/runtime-core` do.
- **The trap comes before the conventions**, under `## Traps` or a heading that states the trap as a
  sentence (`## Nothing in this directory is checked by anything`, `vendor/AGENTS.md`).
- **Name the canonical file to read** for each recurring task, by path, the way `apps/api/AGENTS.md`
  names `src/groups/__tests__/groups.service.spec.ts`.
- **Close on how the work is checked** — `## Tests` giving `pnpm exec vitest --project <name>`, or
  stating there is no project and what covers the behaviour instead (`packages/react-core/AGENTS.md`).
  Where vitest is not the answer the section keeps another name (`docs/AGENTS.md`,
  `## Checking your work`); `apps/api` closes on `## Build` after it and `cli/AGENTS.md` has none.
- **Point down, not up.** The root `AGENTS.md` already loads every turn — point outward only where
  the reader must leave, to the playbook for the procedure or the architecture doc for the model.

**A new `AGENTS.md` needs a sibling `CLAUDE.md` symlink** — `ln -s AGENTS.md CLAUDE.md`, committed
(git mode `120000`, one-line blob `AGENTS.md`). Every `CLAUDE.md` here is that symlink: never author
or edit one, edit the `AGENTS.md`. Every tracked `AGENTS.md` has the symlink except those that are
not this repo's conventions — the published `packages/instrument-guidelines/AGENTS.md` (root
`AGENTS.md` explains why) and `.agents/skills/vercel-react-best-practices/AGENTS.md`, vendored.

## Prose rules

- **Bold lead-in on every rule**, so a scan of the bold text is the summary.
- **State the failure, not the exhortation.** "A story written anywhere else is silently not picked
  up" (`storybook/AGENTS.md`) does work that "be careful where you put stories" cannot.
- **Every non-obvious claim carries its path**, and a decision carries the commit SHA that made it.
- **A number in prose goes stale; a table counts itself.** `runtime-and-vendor.md` states one set of
  files as two different counts, prose against its own table. State a count only beside the command
  that reproduces it (`workspace-map.md`, `pnpm ls -r --depth -1`).
- **Write the fact, not the process that found it.**

## Tables that move together

Each row is one commit's worth of work.

| You changed                             | These move with it                                                                                                                                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a workspace added, renamed or moved     | `workspace-map.md` (its section table, Built vs source-only, Published to npm), root `AGENTS.md` "Where to look", the new `AGENTS.md` and its `CLAUDE.md` symlink                                         |
| a vitest project added or removed       | `testing-strategy.md` Vitest projects table, the count opening it **and** its "everything else has no unit tests" list; `workspace-map.md`'s `Vitest project` column; that workspace's `## Tests` section |
| a new playbook                          | root `AGENTS.md` "Step-by-step playbooks" row                                                                                                                                                             |
| a new architecture doc                  | root `AGENTS.md` "Deeper reference, read on demand" row                                                                                                                                                   |
| a new `.agents/docs/packages/<name>.md` | `.agents/docs/packages/index.md` (its section table's `Docs` link, the fidelity table) and the root `AGENTS.md` "Internal DNP packages" list                                                              |
| a new skill                             | its `.claude/skills/<name>` symlink and `agents/openai.yaml` sidecar — below — and the skill index in `.agents/skills/odc-orientation/SKILL.md`                                                           |

**A skill nothing symlinks is a skill nothing loads.** `ln -s ../../.agents/skills/<name> .claude/skills/<name>`,
committed at git mode `120000`, is what puts a skill in front of an agent; without it the `SKILL.md`
is never read and nothing reports it. The sidecar is two keys — `interface.display_name` and
`interface.short_description`; copy `.agents/skills/review-pr/agents/openai.yaml`.

## Formatting is not your problem

There is nothing to make pass — the pre-commit hook formats rather than verifies
(`.agents/docs/playbooks/run-locally.md`). No `proseWrap` is configured, so your line breaks survive:
match the wrap of the file you are editing. `.agents/skills` is formatted; `.claude/skills` is in
`.prettierignore` because its entries are symlinks, which are not formattable.

## Done when

- A grep for each fact you wrote returns one statement of it and any number of pointers.
- Every path you cited resolves — `ls` each one.
- Every bullet of the House format list for the kind you touched is satisfied — a playbook with its
  expected failure before step 1, its named file to copy and its `## Verify`; an `AGENTS.md` with its
  path title, trap before conventions, and closing check — or your reply names the bullet you skipped.
- Every table in the row you triggered above is updated, or your reply names the one you left and
  why.
- Any workspace `AGENTS.md` your change contradicts is revised in the same commit, never left
  disagreeing (root `AGENTS.md`, "Before you are done").
