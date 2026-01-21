/* eslint-disable no-empty-pattern */

import { test as base, expect } from '@playwright/test';

import { LoginPage } from '../pages/auth/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { SubjectDataTablePage } from '../pages/datahub/subject-data-table.page';
import { SetupPage } from '../pages/setup.page';
import { users } from './data';

import type { ProjectMetadata, RouteTo } from './types';

type PageModels = typeof pageModels;

type TestArgs = {
  getPageModel: <TKey extends Extract<keyof PageModels, RouteTo>>(key: TKey) => InstanceType<PageModels[TKey]>;
  login: () => Promise<void>;
};

type WorkerArgs = {
  getProjectMetadata: <TKey extends Extract<keyof ProjectMetadata, string>>(key: TKey) => ProjectMetadata[TKey];
};

const pageModels = {
  '/auth/login': LoginPage,
  '/dashboard': DashboardPage,
  '/datahub/$subjectId/table': SubjectDataTablePage,
  '/setup': SetupPage
} satisfies { [K in RouteTo]?: any };

export const test = base.extend<TestArgs, WorkerArgs>({
  getPageModel: ({ page }, use) => {
    return use(<TKey extends Extract<keyof PageModels, RouteTo>>(key: TKey) => {
      const pageModel = new pageModels[key](page) as InstanceType<PageModels[TKey]>;
      return pageModel;
    });
  },
  getProjectMetadata: [
    async ({}, use, workerInfo) => {
      return use((key) => {
        return (workerInfo.project.metadata as ProjectMetadata)[key];
      });
    },
    { scope: 'worker' }
  ],
  login: ({ getPageModel, getProjectMetadata }, use) => {
    return use(async () => {
      const loginPage = getPageModel('/auth/login');
      await loginPage.goto('/auth/login');
      const target = getProjectMetadata('browserTarget');
      const credentials = users[target];
      await loginPage.fillLoginForm(credentials);
      await loginPage.expect.toHaveURL('/dashboard');
    });
  }
});

export { expect };
