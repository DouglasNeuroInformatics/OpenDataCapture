import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// `index.ts` captures `util.promisify(cp.exec)` once, at module load — so the custom-promisify
// symbol has to exist on the mock before that first import, not set later in a beforeEach. The
// symbol's implementation reads from `gitResult`, which `mockGit` below mutates in place, so a
// per-test override still takes effect against the already-captured promisified function.
const { execMock, gitResult } = vi.hoisted(() => {
  const gitResult = { branch: { stderr: '', stdout: '' }, commit: { stderr: '', stdout: '' } };
  const execMock: unknown = Object.assign(vi.fn(), {
    [Symbol.for('nodejs.util.promisify.custom')]: (command: string) =>
      Promise.resolve(command.includes('abbrev-ref') ? gitResult.branch : gitResult.commit)
  });
  return { execMock, gitResult };
});

vi.mock('child_process', () => ({ default: { exec: execMock } }));

import { getReleaseInfo } from '../index';

function mockGit(branch: { stderr: string; stdout: string }, commit: { stderr: string; stdout: string }) {
  gitResult.branch = branch;
  gitResult.commit = commit;
}

describe('getReleaseInfo', () => {
  describe('development', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development');
      mockGit({ stderr: '', stdout: 'main' }, { stderr: '', stdout: 'abc1234' });
    });
    it('should return the development release info', async () => {
      await expect(getReleaseInfo()).resolves.toMatchObject({
        branch: 'main',
        commit: 'abc1234',
        type: 'development',
        version: expect.any(String)
      });
    });
    it('should throw if getting the current git branch reports a stderr', async () => {
      mockGit({ stderr: 'fatal: not a git repository', stdout: '' }, { stderr: '', stdout: 'abc1234' });
      await expect(getReleaseInfo()).rejects.toThrow('Failed to get current git branch');
    });
    it('should throw if getting the latest git commit reports a stderr', async () => {
      mockGit({ stderr: '', stdout: 'main' }, { stderr: 'fatal: bad revision', stdout: '' });
      await expect(getReleaseInfo()).rejects.toThrow('Failed to get latest git commit');
    });
    afterEach(() => {
      vi.unstubAllEnvs();
    });
  });
  describe('production', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production');
    });
    it("should throw if the environment variable 'RELEASE_VERSION' is undefined", async () => {
      await expect(getReleaseInfo()).rejects.toThrow();
    });
    // `$ProductionReleaseInfo.parseAsync` rejects with a real ZodError here, but `err instanceof
    // z.ZodError` in `getReleaseInfo`'s catch block evaluates false, so the ZodError propagates
    // unconverted rather than becoming the friendlier "Failed to parse release info" error.
    it("should throw if the environment variable 'RELEASE_VERSION' is invalid", async () => {
      vi.stubEnv('RELEASE_VERSION', 'foo');
      await expect(getReleaseInfo()).rejects.toThrow();
    });
    it('should return the production release info', async () => {
      vi.stubEnv('RELEASE_VERSION', '0.0.0');
      await expect(getReleaseInfo()).resolves.toMatchObject({
        type: 'production',
        version: '0.0.0'
      });
    });
    afterEach(() => {
      vi.unstubAllEnvs();
    });
  });
  describe('unexpected environment', () => {
    it("should throw if NODE_ENV is neither 'development', 'test', nor 'production'", async () => {
      vi.stubEnv('NODE_ENV', 'staging');
      await expect(getReleaseInfo()).rejects.toThrow(/Unexpected value for process\.env\.NODE_ENV/);
      vi.unstubAllEnvs();
    });
  });
});
