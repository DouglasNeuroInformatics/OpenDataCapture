/* eslint-disable no-empty-pattern */

import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { ReleaseInfo } from '@opendatacapture/schemas/setup';
import { test as baseTest, vi } from 'vitest';

import appContainer from '@/main';

/**
 * `libnest build` replaces `__RELEASE__` with a literal, so under vitest the identifier is simply
 * undefined and every route reaching it throws a ReferenceError.
 */
const RELEASE_INFO: ReleaseInfo = {
  branch: 'test',
  buildTime: 0,
  commit: 'test',
  type: 'test',
  version: '0.0.0'
};

/**
 * Boots the real application container — the same instance `libnest` bootstraps in production,
 * minus `listen()` — so a suite exercises the wiring, versioning and docs the deployed app has.
 * `NODE_ENV` is `test` under vitest, which is what makes `PrismaModuleOptionsFactory` start an
 * in-memory replica set instead of dialing `MONGO_URI`.
 */
const test = baseTest.extend('app', { scope: 'file' }, async ({}, { onCleanup }) => {
  vi.stubGlobal('__RELEASE__', RELEASE_INFO);
  const app = await appContainer.createApplicationInstance();
  app.useLogger(false);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  onCleanup(async () => {
    await app.close();
  });
  return app;
});

class TestSuiteThis {
  app: NestFastifyApplication;
}

/**
 * Wraps a suite so its body can reach the booted app as `this.app`. The app fixture is file-scoped,
 * so every suite in a file shares one boot and one database.
 */
export function defineSuite(name: string, fn: (this: TestSuiteThis) => Promise<void> | void) {
  return () => {
    const thisObj = new TestSuiteThis();

    test.aroundAll(async (runSuite, { app }) => {
      thisObj.app = app;
      await runSuite();
    });

    return test.describe(name, () => {
      return fn.call(thisObj);
    });
  };
}
