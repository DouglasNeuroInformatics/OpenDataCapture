import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { SubjectEntity } from '../entities/subject.entity.js';
import { SubjectsService } from '../subjects.service.js';

import { createMock } from '@/core/testing/create-mock.js';
import { CryptoService } from '@/crypto/crypto.service.js';
import { GroupsService } from '@/groups/groups.service.js';

const mockSubject = Object.freeze({
  firstName: 'John',
  lastName: 'Smith',
  dateOfBirth: new Date(2000, 0, 1),
  sex: 'male',
  identifier: 'john-smith',
  groups: []
});

class MockSubjectModel {
  private readonly subjects: SubjectEntity[] = [];

  exists(subject: { identifier: string }) {
    return Boolean(this.subjects.find(({ identifier }) => identifier === subject.identifier));
  }

  create(subject: SubjectEntity) {
    this.subjects.push(subject);
    return Promise.resolve(subject);
  }
}

describe('SubjectsService', () => {
  let subjectsService: SubjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        {
          provide: CryptoService,
          useValue: createMock<CryptoService>({
            hash: (source) => source
          })
        },
        {
          provide: GroupsService,
          useValue: createMock<GroupsService>()
        },
        {
          provide: getModelToken(SubjectEntity.modelName),
          useValue: new MockSubjectModel()
        }
      ]
    }).compile();

    subjectsService = module.get(SubjectsService);
  });

  describe('create', () => {
    it('should add a subject to the database and return an object with the same first and last name', async () => {
      const subject = await subjectsService.create({
        ...mockSubject,
        dateOfBirth: mockSubject.dateOfBirth.toISOString()
      });
      assert(subject.firstName === mockSubject.firstName && subject.lastName === mockSubject.lastName);
    });

    it('should throw a ConflictException if a subject with the same info already exists in the db', async () => {
      await subjectsService.create({ firstName: 'John', lastName: 'Smith', dateOfBirth: '2000-01-01', sex: 'male' });
      assert.rejects(
        () => subjectsService.create({ firstName: 'John', lastName: 'Smith', dateOfBirth: '2000-01-01', sex: 'male' }),
        ConflictException
      );
    });
  });

  describe('generateIdentifier', () => {
    it('should return the same identifier for the same info', () => {
      const info = { firstName: 'John', lastName: 'Smith', dateOfBirth: new Date(2000, 0, 1), sex: 'male' } as const;
      const id1 = subjectsService.generateIdentifier(info.firstName, info.lastName, info.dateOfBirth, info.sex);
      const id2 = subjectsService.generateIdentifier(info.firstName, info.lastName, info.dateOfBirth, info.sex);
      assert.strictEqual(id1, id2);
    });

    it('should return the same identifier for the name first name, with an accent or without', () => {
      const id1 = subjectsService.generateIdentifier('François', 'Smith', new Date(2000, 0, 1), 'male');
      const id2 = subjectsService.generateIdentifier('Francois', 'Smith', new Date(2000, 0, 1), 'male');
      assert.strictEqual(id1, id2);
    });

    it('should return a different identifier for different names ', () => {
      const id1 = subjectsService.generateIdentifier('François', 'Smith', new Date(2000, 0, 1), 'male');
      const id2 = subjectsService.generateIdentifier('John', 'Smith', new Date(2000, 0, 1), 'male');
      assert.notStrictEqual(id1, id2);
    });
  });
});
