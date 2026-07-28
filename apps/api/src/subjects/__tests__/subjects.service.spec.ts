import { CryptoService, getModelToken, PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { pick } from 'lodash-es';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
              findMany: vi.fn()
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

  describe('find', () => {
    it('should return the array returned by the subject model', async () => {
      subjectModel.findMany.mockResolvedValueOnce([{ id: '123' }]);
      await expect(subjectsService.find()).resolves.toMatchObject([{ id: '123' }]);
    });
    it('should return the array of subjects with records', async () => {
      prismaClient.instrumentRecord.findMany.mockResolvedValueOnce([{ subjectId: '123' }]);
      subjectModel.findMany.mockResolvedValueOnce([{ id: '123' }]);
      await expect(subjectsService.find({ hasRecord: true })).resolves.toMatchObject([{ id: '123' }]);
      expect(prismaClient.instrumentRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          distinct: ['subjectId'],
          select: { subjectId: true },
          where: {}
        })
      );
      expect(subjectModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [{}, {}, { id: { in: ['123'] } }]
          })
        })
      );
    });
    it('should filter instrument records by groupId when provided', async () => {
      prismaClient.instrumentRecord.findMany.mockResolvedValueOnce([{ subjectId: '123' }]);
      subjectModel.findMany.mockResolvedValueOnce([{ id: '123' }]);
      await subjectsService.find({ groupId: 'group-1', hasRecord: true });
      expect(prismaClient.instrumentRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { groupId: 'group-1' }
        })
      );
    });
    it('should pass all subject IDs returned by instrument records to the subject query', async () => {
      prismaClient.instrumentRecord.findMany.mockResolvedValueOnce([{ subjectId: '123' }, { subjectId: '456' }]);
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

  describe('findByIds', () => {
    it('should query the whole id set in one call, omitting missing ids rather than throwing', async () => {
      subjectModel.findMany.mockResolvedValueOnce([{ id: '123' }]);
      await expect(subjectsService.findByIds(['123', 'does-not-exist'])).resolves.toMatchObject([{ id: '123' }]);
      expect(subjectModel.findMany).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ where: expect.objectContaining({ id: { in: ['123', 'does-not-exist'] } }) })
      );
    });
  });
});
