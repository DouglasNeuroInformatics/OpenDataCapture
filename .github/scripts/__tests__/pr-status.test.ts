import { describe, expect, it } from 'vitest';

import { planStatusLabels, PULL_REQUESTS_QUERY, STATUS_JOB_NAME } from '../pr-status.ts';

const HEAD = 'a'.repeat(40);

const EARLIER = 'b'.repeat(40);

const AUTHOR = 'contributor';

const REVIEWER = 'maintainer';

const FIRST_RUN = '2026-01-01T00:00:00Z';

const RERUN = '2026-01-01T00:05:00Z';

type ReviewNode = {
  author: null | { __typename: 'Bot' | 'User'; login: string };
  commit: null | { oid: string };
  state: string;
};

type CheckRunParts = {
  name?: string;
  startedAt?: null | string;
  status?: string;
};

type ContextNode =
  | { __typename: 'CheckRun'; conclusion: null | string; name: string; startedAt: null | string; status: string }
  | { __typename: 'StatusContext'; context: string; createdAt: string; state: string };

type PullRequestParts = {
  author?: null | { login: string };
  contexts?: ContextNode[] | null;
  isDraft?: boolean;
  labels?: string[];
  latestOpinionatedReviews?: ReviewNode[];
  mergeable?: string;
  number?: number;
  reviewRequestCount?: number;
  reviews?: ReviewNode[];
  threads?: boolean[];
};

function review(state: string, commit = HEAD, login = REVIEWER): ReviewNode {
  return { author: { __typename: 'User', login }, commit: { oid: commit }, state };
}

function botReview(state: string, commit = HEAD): ReviewNode {
  return { author: { __typename: 'Bot', login: 'copilot-pull-request-reviewer' }, commit: { oid: commit }, state };
}

function checkRun(
  conclusion: null | string,
  { name = 'lint-and-test', startedAt = FIRST_RUN, status = 'COMPLETED' }: CheckRunParts = {}
): ContextNode {
  return { __typename: 'CheckRun', conclusion, name, startedAt, status };
}

function statusContext(state: string, createdAt = FIRST_RUN): ContextNode {
  return { __typename: 'StatusContext', context: 'deploy/preview', createdAt, state };
}

function connection<T>(nodes: T[]) {
  return { nodes, totalCount: nodes.length };
}

function pullRequestNode({
  author = { login: AUTHOR },
  contexts = [checkRun('SUCCESS')],
  isDraft = false,
  labels = [],
  latestOpinionatedReviews = [],
  mergeable = 'MERGEABLE',
  number = 1,
  reviewRequestCount = 0,
  reviews = latestOpinionatedReviews,
  threads = []
}: PullRequestParts = {}) {
  return {
    author,
    commits: { nodes: [{ commit: { statusCheckRollup: contexts && { contexts: connection(contexts) } } }] },
    headRefOid: HEAD,
    isDraft,
    labels: connection(labels.map((name) => ({ name }))),
    latestOpinionatedReviews: connection(latestOpinionatedReviews),
    mergeable,
    number,
    reviewRequests: { totalCount: reviewRequestCount },
    reviews: { nodes: reviews },
    reviewThreads: connection(threads.map((isResolved) => ({ isResolved })))
  };
}

function pages(...pullRequestPages: unknown[][]): string {
  return JSON.stringify(pullRequestPages.map((nodes) => ({ data: { repository: { pullRequests: { nodes } } } })));
}

function statusOf(parts: PullRequestParts = {}) {
  return planStatusLabels(pages([pullRequestNode(parts)]))[0]?.add;
}

