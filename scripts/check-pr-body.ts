import fs from 'node:fs';

type PullRequestEvent = {
  action: string;
  pull_request: {
    body: null | string;
    head: { sha: string };
  };
};

const SKILL_PATH = '.agents/skills/opening-pr/SKILL.md';

const FORBIDDEN_HEADING = /^#{1,6} +(verification|validation|notes|implementation notes)\b/i;

const FENCE = /^(```|~~~)/;

const STAMP = /^(?:Reviewed at commit|Follow-up) ([0-9a-f]{40})\b/gm;

function isRecord(value: unknown): value is { [key: string]: unknown } {
  return typeof value === 'object' && value !== null;
}

function parseEvent(contents: unknown): PullRequestEvent {
  if (!isRecord(contents) || typeof contents.action !== 'string' || !isRecord(contents.pull_request)) {
    throw new Error('Expected a pull_request event payload with an action and a pull_request');
  }
  const { body, head } = contents.pull_request;
  if ((body !== null && typeof body !== 'string') || !isRecord(head) || typeof head.sha !== 'string') {
    throw new Error('Expected pull_request.body to be a string or null and pull_request.head.sha a string');
  }
  return { action: contents.action, pull_request: { body, head: { sha: head.sha } } };
}

function readEvent(): PullRequestEvent {
  const [eventPath] = process.argv.slice(2);
  if (!eventPath) {
    throw new Error('Usage: node scripts/check-pr-body.ts <event.json>');
  }
  return parseEvent(JSON.parse(fs.readFileSync(eventPath, 'utf8')));
}

function outsideFences(lines: string[]): string[] {
  let fenced = false;
  return lines.filter((line) => {
    if (FENCE.test(line)) {
      fenced = !fenced;
      return false;
    }
    return !fenced;
  });
}

function findSection(text: string, heading: string, level: number): null | string {
  const lines = text.split(/\r?\n/);
  const title = `${'#'.repeat(level)} ${heading}`.toLowerCase();
  const start = lines.findIndex((line) => line.trim().toLowerCase() === title);
  if (start === -1) {
    return null;
  }
  const boundary = new RegExp(`^#{1,${level}}\\s`);
  const end = lines.findIndex((line, index) => index > start && boundary.test(line));
  return lines.slice(start + 1, end === -1 ? undefined : end).join('\n');
}

function listNumbers(text: null | string): Set<number> {
  return new Set(Array.from((text ?? '').matchAll(/^\s*(?:-\s*)?(\d+)\./gm), (match) => Number(match[1])));
}

function checkReview(review: string, event: PullRequestEvent): string[] {
  const failures: string[] = [];
  const stamps = Array.from(review.matchAll(STAMP), (match) => match[1]);
  const headSha = event.pull_request.head.sha;
  if (stamps.length === 0) {
    failures.push('The review block names no reviewed commit.');
  } else if (event.action !== 'edited' && !stamps.includes(headSha)) {
    // The body is edited for a new head before that head is pushed, so an edit is checked against
    // the head only once the push that follows it arrives.
    failures.push(`The review block names no commit matching the head \`${headSha}\`.`);
  }
  if (!/\bpnpm check: green\b/.test(review)) {
    failures.push('The review block does not state `pnpm check: green`.');
  }
  const findings = findSection(review, 'findings', 3);
  if (findings === null) {
    failures.push('The review block has no `### Findings` section.');
    return failures;
  }
  const fixed = listNumbers(findSection(review, 'fixed', 3));
  const declined = listNumbers(findSection(review, 'declined', 3));
  if (findings.trim() === 'CLEAN') {
    if (fixed.size + declined.size > 0) {
      failures.push('A `CLEAN` review lists nothing under Fixed or Declined.');
    }
    return failures;
  }
  const found = listNumbers(findings);
  if (found.size === 0) {
    failures.push('`### Findings` is neither `CLEAN` nor numbered findings.');
  }
  for (const number of found) {
    if (fixed.has(number) && declined.has(number)) {
      failures.push(`Finding ${number} is listed as both fixed and declined.`);
    } else if (!fixed.has(number) && !declined.has(number)) {
      failures.push(`Finding ${number} is neither fixed nor declined.`);
    }
  }
  for (const number of new Set([...fixed, ...declined])) {
    if (!found.has(number)) {
      failures.push(`Finding ${number} is fixed or declined but not listed under Findings.`);
    }
  }
  return failures;
}

function checkBody(event: PullRequestEvent): string[] {
  const { body } = event.pull_request;
  if (!body?.trim()) {
    return ['The body is empty.'];
  }
  const failures = outsideFences(body.split(/\r?\n/))
    .filter((line) => FORBIDDEN_HEADING.test(line))
    .map((line) => `Remove the \`${line.trim()}\` section; the body carries effects, decisions and risks only.`);
  const review = findSection(body, 'adversarial review', 2);
  if (review === null) {
    failures.push('The body has no `## Adversarial review` section.');
  } else {
    failures.push(...checkReview(review, event));
  }
  return failures;
}

function report(failures: string[]): never {
  const lines = [
    `This pull request was closed because its body does not meet \`${SKILL_PATH}\`:`,
    '',
    ...failures.map((failure) => `- ${failure}`),
    '',
    'Fix the body with `gh pr edit <number> --body-file <path>`, then `gh pr reopen <number>`.'
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
  process.exit(1);
}

function main(): void {
  let failures: string[];
  try {
    failures = checkBody(readEvent());
  } catch (error) {
    report([`The check itself failed: ${error instanceof Error ? error.message : String(error)}`]);
  }
  if (failures.length > 0) {
    report(failures);
  }
  process.stdout.write('The pull request body meets the template.\n');
}

main();
