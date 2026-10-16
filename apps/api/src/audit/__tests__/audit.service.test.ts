import type { Model } from '@douglasneuroinformatics/libnest';
import { getModelToken } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { AUDIT_LOGS_PAGE_SIZE } from '@opendatacapture/schemas/audit';
import type { $AuditLogsQueryParams } from '@opendatacapture/schemas/audit';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuditService } from '../audit.service';

const defaults: $AuditLogsQueryParams = { limit: AUDIT_LOGS_PAGE_SIZE, page: 1, sortOrder: 'desc' };

describe('AuditService', () => {
  let auditService: AuditService;
  let auditLogModel: MockedInstance<Model<'AuditLog'>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuditService, MockFactory.createForModelToken(getModelToken('AuditLog'))]
    }).compile();
    auditLogModel = moduleRef.get(getModelToken('AuditLog'));
    auditService = moduleRef.get(AuditService);
    auditLogModel.findMany.mockResolvedValue([]);
    auditLogModel.count.mockResolvedValue(0);
  });

  describe('find', () => {
    it('should request only one page of logs rather than the whole collection', async () => {
      await auditService.find(defaults);
      expect(auditLogModel.findMany.mock.lastCall?.[0]).toMatchObject({
        skip: 0,
        take: AUDIT_LOGS_PAGE_SIZE
      });
    });

    it('should offset by the requested page', async () => {
      await auditService.find({ ...defaults, limit: 25, page: 4 });
      expect(auditLogModel.findMany.mock.lastCall?.[0]).toMatchObject({ skip: 75, take: 25 });
    });

    it('should sort in the database rather than leaving it to the client', async () => {
      await auditService.find(defaults);
      expect(auditLogModel.findMany.mock.lastCall?.[0]).toMatchObject({ orderBy: { timestamp: 'desc' } });
      await auditService.find({ ...defaults, sortOrder: 'asc' });
      expect(auditLogModel.findMany.mock.lastCall?.[0]).toMatchObject({ orderBy: { timestamp: 'asc' } });
    });

    it('should apply the filters to both the page and the count', async () => {
      await auditService.find({ ...defaults, action: 'LOGIN', groupId: 'group-1' });
      const where = { action: 'LOGIN', entity: undefined, groupId: 'group-1', userId: undefined };
      expect(auditLogModel.findMany.mock.lastCall?.[0]).toMatchObject({ where });
      expect(auditLogModel.count).toHaveBeenCalledWith({ where });
    });

    it('should derive pageCount by rounding up, so a partial final page is reachable', async () => {
      auditLogModel.count.mockResolvedValue(101);
      const result = await auditService.find(defaults);
      expect(result).toMatchObject({ pageCount: 11, total: 101 });
    });

    it('should report a pageCount of zero when nothing matches', async () => {
      auditLogModel.count.mockResolvedValue(0);
      const result = await auditService.find(defaults);
      expect(result).toStrictEqual({ data: [], pageCount: 0, total: 0 });
    });
  });
});