describe('planStatusLabels', () => {
  describe('status', () => {
    it('should mark a draft as a draft whatever else holds, since no one acts on it yet', () => {
      expect(statusOf({ contexts: [checkRun('FAILURE')], isDraft: true, mergeable: 'CONFLICTING' })).toBe(
        'Status: Draft'
      );
    });

    it('should ask for a rebase before anything else, since a conflict blocks the merge outright', () => {
      expect(statusOf({ contexts: [checkRun('FAILURE')], mergeable: 'CONFLICTING' })).toBe('Status: Needs Rebase');
    });

    it.each([
      ['a failed check run', checkRun('FAILURE', { name: 'commitlint' })],
      ['a timed-out check run', checkRun('TIMED_OUT', { name: 'commitlint' })],
      ['an errored status', statusContext('ERROR')]
    ])('should mark CI failing on %s', (_, context) => {
      expect(statusOf({ contexts: [checkRun('SUCCESS'), context] })).toBe('Status: CI Failing');
    });

    it.each([
      ['listed after the failed run', [checkRun('FAILURE'), checkRun('SUCCESS', { startedAt: RERUN })]],
      ['listed before the failed run', [checkRun('SUCCESS', { startedAt: RERUN }), checkRun('FAILURE')]]
    ])('should not mark CI failing when a check passed on a re-run %s', (_, contexts) => {
      expect(statusOf({ contexts })).toBe('Status: Waiting on Review');
    });

    it('should mark CI failing when the newest run of a check failed after an earlier pass', () => {
      expect(statusOf({ contexts: [checkRun('SUCCESS'), checkRun('FAILURE', { startedAt: RERUN })] })).toBe(
        'Status: CI Failing'
      );
    });

    it('should read a status from its newest report, so an error that later succeeded is not CI failing', () => {
      expect(statusOf({ contexts: [statusContext('ERROR'), statusContext('SUCCESS', RERUN)] })).toBe(
        'Status: Waiting on Review'
      );
    });

    it('should count a check run with no start time as the oldest of its name', () => {
      expect(statusOf({ contexts: [checkRun('SUCCESS'), checkRun('FAILURE', { startedAt: null })] })).toBe(
        'Status: Waiting on Review'
      );
    });

    it("should ignore the status job's own check run, so a failed labelling run does not label itself", () => {
      expect(statusOf({ contexts: [checkRun('SUCCESS'), checkRun('FAILURE', { name: STATUS_JOB_NAME })] })).toBe(
        'Status: Waiting on Review'
      );
    });

    it('should wait on review when nobody has reviewed yet', () => {
      expect(statusOf()).toBe('Status: Waiting on Review');
    });

    it('should wait on the author when changes were requested on the head', () => {
      expect(statusOf({ latestOpinionatedReviews: [review('CHANGES_REQUESTED')] })).toBe('Status: Waiting on Author');
    });

    it('should wait on the author when a comment on the head left a thread unresolved', () => {
      expect(statusOf({ reviews: [review('COMMENTED')], threads: [true, false] })).toBe('Status: Waiting on Author');
    });

    it('should not count resolved threads as open feedback', () => {
      expect(statusOf({ reviews: [review('COMMENTED')], threads: [true] })).toBe('Status: Waiting on Review');
    });

    it('should be ready to merge when the head is approved over unresolved threads, since approving closes them', () => {
      expect(statusOf({ latestOpinionatedReviews: [review('APPROVED')], threads: [false] })).toBe(
        'Status: Ready to Merge'
      );
    });

    it("should keep requested changes open over another reviewer's approval of the head", () => {
      const latestOpinionatedReviews = [review('CHANGES_REQUESTED'), review('APPROVED', HEAD, 'second-reviewer')];
      expect(statusOf({ latestOpinionatedReviews })).toBe('Status: Waiting on Author');
    });

    it("should not count a bot's review of the head as a person having seen the push", () => {
      const changesRequested = review('CHANGES_REQUESTED', EARLIER);
      const reviews = [changesRequested, botReview('COMMENTED')];
      expect(statusOf({ latestOpinionatedReviews: [changesRequested], reviews })).toBe('Status: Waiting on Review');
    });

    it("should not count a bot's approval of the head", () => {
      expect(statusOf({ latestOpinionatedReviews: [botReview('APPROVED')] })).toBe('Status: Waiting on Review');
    });

    it('should wait on review once the author pushes after the requested changes', () => {
      expect(statusOf({ latestOpinionatedReviews: [review('CHANGES_REQUESTED', EARLIER)] })).toBe(
        'Status: Waiting on Review'
      );
    });

    it('should wait on review once the author requests a review again', () => {
      expect(statusOf({ latestOpinionatedReviews: [review('CHANGES_REQUESTED')], reviewRequestCount: 1 })).toBe(
        'Status: Waiting on Review'
      );
    });

    it("should not count the author's thread replies as a review of the head", () => {
      const changesRequested = review('CHANGES_REQUESTED', EARLIER);
      const reviews = [changesRequested, review('COMMENTED', HEAD, AUTHOR)];
      expect(statusOf({ latestOpinionatedReviews: [changesRequested], reviews })).toBe('Status: Waiting on Review');
    });

    it("should still read a review of the head when the pull request's author deleted their account", () => {
      expect(statusOf({ author: null, latestOpinionatedReviews: [review('CHANGES_REQUESTED')] })).toBe(
        'Status: Waiting on Author'
      );
    });

    it('should wait on review when feedback comes from a deleted account on an unknown commit', () => {
      const ghost: ReviewNode = { author: null, commit: null, state: 'CHANGES_REQUESTED' };
      expect(statusOf({ latestOpinionatedReviews: [ghost] })).toBe('Status: Waiting on Review');
    });

    it('should be ready to merge when the head is approved and every check passes', () => {
      const contexts = [checkRun('SUCCESS'), checkRun('NEUTRAL', { name: 'commitlint' }), statusContext('SUCCESS')];
      expect(statusOf({ contexts, latestOpinionatedReviews: [review('APPROVED')] })).toBe('Status: Ready to Merge');
    });

    it('should not be ready to merge on an approval of an earlier commit, so a later push is reviewed', () => {
      expect(statusOf({ latestOpinionatedReviews: [review('APPROVED', EARLIER)] })).toBe('Status: Waiting on Review');
    });

    it.each([
      ['a check run is in progress', [checkRun(null, { status: 'IN_PROGRESS' })]],
      ['a status is pending', [statusContext('PENDING')]],
      ['no check has reported', null]
    ])('should not be ready to merge while %s', (_, contexts) => {
      expect(statusOf({ contexts, latestOpinionatedReviews: [review('APPROVED')] })).toBe('Status: Waiting on Review');
    });
  });

  describe('changes', () => {
    it('should change nothing when the pull request already carries its status alone', () => {
      expect(planStatusLabels(pages([pullRequestNode({ labels: ['Bug', 'Status: Waiting on Review'] })]))).toEqual([]);
    });

    it('should swap a stale status for the current one and leave other labels alone', () => {
      const node = pullRequestNode({ isDraft: true, labels: ['Bug', 'Status: Waiting on Review'], number: 7 });
      expect(planStatusLabels(pages([node]))).toEqual([
        { add: 'Status: Draft', number: 7, remove: ['Status: Waiting on Review'] }
      ]);
    });

    it('should remove extra statuses while keeping the current one', () => {
      const node = pullRequestNode({ labels: ['Status: CI Failing', 'Status: Waiting on Review'] });
      expect(planStatusLabels(pages([node]))).toEqual([{ add: null, number: 1, remove: ['Status: CI Failing'] }]);
    });

    it('should plan every pull request across pages', () => {
      const changes = planStatusLabels(pages([pullRequestNode({ number: 1 })], [pullRequestNode({ number: 2 })]));
      expect(changes.map(({ number }) => number)).toEqual([1, 2]);
    });
  });

  describe('query', () => {
    it('should ask only for opinionated reviews from accounts with write access, so a passer-by cannot approve or block', () => {
      expect(PULL_REQUESTS_QUERY).toContain('latestOpinionatedReviews(first: 100, writersOnly: true)');
    });
  });

  describe('response', () => {
    it('should refuse a truncated connection rather than label from part of the facts', () => {
      const node = { ...pullRequestNode(), reviewThreads: { nodes: [], totalCount: 101 } };
      expect(() => planStatusLabels(pages([node]))).toThrow(
        'Expected pages[0].data.repository.pullRequests.nodes[0].reviewThreads to fit in one page of 0'
      );
    });

    it.each([
      ['a non-array response', '{}', 'Expected pages to be an array'],
      ['a missing field', pages([{}]), 'nodes[0].author to be an object'],
      ['a non-boolean', pages([{ ...pullRequestNode(), isDraft: 'no' }]), 'nodes[0].isDraft to be a boolean'],
      ['a non-number', pages([{ ...pullRequestNode(), number: '1' }]), 'nodes[0].number to be a number'],
      ['a non-string', pages([{ ...pullRequestNode(), headRefOid: 1 }]), 'nodes[0].headRefOid to be a string']
    ])('should name the path of %s', (_, pagesJson, message) => {
      expect(() => planStatusLabels(pagesJson)).toThrow(message);
    });
  });
});
