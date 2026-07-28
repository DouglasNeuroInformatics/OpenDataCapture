import { CryptoService, getModelToken, LoggingService, PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { pick } from 'lodash-es';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AbilityFactory } from '@/auth/ability.factory';
import { accessibleQuery, createAppAbility } from '@/auth/ability.utils';
import type { RuntimePrismaClient } from '@/core/prisma';

import { SubjectsService } from '../subjects.service';

describe('SubjectsService', () => {
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
        MockFactory.createForModelToken(getModelToken('Subject')),
        {
          provide: PRISMA_CLIENT_TOKEN,
          useValue: {
            $transaction: vi.fn(),
            instrumentRecord: {
              deleteMany: vi.fn(),
              findMany: vi.fn(),
              groupBy: vi.fn()
            },
            session: {
              deleteMany: vi.fn()
            },
            subject: {
              deleteMany: vi.fn()
            }
          }
        }
      ]
    }).compile();
    subjectModel = moduleRef.get(getModelToken('Subject'));
    subjectsService = moduleRef.get(SubjectsService);
    prismaClient = moduleRef.get(PRISMA_CLIENT_TOKEN);
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
        groups: [{ id: 'group-1' }],
        id: 'user-1'
      } as any);
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
    it('should pass operations to $transaction in order: instrumentRecord, session, subject', async () => {
      subjectModel.findFirst.mockResolvedValueOnce({ id: '123' });
      const instrumentRecordOp = 'instrumentRecord-op';
      const sessionOp = 'session-op';
      const subjectOp = 'subject-op';
      prismaClient.instrumentRecord.deleteMany.mockReturnValueOnce(instrumentRecordOp);
      prismaClient.session.deleteMany.mockReturnValueOnce(sessionOp);
      prismaClient.subject.deleteMany.mockReturnValueOnce(subjectOp);
      await subjectsService.deleteById('123', { force: true });
      expect(prismaClient.$transaction).toHaveBeenCalledWith([instrumentRecordOp, sessionOp, subjectOp]);
    });
    it('should throw NotFoundException when subject does not exist', async () => {
      subjectModel.findFirst.mockResolvedValueOnce(null);
      await expect(subjectsService.deleteById('123')).rejects.toBeInstanceOf(NotFoundException);
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
