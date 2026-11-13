const STATUS_LABELS = [
  'Status: Draft',
  'Status: Needs Rebase',
  'Status: CI Failing',
  'Status: Waiting on Author',
  'Status: Waiting on Review',
  'Status: Ready to Merge'
] as const;

type StatusLabel = (typeof STATUS_LABELS)[number];

type StatusLabelChange = {
  add: null | StatusLabel;
  number: number;
  remove: StatusLabel[];
};

type CheckOutcome = 'failing' | 'passing' | 'pending';

type Check = {
  name: string;
  outcome: CheckOutcome;
  startedAt: string;
};

type Review = {
  authorLogin: null | string;
  commitOid: null | string;
  state: string;
};

type PullRequest = {
  authorLogin: null | string;
  checkOutcomes: CheckOutcome[];
  hasConflicts: boolean;
  hasReviewRequest: boolean;
  headRefOid: string;
  isDraft: boolean;
  labels: string[];
  latestOpinionatedReviews: Review[];
  number: number;
  reviews: Review[];
  unresolvedThreadCount: number;
};

type JsonReader = {
  boolean: () => boolean;
  field: (key: string) => JsonReader;
  list: () => JsonReader[];
  nullable: () => JsonReader | null;
  number: () => number;
  path: string;
  string: () => string;
};

// The job in .github/workflows/pr-status.yaml. A run dispatched from a pull request's branch is a check on
// that pull request, and one cancelled by a newer run would otherwise read as CI failing.
const STATUS_JOB_NAME = 'label-pr-status';

const PASSING_CONCLUSIONS = new Set(['NEUTRAL', 'SKIPPED', 'SUCCESS']);

const PENDING_STATES = new Set(['EXPECTED', 'PENDING']);

