**Principles**

- Correctness is structural, not vigilant. A correct system is one where the invalid state cannot be written, not one where a careful person catches it. Anything a human must remember, the compiler should remember instead.
- One source of truth; everything derived. Two artifacts that must agree is a bug waiting for its trigger.
- Strict data validation at the boundary, trusting inside. Data is distrusted exactly once, at the perimeter, then the interior runs clean, with no defensive re-checking cluttering the logic. The perimeter is where data arrives from outside the system's control: a request, the environment, a third-party response. What the system wrote, such as a JSON column, is inside.
- A declaration's name and type carry its meaning. When you reach for a doc comment to say what something is, returns or contains, use a more descriptive name instead. A comment explaining what code does usually means the code should be clearer. Save comments for what code can't say: facts about the outside world (a vendor bug, a protocol quirk) and navigation aids (e.g., section banners in long declaration files).
- Complexity concentrated, periphery boring. Sophistication lives in a small framework core so that ordinary code stays trivial, short, and fully inferred. Clever call sites mean the cleverness is in the wrong place.
- Never silently fail on errors. Fail loudly on an undeclared policy.

**Style**

- A name says what the thing is. A request's parameters are not its result, a container is not its content, and raw input is not parsed data. When a name is another name plus a word, that word says how the two differ.
- Name a database model or entity type as a domain noun: a thing a user would recognize, not a process.
- Prefer one general function or component to several near-duplicates. Delete code that exists only to keep variants alike.
- Match existing code of the same role. New code takes the naming, parameters and shape of the code that already does the same kind of job.

_Break any of these guidelines sooner than write anything outright barbarous._
