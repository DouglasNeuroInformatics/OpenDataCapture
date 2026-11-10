import { describe, expect, it } from 'vitest';

import { checkPullRequest } from '../pr-body.ts';

const HEAD = 'a'.repeat(40);

const OTHER = 'b'.repeat(40);

const FOOTER = '🤖 Generated with [Claude Code](https://claude.com/claude-code)';

const ATTESTATION = 'I, Claude, attest that the review block above reports the adversarial review as it ran.';

type ReviewParts = {
  attestation?: string;
  findings?: string;
  stamp?: string;
  tail?: string;
};

function review({
  attestation = ATTESTATION,
  findings = 'CLEAN',
  stamp = `Reviewed at commit ${HEAD}. pnpm check: green.`,
  tail = ''
}: ReviewParts = {}): string {
  return [
    'Users get a thing.',
    '',
    '## Notes',
    '',
    'Context.',
    '',
    '## Adversarial review',
    '',
    stamp,
    '',
    '### Findings',
    '',
    findings,
    tail,
    '',
    '### Attestation',
    '',
    attestation,
    '',
    FOOTER
  ].join('\n');
}

type EventParts = {
  action?: string;
  body?: null | string;
  ref?: string;
  user?: { login: string; type: string };
};

function check(
  { action = 'opened', body = review(), ref = 'feature', user = { login: 'someone', type: 'User' } }: EventParts = {},
  commitMessages = ''
) {
  const eventJson = JSON.stringify({ action, pull_request: { body, head: { ref, sha: HEAD }, user } });
  return checkPullRequest(() => ({ commitMessages, eventJson }));
}

function failuresOf(parts: EventParts, commitMessages?: string): string {
  const { passed, report } = check(parts, commitMessages);
  expect(passed).toBe(false);
  return report;
}

