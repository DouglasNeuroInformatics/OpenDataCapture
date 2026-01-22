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
  getProjectMetadata: <TKey extends Extract<keyof ProjectMetadata, string>>(key: TKey) => ProjectMetadata[TKey];
  setProjectAuth: (auth: ProjectAuth) => void;
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
      return use((auth) => {
        const authStorageFile = getProjectMetadata('authStorageFile');
        fs.writeFileSync(authStorageFile, JSON.stringify(auth, null, 2), 'utf-8');
      });
    },
    { scope: 'worker' }
  ]
});

export { expect };
