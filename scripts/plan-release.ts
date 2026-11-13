import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

import { planReleaseOutputs } from '../.github/scripts/release.ts';
import rootPackage from '../package.json' with { type: 'json' };

const { GITHUB_OUTPUT: githubOutputPath, GITHUB_REF: ref } = process.env;
if (!githubOutputPath || !ref) {
  throw new Error('Expected GITHUB_OUTPUT and GITHUB_REF, which a workflow step sets');
}

const { githubOutput, notice } = planReleaseOutputs({
  ref,
  tagList: execFileSync('git', ['tag', '--list', 'v*'], { encoding: 'utf8' }),
  version: rootPackage.version
});
if (notice) {
  process.stdout.write(`::notice::${notice}\n`);
}
fs.appendFileSync(githubOutputPath, githubOutput);