// `writersOnly` keeps an approval or a change request from an account that cannot merge out of the label.
const PULL_REQUESTS_QUERY = `
query ($owner: String!, $name: String!, $endCursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequests(states: OPEN, first: 50, after: $endCursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        number
        isDraft
        mergeable
        headRefOid
        author { login }
        labels(first: 100) { totalCount nodes { name } }
        reviewRequests(first: 1) { totalCount }
        latestOpinionatedReviews(first: 100, writersOnly: true) { totalCount nodes { state author { __typename login } commit { oid } } }
        reviews(last: 100) { nodes { state author { __typename login } commit { oid } } }
        reviewThreads(first: 100) { totalCount nodes { isResolved } }
        commits(last: 1) {
          nodes {
            commit {
              statusCheckRollup {
                contexts(first: 100) {
                  totalCount
                  nodes {
                    __typename
                    ... on CheckRun { name status conclusion startedAt }
                    ... on StatusContext { context state createdAt }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

function isRecord(value: unknown): value is { [key: string]: unknown } {
  return typeof value === 'object' && value !== null;
}

function readJson(value: unknown, path: string): JsonReader {
  const fail = (expected: string) => new Error(`Expected ${path} to be ${expected}`);
  return {
    boolean: () => {
      if (typeof value !== 'boolean') {
        throw fail('a boolean');
      }
      return value;
    },
    field: (key) => {
      if (!isRecord(value)) {
        throw fail('an object');
      }
      return readJson(value[key], `${path}.${key}`);
    },
    list: () => {
      if (!Array.isArray(value)) {
        throw fail('an array');
      }
      return value.map((item, index) => readJson(item, `${path}[${index}]`));
    },
    nullable: () => (value === null ? null : readJson(value, path)),
    number: () => {
      if (typeof value !== 'number') {
        throw fail('a number');
      }
      return value;
    },
    path,
    string: () => {
      if (typeof value !== 'string') {
        throw fail('a string');
      }
      return value;
    }
  };
}

// A truncated connection would label from part of the facts, so it fails instead.
function completeNodes(connection: JsonReader): JsonReader[] {
  const nodes = connection.field('nodes').list();
  if (connection.field('totalCount').number() > nodes.length) {
    throw new Error(`Expected ${connection.path} to fit in one page of ${nodes.length}`);
  }
  return nodes;
}

function readLogin(actor: JsonReader): null | string {
  return actor.nullable()?.field('login').string() ?? null;
}

// A bot's review, such as Copilot's, says nothing about whether a person has seen the change.
function readPersonReviews(reviews: JsonReader[]): Review[] {
  return reviews.flatMap((review) => {
    const author = review.field('author').nullable();
    if (author?.field('__typename').string() === 'Bot') {
      return [];
    }
    return [
      {
        authorLogin: author?.field('login').string() ?? null,
        commitOid: review.field('commit').nullable()?.field('oid').string() ?? null,
        state: review.field('state').string()
      }
    ];
  });
}

function readCheckOutcome(context: JsonReader): CheckOutcome | null {
  if (context.field('__typename').string() === 'StatusContext') {
    const state = context.field('state').string();
    if (state === 'SUCCESS') {
      return 'passing';
    }
    return PENDING_STATES.has(state) ? 'pending' : 'failing';
  }
  if (context.field('name').string() === STATUS_JOB_NAME) {
    return null;
  }
  if (context.field('status').string() !== 'COMPLETED') {
    return 'pending';
  }
  return PASSING_CONCLUSIONS.has(context.field('conclusion').string()) ? 'passing' : 'failing';
}

// A check run with no start time counts as the oldest of its name.
function readCheck(context: JsonReader): Check | null {
  const outcome = readCheckOutcome(context);
  if (outcome === null) {
    return null;
  }
  if (context.field('__typename').string() === 'StatusContext') {
    return { name: context.field('context').string(), outcome, startedAt: context.field('createdAt').string() };
  }
  return {
    name: context.field('name').string(),
    outcome,
    startedAt: context.field('startedAt').nullable()?.string() ?? ''
  };
}

// GitHub keeps every run of a check on the head: a re-run sits beside the run it replaced, and PR Body runs
// again on each edit of a body. The newest run of each name is where that check stands, which is also how
// the ruleset's required checks read it.
function latestOutcomes(checks: Check[]): CheckOutcome[] {
  const outcomeByName = new Map(
    checks
      .toSorted((left, right) => left.startedAt.localeCompare(right.startedAt))
      .map((check): [string, CheckOutcome] => [check.name, check.outcome])
  );
  return [...outcomeByName.values()];
}

function readPullRequest(pullRequest: JsonReader): PullRequest {
  return {
    authorLogin: readLogin(pullRequest.field('author')),
    checkOutcomes: latestOutcomes(
      pullRequest
        .field('commits')
        .field('nodes')
        .list()
        .flatMap((node) => {
          const rollup = node.field('commit').field('statusCheckRollup').nullable();
          return rollup ? completeNodes(rollup.field('contexts')).map(readCheck) : [];
        })
        .filter((check) => check !== null)
    ),
    hasConflicts: pullRequest.field('mergeable').string() === 'CONFLICTING',
    hasReviewRequest: pullRequest.field('reviewRequests').field('totalCount').number() > 0,
    headRefOid: pullRequest.field('headRefOid').string(),
    isDraft: pullRequest.field('isDraft').boolean(),
    labels: completeNodes(pullRequest.field('labels')).map((label) => label.field('name').string()),
    latestOpinionatedReviews: readPersonReviews(completeNodes(pullRequest.field('latestOpinionatedReviews'))),
    number: pullRequest.field('number').number(),
    reviews: readPersonReviews(pullRequest.field('reviews').field('nodes').list()),
    unresolvedThreadCount: completeNodes(pullRequest.field('reviewThreads')).filter(
      (thread) => !thread.field('isResolved').boolean()
    ).length
  };
}

// Feedback stays open until a reviewer clears it, so whose turn it is comes from what happened after it:
// a push the reviewer has not seen, or a review requested again, hands the pull request back to review.
// The pull request's author replying in a thread is a review too, so only other people's reviews count.
function statusOf(pullRequest: PullRequest): StatusLabel {
  if (pullRequest.isDraft) {
    return 'Status: Draft';
  }
  if (pullRequest.hasConflicts) {
    return 'Status: Needs Rebase';
  }
  if (pullRequest.checkOutcomes.includes('failing')) {
    return 'Status: CI Failing';
  }
  // An approval of an earlier commit does not cover what was pushed after it.
  const isHeadApproved = pullRequest.latestOpinionatedReviews.some(
    (review) => review.state === 'APPROVED' && review.commitOid === pullRequest.headRefOid
  );
  // Reviewers approve over their own threads rather than resolving them, so an approval of the head
  // closes the threads; requested changes stay open until their reviewer approves or is dismissed.
  const hasOpenFeedback =
    pullRequest.latestOpinionatedReviews.some((review) => review.state === 'CHANGES_REQUESTED') ||
    (pullRequest.unresolvedThreadCount > 0 && !isHeadApproved);
  if (hasOpenFeedback) {
    const lastReview = pullRequest.reviews.findLast((review) => review.authorLogin !== pullRequest.authorLogin);
    const isHeadReviewed = lastReview?.commitOid === pullRequest.headRefOid;
    return isHeadReviewed && !pullRequest.hasReviewRequest ? 'Status: Waiting on Author' : 'Status: Waiting on Review';
  }
  const areChecksPassing =
    pullRequest.checkOutcomes.length > 0 && pullRequest.checkOutcomes.every((outcome) => outcome === 'passing');
  return isHeadApproved && areChecksPassing ? 'Status: Ready to Merge' : 'Status: Waiting on Review';
}

export { PULL_REQUESTS_QUERY, STATUS_JOB_NAME };

export function planStatusLabels(pagesJson: string): StatusLabelChange[] {
  return readJson(JSON.parse(pagesJson), 'pages')
    .list()
    .flatMap((page) => page.field('data').field('repository').field('pullRequests').field('nodes').list())
    .map(readPullRequest)
    .flatMap((pullRequest) => {
      const status = statusOf(pullRequest);
      const add = pullRequest.labels.includes(status) ? null : status;
      const remove = STATUS_LABELS.filter((label) => label !== status && pullRequest.labels.includes(label));
      return add === null && remove.length === 0 ? [] : [{ add, number: pullRequest.number, remove }];
    });
}
