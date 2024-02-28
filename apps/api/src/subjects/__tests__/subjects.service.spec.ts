import { CryptoService } from '@douglasneuroinformatics/nestjs/modules';
import { MockFactory, type MockedInstance } from '@douglasneuroinformatics/nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import _ from 'lodash';
import { beforeEach, describe, expect, it } from 'vitest';

import type { Model } from '@/prisma/prisma.types';
import { getModelToken } from '@/prisma/prisma.utils';

import { SubjectsService } from '../subjects.service';

describe('SubjectsService', () => {
  let subjectsService: SubjectsService;
  let subjectModel: MockedInstance<Model<'Subject'>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockFactory.createForService(CryptoService),
        SubjectsService,
        MockFactory.createForModelToken(getModelToken('Subject'))
      ]
    }).compile();
    subjectModel = moduleRef.get(getModelToken('Subject'));
    subjectsService = moduleRef.get(SubjectsService);
  });

  describe('create', () => {
    it('should call the subject model', async () => {
      const subject = { dateOfBirth: new Date(2000), firstName: 'Bob', lastName: 'Smith', sex: 'MALE' } as const;
      await subjectsService.create(subject);
      expect(subjectModel.create.mock.lastCall?.[0]).toMatchObject({ data: _.pick(subject, 'dateOfBirth', 'sex') });
    });
    it('should generate the same id when common French accents are omitted', async () => {
      subjectModel.create.mockImplementation((...args) => args);
      const s1 = await subjectsService.create({
        dateOfBirth: new Date(2000, 0),
        firstName: 'René François',
        lastName: 'Lacôte',
        sex: 'MALE'
      });
      const s2 = await subjectsService.create({
        dateOfBirth: new Date(2000, 0),
        firstName: 'Rene Francois',
        lastName: 'Lacote',
        sex: 'MALE'
      });
      expect(s1.id).toBe(s2.id);
      subjectModel.create.mockClear();
    });

    it('should throw a ConflictException if the subject already exists', () => {
      subjectModel.exists.mockResolvedValueOnce(true);
      expect(
        subjectsService.create({
          dateOfBirth: new Date(2000),
          firstName: 'Bob',
          lastName: 'Smith',
          sex: 'MALE'
        })
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('find', () => {
    it('should return the array returned by the subject model', () => {
      subjectModel.findMany.mockResolvedValueOnce([{ id: '123' }]);
      expect(subjectsService.find()).resolves.toMatchObject([{ id: '123' }]);
    });
  });

  describe('findById', () => {
    it('should throw a `NotFoundException` if there is no subject with the provided id', () => {
      subjectModel.findFirst.mockResolvedValueOnce(null);
      expect(subjectsService.findById('123')).rejects.toBeInstanceOf(NotFoundException);
    });
    it('should return the subject with the provided id if it exists', () => {
      subjectModel.findFirst.mockResolvedValueOnce({ id: '123' });
      expect(subjectsService.findById('123')).resolves.toMatchObject({ id: '123' });
    });
  });
});
