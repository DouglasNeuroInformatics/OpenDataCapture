import { ConfigService, getModelToken, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ForbiddenException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { BulkAssignmentFailure } from '@opendatacapture/schemas/assignment';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuditLogger } from '@/audit/audit.logger';
import { createAppAbility } from '@/auth/ability.utils';
import { GatewayService } from '@/gateway/gateway.service';

import { AssignmentsService } from '../assignments.service';

const GROUP_ID = 'group-1';

const futureDate = () => new Date(Date.now() + 86_400_000);

/**
 * A real ability rather than a stub: `accessibleQuery` calls into CASL's `accessibleBy`, so a
 * hand-rolled `can` would not survive contact with it. Permitting everything keeps each test on the
 * service's own group/subject/instrument scoping rather than on CASL itself.
 */
const permissiveUser = () =>
  ({
    ability: createAppAbility([{ action: 'manage', subject: 'all' }]),
    id: 'user-1'
  }) as any;

/** Can read (so the group resolves) but cannot create an assignment. */
const readOnlyUser = () =>
  ({
    ability: createAppAbility([{ action: 'read', subject: 'all' }]),
    id: 'user-1'
  }) as any;

const request = (overrides: { [key: string]: any } = {}) => ({
  allowDuplicates: false,
  groupId: GROUP_ID,
  subjectIds: ['subject-1', 'subject-2'],
  timepoints: [{ expiresAt: futureDate(), instrumentId: 'instrument-1' }],
  ...overrides
});

/** The refusal body attached to an UnprocessableEntityException. */
const failureOf = async (promise: Promise<unknown>): Promise<BulkAssignmentFailure> => {
  try {
    await promise;
  } catch (err) {
    return (err as UnprocessableEntityException).getResponse() as BulkAssignmentFailure;
  }
  throw new Error('Expected the operation to be refused, but it resolved');
};

