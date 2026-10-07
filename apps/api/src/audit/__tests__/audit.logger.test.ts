import type { Model } from '@douglasneuroinformatics/libnest';
import { getModelToken } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuditLogger } from '../audit.logger';

describe('AuditLogger', () => {
  let auditLogger: AuditLogger;
  let auditLogModel: MockedInstance<Model<'AuditLog'>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuditLogger, MockFactory.createForModelToken(getModelToken('AuditLog'))]
    }).compile();
    auditLogModel = moduleRef.get(getModelToken('AuditLog'));
    auditLogger = moduleRef.get(AuditLogger);
  });

  describe('log', () => {
    it('should connect the entry to the acting user, so the log says who did it', async () => {
      await auditLogger.log('LOGIN', 'USER', { groupId: null, userId: 'user-1' });
      expect(auditLogModel.create.mock.lastCall?.[0]).toMatchObject({
        data: { action: 'LOGIN', entity: 'USER', user: { connect: { id: 'user-1' } } }
      });
    });

    it('should connect the entry to the group it names, so group-scoped log queries find it', async () => {
      await auditLogger.log('CREATE', 'ASSIGNMENT', { groupId: 'group-1', userId: 'user-1' });
      expect(auditLogModel.create.mock.lastCall?.[0]?.data.group).toStrictEqual({ connect: { id: 'group-1' } });
    });

    it('should connect no group when the action is not group-scoped, since connecting a null id would throw', async () => {
      await auditLogger.log('LOGIN', 'USER', { groupId: null, userId: 'user-1' });
      expect(auditLogModel.create.mock.lastCall?.[0]?.data.group).toBeUndefined();
    });

    it('should store the metadata it is given, so an entry can carry details beyond its action', async () => {
      await auditLogger.log('CREATE', 'ASSIGNMENT', {
        groupId: 'group-1',
        metadata: { mode: 'BULK' },
        userId: 'user-1'
      });
      expect(auditLogModel.create.mock.lastCall?.[0]?.data.metadata).toStrictEqual({ mode: 'BULK' });
    });

    it('should timestamp the entry when it is written, so the log can be ordered by time', async () => {
      const before = Date.now();
      await auditLogger.log('LOGIN', 'USER', { groupId: null, userId: 'user-1' });
      expect(auditLogModel.create.mock.lastCall?.[0]?.data.timestamp).toBeGreaterThanOrEqual(before);
    });
  });
});
