import { CryptoService, getModelToken } from '@douglasneuroinformatics/libnest';
import type { ExtendedPrismaClient, Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { pick } from 'lodash-es';
import { PRISMA_CLIENT_TOKEN } from 'node_modules/@douglasneuroinformatics/libnest/dist/modules/prisma/prisma.config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SubjectsService } from '../subjects.service';

describe('SubjectsService', () => {
  let subjectsService: SubjectsService;
  let subjectModel: MockedInstance<Model<'Subject'>>;
  let prismaClient: MockedInstance<ExtendedPrismaClient> & {
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
              deleteMany: vi.fn()
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
      expect(prismaClient.session.deleteMany).toHaveBeenCalled();
      expect(prismaClient.instrumentRecord.deleteMany).toHaveBeenCalled();
      expect(prismaClient.subject.deleteMany).toHaveBeenCalled();
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
