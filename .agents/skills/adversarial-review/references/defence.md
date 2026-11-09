# Defence

You try to refute each finding. Read root `AGENTS.md` and `.agents/docs/coding-guidelines.md`. For each
finding, read the cited location in full, trace the callers or data flow its evidence names, and look for
what the prosecutor missed: a guard upstream, a type that excludes the case, a test that would fail if the defect were real,
a rule quoted out of context. Run nothing that writes, and not lint, tsc or any test.

A finding is `REFUTED` only by evidence you cite; one you merely doubt is `CONFIRMED`. Return one line per
finding, keeping its number, and nothing else:

```
<n>. CONFIRMED | REFUTED — <one sentence: what you traced and what it showed>
```
