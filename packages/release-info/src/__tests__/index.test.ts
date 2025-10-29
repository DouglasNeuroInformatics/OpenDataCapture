import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getReleaseInfo } from '../index';

describe('getReleaseInfo', () => {
  describe.skipIf(() => process.env.CI)('development', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development');
    });
    it('should return the development release info', async () => {
      await expect(getReleaseInfo()).resolves.toMatchObject({
        branch: expect.any(String),
        commit: expect.any(String),
        type: expect.any(String),
        version: expect.any(String)
      });
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
});
