/* eslint-disable no-empty-pattern -- vitest rejects a fixture function whose first argument is not destructured, even when it uses no fixtures */

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

/**
 * A form with one number field, as the bundle the api stores. A bundle normally imports zod from
 * `/runtime/v1`, which does not resolve under vitest (#1653), so this one imports the api's own zod
 * by its file URL. The instrument id derives from `name`, so each bundle needs a name of its own.
 * `measured` makes the score a measure, which is what an export writes a row for.
 */
export function scoreFormBundle(name: string, { measured = false }: { measured?: boolean } = {}) {
  return `(async () => {
    const { z } = await import(${JSON.stringify(import.meta.resolve('zod/v4'))});
    return {
      __runtimeVersion: 1,
      content: { score: { kind: 'number', label: 'Score', variant: 'input' } },
      details: { description: 'A form with one number field', license: 'Apache-2.0', title: ${JSON.stringify(name)} },
      internal: { edition: 1, name: ${JSON.stringify(name)} },
      kind: 'FORM',
      language: 'en',
      measures: ${measured ? "{ score: { kind: 'const', label: 'Score', ref: 'score' } }" : 'null'},
      tags: [],
      validationSchema: z.object({ score: z.number() })
    };
  })()`;
}
