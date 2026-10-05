import { CryptoService, getModelToken, LoggingService, PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Subject } from '@prisma/client';
import { pick } from 'lodash-es';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AbilityFactory } from '@/auth/ability.factory';
import { accessibleQuery, createAppAbility } from '@/auth/ability.utils';
import type { RuntimePrismaClient } from '@/core/prisma';
import { StorageService } from '@/storage/storage.service';

import { SubjectsService } from '../subjects.service';

describe('SubjectsService', () => {
  let storageService: MockedInstance<StorageService>;
  let loggingService: MockedInstance<LoggingService>;
  let subjectsService: SubjectsService;
  let subjectModel: MockedInstance<Model<'Subject'>>;
  let prismaClient: MockedInstance<RuntimePrismaClient> & {
    [key: string]: any;
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockFactory.createForService(CryptoService),
        SubjectsService,
        MockFactory.createForService(StorageService),
        MockFactory.createForService(LoggingService),
        MockFactory.createForModelToken(getModelToken('Subject')),
        {
          provide: PRISMA_CLIENT_TOKEN,
          useValue: {
            $transaction: vi.fn(),
            instrumentRecord: {
              deleteMany: vi.fn(),
              findMany: vi.fn().mockResolvedValue([]),
              groupBy: vi.fn()
            },
            instrumentRecordFile: {
              deleteMany: vi.fn(),
              findMany: vi.fn().mockResolvedValue([])
            },
            session: {
              deleteMany: vi.fn()
            },
            subject: {
              delete: vi.fn()
            }
          }
        }
      ]
    }).compile();
    storageService = moduleRef.get(StorageService);
    loggingService = moduleRef.get(LoggingService);
    subjectModel = moduleRef.get(getModelToken('Subject'));
    subjectsService = moduleRef.get(SubjectsService);
    prismaClient = moduleRef.get(PRISMA_CLIENT_TOKEN);
  });

  describe('addGroupForSubjects', () => {
    // The exclusion belongs in the query, not the caller: mongodb arrays admit duplicates, so a
    // caller filtering against a list it read earlier would push the id twice under concurrency.
    it('should skip subjects already in the group from within the query itself', async () => {
      await subjectsService.addGroupForSubjects(['subject-1', 'subject-2'], 'group-1');

      expect(subjectModel.updateMany.mock.lastCall?.[0]).toMatchObject({
        data: { groupIds: { push: 'group-1' } },
        where: {
          id: { in: ['subject-1', 'subject-2'] },
          NOT: { groupIds: { has: 'group-1' } }
        }
      });
    });

    it('should associate every subject in one write rather than one per subject', async () => {
      await subjectsService.addGroupForSubjects(['subject-1', 'subject-2', 'subject-3'], 'group-1');

      expect(subjectModel.updateMany).toHaveBeenCalledOnce();
      expect(subjectModel.update).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should call the subject model', async () => {
      const subject = {
        dateOfBirth: new Date(2000),
        firstName: 'Bob',
        id: '123',
        lastName: 'Smith',
        sex: 'MALE'
      } as const;
      await subjectsService.create(subject);
      expect(subjectModel.create.mock.lastCall?.[0]).toMatchObject({ data: pick(subject, 'dateOfBirth', 'sex') });
    });

    it('should throw a ConflictException if a subject with the provided id already exists', async () => {
      subjectModel.exists.mockResolvedValueOnce(true);
      await expect(
        subjectsService.create({
          dateOfBirth: new Date(2000),
          firstName: 'Bob',
          id: '123',
          lastName: 'Smith',
          sex: 'MALE'
        })
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('createMany', () => {
    // `demo.service.ts` hands `sessionsService.create` a whole row, which reaches this method.
    it('should keep the demographics of a new subject and drop the fields the caller may not set', async () => {
      subjectModel.findMany.mockResolvedValueOnce([]);
      const row: Subject = {
        createdAt: new Date(0),
        dateOfBirth: new Date(2000, 0, 1),
        firstName: 'Ada',
        groupIds: ['group-9'],
        id: 'subject-1',
        lastName: 'Lovelace',
        sex: 'FEMALE',
        updatedAt: new Date(0)
      };

      await subjectsService.createMany([row]);

      expect(subjectModel.createMany.mock.lastCall?.[0].data).toStrictEqual([
        {
          dateOfBirth: row.dateOfBirth,
          firstName: 'Ada',
          groupIds: [],
          id: 'subject-1',
          lastName: 'Lovelace',
          sex: 'FEMALE'
        }
      ]);
    });
  });

  describe('createMany (existing and repeated subjects)', () => {
    it('should create a subject named twice in one request only once, keeping its first entry', async () => {
      subjectModel.findMany.mockResolvedValueOnce([]);

      await subjectsService.createMany([
        { firstName: 'First', id: 'subject-1' },
        { firstName: 'Second', id: 'subject-1' }
      ]);

      expect(subjectModel.createMany.mock.lastCall?.[0].data).toMatchObject([{ firstName: 'First', id: 'subject-1' }]);
      expect(subjectModel.createMany.mock.lastCall?.[0].data).toHaveLength(1);
    });

    it('should create only the subjects that do not exist yet', async () => {
      subjectModel.findMany.mockResolvedValueOnce([{ id: 'subject-1' }]);

      await subjectsService.createMany([{ id: 'subject-1' }, { id: 'subject-2' }]);

      expect(subjectModel.createMany.mock.lastCall?.[0].data).toMatchObject([{ id: 'subject-2' }]);
    });

    it('should not issue a write when every subject already exists', async () => {
      subjectModel.findMany.mockResolvedValueOnce([{ id: 'subject-1' }]);

      await expect(subjectsService.createMany([{ id: 'subject-1' }])).resolves.toEqual([]);
      expect(subjectModel.createMany).not.toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('should count only the subjects the caller may read that match the filter', async () => {
      const ability = createAppAbility([
        { action: 'read', conditions: { groupIds: { has: 'group-1' } }, subject: 'Subject' }
      ]);
      subjectModel.count.mockResolvedValueOnce(4);

      await expect(subjectsService.count({ sex: 'FEMALE' }, { ability })).resolves.toBe(4);
      expect(subjectModel.count).toHaveBeenCalledWith({
        where: { AND: [accessibleQuery(ability, 'read', 'Subject'), { sex: 'FEMALE' }] }
      });
    });

    it('should count every subject when given no filter', async () => {
      subjectModel.count.mockResolvedValueOnce(7);

      await expect(subjectsService.count()).resolves.toBe(7);
      expect(subjectModel.count).toHaveBeenCalledWith({ where: { AND: [{}, {}] } });
    });
  });

  describe('find', () => {
    it('should return the array returned by the subject model', async () => {
      subjectModel.findMany.mockResolvedValueOnce([{ id: '123' }]);
      await expect(subjectsService.find()).resolves.toMatchObject([{ id: '123' }]);
    });
    it('should return the array of subjects with records', async () => {
      prismaClient.instrumentRecord.groupBy.mockResolvedValueOnce([{ subjectId: '123' }]);
      subjectModel.findMany.mockResolvedValueOnce([{ id: '123' }]);
      await expect(subjectsService.find({ hasRecord: true })).resolves.toMatchObject([{ id: '123' }]);
      expect(subjectModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [{}, {}, { id: { in: ['123'] } }]
          })
        })
      );
    });
    // `distinct` is applied by the prisma query engine, so it returns one row per record over the
    // wire; grouping asks mongodb for one row per subject instead.
    it('should group the ids in the database rather than deduplicating them after the fact', async () => {
      prismaClient.instrumentRecord.groupBy.mockResolvedValueOnce([{ subjectId: '123' }]);
      subjectModel.findMany.mockResolvedValueOnce([{ id: '123' }]);
      await subjectsService.find({ hasRecord: true });
      expect(prismaClient.instrumentRecord.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({ by: ['subjectId'] })
      );
    });
    it('should filter instrument records by groupId when provided', async () => {
      prismaClient.instrumentRecord.groupBy.mockResolvedValueOnce([{ subjectId: '123' }]);
      subjectModel.findMany.mockResolvedValueOnce([{ id: '123' }]);
      await subjectsService.find({ groupId: 'group-1', hasRecord: true });
      expect(prismaClient.instrumentRecord.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { AND: [{}, { groupId: 'group-1' }] }
        })
      );
    });
    it('should constrain the record query to what the caller may read, so the filter cannot be resolved from other groups records', async () => {
      prismaClient.instrumentRecord.groupBy.mockResolvedValueOnce([]);
      subjectModel.findMany.mockResolvedValueOnce([]);
      // Conditions are what make this meaningful: an unconditional read rule yields `{}`, which is
      // indistinguishable from the ability never having been applied.
      const ability = createAppAbility([
        { action: 'read', conditions: { groupId: { in: ['group-1'] } }, subject: 'InstrumentRecord' },
        { action: 'read', conditions: { groupIds: { hasSome: ['group-1'] } }, subject: 'Subject' }
      ]);
      await subjectsService.find({ hasRecord: true }, { ability });
      const [call] = prismaClient.instrumentRecord.groupBy.mock.lastCall as [{ where: { AND: unknown[] } }];
      expect(call.where.AND[0]).toStrictEqual(accessibleQuery(ability, 'read', 'InstrumentRecord'));
    });

    // A STANDARD user holds `create` but not `read` on InstrumentRecord, and this route's guard names
    // `read Subject`, so they reach the service. `accessibleQuery` throws on an ability with no rule
    // for the subject at all, which escapes as a 500 rather than the empty list they should see.
    it('should return an empty list for a caller who may read no records, rather than throwing', async () => {
      const abilityFactory = new AbilityFactory(MockFactory.createMock(LoggingService) as unknown as LoggingService);
      const ability = abilityFactory.createForPayload({
        basePermissionLevel: 'STANDARD',
        firstName: null,
        groups: [],
        id: 'user-1',
        kind: 'login',
        lastName: null,
        mustResetPassword: false,
        username: 'standard-user'
      });
      subjectModel.findMany.mockResolvedValueOnce([]);

      await expect(subjectsService.find({ hasRecord: true }, { ability })).resolves.toStrictEqual([]);

      expect(prismaClient.instrumentRecord.groupBy).not.toHaveBeenCalled();
      const [call] = subjectModel.findMany.mock.lastCall as [{ where: { AND: unknown[] } }];
      expect(call.where.AND).toContainEqual({ id: { in: [] } });
    });
    it('should pass all subject IDs returned by instrument records to the subject query', async () => {
      prismaClient.instrumentRecord.groupBy.mockResolvedValueOnce([{ subjectId: '123' }, { subjectId: '456' }]);
      subjectModel.findMany.mockResolvedValueOnce([{ id: '123' }, { id: '456' }]);
      await subjectsService.find({ hasRecord: true });
      expect(subjectModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [{}, {}, { id: { in: ['123', '456'] } }]
          })
        })
      );
    });
  });

  describe('deleteById', () => {
    it('should delete the subject via the subject model and not call $transaction, if force is falsy', async () => {
      subjectModel.findFirst.mockResolvedValueOnce({ id: '123' });
      await subjectsService.deleteById('123');
      expect(subjectModel.delete).toHaveBeenCalledOnce();
      expect(prismaClient.$transaction).not.toHaveBeenCalled();
    });
    it('should use $transaction if force is set to true', async () => {
      subjectModel.findFirst.mockResolvedValueOnce({ id: '123' });
      await subjectsService.deleteById('123', { force: true });
      expect(subjectModel.delete).not.toHaveBeenCalled();
      expect(prismaClient.$transaction).toHaveBeenCalledOnce();
    });
    it('should pass operations to $transaction in order: files, instrumentRecord, session, subject', async () => {
      subjectModel.findFirst.mockResolvedValueOnce({ id: '123' });
      const fileOp = 'file-op';
      prismaClient.instrumentRecordFile.deleteMany.mockReturnValueOnce(fileOp);
      const instrumentRecordOp = 'instrumentRecord-op';
      const sessionOp = 'session-op';
      const subjectOp = 'subject-op';
      prismaClient.instrumentRecord.deleteMany.mockReturnValueOnce(instrumentRecordOp);
      prismaClient.session.deleteMany.mockReturnValueOnce(sessionOp);
      prismaClient.subject.delete.mockReturnValueOnce(subjectOp);
      await subjectsService.deleteById('123', { force: true });
      expect(prismaClient.$transaction).toHaveBeenCalledWith([fileOp, instrumentRecordOp, sessionOp, subjectOp]);
    });
    it('should scope the subject and its dependent records and sessions to delete permissions', async () => {
      const ability = createAppAbility([
        { action: 'delete', conditions: { groupIds: { has: 'group-1' } }, subject: 'Subject' },
        { action: 'delete', conditions: { groupId: 'group-1' }, subject: 'InstrumentRecord' },
        { action: 'delete', conditions: { groupId: 'group-1' }, subject: 'Session' }
      ]);
      subjectModel.findFirst.mockResolvedValueOnce({ id: '123' });
      await subjectsService.deleteById('123', { ability, force: true });
      const where = { AND: [accessibleQuery(ability, 'delete', 'Subject')], id: '123' };
      expect(subjectModel.findFirst).toHaveBeenCalledWith({ where });
      expect(prismaClient.subject.delete).toHaveBeenCalledWith({ where });
      expect(prismaClient.instrumentRecord.findMany).toHaveBeenCalledWith({
        select: { id: true },
        where: { AND: [accessibleQuery(ability, 'delete', 'InstrumentRecord')], subjectId: '123' }
      });
      expect(prismaClient.instrumentRecord.deleteMany).toHaveBeenCalledWith({
        where: { AND: [accessibleQuery(ability, 'delete', 'InstrumentRecord')], id: { in: [] }, subjectId: '123' }
      });
      expect(prismaClient.session.deleteMany).toHaveBeenCalledWith({
        where: { AND: [accessibleQuery(ability, 'delete', 'Session')], subjectId: '123' }
      });
    });

    it('should collect files from every authorized record and clean storage only after commit', async () => {
      subjectModel.findFirst.mockResolvedValueOnce({ id: '123' });
      prismaClient.instrumentRecord.findMany.mockResolvedValueOnce([{ id: 'record-1' }, { id: 'record-2' }]);
      const files = [
        { basename: 'file', groupId: 'group-1', id: 'file-1', index: 0, recordId: 'record-1' },
        { basename: 'scan', groupId: null, id: 'file-2', index: 1, recordId: 'record-2' }
      ];
      prismaClient.instrumentRecordFile.findMany.mockResolvedValueOnce(files);
      const commit = Promise.withResolvers<unknown[]>();
      prismaClient.$transaction.mockReturnValueOnce(commit.promise);
      const deletion = subjectsService.deleteById('123', { force: true });
      await vi.waitFor(() => expect(prismaClient.$transaction).toHaveBeenCalledOnce());
      expect(storageService.deleteObjects).not.toHaveBeenCalled();
      commit.resolve([]);
      await deletion;
      expect(prismaClient.instrumentRecordFile.findMany).toHaveBeenCalledWith({
        where: { recordId: { in: ['record-1', 'record-2'] } }
      });
      expect(prismaClient.instrumentRecordFile.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['file-1', 'file-2'] } }
      });
      expect(subjectModel.findFirst).toHaveBeenCalledBefore(prismaClient.instrumentRecord.findMany);
      expect(prismaClient.instrumentRecordFile.findMany).toHaveBeenCalledBefore(
        prismaClient.instrumentRecordFile.deleteMany
      );
      expect(storageService.deleteObjects).toHaveBeenCalledWith([
        { groupId: 'group-1', location: { basename: 'file', index: 0 }, recordId: 'record-1' },
        { groupId: null, location: { basename: 'scan', index: 1 }, recordId: 'record-2' }
      ]);
    });

    it('should keep storage intact if any database deletion fails', async () => {
      subjectModel.findFirst.mockResolvedValueOnce({ id: '123' });
      prismaClient.$transaction.mockRejectedValueOnce(new Error('transaction failed'));
      await expect(subjectsService.deleteById('123', { force: true })).rejects.toThrow('transaction failed');
      expect(storageService.deleteObjects).not.toHaveBeenCalled();
    });

    it('should log storage cleanup failure after a successful force deletion', async () => {
      subjectModel.findFirst.mockResolvedValueOnce({ id: '123' });
      prismaClient.instrumentRecord.findMany.mockResolvedValueOnce([{ id: 'record-1' }]);
      prismaClient.instrumentRecordFile.findMany.mockResolvedValueOnce([
        { basename: 'file', groupId: null, id: 'file-1', index: 0, recordId: 'record-1' }
      ]);
      const error = new Error('storage failed');
      storageService.deleteObjects.mockRejectedValueOnce(error);
      await expect(subjectsService.deleteById('123', { force: true })).resolves.toEqual({ success: true });
      expect(loggingService.error).toHaveBeenCalledWith({
        error,
        files: [{ groupId: null, location: { basename: 'file', index: 0 }, recordId: 'record-1' }],
        message: expect.stringContaining('orphaned objects require cleanup')
      });
    });

    it('should refuse an inaccessible subject before reading or deleting dependent data', async () => {
      subjectModel.findFirst.mockResolvedValueOnce(null);
      const ability = createAppAbility([
        { action: 'delete', conditions: { groupIds: { has: 'other-group' } }, subject: 'Subject' }
      ]);
      await expect(subjectsService.deleteById('123', { ability, force: true })).rejects.toBeInstanceOf(
        NotFoundException
      );
      expect(prismaClient.instrumentRecord.findMany).not.toHaveBeenCalled();
      expect(prismaClient.instrumentRecordFile.findMany).not.toHaveBeenCalled();
      expect(prismaClient.$transaction).not.toHaveBeenCalled();
      expect(storageService.deleteObjects).not.toHaveBeenCalled();
    });

    it('should leave dependent rows and storage alone when force is false', async () => {
      subjectModel.findFirst.mockResolvedValueOnce({ id: '123' });
      await expect(subjectsService.deleteById('123')).resolves.toEqual({ success: true });
      expect(prismaClient.instrumentRecord.findMany).not.toHaveBeenCalled();
      expect(prismaClient.instrumentRecordFile.deleteMany).not.toHaveBeenCalled();
      expect(storageService.deleteObjects).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when subject does not exist', async () => {
      subjectModel.findFirst.mockResolvedValueOnce(null);
      await expect(subjectsService.deleteById('123')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findCustomIds', () => {
    const findManyArgs = () =>
      subjectModel.findMany.mock.lastCall?.[0] as { select: unknown; where: { AND: unknown[] } };

    it('should return only the ids, so no personal information leaves the database', async () => {
      subjectModel.findMany.mockResolvedValueOnce([{ id: 'group$a' }, { id: 'group$b' }]);
      await expect(subjectsService.findCustomIds('group-1')).resolves.toStrictEqual(['group$a', 'group$b']);
      expect(findManyArgs().select).toStrictEqual({ id: true });
    });

    it('should constrain the query to what the caller may read, so it cannot list subjects from other groups', async () => {
      // An unconditional read rule yields `{}`, which is indistinguishable from no ability at all.
      const ability = createAppAbility([
        { action: 'read', conditions: { groupIds: { hasSome: ['group-1'] } }, subject: 'Subject' }
      ]);
      subjectModel.findMany.mockResolvedValueOnce([]);
      await subjectsService.findCustomIds('group-1', { ability });
      expect(findManyArgs().where.AND[0]).toStrictEqual(accessibleQuery(ability, 'read', 'Subject'));
    });

    it('should exclude subjects outside the requested group', async () => {
      subjectModel.findMany.mockResolvedValueOnce([]);
      await subjectsService.findCustomIds('group-1');
      expect(findManyArgs().where.AND).toContainEqual({ groupIds: { has: 'group-1' } });
    });

    // A subject with every field set is identified by personal information, so no clause matches it.
    it('should match a subject missing any one personal-info field, whether null or absent from the document', async () => {
      subjectModel.findMany.mockResolvedValueOnce([]);
      await subjectsService.findCustomIds('group-1');
      expect(findManyArgs().where.AND).toContainEqual({
        OR: [
          { dateOfBirth: null },
          { dateOfBirth: { isSet: false } },
          { firstName: null },
          { firstName: { isSet: false } },
          { lastName: null },
          { lastName: { isSet: false } },
          { sex: null },
          { sex: { isSet: false } }
        ]
      });
    });
  });

  describe('findDefaultGroupCustomIds', () => {
    const findManyArgs = () =>
      subjectModel.findMany.mock.lastCall?.[0] as { select: unknown; where: { AND: unknown[] } };

    it('should return only the ids, so no personal information leaves the database', async () => {
      subjectModel.findMany.mockResolvedValueOnce([{ id: 'root$a' }]);
      await expect(subjectsService.findDefaultGroupCustomIds()).resolves.toStrictEqual(['root$a']);
      expect(findManyArgs().select).toStrictEqual({ id: true });
    });

    it('should constrain the query to what the caller may read, so a group manager is not shown other groups’ subjects', async () => {
      const ability = createAppAbility([
        { action: 'read', conditions: { groupIds: { hasSome: ['group-1'] } }, subject: 'Subject' }
      ]);
      subjectModel.findMany.mockResolvedValueOnce([]);
      await subjectsService.findDefaultGroupCustomIds({ ability });
      expect(findManyArgs().where.AND[0]).toStrictEqual(accessibleQuery(ability, 'read', 'Subject'));
    });

    it('should match on the default group scope of the id, so a subject later added to a group is still offered', async () => {
      subjectModel.findMany.mockResolvedValueOnce([]);
      await subjectsService.findDefaultGroupCustomIds();
      expect(findManyArgs().where.AND).toContainEqual({ id: { gte: 'root$', lt: 'root%' } });
      expect(JSON.stringify(findManyArgs().where)).not.toContain('groupIds');
    });

    it('should match only subjects identified by a custom id, like the per-group lookup', async () => {
      subjectModel.findMany.mockResolvedValueOnce([]);
      await subjectsService.findCustomIds('group-1');
      const [, , groupedCustomIdClause] = findManyArgs().where.AND;
      subjectModel.findMany.mockResolvedValueOnce([]);
      await subjectsService.findDefaultGroupCustomIds();
      expect(findManyArgs().where.AND).toContainEqual(groupedCustomIdClause);
    });
  });

  describe('findById', () => {
    it('should throw a `NotFoundException` if there is no subject with the provided id', async () => {
      subjectModel.findFirst.mockResolvedValueOnce(null);
      await expect(subjectsService.findById('123')).rejects.toBeInstanceOf(NotFoundException);
    });
    it('should return the subject with the provided id if it exists', async () => {
      subjectModel.findFirst.mockResolvedValueOnce({ id: '123' });
      await expect(subjectsService.findById('123')).resolves.toMatchObject({ id: '123' });
    });
  });
});
