/* eslint-disable no-empty-pattern */

import { request as apiRequestFactory, test as base, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

import { LoginPage } from '../pages/auth/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { DatahubPage } from '../pages/datahub/datahub.page';
import { SubjectDataTablePage } from '../pages/datahub/subject-data-table.page';
import { RemoteAssignmentPage } from '../pages/remote-assignment.page';
import { StartSessionPage } from '../pages/start-session.page';
import { ApiClient } from './api-client';
import { ADMIN } from './constants';
import { baseURL } from './env';
import { randomId } from './unique';

import type { AppState, NavigateVariadicArgs, Role, RouteTo } from './types';

const pageModels = {
  '/auth/login': LoginPage,
  '/dashboard': DashboardPage,
  '/datahub': DatahubPage,
  '/datahub/$subjectId/table': SubjectDataTablePage,
  '/session/remote-assignment': RemoteAssignmentPage,
  '/session/start-session': StartSessionPage
} satisfies { [K in RouteTo]?: any };

type PageModels = typeof pageModels;

type GetPageModel = <TKey extends Extract<keyof PageModels, RouteTo>>(
  key: TKey,
  ...args: NavigateVariadicArgs<TKey>
) => Promise<InstanceType<PageModels[TKey]>>;

type WorkerFixtures = {
  /** Admin access token, obtained once per worker. */
  adminToken: string;
  /** Admin-authenticated client for seeding preconditions. */
  api: ApiClient;
  /** Worker-scoped API request context targeting the web origin. */
  apiRequestContext: APIRequestContext;
  /** Returns an access token for a role, seeding a user + group on first request and caching it. */
  roleToken: (role: Role) => Promise<string>;
};

type TestFixtures = {
  /** Role whose token `getPageModel` injects; override per file with `test.use({ actingRole })`. */
  actingRole: Role;
  /** First-run gating written to localStorage; override per file with `test.use({ appState })`. */
  appState: AppState;
  /** Navigates to a route as `actingRole` and returns its page object. */
  getPageModel: GetPageModel;
  /** Short run-unique suffix for naming seeded data in this test. */
  uniqueId: string;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  actingRole: ['GROUP_MANAGER', { option: true }],
  adminToken: [
    async ({ apiRequestContext }, use) => {
      await use(await ApiClient.login(apiRequestContext, { password: ADMIN.password, username: ADMIN.username }));
    },
    { scope: 'worker' }
  ],
  api: [
    async ({ adminToken, apiRequestContext }, use) => {
      await use(new ApiClient(apiRequestContext, adminToken));
    },
    { scope: 'worker' }
  ],
  apiRequestContext: [
    async ({}, use) => {
      const context = await apiRequestFactory.newContext({ baseURL });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' }
  ],
  appState: [{ isDisclaimerAccepted: true, isWalkthroughComplete: true }, { option: true }],
  getPageModel: async ({ actingRole, appState, page, roleToken }, use) => {
    await use(
      async <TKey extends Extract<keyof PageModels, RouteTo>>(key: TKey, ...args: NavigateVariadicArgs<TKey>) => {
        const pageModel = new pageModels[key](page) as InstanceType<PageModels[TKey]>;
        if (pageModel._requiresAuth) {
          const accessToken = await roleToken(actingRole);
          await page.addInitScript(
            (injected) => {
              window.__PLAYWRIGHT_ACCESS_TOKEN__ = injected.accessToken;
              localStorage.setItem('app', JSON.stringify({ state: injected.state, version: 1 }));
            },
            { accessToken, state: appState }
          );
        }
        await pageModel.goto(key, ...args);
        return pageModel;
      }
    );
  },
  roleToken: [
    async ({ adminToken, api, apiRequestContext }, use) => {
      const cache = new Map<Role, string>([['ADMIN', adminToken]]);
      await use(async (role) => {
        const cached = cache.get(role);
        if (cached) {
          return cached;
        }
        const group = await api.createGroup();
        const { credentials } = await api.createUser({ basePermissionLevel: role, groupIds: [group.id] });
        const token = await ApiClient.login(apiRequestContext, credentials);
        cache.set(role, token);
        return token;
      });
    },
    { scope: 'worker' }
  ],
  uniqueId: async ({}, use) => {
    await use(randomId());
  }
});

export { expect };
export type { GetPageModel };
