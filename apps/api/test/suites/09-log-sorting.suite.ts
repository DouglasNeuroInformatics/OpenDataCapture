import { PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import { $AuditLogsSortBy, AUDIT_LOGS_MAX_PAGE_SIZE } from '@opendatacapture/schemas/audit';
import type { $AuditLogsPage } from '@opendatacapture/schemas/audit';
import { $InstrumentRepoSyncLogsSortBy } from '@opendatacapture/schemas/instrument-repo';
import type { InstrumentRepoSyncLogsPage } from '@opendatacapture/schemas/instrument-repo';
import { beforeAll, describe, expect, it } from 'vitest';

import type { RuntimePrismaClient } from '@/core/prisma';

import { defineSuite } from '../helpers';

const SORT_ORDERS = ['asc', 'desc'] as const;

// Several orderings reach Mongo as a relation or a composite-list count rather than a field, which
// only a real database can prove it accepts.
export default defineSuite('log sorting', function () {
  let adminHeaders: { authorization: string };

  beforeAll(async () => {
    const login = await this.app.inject({
      method: 'POST',
      payload: { password: 'DataCapture2025_Test', username: 'admin' },
      url: '/v1/auth/login'
    });
    expect(login.statusCode).toBe(200);
    adminHeaders = { authorization: `Bearer ${login.json<{ accessToken: string }>().accessToken}` };
  });

  describe('GET /v1/audit/logs', () => {
    const findAuditLogs = async (query: { [key: string]: string }) => {
      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'GET',
        query: { limit: String(AUDIT_LOGS_MAX_PAGE_SIZE), ...query },
        url: '/v1/audit/logs'
      });
      expect(response.statusCode).toBe(200);
      return response.json<$AuditLogsPage>().data;
    };

    it.each($AuditLogsSortBy.options.flatMap((sortBy) => SORT_ORDERS.map((sortOrder) => [sortBy, sortOrder])))(
      'should order the audit log by %s %s',
      async (sortBy, sortOrder) => {
        expect(await findAuditLogs({ sortBy, sortOrder })).not.toHaveLength(0);
      }
    );

    it('should order the audit log by the username of each entry, which is a relation', async () => {
      const usernames = (await findAuditLogs({ sortBy: 'user', sortOrder: 'asc' })).flatMap((log) => {
        return log.user ? [log.user.username] : [];
      });
      expect(usernames.length).toBeGreaterThan(1);
      expect(usernames).toStrictEqual([...usernames].sort());
    });
  });

  describe('GET /v1/instrument-repos/sync/logs', () => {
    const failure = { instrumentDir: 'forms/broken', message: 'Failed to bundle', stage: 'BUNDLE' } as const;

    const findSyncLogs = async (query: { [key: string]: string }) => {
      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'GET',
        query,
        url: '/v1/instrument-repos/sync/logs'
      });
      expect(response.statusCode).toBe(200);
      return response.json<InstrumentRepoSyncLogsPage>().data;
    };

    beforeAll(async () => {
      const prisma = this.app.get<RuntimePrismaClient>(PRISMA_CLIENT_TOKEN);
      await prisma.instrumentRepoSyncLog.createMany({
        data: [
          { action: 'SYNC', failures: [failure, failure], importedCount: 0, repoName: 'log-sorting/two-failures' },
          { action: 'IMPORT', failures: [], importedCount: 2, repoName: 'log-sorting/no-failures' },
          { action: 'SYNC', failures: [failure], importedCount: 1, repoName: 'log-sorting/one-failure' }
        ]
      });
    });

    it.each(
      $InstrumentRepoSyncLogsSortBy.options.flatMap((sortBy) => SORT_ORDERS.map((sortOrder) => [sortBy, sortOrder]))
    )('should order the activity log by %s %s', async (sortBy, sortOrder) => {
      expect(await findSyncLogs({ sortBy, sortOrder })).not.toHaveLength(0);
    });

    it('should order the activity log by how many instruments failed, which is the length of a list', async () => {
      const logs = await findSyncLogs({ sortBy: 'failedCount', sortOrder: 'asc' });
      expect(logs.filter((log) => log.repoName.startsWith('log-sorting/')).map((log) => log.repoName)).toStrictEqual([
        'log-sorting/no-failures',
        'log-sorting/one-failure',
        'log-sorting/two-failures'
      ]);
    });
  });
});
