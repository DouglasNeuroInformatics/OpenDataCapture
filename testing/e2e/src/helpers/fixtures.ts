/* eslint-disable no-empty-pattern */

import * as fs from 'node:fs';

import { test as base, expect } from '@playwright/test';

import { LoginPage } from '../pages/auth/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { SubjectDataTablePage } from '../pages/datahub/subject-data-table.page';
import { SetupPage } from '../pages/setup.page';

import type { NavigateVariadicArgs, ProjectAuth, ProjectMetadata, RouteTo } from './types';

type PageModels = typeof pageModels;

type TestArgs = {
  getPageModel: <TKey extends Extract<keyof PageModels, RouteTo>>(
    key: TKey,
    ...args: NavigateVariadicArgs<TKey>
  ) => Promise<InstanceType<PageModels[TKey]>>;
};

type WorkerArgs = {
  getProjectAuth: () => Promise<ProjectAuth>;
  getProjectMetadata: <TKey extends Extract<keyof ProjectMetadata, string>>(key: TKey) => ProjectMetadata[TKey];
  setProjectAuth: (auth: ProjectAuth) => Promise<void>;
};

const pageModels = {
  '/auth/login': LoginPage,
  '/dashboard': DashboardPage,
  '/datahub/$subjectId/table': SubjectDataTablePage,
  '/setup': SetupPage
} satisfies { [K in RouteTo]?: any };

export const test = base.extend<TestArgs, WorkerArgs>({
  getPageModel: ({ page }, use) => {
    return use(
      async <TKey extends Extract<keyof PageModels, RouteTo>>(key: TKey, ...args: NavigateVariadicArgs<TKey>) => {
        const pageModel = new pageModels[key](page) as InstanceType<PageModels[TKey]>;
        await pageModel.goto(key, ...args);
        return pageModel;
      }
    );
  },
  getProjectAuth: [
    async ({ getProjectMetadata }, use) => {
      return use(async () => {
        const authStorageFile = getProjectMetadata('authStorageFile');
        if (!fs.existsSync(authStorageFile)) {
          throw new Error(`Cannot get project auth: storage file does not exist: ${authStorageFile}`);
        }
        return JSON.parse(await fs.promises.readFile(authStorageFile, 'utf8')) as ProjectAuth;
      });
    },
    { scope: 'worker' }
  ],
  getProjectMetadata: [
    async ({}, use, workerInfo) => {
      return use((key) => {
        return (workerInfo.project.metadata as ProjectMetadata)[key];
      });
    },
    { scope: 'worker' }
  ],
  setProjectAuth: [
    async ({ getProjectMetadata }, use) => {
      return use(async (auth) => {
        const authStorageFile = getProjectMetadata('authStorageFile');
        if (fs.existsSync(authStorageFile)) {
          throw new Error(`Cannot set project auth: storage file already exists: ${authStorageFile}`);
        }
        await fs.promises.writeFile(authStorageFile, JSON.stringify(auth, null, 2), 'utf-8');
      });
    },
    { scope: 'worker' }
  ]
});

export { expect };
