import type { $AuditLog } from '@opendatacapture/schemas/audit';

import { ApiClient } from '../support/api-client';
import { ADMIN, HAPPINESS_RECORD } from '../support/constants';
import { expect, test } from '../support/fixtures';

test.describe('admin audit logs', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should show the audit logs table', async ({ getPageModel }) => {
    const auditLogsPage = await getPageModel('/admin/audit/logs');

    await expect(auditLogsPage.pageHeader).toContainText('Audit Logs');
    await expect(auditLogsPage.dataTable).toBeVisible();
  });

  // `AUDITED_ACTIONS` (`packages/schemas/src/audit/audit.ts`) lists every pair the API writes, and
  // the filters below offer exactly those.
  test('should record a login and find it through the action filter', async ({ apiRequestContext, getPageModel }) => {
    // `getPageModel('ADMIN')` reuses a token cached once per worker (see `roleAccount` in fixtures.ts),
    // so it would not itself produce a fresh entry here. Logging in directly does.
    await ApiClient.login(apiRequestContext, { password: ADMIN.password, username: ADMIN.username });

    const auditLogsPage = await getPageModel('/admin/audit/logs');
    await auditLogsPage.filterBy('action', 'Login');

    const firstRow = auditLogsPage.dataTable.getByTestId('data-table-row').first();
    await expect(firstRow).toContainText('Login');
    await expect(firstRow).toContainText('User');
    await expect(firstRow.getByTestId('audit-log-action')).toHaveText('Login');
  });

  test('should show the chosen option on its filter button and put it in the URL', async ({ getPageModel }) => {
    const auditLogsPage = await getPageModel('/admin/audit/logs');
    await auditLogsPage.filterBy('entity', 'Instrument');

    await expect(auditLogsPage.filterButton('entity')).toContainText('Instrument');
    await expect(auditLogsPage.$ref).toHaveURL(/entity=INSTRUMENT(&|$)/);
  });

  test('should not offer an entity nothing writes to the log', async ({ getPageModel }) => {
    const auditLogsPage = await getPageModel('/admin/audit/logs');
    await auditLogsPage.filterButton('entity').click();

    await expect(auditLogsPage.filterOption('User')).toBeVisible();
    await expect(auditLogsPage.filterOption('Session')).toBeHidden();
  });

  test('should offer only the actions written on the chosen entity', async ({ getPageModel }) => {
    const auditLogsPage = await getPageModel('/admin/audit/logs');
    await auditLogsPage.filterBy('entity', 'Assignment');
    await auditLogsPage.filterButton('action').click();

    await expect(auditLogsPage.filterOption('Send Email')).toBeVisible();
    await expect(auditLogsPage.filterOption('Login')).toBeHidden();
  });

  test('should clear every filter at once', async ({ getPageModel }) => {
    const auditLogsPage = await getPageModel('/admin/audit/logs');
    await expect(auditLogsPage.clearFiltersButton).toBeHidden();

    await auditLogsPage.filterBy('action', 'Login');
    await auditLogsPage.filterBy('entity', 'User');
    await auditLogsPage.clearFiltersButton.click();

    await expect(auditLogsPage.clearFiltersButton).toBeHidden();
    await expect(auditLogsPage.$ref).not.toHaveURL(/action=|entity=/);
    await expect(auditLogsPage.filterButton('action')).toHaveText('Action');
  });

  test('should download the audit logs as JSON', async ({ getPageModel }) => {
    const auditLogsPage = await getPageModel('/admin/audit/logs');

    const downloadPromise = auditLogsPage.$ref.waitForEvent('download');
    await auditLogsPage.downloadButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^ODC_Audit_Logs_\d+\.json$/);
  });
});

test.describe('admin audit logs sorting', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should request the oldest logs first on the first click of the time header', async ({ getPageModel }) => {
    const auditLogsPage = await getPageModel('/admin/audit/logs');

    const ascendingRequest = auditLogsPage.$ref.waitForRequest(
      (request) => request.url().includes('/v1/audit/logs') && request.url().includes('sortOrder=asc')
    );
    await auditLogsPage.timeHeaderButton.click();

    expect((await ascendingRequest).url()).toContain('sortOrder=asc');
  });
});

test.describe('admin audit logs fetching', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should fetch the logs once per navigation, not again when the table mounts', async ({ getPageModel, page }) => {
    const auditLogsRequests: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'GET' && new URL(request.url()).pathname.endsWith('/v1/audit/logs')) {
        auditLogsRequests.push(request.url());
      }
    });

    const auditLogsPage = await getPageModel('/admin/audit/logs');
    const firstRow = auditLogsPage.dataTable.getByTestId('data-table-row').first();
    await expect(firstRow).toBeVisible();
    // eslint-disable-next-line playwright/no-networkidle -- proving no duplicate request fires needs a quiet period, which is what network idle is
    await page.waitForLoadState('networkidle');
    expect(auditLogsRequests).toHaveLength(1);

    await auditLogsPage.filterBy('action', 'Login');
    await expect(auditLogsPage.$ref).toHaveURL(/action=LOGIN/);
    await expect(firstRow).toContainText('Login');
    // eslint-disable-next-line playwright/no-networkidle -- proving no duplicate request fires needs a quiet period, which is what network idle is
    await page.waitForLoadState('networkidle');
    expect(auditLogsRequests).toHaveLength(2);
  });
});

const HAPPINESS = 'DNP_HAPPINESS_QUESTIONNAIRE';

