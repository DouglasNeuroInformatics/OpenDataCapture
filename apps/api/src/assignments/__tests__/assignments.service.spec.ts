import { ConfigService, getModelToken, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ForbiddenException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { BulkAssignmentFailure } from '@opendatacapture/schemas/assignment';
import type { Permissions } from '@opendatacapture/schemas/core';
import type { BasePermissionLevel } from '@opendatacapture/schemas/user';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuditLogger } from '@/audit/audit.logger';
import { AbilityFactory } from '@/auth/ability.factory';
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

/** The ability `AbilityFactory` builds at login, so group conditions are the ones production applies. */
const userAt = (
  basePermissionLevel: BasePermissionLevel,
  groupId = GROUP_ID,
  additionalPermissions: Permissions = []
) =>
  ({
    ability: new AbilityFactory({ verbose: vi.fn() } as any).createForPayload({
      additionalPermissions,
      basePermissionLevel,
      groups: [{ id: groupId }],
      id: 'user-1'
    } as any),
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
        {
          provide: GatewayService,
          useValue: {
            createRemoteAssignment: vi.fn(),
            createRemoteAssignments: vi.fn(),
            deleteRemoteAssignment: vi.fn()
          }
        },
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

  describe('create', () => {
    const data = () => ({
      expiresAt: futureDate(),
      groupId: GROUP_ID,
      instrumentId: 'instrument-1',
      subjectId: 'subject-1'
    });

    it('should never return or transmit the encryption keypair, which would hand out the private key', async () => {
      assignmentModel.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ ...data, encryptionKeyPair: { privateKey: 'SECRET', publicKey: 'PUB' } })
      );
      const assignment = await assignmentsService.create(data(), permissiveUser());

      expect(assignment).not.toHaveProperty('encryptionKeyPair');
      expect(gatewayService.createRemoteAssignment.mock.lastCall?.[0]).not.toHaveProperty('encryptionKeyPair');
    });

    it('should connect no group to an ungrouped assignment, since connecting a null id would throw', async () => {
      await assignmentsService.create({ ...data(), groupId: null }, permissiveUser());
      expect(assignmentModel.create.mock.lastCall?.[0].data.group).toBeUndefined();
    });

    it('should refuse a group the caller cannot read, as though it did not exist', async () => {
      groupModel.findFirst.mockResolvedValueOnce(null);
      await expect(assignmentsService.create(data(), permissiveUser())).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should refuse a group manager an assignment filed under a group they do not manage', async () => {
      await expect(assignmentsService.create(data(), userAt('GROUP_MANAGER', 'group-2'))).rejects.toBeInstanceOf(
        ForbiddenException
      );
    });

    it('should refuse an instrument the group has not opted into', async () => {
      const failure = await failureOf(
        assignmentsService.create({ ...data(), instrumentId: 'instrument-other' }, userAt('GROUP_MANAGER'))
      );
      expect(failure.issues).toContainEqual({ instrumentIds: ['instrument-other'], kind: 'INSTRUMENT_UNAVAILABLE' });
    });

    it('should refuse a subject outside the group, so its participant link cannot be issued elsewhere', async () => {
      subjectModel.findMany.mockResolvedValueOnce([]);
      const failure = await failureOf(assignmentsService.create(data(), userAt('GROUP_MANAGER')));
      expect(failure.issues).toContainEqual({ kind: 'SUBJECT_UNAVAILABLE', subjectIds: ['subject-1'] });
    });

    it('should write nothing to the model or the gateway when the request is refused', async () => {
      subjectModel.findMany.mockResolvedValueOnce([]);
      await expect(assignmentsService.create(data(), userAt('GROUP_MANAGER'))).rejects.toThrow();
      expect(assignmentModel.create).not.toHaveBeenCalled();
      expect(gatewayService.createRemoteAssignment).not.toHaveBeenCalled();
    });

    it('should not look for conflicts, since a single assignment may duplicate an outstanding one', async () => {
      await assignmentsService.create(data(), userAt('GROUP_MANAGER'));
      expect(assignmentModel.findMany).not.toHaveBeenCalled();
    });

    it.each([null, undefined])(
      'should refuse a group manager an assignment with groupId %s, since every rule they hold names a group',
      async (groupId) => {
        await expect(assignmentsService.create({ ...data(), groupId }, userAt('GROUP_MANAGER'))).rejects.toBeInstanceOf(
          ForbiddenException
        );
        expect(assignmentModel.create).not.toHaveBeenCalled();
      }
    );

    it('should allow an administrator an ungrouped assignment, which the web client sends when no group is selected', async () => {
      await assignmentsService.create({ ...data(), groupId: undefined }, userAt('ADMIN'));
      expect(gatewayService.createRemoteAssignment).toHaveBeenCalledTimes(1);
    });

    it('should file a grouped assignment under the group it names, so that group can find and cancel it', async () => {
      await assignmentsService.create(data(), userAt('GROUP_MANAGER'));
      expect(assignmentModel.create.mock.lastCall?.[0].data.group).toStrictEqual({ connect: { id: GROUP_ID } });
    });

    it('should allow a grouped assignment to a user granted only assignment creation in that group, which is less than managing it', async () => {
      const grantee = userAt('STANDARD', GROUP_ID, [{ action: 'create', groupId: GROUP_ID, subject: 'Assignment' }]);
      await assignmentsService.create(data(), grantee);
      expect(gatewayService.createRemoteAssignment).toHaveBeenCalledTimes(1);
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

  describe('deleteBulk', () => {
    it('should delete outstanding assignments from the gateway and then from the database', async () => {
      assignmentModel.findMany.mockResolvedValueOnce([
        { id: 'a-1', status: 'OUTSTANDING' },
        { id: 'a-2', status: 'OUTSTANDING' }
      ]);
      assignmentModel.delete.mockResolvedValue({});
      const result = await assignmentsService.deleteBulk(['a-1', 'a-2'], { ability: permissiveUser().ability });
      expect(result).toEqual({ deletedCount: 2, failedIds: [] });
      expect(gatewayService.deleteRemoteAssignment).toHaveBeenCalledTimes(2);
      expect(assignmentModel.delete).toHaveBeenCalledTimes(2);
    });

    it('should skip the gateway call for expired assignments, since their links are already dead', async () => {
      assignmentModel.findMany.mockResolvedValueOnce([{ id: 'a-1', status: 'EXPIRED' }]);
      assignmentModel.delete.mockResolvedValue({});
      const result = await assignmentsService.deleteBulk(['a-1'], { ability: permissiveUser().ability });
      expect(result).toEqual({ deletedCount: 1, failedIds: [] });
      expect(gatewayService.deleteRemoteAssignment).not.toHaveBeenCalled();
      expect(assignmentModel.delete).toHaveBeenCalledTimes(1);
    });

    it('should report a failed assignment without stopping the rest of the batch', async () => {
      assignmentModel.findMany.mockResolvedValueOnce([
        { id: 'a-1', status: 'OUTSTANDING' },
        { id: 'a-2', status: 'OUTSTANDING' }
      ]);
      gatewayService.deleteRemoteAssignment.mockRejectedValueOnce(new Error('gateway down'));
      assignmentModel.delete.mockResolvedValue({});
      const result = await assignmentsService.deleteBulk(['a-1', 'a-2'], { ability: permissiveUser().ability });
      expect(result.deletedCount).toBe(1);
      expect(result.failedIds).toEqual(['a-1']);
    });

    it('should only find assignments with OUTSTANDING or EXPIRED status', async () => {
      assignmentModel.findMany.mockResolvedValueOnce([]);
      await assignmentsService.deleteBulk(['a-1'], { ability: permissiveUser().ability });
      expect(assignmentModel.findMany.mock.lastCall?.[0]).toMatchObject({
        where: { id: { in: ['a-1'] }, status: { in: ['OUTSTANDING', 'EXPIRED'] } }
      });
    });
  });

  describe('updateById', () => {
    it('should refuse an assignment the caller cannot update before deleting it on the gateway, which cannot be undone', async () => {
      assignmentModel.exists.mockResolvedValueOnce(false);
      await expect(
        assignmentsService.updateById('assignment-1', { status: 'CANCELED' }, permissiveUser())
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(gatewayService.deleteRemoteAssignment).not.toHaveBeenCalled();
    });

    it('should delete the gateway copy of an assignment the caller cancels, so its link stops working', async () => {
      assignmentModel.exists.mockResolvedValueOnce(true);
      assignmentModel.update.mockResolvedValueOnce({ groupId: GROUP_ID, id: 'assignment-1' });
      await assignmentsService.updateById('assignment-1', { status: 'CANCELED' }, permissiveUser());
      expect(gatewayService.deleteRemoteAssignment).toHaveBeenCalledExactlyOnceWith('assignment-1');
    });
  });
});
