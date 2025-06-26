import cp from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import util from 'util';

import { $DevelopmentReleaseInfo, $ProductionReleaseInfo } from '@opendatacapture/schemas/setup';
import type { DevelopmentReleaseInfo, ProductionReleaseInfo, ReleaseInfo } from '@opendatacapture/schemas/setup';
import type { PackageJson } from 'type-fest';
import { z } from 'zod/v4';

const exec = util.promisify(cp.exec);

async function getGitBranch() {
  const { stderr, stdout } = await exec('git rev-parse --abbrev-ref HEAD');
  if (stderr) {
    console.error(stderr);
    throw new Error('Failed to get current git branch');
  }
  return stdout.trim();
}

async function getGitCommit() {
  const { stderr, stdout } = await exec('git rev-parse --short HEAD');
  if (stderr) {
    console.error(stderr);
    throw new Error('Failed to get latest git commit');
  }
  return stdout.trim();
}

export async function getReleaseInfo(): Promise<ReleaseInfo> {
  try {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      return $DevelopmentReleaseInfo.parseAsync({
        branch: await getGitBranch(),
        buildTime: Date.now(),
        commit: await getGitCommit(),
        type: process.env.NODE_ENV,
        version: await fs
          .readFile(path.resolve(import.meta.dirname, '../../../package.json'), 'utf-8')
          .then((content) => JSON.parse(content) as PackageJson)
          .then(({ version }) => version!)
      } satisfies DevelopmentReleaseInfo);
    } else if (process.env.NODE_ENV === 'production') {
      return $ProductionReleaseInfo.parseAsync({
        buildTime: Date.now(),
        type: 'production',
        version: process.env.RELEASE_VERSION!
      } satisfies ProductionReleaseInfo);
    } else {
      throw new Error(`Unexpected value for process.env.NODE_ENV: ${process.env.NODE_ENV}`);
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error(err.issues);
      throw new Error(`Failed to parse release info for environment '${process.env.NODE_ENV}'`);
    }
    throw err;
  }
}