describe('checkPullRequest', () => {
  describe('authorship', () => {
    it('should pass a body with no agent trace unchecked, so the template binds agents only', () => {
      expect(check({ body: 'A person wrote this.' })).toEqual({
        passed: true,
        report: 'The pull request shows no agent authorship, so the template does not apply.\n'
      });
    });

    it('should pass a merge-back to a release branch unchecked, since its commits already passed', () => {
      expect(check({ body: FOOTER, ref: 'release/2' }).passed).toBe(true);
    });

    it('should pass Dependabot unchecked, since it is the one exempt bot', () => {
      expect(check({ body: null, user: { login: 'dependabot[bot]', type: 'Bot' } }).passed).toBe(true);
    });

    it('should check a bot author whatever its body says', () => {
      expect(failuresOf({ body: null, user: { login: 'renovate[bot]', type: 'Bot' } })).toContain('The body is empty.');
    });

    it('should check a body whose author committed with an agent trailer', () => {
      expect(failuresOf({ body: 'Plain.' }, 'fix: x\n\nCo-Authored-By: Claude <noreply@anthropic.com>')).toContain(
        'The body has no `## Adversarial review` section.'
      );
    });

    it.each([
      ['a trailer', 'Co-Authored-By: Codex <x@y.z>'],
      ['the footer', FOOTER],
      ['an attestation', ATTESTATION],
      ['a review heading', '## Adversarial review']
    ])('should check a body that carries %s', (_, trace) => {
      expect(check({ body: `Plain.\n\n${trace}` }).passed).toBe(false);
    });

    it('should ignore a trace inside a code fence, so quoting the template does not bind a person', () => {
      expect(check({ body: `Plain.\n\n\`\`\`\n${FOOTER}\n\`\`\`` }).passed).toBe(true);
    });
  });

  describe('body', () => {
    it('should pass a body that meets the template', () => {
      expect(check()).toEqual({ passed: true, report: 'The pull request body meets the template.\n' });
    });

    it('should refuse a Verification section, since pnpm check is the only verification statement', () => {
      expect(failuresOf({ body: `## Verification\n\nRan it.\n\n${review()}` })).toContain(
        'Remove the `## Verification` section'
      );
    });

    it('should refuse a Notes section after the review block', () => {
      expect(failuresOf({ body: `${review()}\n\n## Notes\n\nLate.` })).toContain(
        'A Notes section goes before `## Adversarial review`'
      );
    });

    it('should refuse a review block that does not state pnpm check is green', () => {
      expect(failuresOf({ body: review({ stamp: `Reviewed at commit ${HEAD}.` }) })).toContain(
        'does not state `pnpm check: green`'
      );
    });

    it('should refuse a review block without an attestation', () => {
      expect(failuresOf({ body: review({ attestation: 'Trust me.' }) })).toContain('has no `### Attestation`');
    });

    it('should refuse a review block without a Findings section', () => {
      expect(failuresOf({ body: `${FOOTER}\n\n## Adversarial review\n\npnpm check: green.` })).toContain(
        'has no `### Findings` section'
      );
    });
  });

  describe('attestation', () => {
    const cannotAttest = 'I, Claude, cannot attest: the review did not run.';

    it('should pass a review that cannot attest without a stamp, so the reviewer decides', () => {
      expect(
        check({ body: review({ attestation: cannotAttest, findings: 'Skipped.', stamp: 'pnpm check: green.' }) }).passed
      ).toBe(true);
    });

    it('should refuse a review that cannot attest and says nothing under Findings', () => {
      expect(failuresOf({ body: review({ attestation: cannotAttest, findings: '' }) })).toContain(
        'says what happened under `### Findings`'
      );
    });
  });

  describe('stamp', () => {
    it('should refuse a review block that names no commit', () => {
      expect(failuresOf({ body: review({ stamp: 'pnpm check: green.' }) })).toContain('names no reviewed commit');
    });

    it('should refuse a stamp on a push that does not name the head', () => {
      expect(
        failuresOf({
          action: 'synchronize',
          body: review({ stamp: `Reviewed at commit ${OTHER}. pnpm check: green.` })
        })
      ).toContain(`names no commit matching the head \`${HEAD}\``);
    });

    it('should pass a stale stamp on an edit, since the body is edited before the push it names', () => {
      expect(
        check({ action: 'edited', body: review({ stamp: `Reviewed at commit ${OTHER}. pnpm check: green.` }) }).passed
      ).toBe(true);
    });

    it('should pass a follow-up line that names the head', () => {
      const stamp = `Reviewed at commit ${OTHER}. pnpm check: green.\nFollow-up ${HEAD}: addresses findings 1; no new code.`;
      expect(check({ body: review({ stamp }) }).passed).toBe(true);
    });
  });

  describe('findings', () => {
    it('should pass NO REVIEWABLE FILES, so a diff the review reads none of is reported as such', () => {
      expect(check({ body: review({ findings: 'NO REVIEWABLE FILES' }) }).passed).toBe(true);
    });

    it('should refuse a CLEAN review that lists a fixed finding', () => {
      expect(failuresOf({ body: review({ tail: '\n### Fixed\n\n- 1. Done.' }) })).toContain(
        'A `CLEAN` review lists nothing under Fixed or Declined.'
      );
    });

    it('should name the extra text after CLEAN, so the author knows the token itself is right', () => {
      expect(failuresOf({ body: review({ findings: 'CLEAN\n\nThe review ended at file selection.' }) })).toContain(
        "`### Findings` holds text besides `CLEAN`; it holds the review's reply alone, and context goes in Notes."
      );
    });

    it('should refuse Findings that are neither a reply token nor numbered', () => {
      expect(failuresOf({ body: review({ findings: 'Looks fine.' }) })).toContain(
        '`### Findings` is not `CLEAN`, `NO REVIEWABLE FILES` or numbered findings.'
      );
    });

    it('should pass numbered findings that are each fixed or declined', () => {
      const tail = '\n### Fixed\n\n- 1. Guarded.\n\n### Declined\n\n- 2. Upstream guard.';
      expect(check({ body: review({ findings: '1. a.ts:1 — x — y\n2. b.ts:2 — x — y', tail }) }).passed).toBe(true);
    });

    it('should refuse a finding that is neither fixed nor declined', () => {
      expect(failuresOf({ body: review({ findings: '1. a.ts:1 — x — y' }) })).toContain(
        'Finding 1 is neither fixed nor declined.'
      );
    });

    it('should refuse a finding that is both fixed and declined', () => {
      const tail = '\n### Fixed\n\n- 1. Guarded.\n\n### Declined\n\n- 1. Upstream guard.';
      expect(failuresOf({ body: review({ findings: '1. a.ts:1 — x — y', tail }) })).toContain(
        'Finding 1 is listed as both fixed and declined.'
      );
    });

    it('should refuse a fixed finding the review did not return', () => {
      const tail = '\n### Fixed\n\n- 1. Guarded.\n- 2. Invented.';
      expect(failuresOf({ body: review({ findings: '1. a.ts:1 — x — y', tail }) })).toContain(
        'Finding 2 is fixed or declined but not listed under Findings.'
      );
    });
  });

  describe('payload', () => {
    it.each([
      ['invalid JSON', '{'],
      ['a payload without an action', JSON.stringify({ pull_request: {} })],
      [
        'a non-string body',
        JSON.stringify({ action: 'opened', pull_request: { body: 1, head: { ref: 'x', sha: HEAD } } })
      ],
      [
        'a user without a type',
        JSON.stringify({
          action: 'opened',
          pull_request: { body: null, head: { ref: 'x', sha: HEAD }, user: { login: 'x' } }
        })
      ]
    ])('should report %s as a failure of the check itself, so the PR is not passed', (_, eventJson) => {
      const { passed, report } = checkPullRequest(() => ({ commitMessages: '', eventJson }));
      expect(passed).toBe(false);
      expect(report).toContain('The check itself failed: ');
    });

    it('should report an input that cannot be read, so the workflow still has a comment to post', () => {
      const { passed, report } = checkPullRequest(() => {
        throw new Error('ENOENT: event.json');
      });
      expect(passed).toBe(false);
      expect(report).toContain('The check itself failed: Error: ENOENT: event.json');
    });
  });
});
