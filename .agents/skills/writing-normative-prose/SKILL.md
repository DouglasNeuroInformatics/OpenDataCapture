---
name: writing-normative-prose
description: Sentence, list and literal-text rules for a document that states rules or decisions as fact for a reader who builds from it, such as a specification or an implementation plan. Use when another skill names this one. Not for documentation, reports, emails or other prose.
---

# Writing Normative Prose

Normative prose states rules and decisions as fact, for a reader who builds from them. "The document" below is the text being written, and "the reader" is whoever builds from it.

## Sentences

- Short declarative sentences in the present tense that state behavior as fact: "is", not "should". No RFC 2119 keywords.
- One idea per sentence. Commas, colons and periods in place of em dashes.
- The subject of a sentence is the thing the rule governs, such as an input, a stored item, a message or an actor, not the system that the document describes. The passive is allowed, and is the usual form when the actor is the system. The system is the subject only of a sentence about the system as a whole.
- A sentence names the set it governs. A quantifier with no noun ("everything", "anything", "whatever") or a clause standing in for a set ("what the input contains", "whichever applies") is a defect unless that sentence or the one before it enumerates the set.
- Choose the exact word over the approximate one: "within five seconds", not "quickly"; "rounded to the nearest cent", not "rounded".
- Use a technical term when it says something more precisely than plain words and the reader would know it without looking it up: "case-insensitive", not "ignoring capital letters"; "every read returns the most recently saved value", not "reads are linearizable".

## Cases

A rule with a fixed set of cases is a lead sentence that names the set, then one list item per case: a bold label, the condition, and the outcome last. Two cases are still a list.

## Once

A rule is written once. A sentence elsewhere that relies on it cites it and may name the rule in a few words, but never restates its content. The skill that loads this one gives the form of the citation.

## Literal Text

A code span marks literal text: anything that appears exactly as written in code, a file, a command line or a message the software sends or receives, such as an identifier, a flag, a header or a literal value.

## Anti-Patterns

Each pair shows text these rules reject and the text that replaces it. All are from a fictional document about a job scheduler with an HTTP API: a job has a schedule, and each scheduled time starts a run.

**A quantifier over an unnamed set.**

- Rejected: "Everything a request carries is validated before it is acted on."
- Accepted: "Every request body is parsed with the JSON Schema of its endpoint before the handler runs. A body the schema rejects is refused with status 400."

**The system as subject.**

- Rejected: "The scheduler checks the schedule expression. The scheduler rejects an expression with a field out of range."
- Accepted: "A `schedule` with a field out of its range is refused with status 400."

**A fixed set of cases in prose.**

- Rejected: "After a run fails, a new run is queued when the job's retry limit is not reached, no run is queued when the job is paused or deleted, and otherwise the job waits for its next scheduled time."
- Accepted: "After a run fails, one of three things follows:
  - **Retry.** The job's `retryLimit` is not reached: a new run is queued.
  - **Cancel.** The job is paused or deleted: no run is queued.
  - **Wait.** Otherwise: the job waits for its next scheduled time."
