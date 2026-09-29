---
name: odc-commit
description: Write a commit in this repo — the Conventional Commits subject and the Co-Authored-By trailer naming the model that wrote it. Use whenever committing, and when a skill or sub-agent commits on its own. Filing the branch as a PR is odc-open-pr's job.
---

## Sign the commit with your model name

Every commit an agent writes ends with:

```
Co-Authored-By: <your own model name>
```

**Name yourself.** Not the harness you run in, not the model that wrote an earlier commit, not a
guess — the model producing the commit. No email: this trailer is read by a person, not by GitHub.

```
Co-Authored-By: Claude Opus 5 (1M context)
Co-Authored-By: GPT-5.1 Codex
Co-Authored-By: Gemini 3 Pro
```

Spell it identically every time. `.agents/skills/odc-open-pr/SKILL.md` collects these across a
branch by exact string, so one model under two spellings reads as two models.

A commit the user wrote alone carries no trailer. Two models on one commit carry one line each.

Because the trailer has no email, GitHub will not render it as a co-author — that is the point. The
lines exist so the user can see which models touched a branch while reviewing it.

## Subject

`type(scope): subject`, one of the 11 `@commitlint/config-conventional` types. `scope` is optional
and, when present, must be a workspace name without the `@opendatacapture/` prefix —
`commitlint.config.ts` builds that enum from `pnpm-workspace.yaml`, so a non-workspace scope such as
`skills` or `ci` fails the `commit-msg` hook. Leave it off rather than inventing one.

One commit is one `CHANGELOG.md` entry for `feat`, `fix`, `perf` and breaking changes. Write the
subject for the person reading the changelog.
