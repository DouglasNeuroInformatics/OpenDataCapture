/* eslint-disable no-empty-pattern */

import type { $LoginCredentials } from '@opendatacapture/schemas/auth';
import { request as apiRequestFactory, test as base, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

import { AboutPage } from '../pages/_app/about.page';
import { AuditLogsPage } from '../pages/_app/admin/audit/logs.page';
import { BrandingPage } from '../pages/_app/admin/branding/index.page';
import { BrandingLoginPagePage } from '../pages/_app/admin/branding/login-page.page';
import { InstrumentReposPage } from '../pages/_app/admin/instrument-repos/index.page';
import { AdminSettingsPage } from '../pages/_app/admin/settings.page';
import { ContactPage } from '../pages/_app/contact.page';
import { DashboardPage } from '../pages/_app/dashboard.page';
import { SubjectAssignmentsPage } from '../pages/_app/datahub/$subjectId/assignments.page';
import { SubjectGraphPage } from '../pages/_app/datahub/$subjectId/graph.page';
import { SubjectRecordDetailPage } from '../pages/_app/datahub/$subjectId/table/$recordId.page';
import { SubjectDataTablePage } from '../pages/_app/datahub/$subjectId/table/index.page';
import { DatahubPage } from '../pages/_app/datahub/index.page';
import { GroupManagePage } from '../pages/_app/group/manage.page';
import { AccessibleInstrumentsPage } from '../pages/_app/instruments/accessible-instruments.page';
import { RemoteAssignmentPage } from '../pages/_app/session/remote-assignment.page';
import { StartSessionPage } from '../pages/_app/session/start-session.page';
import { UploadInstrumentPage } from '../pages/_app/upload/$instrumentId.page';
import { UploadPage } from '../pages/_app/upload/index.page';
import { UserPage } from '../pages/_app/user.page';
import { LoginPage } from '../pages/auth/login.page';
import { ApiClient } from './api-client';
import { ADMIN } from './constants';
import { baseURL } from './env';
import { randomId } from './unique';

import type { AppState, NavigateVariadicArgs, Role, RouteTo } from './types';

const pageModels = {
  '/about': AboutPage,
  '/admin/audit/logs': AuditLogsPage,
  '/admin/branding': BrandingPage,
  '/admin/branding/login-page': BrandingLoginPagePage,
  '/admin/instrument-repos': InstrumentReposPage,
  '/admin/settings': AdminSettingsPage,
  '/auth/login': LoginPage,
  '/contact': ContactPage,
  '/dashboard': DashboardPage,
  '/datahub': DatahubPage,
  '/datahub/$subjectId/assignments': SubjectAssignmentsPage,
  '/datahub/$subjectId/graph': SubjectGraphPage,
  '/datahub/$subjectId/table': SubjectDataTablePage,
  '/datahub/$subjectId/table/$recordId': SubjectRecordDetailPage,
  '/group/manage': GroupManagePage,
  '/instruments/accessible-instruments': AccessibleInstrumentsPage,
  '/session/remote-assignment': RemoteAssignmentPage,
  '/session/start-session': StartSessionPage,
  '/upload': UploadPage,
  '/upload/$instrumentId': UploadInstrumentPage,
  '/user': UserPage
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
  /** Returns the account for a role, seeding a user + group on first request and caching it. */
  roleAccount: (role: Role) => Promise<{ accessToken: string; username: string }>;
};

type TestFixtures = {
  /** Role whose token `getPageModel` injects; override per file with `test.use({ actingRole })`. */
  actingRole: Role;
  /** First-run gating written to localStorage; override per file with `test.use({ appState })`. */
  appState: AppState;
  /**
   * Injects a token without navigating, so the test can drive navigation itself. Use this (rather
   * than `getPageModel`) when the expected outcome is a redirect, since `getPageModel` asserts it
   * landed on the requested route. Pass a role to reuse the worker's cached user, or credentials
   * to act as a user the test seeded itself — necessary when the test mutates that user's login.
   */
  authenticateAs: (roleOrCredentials: $LoginCredentials | Role) => Promise<void>;
  /** Navigates to a route as `actingRole` and returns its page object. */
  getPageModel: GetPageModel;
  /**
   * Writes `appState` to localStorage on every navigation, for every test, whether or not it
   * authenticates through `authenticateAs`. Without it a spec that logs in through the real form
   * meets the app's in-code defaults, where the disclaimer dialog and then the walkthrough overlay
   * cover the page and swallow clicks.
   */
  seedAppState: void;
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
  authenticateAs: async ({ apiRequestContext, page, roleAccount }, use) => {
    await use(async (roleOrCredentials) => {
      const accessToken =
        typeof roleOrCredentials === 'string'
          ? (await roleAccount(roleOrCredentials)).accessToken
          : await ApiClient.login(apiRequestContext, roleOrCredentials);
      await page.addInitScript((injected) => {
        window.__PLAYWRIGHT_ACCESS_TOKEN__ = injected;
      }, accessToken);
    });
  },
  getPageModel: async ({ actingRole, authenticateAs, page }, use) => {
    await use(
      async <TKey extends Extract<keyof PageModels, RouteTo>>(key: TKey, ...args: NavigateVariadicArgs<TKey>) => {
        const pageModel = new pageModels[key](page) as InstanceType<PageModels[TKey]>;
        if (pageModel._requiresAuth) {
          await authenticateAs(actingRole);
        }
        await pageModel.goto(key, ...args);
        return pageModel;
      }
    );
  },
  roleAccount: [
    async ({ adminToken, api, apiRequestContext }, use) => {
      const cache = new Map<Role, { accessToken: string; username: string }>([
        ['ADMIN', { accessToken: adminToken, username: ADMIN.username }]
      ]);
      await use(async (role) => {
        const cached = cache.get(role);
        if (cached) {
          return cached;
        }
        const group = await api.createGroup();
        const { credentials } = await api.createUser({ basePermissionLevel: role, groupIds: [group.id] });
        const account = {
          accessToken: await ApiClient.login(apiRequestContext, credentials),
          username: credentials.username
        };
        cache.set(role, account);
        return account;
      });
    },
    { scope: 'worker' }
  ],
  seedAppState: [
    async ({ appState, page }, use) => {
      await page.addInitScript((state) => {
        localStorage.setItem('app', JSON.stringify({ state, version: 1 }));
      }, appState);
      await use();
    },
    { auto: true }
  ],
  uniqueId: async ({}, use) => {
    await use(randomId());
  }
});

export { expect };
export type { GetPageModel };
