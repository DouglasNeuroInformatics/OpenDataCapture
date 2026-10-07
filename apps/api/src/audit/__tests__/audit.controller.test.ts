import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { AUDIT_LOGS_PAGE_SIZE } from '@opendatacapture/schemas/audit';
import type { $AuditLogsQueryParams } from '@opendatacapture/schemas/audit';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuditController } from '../audit.controller';
import { AuditService } from '../audit.service';

const query: $AuditLogsQueryParams = { limit: AUDIT_LOGS_PAGE_SIZE, page: 2, sortOrder: 'asc' };

describe('AuditController', () => {
  let auditController: AuditController;
  let auditService: MockedInstance<AuditService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [MockFactory.createForService(AuditService)]
    }).compile();
    auditController = moduleRef.get(AuditController);
    auditService = moduleRef.get(AuditService);
  });

  describe('find', () => {
    it('should pass the parsed query through to the service, so paging and sorting reach the database', async () => {
      await auditController.find(query);
      expect(auditService.find).toHaveBeenCalledExactlyOnceWith(query);
    });

    it('should return the page the service produces', async () => {
      const page = { data: [], pageCount: 0, total: 0 };
      auditService.find.mockResolvedValueOnce(page);
      await expect(auditController.find(query)).resolves.toBe(page);
    });
  });
});
