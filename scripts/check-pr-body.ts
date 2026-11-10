import fs from 'node:fs';

type PullRequestEvent = {
  action: string;
  pull_request: {
    body: null | string;
    head: { ref: string; sha: string };
    user: { login: string; type: string };
  };
};

type PullRequest = {
  commitMessages: string;
  event: PullRequestEvent;
};

const SKILL_PATH = '.agents/skills/opening-pr/SKILL.md';

const FORBIDDEN_HEADING = /^#{1,6} +(verification|validation|implementation notes)\b/i;

const NOTES_HEADING = /^#{1,6} +notes\b/i;

const REVIEW_HEADING = /^## +adversarial review\b/i;

const FENCE = /^(```|~~~)/;

const STAMP = /^(?:Reviewed at commit|Follow-up) ([0-9a-f]{40})\b/gm;

const ATTESTATION = /^I, [^,\n]+, (attest that .+|cannot attest: .+)$/m;

const AGENT_TRAILER = /^Co-Authored-By: *(?:Claude|GPT|Codex|Copilot)\b/im;

const AGENT_FOOTER = /^🤖 Generated with /m;

const EXEMPT_BOTS = new Set(['dependabot[bot]']);

// A merge-back carries commits whose own pull requests already passed this check into the release branch.
const EXEMPT_HEAD_REF = /^release\/\d+$/;

function isRecord(value: unknown): value is { [key: string]: unknown } {
  return typeof value === 'object' && value !== null;
}

function parseEvent(contents: unknown): PullRequestEvent {
  if (!isRecord(contents) || typeof contents.action !== 'string' || !isRecord(contents.pull_request)) {
    throw new Error('Expected a pull_request event payload with an action and a pull_request');
  }
  const { body, head, user } = contents.pull_request;
  if (
    (body !== null && typeof body !== 'string') ||
    !isRecord(head) ||
    typeof head.ref !== 'string' ||
    typeof head.sha !== 'string'
  ) {
    throw new Error('Expected pull_request.body to be a string or null and pull_request.head.ref and sha strings');
  }
  if (!isRecord(user) || typeof user.login !== 'string' || typeof user.type !== 'string') {
    throw new Error('Expected pull_request.user to have a string login and type');
  }
  return {
    action: contents.action,
    pull_request: { body, head: { ref: head.ref, sha: head.sha }, user: { login: user.login, type: user.type } }
  };
}

function readPullRequest(): PullRequest {
  const [eventPath, commitMessagesPath] = process.argv.slice(2);
  if (!eventPath || !commitMessagesPath) {
    throw new Error('Usage: node scripts/check-pr-body.ts <event.json> <commit-messages.txt>');
  }
  return {
    commitMessages: fs.readFileSync(commitMessagesPath, 'utf8'),
    event: parseEvent(JSON.parse(fs.readFileSync(eventPath, 'utf8')))
  };
}

// The template binds agents, not people. An agent that leaves no trace cannot be told apart from a
// person, so a review block is a trace too: a body that carries one is checked whatever else it says.
function isAgentAuthored({ commitMessages, event }: PullRequest): boolean {
  const { body, head, user } = event.pull_request;
  if (EXEMPT_HEAD_REF.test(head.ref)) {
    return false;
  }
  const lines = outsideFences((body ?? '').split(/\r?\n/));
  const text = lines.join('\n');
  return (
    (user.type === 'Bot' && !EXEMPT_BOTS.has(user.login)) ||
    AGENT_TRAILER.test(commitMessages) ||
    AGENT_TRAILER.test(text) ||
    AGENT_FOOTER.test(text) ||
    ATTESTATION.test(text) ||
    lines.some((line) => REVIEW_HEADING.test(line))
  );
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

function checkStamp(review: string, event: PullRequestEvent): string[] {
  const stamps = Array.from(review.matchAll(STAMP), (match) => match[1]);
  const headSha = event.pull_request.head.sha;
  if (stamps.length === 0) {
    return ['The review block names no reviewed commit.'];
  }
  if (event.action !== 'edited' && !stamps.includes(headSha)) {
    // The body is edited for a new head before that head is pushed, so an edit is checked against
    // the head only once the push that follows it arrives.
    return [`The review block names no commit matching the head \`${headSha}\`.`];
  }
  return [];
}

function checkFindings(review: string, findings: string): string[] {
  const failures: string[] = [];
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

function checkReview(review: string, event: PullRequestEvent): string[] {
  const failures: string[] = [];
  if (!/\bpnpm check: green\b/.test(review)) {
    failures.push('The review block does not state `pnpm check: green`.');
  }
  const attestation = findSection(review, 'attestation', 3)?.match(ATTESTATION);
  if (!attestation) {
    failures.push(
      'The review block has no `### Attestation` with an `I, <model name>, attest that …` or `cannot attest: …` line.'
    );
  }
  const findings = findSection(review, 'findings', 3);
  if (findings === null) {
    failures.push('The review block has no `### Findings` section.');
    return failures;
  }
  const cannotAttest = attestation?.[1]?.startsWith('cannot attest') ?? false;
  if (cannotAttest) {
    if (findings.trim() === '') {
      failures.push('A review that cannot attest says what happened under `### Findings`.');
    }
    return failures;
  }
  return [...failures, ...checkStamp(review, event), ...checkFindings(review, findings)];
}

function checkBody(event: PullRequestEvent): string[] {
  const { body } = event.pull_request;
  if (!body?.trim()) {
    return ['The body is empty.'];
  }
  const lines = outsideFences(body.split(/\r?\n/));
  const failures = lines
    .filter((line) => FORBIDDEN_HEADING.test(line))
    .map((line) => `Remove the \`${line.trim()}\` section; the body carries effects, decisions and risks only.`);
  const reviewIndex = lines.findIndex((line) => REVIEW_HEADING.test(line));
  if (lines.some((line, index) => index > reviewIndex && NOTES_HEADING.test(line))) {
    failures.push('A Notes section goes before `## Adversarial review`, and nowhere after it.');
  }
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
    const pullRequest = readPullRequest();
    if (!isAgentAuthored(pullRequest)) {
      process.stdout.write('The pull request shows no agent authorship, so the template does not apply.\n');
      return;
    }
    failures = checkBody(pullRequest.event);
  } catch (error) {
    report([`The check itself failed: ${error instanceof Error ? error.message : String(error)}`]);
  }
  if (failures.length > 0) {
    report(failures);
  }
  process.stdout.write('The pull request body meets the template.\n');
}

main();
