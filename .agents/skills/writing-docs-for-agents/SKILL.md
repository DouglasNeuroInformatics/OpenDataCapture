---
name: writing-docs-for-agents
description: Write or correct this repo's agent documentation — a workspace AGENTS.md (or its CLAUDE.md symlink), a playbook under .agents/docs/playbooks, an architecture doc, the workspace map, or a skill. Use when a documented rule is wrong or missing, when a change contradicts an AGENTS.md, or when another skill needs the house format for these files. Architectural decisions land in .agents/docs/architecture; there is no ADR flow.
---

`.agents/` is neither shipped nor linted, so nothing reports a fact in the wrong file or a second copy going
stale. **Every fact has one home.**

## Find the home before you write

Search tracked files for a distinctive token of the fact (`git grep -n '<token>'`). No hits: place it by the
list below. One hit: that is the home; point at it by path. Two or more: pick the home and cut the rest to
one-line pointers in the same change.

- **A rule that binds every directory:** root `AGENTS.md`.
- **A convention or invariant of one workspace:** that workspace's `AGENTS.md`.
- **An ordered procedure where a skipped step fails silently:** `.agents/docs/playbooks/<verb>-<rest>.md`,
  verb first, kebab-case.
- **Structure spanning workspaces, such as a pipeline or a permission model:**
  `.agents/docs/architecture/<topic>.md`.
- **What a workspace is, what it builds, who depends on it:** `.agents/docs/workspace-map.md`.
- **Which consumed `@douglasneuroinformatics/*` package does what:** `.agents/docs/packages/index.md`. Never
  its API; agents read the source.
- **Agent behaviour with a trigger of its own:** a skill, `.agents/skills/<name>/SKILL.md`.

## House format

**Playbook** — `add-web-route.md` is the template. Title, then a line saying where the conventions live and
that this file is only the ordering. The expected failure, or the one step that fails silently, before step 1.
Numbered steps, each opening with the action in bold and stating the cost of skipping it. Name a canonical file
to copy by path. Close on `## Verify`: a fenced `sh` block of real commands and what a given failure means. If
you cannot write the Verify block, it is reference and belongs in an `AGENTS.md` or architecture doc.

**AGENTS.md** — title is the workspace path (`# apps/web`). A few lines of identity: what it is, who consumes
it, whether it builds. Stakes in a blockquote where a mistake is expensive. Traps before conventions. Name the
canonical file for each recurring task. Close on how the work is checked (`## Tests` with
`pnpm exec vitest --project <name>`, or what covers it instead). Point down, not up: root `AGENTS.md` is
always loaded.

**A new `AGENTS.md` needs a sibling `CLAUDE.md` symlink** (`ln -s AGENTS.md CLAUDE.md`, committed at git mode
`120000`), except the published `packages/instrument-guidelines/AGENTS.md`, which is not this repo's
conventions. Never author or edit a `CLAUDE.md`.

**Skill** — the body follows `.agents/skills/writing-skills-for-agents/SKILL.md`. **A skill nothing symlinks
is never loaded:** add `ln -s ../../.agents/skills/<name> .claude/skills/<name>` (git mode `120000`) and an
`agents/openai.yaml` sidecar with `interface.display_name` and `interface.short_description`.

## Prose rules

- **Bold lead-in on every rule**, so the bold text alone is the summary.
- **State the failure, not the exhortation**: "a story written anywhere else is silently not picked up", not
  "be careful where you put stories".
- **Every non-obvious claim carries its path**; a decision carries the commit SHA that made it.
- **State a count only beside the command that reproduces it**; prose counts go stale, tables count themselves.
- **Write the fact, not the process that found it.**

## Docs that move together

- **A workspace added, renamed or moved:** `.agents/docs/workspace-map.md` ("Who depends on what", "Built vs
  source-only", "Published to npm"), `.agents/docs/index.md` "Where to look", and the new `AGENTS.md` and its
  symlink.
- **A vitest project added or removed:** `.agents/docs/architecture/testing-strategy.md` "Vitest projects"
  (the table, the count in its first line, and the "Everything else has no unit tests" paragraph), and the
  workspace `AGENTS.md` `## Tests`.
- **A consumed `@douglasneuroinformatics/*` package added or removed:** the table and its count in
  `.agents/docs/packages/index.md`, and the count in `.agents/docs/index.md` "Deeper reference, read on
  demand".
- **A new playbook:** `.agents/docs/index.md` "Step-by-step playbooks".
- **A new architecture doc:** `.agents/docs/index.md` "Deeper reference, read on demand".

**Done when** every path you cited resolves and any `AGENTS.md` your change contradicts is revised in the same
commit with the user's approval — or your reply names what you skipped.