describe('AssignmentsService', () => {
  let assignmentsService: AssignmentsService;
  let assignmentModel: MockedInstance<Model<'Assignment'>>;
  let groupModel: MockedInstance<Model<'Group'>>;
  let subjectModel: MockedInstance<Model<'Subject'>>;
  let auditLogger: MockedInstance<AuditLogger>;
  let gatewayService: MockedInstance<GatewayService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        MockFactory.createForModelToken(getModelToken('Assignment')),
        MockFactory.createForModelToken(getModelToken('Group')),
        MockFactory.createForModelToken(getModelToken('Subject')),
        { provide: AuditLogger, useValue: { log: vi.fn() } },
        { provide: ConfigService, useValue: { get: () => 3500, getOrThrow: () => ({ origin: 'https://x' }) } },
        { provide: GatewayService, useValue: { createRemoteAssignments: vi.fn() } },
        { provide: LoggingService, useValue: { error: vi.fn() } }
      ]
    }).compile();

    assignmentModel = moduleRef.get(getModelToken('Assignment'));
    groupModel = moduleRef.get(getModelToken('Group'));
    subjectModel = moduleRef.get(getModelToken('Subject'));
    auditLogger = moduleRef.get(AuditLogger);
    gatewayService = moduleRef.get(GatewayService);
    assignmentsService = moduleRef.get(AssignmentsService);

    groupModel.findFirst.mockResolvedValue({ accessibleInstrumentIds: ['instrument-1', 'instrument-2'], id: GROUP_ID });
    subjectModel.findMany.mockResolvedValue([{ id: 'subject-1' }, { id: 'subject-2' }]);
    assignmentModel.findMany.mockResolvedValue([]);
    assignmentModel.create.mockImplementation(({ data }: any) =>
      Promise.resolve({ ...data, instrumentId: 'instrument-1' })
    );
    assignmentModel.deleteMany.mockResolvedValue({ count: 0 });
  });

  describe('bulkPreflight', () => {
    it('should report one assignment per subject per timepoint, since every timepoint applies to every subject', async () => {
      const result = await assignmentsService.bulkPreflight(
        request({
          subjectIds: ['subject-1', 'subject-2'],
          timepoints: [
            { expiresAt: futureDate(), instrumentId: 'instrument-1' },
            { expiresAt: futureDate(), instrumentId: 'instrument-2' }
          ]
        }),
        permissiveUser()
      );
      expect(result).toEqual({ assignmentCount: 4, subjectCount: 2, timepointCount: 2 });
    });

    it('should scope the group query by the caller ability, so an unreadable group is not found', async () => {
      groupModel.findFirst.mockResolvedValueOnce(null);
      await expect(assignmentsService.bulkPreflight(request(), permissiveUser())).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('should refuse a caller who cannot create assignments for the resolved group', async () => {
      await expect(assignmentsService.bulkPreflight(request(), readOnlyUser())).rejects.toBeInstanceOf(
        ForbiddenException
      );
    });

    it('should refuse an instrument the group has not opted into, since existing is not the same as assignable', async () => {
      const failure = await failureOf(
        assignmentsService.bulkPreflight(
          request({ timepoints: [{ expiresAt: futureDate(), instrumentId: 'instrument-other' }] }),
          permissiveUser()
        )
      );
      expect(failure.issues).toContainEqual({ instrumentIds: ['instrument-other'], kind: 'INSTRUMENT_UNAVAILABLE' });
    });

    it('should restrict subjects to the selected group and the caller ability', async () => {
      await assignmentsService.bulkPreflight(request(), permissiveUser());
      expect(subjectModel.findMany.mock.lastCall?.[0]).toMatchObject({
        where: { groupIds: { has: GROUP_ID }, id: { in: ['subject-1', 'subject-2'] } }
      });
    });

    it('should report a subject outside the group as unavailable without revealing whether it exists', async () => {
      subjectModel.findMany.mockResolvedValueOnce([{ id: 'subject-1' }]);
      const failure = await failureOf(assignmentsService.bulkPreflight(request(), permissiveUser()));
      expect(failure.issues).toContainEqual({ kind: 'SUBJECT_UNAVAILABLE', subjectIds: ['subject-2'] });
    });

    it('should report an outstanding unexpired assignment as a conflict', async () => {
      assignmentModel.findMany.mockResolvedValueOnce([{ instrumentId: 'instrument-1', subjectId: 'subject-1' }]);
      const failure = await failureOf(assignmentsService.bulkPreflight(request(), permissiveUser()));
      expect(failure.issues).toContainEqual({
        conflicts: [{ instrumentId: 'instrument-1', subjectId: 'subject-1' }],
        kind: 'CONFLICT'
      });
    });

    it('should scope the conflict query to this group, instrument, subjects, and live assignments only', async () => {
      await assignmentsService.bulkPreflight(request(), permissiveUser());
      expect(assignmentModel.findMany.mock.lastCall?.[0]).toMatchObject({
        where: {
          groupId: GROUP_ID,
          instrumentId: { in: ['instrument-1'] },
          status: 'OUTSTANDING',
          subjectId: { in: ['subject-1', 'subject-2'] }
        }
      });
    });

    it('should not look for conflicts when the caller has already accepted duplicates', async () => {
      await assignmentsService.bulkPreflight(request({ allowDuplicates: true }), permissiveUser());
      expect(assignmentModel.findMany).not.toHaveBeenCalled();
    });
  });

  describe('createBulk', () => {
    it('should create one assignment per subject per timepoint', async () => {
      const assignments = await assignmentsService.createBulk(
        request({
          timepoints: [
            { expiresAt: futureDate(), instrumentId: 'instrument-1' },
            { expiresAt: futureDate(), instrumentId: 'instrument-2' }
          ]
        }),
        permissiveUser()
      );
      expect(assignments).toHaveLength(4);
      expect(assignmentModel.create).toHaveBeenCalledTimes(4);
    });

    it('should never return or transmit the encryption keypair, which would hand out the private key', async () => {
      assignmentModel.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ ...data, encryptionKeyPair: { privateKey: 'SECRET', publicKey: 'PUB' } })
      );
      const assignments = await assignmentsService.createBulk(request(), permissiveUser());

      expect(assignments.every((assignment) => !('encryptionKeyPair' in assignment))).toBe(true);
      const sent = gatewayService.createRemoteAssignments.mock.lastCall?.[0] as { assignment: object }[];
      expect(sent.every(({ assignment }) => !('encryptionKeyPair' in assignment))).toBe(true);
      expect(JSON.stringify(sent)).not.toContain('SECRET');
    });

    it('should send the whole batch to the gateway in a single call, so one bundle is fetched per instrument', async () => {
      await assignmentsService.createBulk(request(), permissiveUser());
      expect(gatewayService.createRemoteAssignments).toHaveBeenCalledTimes(1);
      expect(gatewayService.createRemoteAssignments.mock.lastCall?.[0]).toHaveLength(2);
    });

    it('should re-run the conflict check at create time, closing the race between review and submit', async () => {
      assignmentModel.findMany.mockResolvedValueOnce([{ instrumentId: 'instrument-1', subjectId: 'subject-1' }]);
      await expect(assignmentsService.createBulk(request(), permissiveUser())).rejects.toBeInstanceOf(
        UnprocessableEntityException
      );
      expect(assignmentModel.create).not.toHaveBeenCalled();
      expect(gatewayService.createRemoteAssignments).not.toHaveBeenCalled();
    });

    it('should create despite a conflict when the caller explicitly allowed duplicates', async () => {
      const assignments = await assignmentsService.createBulk(request({ allowDuplicates: true }), permissiveUser());
      expect(assignments).toHaveLength(2);
    });

    it('should delete every staged row when the gateway rejects the batch, leaving nothing behind', async () => {
      gatewayService.createRemoteAssignments.mockRejectedValueOnce(new Error('gateway down'));
      await expect(assignmentsService.createBulk(request(), permissiveUser())).rejects.toThrow();
      expect(assignmentModel.deleteMany).toHaveBeenCalledTimes(1);
      expect(assignmentModel.deleteMany.mock.lastCall?.[0]).toMatchObject({ where: { id: { in: expect.any(Array) } } });
      expect(assignmentModel.deleteMany.mock.lastCall?.[0].where.id.in).toHaveLength(2);
    });

    it('should not record an audit entry when the batch failed, since nothing was created', async () => {
      gatewayService.createRemoteAssignments.mockRejectedValueOnce(new Error('gateway down'));
      await expect(assignmentsService.createBulk(request(), permissiveUser())).rejects.toThrow();
      expect(auditLogger.log).not.toHaveBeenCalled();
    });

    it('should record one audit entry carrying the bulk counts, using the existing CREATE action', async () => {
      await assignmentsService.createBulk(request(), permissiveUser());
      expect(auditLogger.log).toHaveBeenCalledTimes(1);
      expect(auditLogger.log.mock.lastCall).toMatchObject([
        'CREATE',
        'ASSIGNMENT',
        { groupId: GROUP_ID, metadata: { createdCount: '2', mode: 'BULK', requestedCount: '2' } }
      ]);
    });
  });
});
