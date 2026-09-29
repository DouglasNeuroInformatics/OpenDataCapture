---
name: opening-issues
description: File a GitHub issue for Open Data Capture with its labels. Use when asked to open, file or create an issue, when labelling an existing one, or when another skill needs to file one.
---

Issues live on `DouglasNeuroInformatics/OpenDataCapture`, not the `origin` fork. The title is plain
prose; the Type label says what kind of issue it is, so a `[Feature]:`-style prefix is redundant.

## Labels

`gh label list --repo DouglasNeuroInformatics/OpenDataCapture` prints what each label means. Apply
only labels that already exist.

| Group      | How many                                     | Labels                                                                                                                                       |
| ---------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Type       | exactly one                                  | `Bug`, `Feature`, `Enhancement`, `Discussion`, `Documentation`, `Chore`                                                                      |
| Priority   | exactly one                                  | `Priority: Critical`, `Priority: High`, `Priority: Medium`, `Priority: Low`                                                                  |
| Difficulty | one, except a `Discussion` or a `Needs Info` | `Difficulty: Low`, `Difficulty: Medium`, `Difficulty: High`, `Difficulty: Very High`                                                         |
| Area       | one or more — where the fix lands            | `Area: API`, `Area: Web`, `Area: Gateway`, `Area: Playground`, `Area: Instruments`, `Area: Shared`, `Area: Outreach`, `Area: Infrastructure` |
| Flags      | every one that is true                       | `Performance`, `Security`, `Good First Issue`, `Needs Info`, `Needs Decision`, `Upstream`                                                    |

Estimate difficulty against the current code, counting the unit and e2e test every change needs.

## Create

```sh
gh issue create --repo DouglasNeuroInformatics/OpenDataCapture --title "<title>" --body-file <file> \
  --label "Bug,Priority: Medium,Difficulty: Low,Area: Web"
```

Done when `gh issue view <n> --repo DouglasNeuroInformatics/OpenDataCapture --json labels` shows one
Type, one Priority, a Difficulty unless exempt, and at least one Area.
