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
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });
    // A schema failure must surface as the caller-facing "Failed to parse release info" error, not
    // as a raw ZodError: `getReleaseInfo` only converts it if the rejection is awaited inside its
    // own try block, so asserting on the message is what pins the conversion in place.
    it("should throw a parse error naming the environment if 'RELEASE_VERSION' is undefined", async () => {
      await expect(getReleaseInfo()).rejects.toThrow("Failed to parse release info for environment 'production'");
    });
    it("should throw a parse error naming the environment if 'RELEASE_VERSION' is invalid", async () => {
      vi.stubEnv('RELEASE_VERSION', 'foo');
      await expect(getReleaseInfo()).rejects.toThrow("Failed to parse release info for environment 'production'");
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
      vi.restoreAllMocks();
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
