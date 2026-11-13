import { execFileSync } from 'node:child_process';

import { planStatusLabels, PULL_REQUESTS_QUERY } from '../.github/scripts/pr-status.ts';

function gh(...args: string[]): string {
  return execFileSync('gh', args, { encoding: 'utf8' });
}

const repository = process.env.GITHUB_REPOSITORY ?? '';
const [owner, name, ...rest] = repository.split('/');
if (!owner || !name || rest.length > 0) {
  throw new Error(`Expected GITHUB_REPOSITORY to be <owner>/<name>, got '${repository}'`);
}

const pagesJson = gh(
  'api',
  'graphql',
  '--paginate',
  '--slurp',
  '-f',
  `owner=${owner}`,
  '-f',
  `name=${name}`,
  '-f',
  `query=${PULL_REQUESTS_QUERY}`
);

for (const { add, number, remove } of planStatusLabels(pagesJson)) {
  for (const label of remove) {
    gh('api', '--method', 'DELETE', `repos/${repository}/issues/${number}/labels/${encodeURIComponent(label)}`);
  }
  if (add) {
    gh('api', '--method', 'POST', `repos/${repository}/issues/${number}/labels`, '-f', `labels[]=${add}`);
  }
  process.stdout.write(
    `#${number}: ${[add && `+${add}`, ...remove.map((label) => `-${label}`)].filter(Boolean).join(', ')}\n`
  );
}