/** The entry among `entries` whose metadata names `value` under `key`, which is how an entry says what it acted on. */
function entryNaming(entries: $AuditLog[], key: string, value: string) {
  return entries.find(({ metadata }) => metadata?.[key] === value);
}

test.describe('admin audit log coverage', () => {
  test.describe('users', () => {
    test('should record who created a user', async ({ api }) => {
      const { user } = await api.createUser();

      const entries = await api.findAuditLogs({ action: 'CREATE', entity: 'USER' });
      expect(entryNaming(entries, 'targetUserId', user.id)?.user?.username).toBe(ADMIN.username);
    });

    test('should record which fields an update changed, and not their values', async ({ api }) => {
      const { user } = await api.createUser();
      await api.updateUser(user.id, { firstName: 'Renamed', lastName: user.lastName });

      const entry = entryNaming(await api.findAuditLogs({ action: 'UPDATE', entity: 'USER' }), 'targetUserId', user.id);
      expect(entry?.metadata?.fields).toBe('firstName');
      expect(JSON.stringify(entry)).not.toContain('Renamed');
    });

    test('should record a change to the permissions a user holds', async ({ api }) => {
      const { user } = await api.createUser();
      await api.setUserPermissions(user.id, [{ action: 'read', groupId: null, subject: 'Subject' }]);

      const entry = entryNaming(await api.findAuditLogs({ action: 'UPDATE', entity: 'USER' }), 'targetUserId', user.id);
      expect(entry?.metadata?.fields).toBe('additionalPermissions');
    });

    test('should record a user updating their own account, as that user', async ({ api, apiRequestContext }) => {
      const { credentials, user } = await api.createUser();
      const self = new ApiClient(apiRequestContext, await ApiClient.login(apiRequestContext, credentials));
      await self.updateSelf(user.id, { firstName: 'Renamed' });

      const entry = entryNaming(await api.findAuditLogs({ action: 'UPDATE', entity: 'USER' }), 'targetUserId', user.id);
      expect(entry?.metadata?.fields).toBe('firstName');
      expect(entry?.user?.username).toBe(credentials.username);
    });

    test('should record archiving a user as an archive', async ({ api }) => {
      const { user } = await api.createUser();
      await api.archiveUser(user.id);

      const entries = await api.findAuditLogs({ action: 'ARCHIVE', entity: 'USER' });
      expect(entryNaming(entries, 'targetUserId', user.id)).toBeDefined();
    });

    test('should record unarchiving a user as an unarchive', async ({ api }) => {
      const { user } = await api.createUser();
      await api.archiveUser(user.id);
      await api.unarchiveUser(user.id);

      const entries = await api.findAuditLogs({ action: 'UNARCHIVE', entity: 'USER' });
      expect(entryNaming(entries, 'targetUserId', user.id)).toBeDefined();
    });
  });

  test.describe('assignments', () => {
    test('should record each deleted assignment in its group', async ({ api }) => {
      const group = await api.createGroup();
      const assignment = await api.createAssignment({
        expiresAt: new Date(Date.now() + 86_400_000),
        groupId: group.id,
        instrumentId: await api.findInstrumentId('FORM'),
        subjectId: await api.createSubject(group.id)
      });
      await api.deleteAssignments([assignment.id]);

      const entries = await api.findAuditLogs({ action: 'DELETE', entity: 'ASSIGNMENT' });
      expect(entryNaming(entries, 'assignmentId', assignment.id)?.group?.name).toBe(group.name);
    });
  });

  test.describe('series', () => {
    test('should record who created a series, in the group that owns it', async ({ api, uniqueId }) => {
      const group = await api.createGroup();
      const seriesId = await api.createSeries(group.id, `Audited Series ${uniqueId}`);

      const entry = entryNaming(
        await api.findAuditLogs({ action: 'CREATE', entity: 'INSTRUMENT' }),
        'instrumentId',
        seriesId
      );
      expect(entry?.group?.name).toBe(group.name);
      expect(entry?.metadata?.title).toBe(`Audited Series ${uniqueId}`);
    });

    test('should record who deleted a series', async ({ api, uniqueId }) => {
      const group = await api.createGroup();
      const seriesId = await api.createSeries(group.id, `Deleted Series ${uniqueId}`);
      await api.deleteSeries(seriesId);

      const entries = await api.findAuditLogs({ action: 'DELETE', entity: 'INSTRUMENT' });
      expect(entryNaming(entries, 'instrumentId', seriesId)?.metadata?.title).toBe(`Deleted Series ${uniqueId}`);
    });
  });

  test.describe('subjects', () => {
    test('should record a forced delete once, with the number of records it removed', async ({ api, uniqueId }) => {
      const group = await api.createGroup();
      const session = await api.createSession(group.id, { id: `deleted-${uniqueId}` });
      const instrumentId = await api.findInstrumentIdByName(HAPPINESS);
      await api.createRecord(group.id, instrumentId, session, HAPPINESS_RECORD);
      await api.createRecord(group.id, instrumentId, session, HAPPINESS_RECORD);
      await api.deleteSubject(session.subjectId, { force: true });

      const entries = await api.findAuditLogs({ action: 'DELETE', entity: 'SUBJECT' });
      const matching = entries.filter(({ metadata }) => metadata?.subjectId === session.subjectId);
      expect(matching).toHaveLength(1);
      expect(matching[0]?.metadata).toMatchObject({ force: 'true', recordCount: '2' });
    });
  });
});
